/**
 * Host half of the Quick Provider bundle.
 *
 * All real work happens here, driven by either the agent tool
 * `add_llm_provider` or the Web form (POST /api/quick-provider/add):
 *   1. discover every model the OpenAI-compatible `/models` endpoint advertises
 *   2. store the API key through the credential seam
 *   3. write the provider into the pi-ai adapter's `providers` config via Settings
 *
 * The pi-ai adapter (`@deepseek-ai/dsh-llm-pi-ai`) already owns streaming,
 * retry, and catalog resolution, so this plugin stays minimal.
 */

const SETTINGS_NS = 'llm-pi-ai';

function sanitizeProviderId(id) {
  const s = String(id || '').trim().toLowerCase()
    .replace(/[^a-z0-9_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
  if (!s) throw new Error('Provider ID must contain letters or digits');
  return s;
}

function deriveApiKeyEnv(provider) {
  const stem = provider.toUpperCase().replace(/[^A-Z0-9]+/g, '_').replace(/^_+|_+$/g, '');
  return (stem || 'CUSTOM') + '_API_KEY';
}

function mapDiscoveredModel(m) {
  const input = Array.isArray(m.inputModalities) && m.inputModalities.includes('image')
    ? ['text', 'image']
    : ['text'];
  const out = { id: m.id, name: m.name || m.id, input };
  if (typeof m.contextWindow === 'number' && m.contextWindow > 0) out.contextWindow = m.contextWindow;
  if (typeof m.maxTokens === 'number' && m.maxTokens > 0) out.maxTokens = m.maxTokens;
  return out;
}

function errText(err) {
  return err && err.message ? err.message : String(err);
}

function jsonResponse(status, payload) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { 'content-type': 'application/json' },
  });
}

export const inject = ['llm', 'credentials', 'connection', 'tools', 'settings'];

export function apply(ctx) {
  const { llm, credentials, connection, tools, settings } = ctx;

  async function addProvider(input) {
    const id = sanitizeProviderId(input && input.provider);
    const displayName = String((input && input.displayName) || '').trim() || id;
    const baseURL = String((input && input.baseURL) || '').trim().replace(/\/+$/, '');
    const apiKey = String((input && input.apiKey) || '').trim();
    if (!baseURL) throw new Error('Base URL is required');
    if (!apiKey) throw new Error('API key is required');

    // 1. Discover models from the OpenAI-compatible GET /models endpoint (JSON).
    let discovered;
    try {
      discovered = await llm.discoverModels(SETTINGS_NS, {
        provider: id,
        baseURL,
        api: 'openai-completions',
        apiKey,
      });
    } catch (err) {
      throw new Error('Model discovery failed: ' + errText(err));
    }
    if (!Array.isArray(discovered) || discovered.length === 0) {
      throw new Error('Model discovery returned no models. The endpoint may not support GET /models (JSON).');
    }

    const models = discovered.map(mapDiscoveredModel);
    const apiKeyEnv = deriveApiKeyEnv(id);

    // 2. Store the API key under its env-var reference.
    await credentials.set(apiKeyEnv, apiKey);

    // 3. Write the provider into the pi-ai adapter's providers config.
    const providerConfig = {
      displayName,
      api: 'openai-completions',
      baseURL,
      apiKeyEnv,
      models,
    };
    await settings.mutate(SETTINGS_NS, [{ op: 'set', path: ['providers', id], value: providerConfig }]);

    return { provider: id, displayName, apiKeyEnv, models };
  }

  // Agent tool so the operation is drivable and testable.
  tools.register({
    name: 'add_llm_provider',
    description:
      'Add a third-party OpenAI-compatible model provider to DeepSeek Harness from a provider id, display name, base URL and API key. Discovers every model the endpoint advertises via GET /models, stores the API key, and registers the provider and all its models automatically.',
    parameters: {
      type: 'object',
      properties: {
        provider: { type: 'string', description: 'Unique lowercase provider route id, e.g. apiyi' },
        displayName: { type: 'string', description: 'Display name shown in the model picker, e.g. API易' },
        baseURL: { type: 'string', description: 'OpenAI-compatible base URL, e.g. https://api.apimyi.com/v1' },
        apiKey: { type: 'string', description: 'The API key for this provider' },
      },
      required: ['provider', 'displayName', 'baseURL', 'apiKey'],
      additionalProperties: false,
    },
    output: {
      schema: { type: 'object' },
      render: (_args, value) => [{ type: 'text', text: JSON.stringify(value, null, 2) }],
    },
    async execute(args) {
      return addProvider(args);
    },
  });

  // Web route backing the client form, served through the authenticated
  // connection fetch channel so the browser reaches it directly.
  connection.fetch.register({
    path: '/api/quick-provider/add',
    methods: ['POST'],
    requestBody: 'buffered',
    fetch: async (request) => {
      try {
        const body = await request.json();
        const result = await addProvider(body);
        return jsonResponse(200, { ok: true, result });
      } catch (err) {
        return jsonResponse(400, { ok: false, error: errText(err) });
      }
    },
  });
}

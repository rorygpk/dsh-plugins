# Changelog

All notable changes to this package are documented in this file.
The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project uses [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-11-14

### Added

- Quick-provider settings card under **Settings > Models**: provider id, display
  name, base URL and API key, with automatic model discovery.
- Agent tool `add_llm_provider` and the authenticated
  `POST /api/quick-provider/add` route.
- API keys stored through the Harness credential seam; provider config only
  carries the environment-variable reference.
- Bilingual README, plugin icon, locale metadata and a portable pack script.

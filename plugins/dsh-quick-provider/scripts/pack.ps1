<#
.SYNOPSIS
  Builds the portable release archive for @local/dsh-quick-provider.

.DESCRIPTION
  Reads the version from package.json, copies the runtime and documentation
  files into a staging directory, compresses the package into
  dist/dsh-quick-provider-<version>.zip, and prints its SHA-256 checksum.

  Works with Windows PowerShell 5.1 and PowerShell 7+. No Node.js, pnpm, or
  network access is required. Missing runtime files abort the build; missing
  optional documentation files only produce a warning.

.PARAMETER OutputDirectory
  Directory that receives the archive. Defaults to <package>/dist.

.EXAMPLE
  powershell -ExecutionPolicy Bypass -File scripts\pack.ps1
#>
[CmdletBinding()]
param(
    [string]$OutputDirectory = ''
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

$packageRoot = Split-Path -Parent $PSScriptRoot
$bundleId = 'dsh-quick-provider'

function Stop-PackBuild([string]$Message) {
    throw ('pack.ps1: ' + $Message)
}

# --- version ---------------------------------------------------------------

$packageJsonPath = Join-Path $packageRoot 'package.json'
if (-not (Test-Path -LiteralPath $packageJsonPath -PathType Leaf)) {
    Stop-PackBuild ('package.json not found: ' + $packageJsonPath)
}
try {
    $package = Get-Content -LiteralPath $packageJsonPath -Raw -Encoding UTF8 | ConvertFrom-Json
}
catch {
    Stop-PackBuild ('package.json is not valid JSON: ' + $_.Exception.Message)
}
$versionProperty = $package.PSObject.Properties['version']
if ($null -eq $versionProperty) {
    Stop-PackBuild 'package.json has no "version" field.'
}
$version = ([string]$versionProperty.Value).Trim()
if ([string]::IsNullOrWhiteSpace($version)) {
    Stop-PackBuild 'package.json "version" field is empty.'
}
if ($version -notmatch '^\d+\.\d+\.\d+([-+][0-9A-Za-z.-]+)?$') {
    Stop-PackBuild ('unsupported version format: ' + $version)
}

if ([string]::IsNullOrWhiteSpace($OutputDirectory)) {
    $OutputDirectory = Join-Path $packageRoot 'dist'
}
if (-not (Test-Path -LiteralPath $OutputDirectory -PathType Container)) {
    New-Item -ItemType Directory -Path $OutputDirectory -Force | Out-Null
}
$OutputDirectory = [System.IO.Path]::GetFullPath($OutputDirectory)

# --- file lists ------------------------------------------------------------

# Runtime files: the bundle cannot load without them, so a missing entry aborts.
$requiredRuntime = @(
    'package.json',
    'cordis.patch.yml',
    'index.js',
    'client.js',
    'locale\en.json',
    'locale\zh.json',
    'icon.svg'
)

# Distribution extras: nice to have, never fatal.
$optionalDocs = @(
    'README.md',
    'README.zh.md',
    'LICENSE',
    'CHANGELOG.md'
)

# --- staging ---------------------------------------------------------------

$stagingRoot = Join-Path $OutputDirectory ('_staging-' + $bundleId)
$stagingPackage = Join-Path $stagingRoot $bundleId

function Copy-PackageFile {
    param(
        [Parameter(Mandatory = $true)][string]$RelativePath,
        [Parameter(Mandatory = $true)][bool]$Required
    )
    $source = Join-Path $packageRoot $RelativePath
    if (-not (Test-Path -LiteralPath $source -PathType Leaf)) {
        if ($Required) {
            Stop-PackBuild ('required runtime file is missing: ' + $RelativePath)
        }
        Write-Warning ('optional file not found, skipped: ' + $RelativePath)
        return
    }
    $destination = Join-Path $stagingPackage $RelativePath
    $destinationDirectory = Split-Path -Parent $destination
    if (-not (Test-Path -LiteralPath $destinationDirectory -PathType Container)) {
        New-Item -ItemType Directory -Path $destinationDirectory -Force | Out-Null
    }
    Copy-Item -LiteralPath $source -Destination $destination -Force
}

try {
    if (Test-Path -LiteralPath $stagingRoot) {
        Remove-Item -LiteralPath $stagingRoot -Recurse -Force
    }
    New-Item -ItemType Directory -Path $stagingPackage -Force | Out-Null

    foreach ($relativePath in $requiredRuntime) {
        Copy-PackageFile -RelativePath $relativePath -Required $true
    }
    foreach ($relativePath in $optionalDocs) {
        Copy-PackageFile -RelativePath $relativePath -Required $false
    }

    $archivePath = Join-Path $OutputDirectory ($bundleId + '-' + $version + '.zip')
    if (Test-Path -LiteralPath $archivePath) {
        Remove-Item -LiteralPath $archivePath -Force
    }

    Compress-Archive -Path $stagingPackage -DestinationPath $archivePath -CompressionLevel Optimal -Force

    if (-not (Test-Path -LiteralPath $archivePath -PathType Leaf)) {
        Stop-PackBuild 'Compress-Archive did not produce an archive.'
    }
    $archiveInfo = Get-Item -LiteralPath $archivePath
    if ($archiveInfo.Length -le 0) {
        Stop-PackBuild 'the archive is empty.'
    }

    # Confirm the archive keeps the self-contained folder layout.
    Add-Type -AssemblyName System.IO.Compression.FileSystem
    $zip = [System.IO.Compression.ZipFile]::OpenRead($archivePath)
    try {
        $entryCount = $zip.Entries.Count
        $hasRootFolder = $false
        foreach ($entry in $zip.Entries) {
            if ($entry.FullName.StartsWith($bundleId + '\') -or $entry.FullName.StartsWith($bundleId + '/')) {
                $hasRootFolder = $true
                break
            }
        }
    }
    finally {
        $zip.Dispose()
    }
    if ($entryCount -eq 0) {
        Stop-PackBuild 'the archive contains no entries.'
    }
    if (-not $hasRootFolder) {
        Stop-PackBuild ('the archive does not contain the top-level folder "' + $bundleId + '/".')
    }

    $hash = Get-FileHash -LiteralPath $archivePath -Algorithm SHA256
    $relativeArchive = $archivePath
    if ($archivePath.StartsWith($packageRoot, [System.StringComparison]::OrdinalIgnoreCase)) {
        $relativeArchive = $archivePath.Substring($packageRoot.Length).TrimStart('\', '/')
    }

    Write-Host ''
    Write-Host ('Archive : ' + $relativeArchive)
    Write-Host ('Version : ' + $version)
    Write-Host ('Entries : ' + $entryCount)
    Write-Host ('Size    : ' + $archiveInfo.Length + ' bytes')
    Write-Host ('SHA256  : ' + $hash.Hash)
    Write-Host ''
}
finally {
    if (Test-Path -LiteralPath $stagingRoot) {
        Remove-Item -LiteralPath $stagingRoot -Recurse -Force -ErrorAction SilentlyContinue
    }
}

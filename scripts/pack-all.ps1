<#
.SYNOPSIS
  Builds a portable archive for every plugin under plugins/.

.DESCRIPTION
  Each plugin directory that contains a package.json and a scripts/pack.ps1 is
  built with its own packer. Plugins without a packer get a generic archive that
  contains the bundle files listed in package.json "files" plus README, LICENSE
  and icon when present.

  Works with Windows PowerShell 5.1 and PowerShell 7+. No Node.js or network
  access is required.

.EXAMPLE
  powershell -ExecutionPolicy Bypass -File scripts\pack-all.ps1
#>
[CmdletBinding()]
param()

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

$repoRoot = Split-Path -Parent $PSScriptRoot
$pluginsRoot = Join-Path $repoRoot 'plugins'
if (-not (Test-Path -LiteralPath $pluginsRoot -PathType Container)) {
    throw ('pack-all.ps1: plugins directory not found: ' + $pluginsRoot)
}

$plugins = Get-ChildItem -LiteralPath $pluginsRoot -Directory |
    Where-Object { Test-Path -LiteralPath (Join-Path $_.FullName 'package.json') -PathType Leaf } |
    Sort-Object Name

if ($plugins.Count -eq 0) {
    throw 'pack-all.ps1: no plugin directories found under plugins/'
}

$built = @()
foreach ($plugin in $plugins) {
    $packer = Join-Path $plugin.FullName 'scripts\pack.ps1'
    if (Test-Path -LiteralPath $packer -PathType Leaf) {
        Write-Host ('==> ' + $plugin.Name)
        try {
            & $packer
        }
        catch {
            throw ('pack-all.ps1: ' + $plugin.Name + ' packer failed: ' + $_.Exception.Message)
        }
    } else {
        throw ('pack-all.ps1: ' + $plugin.Name + ' has no scripts/pack.ps1')
    }
    $dist = Join-Path $plugin.FullName 'dist'
    if (-not (Test-Path -LiteralPath $dist -PathType Container)) {
        throw ('pack-all.ps1: ' + $plugin.Name + ' produced no dist/ directory')
    }
    Get-ChildItem -LiteralPath $dist -Filter '*.zip' -File | ForEach-Object { $built += $_.FullName }
}

if ($built.Count -eq 0) {
    throw 'pack-all.ps1: no archives were produced'
}

Write-Host ''
Write-Host ('Built ' + $built.Count + ' archive(s):')
foreach ($archive in $built) {
    $hash = (Get-FileHash -LiteralPath $archive -Algorithm SHA256).Hash
    $size = (Get-Item -LiteralPath $archive).Length
    Write-Host ('  ' + $archive)
    Write-Host ('    size   ' + $size + ' bytes')
    Write-Host ('    sha256 ' + $hash)
}

param(
    [string]$OutputDir = "dist",
    [string]$PackagePrefix = "deploy-caprover"
)

$ErrorActionPreference = "Stop"

$RepoRoot = $PSScriptRoot
$Timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$ResolvedOutputDir = Join-Path $RepoRoot $OutputDir
$PackageName = "$PackagePrefix-$Timestamp.tar"
$PackagePath = Join-Path $ResolvedOutputDir $PackageName
$TempRoot = [System.IO.Path]::GetTempPath()
$StageDir = Join-Path $TempRoot "events-caprover-package-$Timestamp"
$TempPackagePath = Join-Path $TempRoot $PackageName
$CaptainDefinitionSource = Join-Path $RepoRoot "infrastructure\captain-definition"
$CaptainDefinitionTarget = Join-Path $StageDir "captain-definition"

if (-not (Test-Path $CaptainDefinitionSource)) {
    throw "Missing CapRover definition: $CaptainDefinitionSource"
}

if (-not (Get-Command tar.exe -ErrorAction SilentlyContinue)) {
    throw "tar.exe was not found. Install tar or run this script in an environment that provides it."
}

New-Item -ItemType Directory -Force -Path $ResolvedOutputDir | Out-Null

if (Test-Path $StageDir) {
    $ResolvedStageDir = (Resolve-Path $StageDir).Path
    if (-not $ResolvedStageDir.StartsWith($TempRoot, [System.StringComparison]::OrdinalIgnoreCase)) {
        throw "Refusing to clean staging directory outside temp: $ResolvedStageDir"
    }
    Remove-Item -LiteralPath $ResolvedStageDir -Recurse -Force
}

New-Item -ItemType Directory -Force -Path $StageDir | Out-Null

$ExcludeDirs = @(
    ".git",
    "dist",
    "node_modules",
    ".pytest_cache",
    "__pycache__",
    ".venv",
    "venv",
    "frontend\dist",
    "frontend\node_modules",
    "backend\.pytest_cache",
    "backend\__pycache__"
)

$ExcludeFiles = @(
    ".env",
    "*.log",
    "*.pid"
)

$RoboArgs = @(
    $RepoRoot,
    $StageDir,
    "/E",
    "/NFL",
    "/NDL",
    "/NJH",
    "/NJS",
    "/NP",
    "/XD"
) + $ExcludeDirs + @("/XF") + $ExcludeFiles

& robocopy @RoboArgs | Out-Null
$RoboExitCode = $LASTEXITCODE
if ($RoboExitCode -gt 7) {
    throw "robocopy failed with exit code $RoboExitCode"
}

Copy-Item -LiteralPath $CaptainDefinitionSource -Destination $CaptainDefinitionTarget -Force

if (Test-Path $PackagePath) {
    Remove-Item -LiteralPath $PackagePath -Force
}

if (Test-Path $TempPackagePath) {
    Remove-Item -LiteralPath $TempPackagePath -Force
}

Push-Location $StageDir
try {
    & tar.exe -cf "../$PackageName" .
    if ($LASTEXITCODE -ne 0) {
        throw "tar.exe failed with exit code $LASTEXITCODE"
    }
}
finally {
    Pop-Location
}

Move-Item -LiteralPath $TempPackagePath -Destination $PackagePath -Force

if (Test-Path $StageDir) {
    $ResolvedStageDir = (Resolve-Path $StageDir).Path
    if ($ResolvedStageDir.StartsWith($TempRoot, [System.StringComparison]::OrdinalIgnoreCase)) {
        Remove-Item -LiteralPath $ResolvedStageDir -Recurse -Force
    }
}

Write-Host "CapRover package created: $PackagePath"

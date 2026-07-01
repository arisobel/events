param(
    [ValidateSet("api", "web")]
    [string]$Target = "api"
)

$ErrorActionPreference = "Stop"

$RepoRoot   = $PSScriptRoot
$Timestamp  = Get-Date -Format "yyyyMMdd-HHmmss"
$DistDir    = Join-Path $RepoRoot "dist"
$PackageName = "events-$Target-$Timestamp.tar"
$PackagePath = Join-Path $DistDir $PackageName
$TempRoot   = [System.IO.Path]::GetTempPath()
$StageDir   = Join-Path $TempRoot "events-build-$Target-$Timestamp"
$TempPackagePath = Join-Path $TempRoot $PackageName

$CaptainDefSource = if ($Target -eq "api") {
    Join-Path $RepoRoot "captain-definition"
} else {
    Join-Path $RepoRoot "frontend\captain-definition"
}

if (-not (Get-Command tar.exe -ErrorAction SilentlyContinue)) {
    throw "tar.exe not found. Requires Git for Windows or Windows 10+."
}
if (-not (Test-Path $CaptainDefSource)) {
    throw "Missing captain-definition: $CaptainDefSource"
}

New-Item -ItemType Directory -Force -Path $DistDir | Out-Null

if (Test-Path $StageDir) {
    $resolved = (Resolve-Path $StageDir).Path
    if (-not $resolved.StartsWith($TempRoot, [System.StringComparison]::OrdinalIgnoreCase)) {
        throw "Refusing to remove directory outside temp: $resolved"
    }
    Remove-Item -LiteralPath $resolved -Recurse -Force
}
New-Item -ItemType Directory -Force -Path $StageDir | Out-Null

$ExcludeDirs = @(
    ".git", "dist", "node_modules", ".pytest_cache", "__pycache__",
    ".venv", "venv", "frontend\dist", "frontend\node_modules",
    "backend\.pytest_cache", "backend\__pycache__"
)
$ExcludeFiles = @(".env", "*.log", "*.pid")

$RoboArgs = @($RepoRoot, $StageDir, "/E", "/NFL", "/NDL", "/NJH", "/NJS", "/NP", "/XD") `
    + $ExcludeDirs + @("/XF") + $ExcludeFiles
& robocopy @RoboArgs | Out-Null
if ($LASTEXITCODE -gt 7) {
    throw "robocopy failed (exit code $LASTEXITCODE)"
}

Copy-Item -LiteralPath $CaptainDefSource -Destination (Join-Path $StageDir "captain-definition") -Force

if (Test-Path $TempPackagePath) { Remove-Item -LiteralPath $TempPackagePath -Force }

Push-Location $StageDir
try {
    & tar.exe -cf "../$PackageName" .
    if ($LASTEXITCODE -ne 0) { throw "tar failed (exit code $LASTEXITCODE)" }
} finally {
    Pop-Location
}

Move-Item -LiteralPath $TempPackagePath -Destination $PackagePath -Force
Remove-Item -LiteralPath $StageDir -Recurse -Force

$OldFiles = Get-ChildItem -Path $DistDir -Filter "events-$Target-*.tar" |
    Sort-Object Name -Descending |
    Select-Object -Skip 5
foreach ($f in $OldFiles) {
    Remove-Item -LiteralPath $f.FullName -Force
    Write-Host "Removed old package: $($f.Name)"
}

Write-Host ""
Write-Host "Package ready : $PackagePath"
Write-Host "Upload to app : events-$Target  (CapRover > Apps > events-$Target > Deploy > Tarball)"
Write-Host ""

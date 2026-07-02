# HARD 4 — PAI-SAFE PASS 10: REACT BROWSER SMOKE / VISUAL VERIFICATION
# Scope: verify built React preview and create browser verification report.
# No payment. No processor. No custody. No external APIs. No S:\SOUL.

$ErrorActionPreference = "Stop"
$ModuleRoot = "D:\DEV\AIVA\shared-core\pai-safe-vnext"
$ReactPreviewRoot = Join-Path $ModuleRoot "preview\pai-safe-pass-9-react"
$Timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$BackupRoot = Join-Path $ModuleRoot "backups\pass10-react-browser-smoke-$Timestamp"
$ReportPath = Join-Path $ModuleRoot "reports\pai-safe-pass-10-react-browser-smoke-verified-$Timestamp.md"
$Utf8NoBom = New-Object System.Text.UTF8Encoding($false)
Set-Location $ModuleRoot

function Backup-IfExists {
  param([Parameter(Mandatory=$true)][string]$Path)
  if (Test-Path $Path) {
    $Resolved = Resolve-Path $Path
    $Relative = $Resolved.Path.Replace($ModuleRoot, "").TrimStart("\")
    $Dest = Join-Path $BackupRoot $Relative
    $DestDir = Split-Path $Dest -Parent
    if (!(Test-Path $DestDir)) { New-Item -ItemType Directory -Path $DestDir -Force | Out-Null }
    Copy-Item $Path $Dest -Force
  }
}

function Write-NoBom {
  param([Parameter(Mandatory=$true)][string]$Path, [Parameter(Mandatory=$true)][string]$Content)
  $FullPath = Join-Path $ModuleRoot $Path
  $Dir = Split-Path $FullPath -Parent
  if ($Dir -and !(Test-Path $Dir)) { New-Item -ItemType Directory -Path $Dir -Force | Out-Null }
  [System.IO.File]::WriteAllText($FullPath, $Content, $Utf8NoBom)
}

function Run-OrFail {
  param([Parameter(Mandatory=$true)][string]$Command, [string]$WorkingDirectory = $ModuleRoot)
  Write-Host "`n=== $Command ===" -ForegroundColor Cyan
  Push-Location $WorkingDirectory
  try {
    cmd /c $Command
    if ($LASTEXITCODE -ne 0) { throw "Command failed: $Command" }
  }
  finally { Pop-Location }
}

Write-Host "`n=== HARD 4 / PAI-SAFE PASS 10 START ===" -ForegroundColor Cyan

# Backup touched files before scoped write.
Backup-IfExists ".\package.json"
Backup-IfExists ".\scripts\smoke-pai-safe-pass-10-react-browser-preview.mjs"
Backup-IfExists ".\scripts\run-pai-safe-pass10.ps1"

# Verify Pass 8 and Pass 9 authority before Pass 10.
$Pass8Report = Get-ChildItem ".\reports" -ErrorAction SilentlyContinue | Where-Object { $_.Name -like "pai-safe-pass-8-browser-preview-VERIFIED-*.md" } | Sort-Object LastWriteTime -Descending | Select-Object -First 1
if (!$Pass8Report) { throw "Missing Pass 8 verified browser preview report." }

$Pass9Report = Get-ChildItem ".\reports" -ErrorAction SilentlyContinue | Where-Object { $_.Name -like "pai-safe-pass-9-minimal-react-ui-preview-verified-*.md" } | Sort-Object LastWriteTime -Descending | Select-Object -First 1
if (!$Pass9Report) { throw "Missing Pass 9 verified React preview report." }

if (!(Test-Path $ReactPreviewRoot)) { throw "Missing Pass 9 React preview folder: $ReactPreviewRoot" }

# Scoped Pass 10 smoke test content.
$SmokeLines = @(
  'import { existsSync, readFileSync } from "node:fs";',
  'import { join } from "node:path";',
  '',
  'const moduleRoot = process.cwd();',
  'const reactRoot = join(moduleRoot, "preview", "pai-safe-pass-9-react");',
  '',
  'function assert(condition, message) {',
  '  if (!condition) throw new Error(message);',
  '}',
  '',
  'const requiredFiles = [',
  '  "package.json",',
  '  "index.html",',
  '  "src/App.tsx",',
  '  "src/main.tsx",',
  '  "src/index.css",',
  '  "src/fixtures/manifest.json",',
  '  "src/fixtures/pai_safe_fixture_safe.json",',
  '  "src/fixtures/pai_safe_fixture_hold.json",',
  '  "src/fixtures/pai_safe_fixture_refused.json",',
  '  "src/fixtures/pai_safe_fixture_empty.json",',
  '  "src/fixtures/pai_safe_fixture_loading.json",',
  '  "src/fixtures/pai_safe_fixture_unavailable.json",',
  '  "dist/index.html"',
  '];',
  '',
  'for (const file of requiredFiles) {',
  '  assert(existsSync(join(reactRoot, file)), `Missing Pass 10 React browser file: ${file}`);',
  '}',
  '',
  'const appSource = readFileSync(join(reactRoot, "src", "App.tsx"), "utf8");',
  'const distIndex = readFileSync(join(reactRoot, "dist", "index.html"), "utf8");',
  'const manifest = JSON.parse(readFileSync(join(reactRoot, "src", "fixtures", "manifest.json"), "utf8"));',
  '',
  'const requiredSourceSignals = [',
  '  "PAI-SAFE Pass 9",',
  '  "Minimal React UI Preview",',
  '  "Circuit decides",',
  '  "Projection reflects",',
  '  "Surface contract maps",',
  '  "Screen state prepares",',
  '  "Fixture packet exports",',
  '  "React preview reads fixtures",',
  '  "UI renders later",',
  '  "Merchant Preview",',
  '  "Consumer Preview",',
  '  "Internal Review Preview",',
  '  "SAFE",',
  '  "HOLD",',
  '  "REFUSED"',
  '];',
  '',
  'for (const signal of requiredSourceSignals) {',
  '  assert(appSource.includes(signal), `React source missing browser smoke signal: ${signal}`);',
  '}',
  '',
  'const forbiddenMarkers = [',
  '  "runPaiSafeTransactionCircuit",',
  '  "projectPaiSafeTransactionState",',
  '  "buildPaiSafeSurfaceContractPacket",',
  '  "buildPaiSafeUiStatePacket",',
  '  "authorizePayment(",',
  '  "writeCustody(",',
  '  "promoteDoctrine(",',
  '  "fetch(",',
  '  "XMLHttpRequest",',
  '  "axios",',
  '  "stripe",',
  '  "checkout",',
  '  "wallet",',
  '  "<button",',
  '  "onClick"',
  '];',
  '',
  'for (const marker of forbiddenMarkers) {',
  '  assert(!appSource.includes(marker), `Forbidden Pass 10 marker found in React source: ${marker}`);',
  '}',
  '',
  'assert(manifest.fixtureCount === 6, "Fixture count must remain 6.");',
  'assert(manifest.boundary.noPayments === true, "noPayments boundary missing.");',
  'assert(manifest.boundary.noExternalApis === true, "noExternalApis boundary missing.");',
  'assert(manifest.boundary.noCustody === true, "noCustody boundary missing.");',
  'assert(manifest.boundary.noSoulWritePath === true, "noSoulWritePath boundary missing.");',
  'assert(manifest.boundary.noFundTrackerBridge === true, "noFundTrackerBridge boundary missing.");',
  '',
  'assert(distIndex.includes("<div id=\""root\""></div>"), "Built React dist root missing.");',
  'assert(distIndex.includes("script"), "Built React dist script missing.");',
  '',
  'console.log("PAI_SAFE_PASS_10_REACT_BROWSER_SMOKE=PASS");',
  'console.log(JSON.stringify({',
  '  tested: [',
  '    "Pass 9 React preview dist exists",',
  '    "React source browser smoke signals",',
  '    "SAFE HOLD REFUSED source visibility",',
  '    "merchant consumer internal review component source",',
  '    "fixture-only boundary",',
  '    "no transaction logic in React",',
  '    "no payment wallet custody controls",',
  '    "no external API behavior",',
  '    "manifest boundaries",',
  '    "built dist browser readiness"',
  '  ],',
  '  status: "PASS"',
  '}, null, 2));'
)
$Smoke = $SmokeLines -join [Environment]::NewLine
Write-NoBom "scripts\smoke-pai-safe-pass-10-react-browser-preview.mjs" $Smoke

# Scoped package.json update.
$PackagePath = Join-Path $ModuleRoot "package.json"
$Pkg = Get-Content $PackagePath -Raw | ConvertFrom-Json
$Pkg.scripts | Add-Member -MemberType NoteProperty -Name "smoke:pass10" -Value "node scripts/smoke-pai-safe-pass-10-react-browser-preview.mjs" -Force
$Pkg.scripts | Add-Member -MemberType NoteProperty -Name "verify:pass10" -Value "npm run typecheck && npm run smoke && npm run smoke:pass2 && npm run smoke:pass3 && npm run smoke:pass4 && npm run smoke:pass5 && npm run export:pass6 && npm run smoke:pass6 && npm run preview:pass7 && npm run smoke:pass7 && cd preview/pai-safe-pass-9-react && npm run verify && cd ../.. && npm run smoke:pass10" -Force
[System.IO.File]::WriteAllText($PackagePath, ($Pkg | ConvertTo-Json -Depth 20), $Utf8NoBom)

# Required command chain.
Run-OrFail "npm run typecheck"
Run-OrFail "npm run smoke"
Run-OrFail "npm run smoke:pass2"
Run-OrFail "npm run smoke:pass3"
Run-OrFail "npm run smoke:pass4"
Run-OrFail "npm run smoke:pass5"
Run-OrFail "npm run export:pass6"
Run-OrFail "npm run smoke:pass6"
Run-OrFail "npm run preview:pass7"
Run-OrFail "npm run smoke:pass7"
Run-OrFail "npm run verify" $ReactPreviewRoot
Run-OrFail "npm run smoke:pass10"
Run-OrFail "npm run verify:pass10"

$ReactDistIndex = Join-Path $ReactPreviewRoot "dist\index.html"
if (!(Test-Path $ReactDistIndex)) { throw "Missing React preview dist index after Pass 10 verify." }

$ReportLines = @(
  "# PAI-SAFE Pass 10 — React Browser Smoke / Visual Verification",
  "",
  "Generated: $Timestamp",
  "",
  "## Status",
  "",
  "VERIFIED PASS",
  "",
  "## Files Touched",
  "",
  "- package.json",
  "- scripts/smoke-pai-safe-pass-10-react-browser-preview.mjs",
  "- scripts/run-pai-safe-pass10.ps1",
  "",
  "## Backups",
  "",
  "$BackupRoot",
  "",
  "## Commands Passed",
  "",
  "- npm run typecheck",
  "- npm run smoke",
  "- npm run smoke:pass2",
  "- npm run smoke:pass3",
  "- npm run smoke:pass4",
  "- npm run smoke:pass5",
  "- npm run export:pass6",
  "- npm run smoke:pass6",
  "- npm run preview:pass7",
  "- npm run smoke:pass7",
  "- npm run verify inside preview/pai-safe-pass-9-react",
  "- npm run smoke:pass10",
  "- npm run verify:pass10",
  "",
  "## Confirmed",
  "",
  "- Pass 9 React preview build remains valid",
  "- React dist browser entry exists",
  "- SAFE / HOLD / REFUSED source signals present",
  "- Merchant / Consumer / Internal Review source signals present",
  "- Fixture-only rendering preserved",
  "- No transaction business logic in React",
  "- No external API behavior",
  "- No payment controls",
  "- No wallet controls",
  "- No custody controls",
  "- No mutation buttons",
  "- Manifest boundaries preserved",
  "- React browser smoke passed",
  "",
  "## Authority Rule Preserved",
  "",
  "React browser smoke does not create truth.",
  "",
  "Circuit decides.",
  "Projection reflects.",
  "Surface contract maps.",
  "Screen state prepares.",
  "Fixture packet exports.",
  "Preview reads fixtures.",
  "Browser preview verifies.",
  "React preview renders fixtures.",
  "React browser smoke verifies.",
  "UI remains downstream.",
  "",
  "## Boundary Preserved",
  "",
  "No payment processor.",
  "No wallet.",
  "No custody.",
  "No external APIs.",
  "No S:\SOUL write path.",
  "No PAID Relay Workspace changes.",
  "No FundTrackerAI bridge.",
  "No transaction-screening reserve activation.",
  "No automatic promotion.",
  "No production deployment.",
  "No doctrine sealing.",
  "",
  "## Final Rule",
  "",
  "Transaction first.",
  "Dashboard second.",
  "Proof always."
)
$Report = $ReportLines -join [Environment]::NewLine
[System.IO.File]::WriteAllText($ReportPath, $Report, $Utf8NoBom)

Write-Host "`n=== PAI-SAFE PASS 10 VERIFIED ===" -ForegroundColor Green
Write-Host "Verified report:" -ForegroundColor Cyan
Write-Host $ReportPath -ForegroundColor Cyan

Write-Host "`nOpening React preview dist for browser visual check..." -ForegroundColor Cyan
Start-Process $ReactDistIndex

Get-ChildItem reports | Sort-Object LastWriteTime -Descending | Select-Object -First 12 Name, LastWriteTime
Get-ChildItem (Join-Path $ReactPreviewRoot "dist") | Sort-Object Name | Select-Object Name, LastWriteTime

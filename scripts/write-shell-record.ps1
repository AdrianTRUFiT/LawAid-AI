param(
    [Parameter(Mandatory = $true)][string]$handoffId,
    [string]$inboxRoot = "D:\DEV\PROJECTS\LawAidAI\intake\inbox",
    [string]$reviewedRoot = "D:\DEV\PROJECTS\LawAidAI\intake\reviewed",
    [string]$shellRoot = "D:\DEV\PROJECTS\LawAidAI\records\shell",
    [string]$reviewer = "ADMIN"
)

$inboxPath = Join-Path $inboxRoot "$handoffId.json"

if (-not (Test-Path $inboxPath)) {
    Write-Host "Inbox item not found: $handoffId" -ForegroundColor Red
    exit 1
}

if (-not (Test-Path $reviewedRoot)) {
    New-Item -ItemType Directory -Path $reviewedRoot -Force | Out-Null
}

if (-not (Test-Path $shellRoot)) {
    New-Item -ItemType Directory -Path $shellRoot -Force | Out-Null
}

$item = Get-Content $inboxPath -Raw | ConvertFrom-Json -ErrorAction Stop
$reviewedAt = Get-Date -Format "o"

$item.receiveStatus = "acceptedForIngest"
$item.reviewedBy = $reviewer
$item.reviewedAt = $reviewedAt
$item.ingestStatus = "ingestedToShell"

$shellRecord = [ordered]@{
    shellRecordId = "shell-$handoffId"
    createdAt = $reviewedAt
    sourceHandoffId = $item.handoff.handoffId
    leadId = $item.handoff.leadId
    sourceApp = $item.handoff.sourceApp
    targetApp = $item.handoff.targetApp
    artifactType = $item.handoff.artifactType
    receiveStatus = $item.receiveStatus
    ingestStatus = $item.ingestStatus
    payloadSummary = $item.handoff.payload
} | ConvertTo-Json -Depth 20

$shellPath = Join-Path $shellRoot "shell-$handoffId.json"
$reviewedPath = Join-Path $reviewedRoot "$handoffId.json"

$shellRecord | Set-Content -Path $shellPath -Encoding UTF8
($item | ConvertTo-Json -Depth 20) | Set-Content -Path $reviewedPath -Encoding UTF8
Remove-Item $inboxPath -Force

Write-Host "Shell record created: $shellPath" -ForegroundColor Green
Write-Host "Inbox item moved to reviewed: $reviewedPath" -ForegroundColor DarkGray
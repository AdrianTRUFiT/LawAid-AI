param(
    [Parameter(Mandatory = $true)][string]$handoffId,
    [Parameter(Mandatory = $true)][string]$reason,
    [string]$inboxRoot = "D:\DEV\PROJECTS\LawAidAI\intake\inbox",
    [string]$rejectedRoot = "D:\DEV\PROJECTS\LawAidAI\intake\rejected",
    [string]$reviewer = "ADMIN"
)

$inboxPath = Join-Path $inboxRoot "$handoffId.json"

if (-not (Test-Path $inboxPath)) {
    Write-Host "Inbox item not found: $handoffId" -ForegroundColor Red
    exit 1
}

if (-not (Test-Path $rejectedRoot)) {
    New-Item -ItemType Directory -Path $rejectedRoot -Force | Out-Null
}

$item = Get-Content $inboxPath -Raw | ConvertFrom-Json -ErrorAction Stop
$item.receiveStatus = "rejected"
$item.reviewedBy = $reviewer
$item.reviewedAt = Get-Date -Format "o"
$item.ingestStatus = "notIngested"
$item | Add-Member -NotePropertyName rejectionReason -NotePropertyValue $reason -Force

$rejectedPath = Join-Path $rejectedRoot "$handoffId-rejected.json"
($item | ConvertTo-Json -Depth 20) | Set-Content -Path $rejectedPath -Encoding UTF8
Remove-Item $inboxPath -Force

Write-Host "Inbox item rejected: $rejectedPath" -ForegroundColor Yellow
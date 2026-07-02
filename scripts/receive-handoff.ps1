param(
    [string]$handoffRoot = "D:\DEV\AIVA\shared-data\handoffs",
    [string]$inboxRoot = "D:\DEV\PROJECTS\LawAidAI\intake\inbox",
    [string]$rejectedRoot = "D:\DEV\PROJECTS\LawAidAI\intake\rejected",
    [string]$processedRoot = "D:\DEV\PROJECTS\LawAidAI\intake\processed-source",
    [string]$allowedTargetApp = "LawAidAI"
)

$allowedArtifactTypes = @("ActivatedTransactionState")
$requiredTopFields = @("handoffId", "leadId", "timestamp", "sourceApp", "targetApp", "artifactType", "status", "payload")
$receiveTimestamp = Get-Date -Format "o"

foreach ($path in @($handoffRoot, $inboxRoot, $rejectedRoot, $processedRoot)) {
    if (-not (Test-Path $path)) {
        New-Item -ItemType Directory -Path $path -Force | Out-Null
    }
}

$files = Get-ChildItem -Path $handoffRoot -Filter *.json -File

if ($files.Count -eq 0) {
    Write-Host "No handoff files found." -ForegroundColor Yellow
    exit 0
}

foreach ($file in $files) {
    $processedDestination = Join-Path $processedRoot $file.Name

    try {
        $raw = Get-Content $file.FullName -Raw
        $obj = $raw | ConvertFrom-Json -ErrorAction Stop
    }
    catch {
        $rejectName = [System.IO.Path]::GetFileNameWithoutExtension($file.Name) + "-rejected.json"
        $rejectPath = Join-Path $rejectedRoot $rejectName

        [ordered]@{
            receiveTimestamp = $receiveTimestamp
            sourceFile = $file.FullName
            reason = "Invalid JSON"
        } | ConvertTo-Json -Depth 10 | Set-Content -Path $rejectPath -Encoding UTF8

        Move-Item -Path $file.FullName -Destination $processedDestination -Force
        Write-Host "Rejected invalid JSON: $($file.Name)" -ForegroundColor Red
        continue
    }

    $missing = @()
    foreach ($field in $requiredTopFields) {
        if ($null -eq $obj.$field -or [string]::IsNullOrWhiteSpace([string]$obj.$field)) {
            $missing += $field
        }
    }

    if ($missing.Count -gt 0) {
        $rejectName = if ([string]::IsNullOrWhiteSpace($obj.handoffId)) {
            [System.IO.Path]::GetFileNameWithoutExtension($file.Name) + "-rejected.json"
        } else {
            "$($obj.handoffId)-rejected.json"
        }

        $rejectPath = Join-Path $rejectedRoot $rejectName

        [ordered]@{
            receiveTimestamp = $receiveTimestamp
            sourceFile = $file.FullName
            reason = "Missing required fields"
            missingFields = $missing
        } | ConvertTo-Json -Depth 10 | Set-Content -Path $rejectPath -Encoding UTF8

        Move-Item -Path $file.FullName -Destination $processedDestination -Force
        Write-Host "Rejected missing fields: $($file.Name)" -ForegroundColor Red
        continue
    }

    if ($obj.targetApp -ne $allowedTargetApp) {
        $rejectPath = Join-Path $rejectedRoot "$($obj.handoffId)-rejected.json"

        [ordered]@{
            receiveTimestamp = $receiveTimestamp
            sourceFile = $file.FullName
            handoffId = $obj.handoffId
            reason = "Wrong targetApp"
            actualTarget = $obj.targetApp
            expectedTarget = $allowedTargetApp
        } | ConvertTo-Json -Depth 10 | Set-Content -Path $rejectPath -Encoding UTF8

        Move-Item -Path $file.FullName -Destination $processedDestination -Force
        Write-Host "Rejected wrong target: $($obj.handoffId)" -ForegroundColor Red
        continue
    }

    if ($obj.artifactType -notin $allowedArtifactTypes) {
        $rejectPath = Join-Path $rejectedRoot "$($obj.handoffId)-rejected.json"

        [ordered]@{
            receiveTimestamp = $receiveTimestamp
            sourceFile = $file.FullName
            handoffId = $obj.handoffId
            reason = "Unsupported artifactType"
            artifactType = $obj.artifactType
        } | ConvertTo-Json -Depth 10 | Set-Content -Path $rejectPath -Encoding UTF8

        Move-Item -Path $file.FullName -Destination $processedDestination -Force
        Write-Host "Rejected unsupported artifact: $($obj.handoffId)" -ForegroundColor Red
        continue
    }

    $inboxPath = Join-Path $inboxRoot "$($obj.handoffId).json"
    if (Test-Path $inboxPath) {
        Move-Item -Path $file.FullName -Destination $processedDestination -Force
        Write-Host "Skipped duplicate inbox item: $($obj.handoffId)" -ForegroundColor Yellow
        continue
    }

    [ordered]@{
        receiveTimestamp = $receiveTimestamp
        receiveStatus = "reviewPending"
        reviewedBy = $null
        reviewedAt = $null
        ingestStatus = "notIngested"
        handoff = $obj
    } | ConvertTo-Json -Depth 20 | Set-Content -Path $inboxPath -Encoding UTF8

    Move-Item -Path $file.FullName -Destination $processedDestination -Force
    Write-Host "Received into inbox: $($obj.handoffId)" -ForegroundColor Green
}
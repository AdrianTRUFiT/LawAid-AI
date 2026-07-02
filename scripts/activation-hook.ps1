Write-Host "LAWAIDAI — ACTIVATION REQUEST"

$params = @{
  actorId = "lawaid_actor"
  activationId = "LA_ACT_001"
  payloadJson = '{"record":"live_system_record","intent":"activate","level":"protected"}'
  contextId = "lawaid_activation"
}

& "D:\DEV\AIVA\Command_Center\governance\activation-gate.ps1" @params

if ($LASTEXITCODE -ne 0) {
  Write-Host "⛔ LAWAIDAI ACTIVATION HALTED"
  exit 1
}

Write-Host "✔ LAWAIDAI ACTIVATION PROCEEDS"

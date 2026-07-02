$actorId = "lawaid_actor"
$actionType = "INTAKE_RECEIVE"
$payloadJson = '{"artifactId":"LA_AUTH_001","intent":"receive_intake","target":"live_system_record"}'
$contextId = "lawaid"

& "D:\DEV\AIVA\Command_Center\governance\authorship-enforcer.ps1" 
  -actorId $actorId 
  -actionType $actionType 
  -payloadJson $payloadJson 
  -contextId $contextId

if ($LASTEXITCODE -ne 0) {
  Write-Host "⛔ LAWAIDAI BLOCKED — NO AUTHORSHIP"
  exit 1
}

Write-Host "✔ LAWAIDAI AUTHORSHIP CLEARED"

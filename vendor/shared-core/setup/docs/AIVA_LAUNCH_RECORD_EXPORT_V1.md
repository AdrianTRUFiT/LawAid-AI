# AIVA_LAUNCH_RECORD_EXPORT_V1

## Purpose

Export validated consumer and merchant launch lane records into portable JSON records.

## Proves

- Consumer launch lane can produce exportable activation record
- Merchant launch lane can produce exportable activation record
- TS reference is present
- FundTrackerAI truth remains required
- No financial authority is granted
- No payment rails are connected
- No wallet is created

## Output Folder

records/launch

## Smoke

npx tsx tests/smoke-launch-record-export.ts
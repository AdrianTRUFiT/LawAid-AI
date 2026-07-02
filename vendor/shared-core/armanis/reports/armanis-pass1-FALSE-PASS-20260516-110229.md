# ARMANIS Certification Engine v0 — Pass 1

Generated: 20260516-110229

## Status

VERIFIED PASS

## Verified Chain

- npm run typecheck = PASS
- npm run smoke:pass1 = PASS
- npm run verify:pass1 = PASS
- ARMANIS_PASS1_SMOKE=PASS

## Repair Notes

- Previous premature report renamed FALSE-PASS.
- Fixed TargetProfile integration readiness reference.
- Compatibility smoke fixture repaired to produce the intended safe-with-conditions candidate result.

## Smoke Proofs

- ACQUIRER_READY_PASS
- TARGET_READY_PASS
- MATCH_COMPATIBILITY_PASS
- CERTIFICATION_LEVEL_ISSUED
- INCOMPLETE_PACKET_REFUSED
- DEAL_ANSWER_PACKET_GENERATED

## Files Touched

- src/armanisEngine.ts
- tests/smoke-armanis-pass1.ts

## Confirmed Boundaries

- No live negotiation agent
- No payments
- No blockchain
- No real M&A marketplace
- No legal claims
- No external APIs
- No full UI
- Human remains final authority
- Final action remains blank

## Module Purpose

ARMANIS Pass 1 proves that the system can intake acquirer and target readiness packets, score agentic acquisition readiness, issue a certification level, calculate compatibility, refuse incomplete packets, and generate a Deal Answer Packet.

NEIL comes later.
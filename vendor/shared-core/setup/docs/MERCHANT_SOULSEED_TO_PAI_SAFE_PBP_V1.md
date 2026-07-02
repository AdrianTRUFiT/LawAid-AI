# MERCHANT_SOULSEED_TO_PAI_SAFE_PBP_V1

## Purpose

Move the merchant lane toward launch.

This lane proves:

SoulSeed merchant entry
-> TPS workflow selection
-> PAID relationship
-> PAI-SAFE merchant activation intent
-> ProofBack Protection record prepared
-> FundTrackerAI truth required
-> setup proof packet
-> TPS receiver validation
-> merchant live activation record
-> TS proof reference
-> protected transaction fee placeholder

## Boundaries

- No live payment rails
- No wallet
- No processor
- No receiver financial authority
- FundTrackerAI remains financial / consequence truth authority
- PAI-SAFE is the verified payment safety rail
- ProofBack Protection is the merchant-facing protection surface
- TPS is the merchant SaaS surface
- PAID is the dashboard/home relationship inside iAscendAi
- UI is not truth
- Display is not authority

## Smoke

npx tsx tests/smoke-merchant-launch-lane.ts
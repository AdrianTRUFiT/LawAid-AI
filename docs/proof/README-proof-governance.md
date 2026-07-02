# Proof Governance Layer

This folder provides the initial proof-governance substrate for LawAidAI.

## Files
- proofClaimTypes.ts
- verificationLevels.ts
- existenceClasses.ts
- validatedComponentMap.ts
- artifactProofRegistry.ts
- index.ts

## Purpose
These files encode the white paper and Plan B verification posture into typed boundaries:
- what kind of claim is being made
- what level of verification has been satisfied
- what existence class a component belongs to
- what artifacts are actually proven
- what remains future-state or unresolved

## Next Integration Targets
- src/lib/activation/activationContract.ts
- src/lib/activation/activationEngine.ts
- admin proof / activation visibility surfaces
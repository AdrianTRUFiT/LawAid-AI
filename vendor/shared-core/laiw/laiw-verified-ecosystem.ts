import crypto from 'crypto';
import {
  LAIW_CONCEPT_STACK,
  LAIW_WORKFLOW_CHAIN,
  LAIWStackIdentity
} from './laiw-stack-contracts';

function sha256(data: string) {
  return crypto.createHash('sha256').update(data).digest('hex');
}

export function createSoulVerifiedIdentity(
  label: string,
  participantType: LAIWStackIdentity["participantType"]
): LAIWStackIdentity {

  const seed =
    label +
    ":" +
    participantType +
    ":" +
    Date.now();

  const digest = sha256(seed);

  return {
    id: participantType + "-" + digest.slice(0, 10),
    label: label,
    participantType: participantType,
    soulId: "SOUL-" + digest.slice(10, 22),
    soulmark: "SM-" + digest.slice(22, 38),
    verified: true
  };
}

export function buildLAIWVerifiedEcosystem() {

  const buyer = createSoulVerifiedIdentity("Buyer A", "BUYER");
  const seller = createSoulVerifiedIdentity("Seller B", "SELLER");
  const api = createSoulVerifiedIdentity("Verified Logistics API", "API");

  return {
    stack: LAIW_CONCEPT_STACK,
    verifiedParticipants: [buyer, seller, api],
    workflowChain: LAIW_WORKFLOW_CHAIN,
    openSearchAllowed: false,
    verifiedOnly: true,
    createdAt: Date.now()
  };
}

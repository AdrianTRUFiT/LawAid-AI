import crypto from 'crypto';
import { ProjectBox, UtilityDomain } from './utilityContainerContracts';

function sha256(data: string) {
  return crypto.createHash('sha256').update(data).digest('hex');
}

export function createProjectBox(input: {
  domain: UtilityDomain;
  category: string;
  tags: string[];
  custodyRequired: boolean;
  routingRequired: boolean;
  schedulingRequired: boolean;
  transactionRequired: boolean;
}): ProjectBox {
  const seed =
    input.domain +
    ":" +
    input.category +
    ":" +
    input.tags.join("|") +
    ":" +
    Date.now();

  const digest = sha256(seed);

  return {
    boxId: "BOX-" + digest.slice(0, 12),
    domain: input.domain,
    category: input.category,
    tags: input.tags,
    artifactId: "ART-" + digest.slice(12, 24),
    custodyRequired: input.custodyRequired,
    routingRequired: input.routingRequired,
    schedulingRequired: input.schedulingRequired,
    transactionRequired: input.transactionRequired,
    verified: false,
    state: "CREATED",
    createdAt: Date.now()
  };
}

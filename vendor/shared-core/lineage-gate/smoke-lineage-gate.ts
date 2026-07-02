import { createLineageHash, verifyLineageChain } from './lineageGate';

const root = {
  artifactId: "ART-ROOT",
  type: "IDENTITY_USAGE",
  status: "ACTIVE" as const
};

const child = {
  artifactId: "ART-BOX",
  type: "PROJECT_BOX",
  parentArtifactId: "ART-ROOT",
  status: "ACTIVE" as const
};

const consequence = {
  artifactId: "ART-CONSEQUENCE",
  type: "EXECUTION_EVENT",
  parentArtifactId: "ART-BOX",
  status: "ACTIVE" as const
};

root.lineageHash = createLineageHash(root);
child.lineageHash = createLineageHash(child);
consequence.lineageHash = createLineageHash(consequence);

const validChain = [root, child, consequence];

const brokenChain = [
  root,
  {
    ...child,
    parentArtifactId: "WRONG-PARENT",
    lineageHash: undefined
  },
  consequence
];

const invalidChain = [
  root,
  {
    ...child,
    status: "INVALID" as const,
    lineageHash: undefined
  },
  consequence
];

console.log("LINEAGE_GATE_V1=START");

console.log("----");
console.log("VALID_CHAIN");
console.log(verifyLineageChain(validChain));

console.log("----");
console.log("BROKEN_PARENT_CHAIN");
console.log(verifyLineageChain(brokenChain as any));

console.log("----");
console.log("INVALID_ARTIFACT_CHAIN");
console.log(verifyLineageChain(invalidChain as any));

console.log("LINEAGE_GATE_V1=COMPLETE");

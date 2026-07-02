import { evaluateAuthorBoundary } from './authorBoundary';

console.log("AUTHORSHIP_BOUNDARY_V1=START");

console.log("----");
console.log("PROVENANCE_ALLOWED");
console.log(evaluateAuthorBoundary({
  authorId: "ADRIAN-TRUFIT-MCKENZIE",
  use: "PROVENANCE",
  target: "iAscendAi-origin-story"
}));

console.log("----");
console.log("BRAND_ORIGIN_ALLOWED");
console.log(evaluateAuthorBoundary({
  authorId: "ADRIAN-TRUFIT-MCKENZIE",
  use: "BRAND_ORIGIN",
  target: "founder-story"
}));

console.log("----");
console.log("EXECUTION_AUTHORITY_REFUSED");
console.log(evaluateAuthorBoundary({
  authorId: "ADRIAN-TRUFIT-MCKENZIE",
  use: "EXECUTION_AUTHORITY",
  target: "hil-execution"
}));

console.log("----");
console.log("TRUTH_OVERRIDE_REFUSED");
console.log(evaluateAuthorBoundary({
  authorId: "ADRIAN-TRUFIT-MCKENZIE",
  use: "TRUTH_OVERRIDE",
  target: "artifact-law"
}));

console.log("AUTHORSHIP_BOUNDARY_V1=COMPLETE");

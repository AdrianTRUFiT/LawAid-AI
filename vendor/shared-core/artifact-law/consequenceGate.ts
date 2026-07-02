import { verificationCheck } from "./verificationCheck.ts";
import { authorizationCheck } from "./authorizationCheck.ts";
import { consequenceCheck } from "./consequenceCheck.ts";

export function runConsequenceGate(input) {
  const verification = verificationCheck(input);
  if (!verification.passed) {
    return {
      allowed: false,
      stage: "VERIFICATION",
      failures: verification.failures
    };
  }

  const authorization = authorizationCheck(input);
  if (!authorization.passed) {
    return {
      allowed: false,
      stage: "AUTHORIZATION",
      failures: authorization.failures
    };
  }

  const consequence = consequenceCheck(input);
  if (!consequence.passed) {
    return {
      allowed: false,
      stage: "CONSEQUENCE",
      failures: consequence.failures
    };
  }

  return {
    allowed: true,
    stage: "CONSEQUENCE_READY",
    message: "Verified, authorized, consequence-ready."
  };
}


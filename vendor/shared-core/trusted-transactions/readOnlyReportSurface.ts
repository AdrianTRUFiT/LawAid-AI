import { evaluateTrustedTransactionHIL } from "./hilEvaluator";
import { happyPathScenario, negativeScenarios } from "./trustedTransactionFixtures";
import { HILResult, TrustedTransactionScenario } from "./trustedTransactionContracts";

export interface ReadOnlyTrustedTransactionReport {
  generatedAt: string;
  mutationAllowed: false;
  summary: {
    total: number;
    passed: number;
    refused: number;
  };
  results: HILResult[];
}

export function buildReadOnlyTrustedTransactionReport(
  scenarios: TrustedTransactionScenario[]
): ReadOnlyTrustedTransactionReport {
  const results = scenarios.map((scenario) => evaluateTrustedTransactionHIL(scenario));
  const passed = results.filter((result) => result.allowed).length;
  const refused = results.filter((result) => !result.allowed).length;

  return Object.freeze({
    generatedAt: "2026-04-30T12:00:00.000Z",
    mutationAllowed: false as const,
    summary: {
      total: results.length,
      passed,
      refused
    },
    results
  });
}

export function runDefaultReadOnlyReport(): ReadOnlyTrustedTransactionReport {
  return buildReadOnlyTrustedTransactionReport([
    happyPathScenario,
    ...negativeScenarios
  ]);
}

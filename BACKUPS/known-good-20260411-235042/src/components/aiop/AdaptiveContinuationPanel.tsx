import React from "react";
import { AiopInterpretation } from "../../lib/aiop";

interface Props {
  interpretation: AiopInterpretation;
  onContinue?: () => void;
  continueLabel?: string;
}

export default function AdaptiveContinuationPanel({
  interpretation,
  onContinue,
  continueLabel = "Continue",
}: Props) {
  const { insight, readinessState, paymentReadiness, routingDecision } = interpretation;

  return (
    <div className="rounded-xl border p-5">
      <div className="mb-2 text-lg font-semibold">Continuation Readiness</div>
      <p className="mb-4 text-sm opacity-80">
        This panel reflects the Acquire-stage interpretation and the recommended continuation path.
      </p>

      <div className="grid gap-3 md:grid-cols-2">
        <div className="rounded-lg border p-4">
          <div className="text-xs uppercase tracking-wide opacity-70">Readiness State</div>
          <div className="mt-1 font-medium">{readinessState}</div>
        </div>

        <div className="rounded-lg border p-4">
          <div className="text-xs uppercase tracking-wide opacity-70">Payment Readiness</div>
          <div className="mt-1 font-medium">{paymentReadiness}</div>
        </div>

        <div className="rounded-lg border p-4 md:col-span-2">
          <div className="text-xs uppercase tracking-wide opacity-70">Routing Decision</div>
          <div className="mt-1 font-medium">{routingDecision}</div>
        </div>

        <div className="rounded-lg border p-4">
          <div className="text-xs uppercase tracking-wide opacity-70">Pressure Center</div>
          <div className="mt-1 font-medium">{insight.pressureCenter}</div>
        </div>

        <div className="rounded-lg border p-4">
          <div className="text-xs uppercase tracking-wide opacity-70">At-Risk Area</div>
          <div className="mt-1 font-medium">{insight.atRiskArea}</div>
        </div>

        <div className="rounded-lg border p-4 md:col-span-2">
          <div className="text-xs uppercase tracking-wide opacity-70">Suggested Next Module</div>
          <div className="mt-1 font-medium">{insight.suggestedNextModule}</div>
        </div>
      </div>

      {onContinue ? (
        <div className="mt-4">
          <button
            type="button"
            onClick={onContinue}
            className="rounded-lg border px-4 py-2 font-medium"
          >
            {continueLabel}
          </button>
        </div>
      ) : null}
    </div>
  );
}

import React from "react";
import { AiopInterpretation } from "../../lib/aiop";

interface Props {
  interpretation: AiopInterpretation;
}

export function AiopInsightPanel({ interpretation }: Props) {
  const { insight } = interpretation;

  return (
    <div className="rounded-xl border p-5">
      <div className="mb-4 text-lg font-semibold">Instant Insight</div>

      <div className="grid gap-3">
        <div>
          <div className="text-xs uppercase tracking-wide opacity-70">Pressure Center</div>
          <div className="font-medium">{insight.pressureCenter}</div>
        </div>

        <div>
          <div className="text-xs uppercase tracking-wide opacity-70">Hidden Dependency</div>
          <div className="font-medium">{insight.hiddenDependency}</div>
        </div>

        <div>
          <div className="text-xs uppercase tracking-wide opacity-70">First Protective Move</div>
          <div className="font-medium">{insight.firstProtectiveMove}</div>
        </div>

        <div className="pt-2 text-sm opacity-80">{insight.trustSummary}</div>
      </div>
    </div>
  );
}

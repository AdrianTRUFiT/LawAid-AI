import React from "react";
import { AiopInterpretation } from "../../lib/aiop";

interface Props {
  interpretation: AiopInterpretation;
}

export function AiopMiniDashboard({ interpretation }: Props) {
  const { insight } = interpretation;

  const cards = [
    { label: "Pressure Center", value: insight.pressureCenter },
    { label: "At-Risk Area", value: insight.atRiskArea },
    { label: "First Action", value: insight.firstProtectiveMove },
    { label: "Suggested Next Module", value: insight.suggestedNextModule }
  ];

  return (
    <div className="rounded-xl border p-5">
      <div className="mb-4 text-lg font-semibold">Mini Dashboard Reveal</div>
      <div className="grid gap-3 md:grid-cols-2">
        {cards.map((card) => (
          <div key={card.label} className="rounded-lg border p-4">
            <div className="text-xs uppercase tracking-wide opacity-70">{card.label}</div>
            <div className="mt-1 font-medium">{card.value}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

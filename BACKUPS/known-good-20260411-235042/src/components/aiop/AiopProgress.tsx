import React from "react";
import { AiopStage } from "../../lib/aiop";
import { AIOP_STAGE_ORDER, getStageLabel } from "../../lib/aiop";

interface Props {
  currentStage: AiopStage;
}

export function AiopProgress({ currentStage }: Props) {
  return (
    <div className="rounded-xl border p-4">
      <div className="mb-3 text-sm font-semibold">AIOP Progress</div>
      <div className="grid gap-2 md:grid-cols-4">
        {AIOP_STAGE_ORDER.filter((stage) => stage !== "handoff").map((stage) => {
          const active = stage === currentStage;
          return (
            <div
              key={stage}
              className={`rounded-lg border px-3 py-2 text-sm ${
                active ? "border-black font-semibold" : "opacity-70"
              }`}
            >
              {getStageLabel(stage)}
            </div>
          );
        })}
      </div>
    </div>
  );
}

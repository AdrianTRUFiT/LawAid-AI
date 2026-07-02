import React from 'react';
import type { DiceSessionRecord } from '../../lib/dice';

type Props = {
  session: DiceSessionRecord | null;
};

export default function DiceSignalSummary({ session }: Props) {
  if (!session) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h3 className="text-lg font-bold text-legal-navy">Signal Summary</h3>
        <p className="mt-2 text-sm text-slate-500">
          Run Ask LawAidAI to generate a structured signal summary.
        </p>
      </div>
    );
  }

  const { classification, response } = session;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <h3 className="text-lg font-bold text-legal-navy">Signal Summary</h3>

      <div className="mt-4 grid gap-3 md:grid-cols-2">
        <Metric label="Domain" value={classification.dominantDomain} />
        <Metric label="Problem Class" value={classification.problemClass} />
        <Metric label="Urgency" value={classification.urgencyLevel} />
        <Metric label="Continuity Burden" value={classification.continuityBurden} />
        <Metric label="Emotional Weight" value={classification.emotionalWeight} />
        <Metric label="Next Step" value={response.recommendedNextStep} />
      </div>

      {classification.matchedSignals.length > 0 && (
        <div className="mt-4">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Matched Signals
          </div>
          <div className="mt-2 flex flex-wrap gap-2">
            {classification.matchedSignals.map((signal) => (
              <span
                key={signal}
                className="rounded-full border border-slate-200 bg-slate-50 px-2 py-1 text-xs text-slate-700"
              >
                {signal}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-3">
      <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
        {label}
      </div>
      <div className="mt-1 text-sm font-semibold text-slate-800">{value}</div>
    </div>
  );
}
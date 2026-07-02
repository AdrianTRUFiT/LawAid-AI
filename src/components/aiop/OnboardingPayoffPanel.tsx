import React from "react";
import type { AiopSessionState } from "../../lib/aiop";

type Props = {
  session: AiopSessionState | null;
};

export default function OnboardingPayoffPanel({ session }: Props) {
  const interpretation = session?.interpretation;

  const immediateReturnValues = interpretation
    ? [
        interpretation.insight.firstProtectiveMove,
        interpretation.insight.trustSummary,
      ].filter(Boolean)
    : [];

  const surfacedWarnings = interpretation?.riskSignals ?? [];

  const nextActions = interpretation
    ? [
        interpretation.routingDecision,
        interpretation.insight.suggestedNextModule,
      ].filter(Boolean)
    : [];

  const inferredDependencies = interpretation
    ? [
        interpretation.insight.hiddenDependency,
        interpretation.insight.atRiskArea,
      ].filter(Boolean)
    : [];

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <h3 className="text-lg font-bold text-legal-navy">Early Structure Payoff</h3>

      {!session || !interpretation ? (
        <p className="mt-2 text-sm text-slate-500">
          Structured payoff appears here as adaptive onboarding begins to interpret the issue.
        </p>
      ) : (
        <div className="mt-4 space-y-4">
          <Metric label="Pressure Category" value={interpretation.pressureCategory || "-"} />
          <Metric label="Routing Decision" value={interpretation.routingDecision || "-"} />
          <Metric label="Posture" value={interpretation.posture || "-"} />
          <Metric label="Readiness" value={interpretation.readinessState || "-"} />

          <Section title="Immediate Return Values" items={immediateReturnValues} />
          <Section title="Surfaced Warnings" items={surfacedWarnings} />
          <Section title="Next Actions" items={nextActions} />
          <Section title="Inferred Dependencies" items={inferredDependencies} />
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

function Section({ title, items }: { title: string; items: string[] }) {
  return (
    <div>
      <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
        {title}
      </div>
      {items.length === 0 ? (
        <div className="mt-1 text-sm text-slate-500">Nothing surfaced yet.</div>
      ) : (
        <ul className="mt-2 space-y-2 text-sm text-slate-700">
          {items.map((item, index) => (
            <li key={`${title}-${index}`}>â€¢ {item}</li>
          ))}
        </ul>
      )}
    </div>
  );
}

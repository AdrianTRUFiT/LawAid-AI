import { createLawAidAILaunchUxViewModel } from "./lawaidaiLaunchUxViewModel";
import { getLawAidAILaunchBoundaryCopy } from "./lawaidaiLaunchBoundaryCopy";

export function LawAidAILaunchPolicyPanel() {
  const viewModel = createLawAidAILaunchUxViewModel();
  const copy = getLawAidAILaunchBoundaryCopy();

  return (
    <section
      data-lawaidai-product-execution="pass-4-launch-policy-panel"
      className="rounded-2xl border border-slate-200 bg-white/90 p-4 shadow-sm"
    >
      <div className="flex flex-col gap-2">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            {copy.localLaunchCandidate}
          </p>
          <h2 className="text-lg font-semibold text-slate-950">
            {viewModel.title}
          </h2>
          <p className="mt-1 text-sm text-slate-600">
            {viewModel.subtitle}
          </p>
        </div>

        <div className="grid gap-2 md:grid-cols-2">
          {viewModel.visibleSurfaces.map((surface) => (
            <div
              key={surface.surfaceId}
              className="rounded-xl border border-slate-100 bg-slate-50 p-3"
            >
              <p className="text-sm font-medium text-slate-900">
                {surface.label}
              </p>
              <p className="mt-1 text-xs text-slate-600">
                {surface.purpose}
              </p>
            </div>
          ))}
        </div>

        {viewModel.wireLaterSurfaces.length > 0 && (
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-3">
            <p className="text-sm font-semibold text-amber-900">
              Wire Later
            </p>
            <ul className="mt-1 list-disc space-y-1 pl-5 text-xs text-amber-800">
              {viewModel.wireLaterSurfaces.map((surface) => (
                <li key={surface.surfaceId}>
                  {surface.label}: {surface.notes[0]}
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="rounded-xl border border-blue-200 bg-blue-50 p-3">
          <p className="text-sm font-semibold text-blue-950">
            Boundary Lock
          </p>
          <ul className="mt-1 list-disc space-y-1 pl-5 text-xs text-blue-900">
            {viewModel.boundaryMessages.map((message) => (
              <li key={message}>{message}</li>
            ))}
          </ul>
        </div>

        <p className="text-xs text-slate-500">
          {copy.noLegalAdvice}
        </p>
      </div>
    </section>
  );
}

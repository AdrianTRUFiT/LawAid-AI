import React, { useMemo } from "react";
import {
  AIOP_QUESTIONS,
  AiopQuestion,
  getQuestionsForStage,
  useAiopSession
} from "../lib/aiop";
import { AiopProgress } from "../components/aiop/AiopProgress";
import { AiopQuestionCard } from "../components/aiop/AiopQuestionCard";
import { AiopInsightPanel } from "../components/aiop/AiopInsightPanel";
import { AiopMiniDashboard } from "../components/aiop/AiopMiniDashboard";

function getRenderableQuestions(currentStage: AiopQuestion["stage"]): AiopQuestion[] {
  if (currentStage === "situation_snapshot") {
    return [];
  }

  if (currentStage === "commitment_readiness") {
    return [];
  }

  return getQuestionsForStage(currentStage);
}

export default function AiopIntakeView() {
  const { state, interpretation, answer, goNext, reset } = useAiopSession();

  const questions = useMemo(() => {
    if (state.currentStage === "handoff") {
      return [];
    }

    if (state.currentStage === "situation_snapshot") {
      return [];
    }

    if (state.currentStage === "commitment_readiness") {
      return [];
    }

    return getRenderableQuestions(state.currentStage as AiopQuestion["stage"]);
  }, [state.currentStage]);

  const canRenderPreview =
    state.currentStage === "system_preview" ||
    state.currentStage === "commitment_readiness" ||
    state.currentStage === "handoff";

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-6">
      <div className="rounded-2xl border p-6">
        <div className="text-sm uppercase tracking-wide opacity-70">AIOP</div>
        <h1 className="mt-2 text-3xl font-semibold">Adaptive Proof Intake</h1>
        <p className="mt-3 max-w-3xl opacity-80">
          This is the Acquire-stage intelligence shell. It adapts to pressure, surfaces
          hidden dependency, reflects structured value, and emits a Verified Opportunity
          artifact without pretending to be transaction or receiving truth.
        </p>
      </div>

      <AiopProgress currentStage={state.currentStage} />

      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-4">
          {state.currentStage === "situation_snapshot" ? (
            <div className="rounded-xl border p-5">
              <div className="text-lg font-semibold">Situation Snapshot</div>
              <p className="mt-2 opacity-80">
                The intake is narrowing the signal category into a more usable path.
              </p>
            </div>
          ) : null}

          {questions.map((question) => (
            <AiopQuestionCard
              key={question.id}
              question={question}
              value={state.responses[question.id]?.value}
              onChange={(value) => answer(question.id, value)}
            />
          ))}

          {state.currentStage === "commitment_readiness" ? (
            <div className="rounded-xl border p-5">
              <div className="text-lg font-semibold">Save Seam</div>
              <p className="mt-2 opacity-80">
                The user now has something worth keeping. This is where continuity,
                saving, and downstream expansion become rational.
              </p>
              <div className="mt-3 rounded-lg border p-3 text-sm">
                Payment readiness: <strong>{interpretation.paymentReadiness}</strong>
              </div>
            </div>
          ) : null}

          {state.currentStage === "handoff" && state.verifiedOpportunity ? (
            <div className="rounded-xl border p-5">
              <div className="text-lg font-semibold">Verified Opportunity Emitted</div>
              <p className="mt-2 opacity-80">
                Acquire-stage progression is now real because the artifact exists.
              </p>
              <pre className="mt-4 overflow-auto rounded-lg border p-3 text-xs">
{JSON.stringify(state.verifiedOpportunity, null, 2)}
              </pre>
            </div>
          ) : null}

          <div className="flex gap-3">
            {state.currentStage !== "handoff" ? (
              <button
                type="button"
                onClick={goNext}
                className="rounded-lg border px-4 py-2 font-medium"
              >
                Next
              </button>
            ) : null}

            <button
              type="button"
              onClick={reset}
              className="rounded-lg border px-4 py-2"
            >
              Reset Session
            </button>
          </div>
        </div>

        <div className="space-y-4">
          <AiopInsightPanel interpretation={interpretation} />
          {canRenderPreview ? <AiopMiniDashboard interpretation={interpretation} /> : null}
        </div>
      </div>
    </div>
  );
}

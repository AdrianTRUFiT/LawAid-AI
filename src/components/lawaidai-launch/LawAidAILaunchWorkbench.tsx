import React, { useMemo, useState } from "react";
import {
  LAWAIDAI_PLANS,
  activateFromCheckout,
  beginCheckout,
  buildLawAidAILaunchState,
  buildLawAidAIStripeCheckoutPayload,
  convertTrialToPaid,
  deriveSubscriptionState,
  formatPlanPrice,
  getLawAidAIPlan,
  markPaymentFailed,
  renewSubscription,
  type LawAidAICourseReflection,
  type LawAidAIPlanId,
  type SubscriptionRecord,
} from "../../lib/lawaidai-launch";

const shellCard: React.CSSProperties = {
  border: "1px solid #d9dee8",
  borderRadius: 16,
  padding: 20,
  background: "#ffffff",
  boxShadow: "0 8px 24px rgba(15, 23, 42, 0.06)",
};

const muted = { color: "#64748b" };

export function LawAidAILaunchWorkbench(): JSX.Element {
  const [selectedPlanId, setSelectedPlanId] = useState<LawAidAIPlanId>("annual_pro");
  const [subscription, setSubscription] = useState<SubscriptionRecord | undefined>();
  const [course, setCourse] = useState<LawAidAICourseReflection>({
    onboardingComplete: true,
    trialStarted: true,
    paidPending: true,
    activated: false,
    complete: false,
    blocked: false,
    trapped: false,
    consequenceCheckpointId: "cp_192",
  });

  const launchState = useMemo(() => {
    return buildLawAidAILaunchState({
      course,
      planId: selectedPlanId,
      subscription,
    });
  }, [course, selectedPlanId, subscription]);

  const checkoutPayload = useMemo(() => {
    return buildLawAidAIStripeCheckoutPayload({
      planId: selectedPlanId,
      customerEmail: "adrianlegalstuff@gmail.com",
      successUrl: "https://example.com/lawaidai/success",
      cancelUrl: "https://example.com/lawaidai/cancel",
    });
  }, [selectedPlanId]);

  const activePlan = getLawAidAIPlan(selectedPlanId);

  return (
    <div style={{ padding: 24, background: "#f8fafc", minHeight: "100vh" }}>
      <div style={{ maxWidth: 1280, margin: "0 auto", display: "grid", gap: 20 }}>
        <div style={{ ...shellCard, paddingBottom: 16 }}>
          <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: "#b45309" }}>
            LawAidAI Launch Workbench
          </div>
          <h1 style={{ margin: "10px 0 8px", fontSize: 32, color: "#0f172a" }}>
            Subscription launch logic, access state, and checkout staging
          </h1>
          <div style={muted}>
            This is a controllable internal workbench for the LawAidAI launch path. It stages annual trial logic, monthly and quarterly direct-paid logic, and workspace access state without touching live Stripe yet.
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: 20 }}>
          <div style={{ ...shellCard }}>
            <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 12, color: "#0f172a" }}>Plan selection</div>
            <div style={{ display: "grid", gap: 14 }}>
              {LAWAIDAI_PLANS.map((plan) => {
                const selected = plan.id === selectedPlanId;
                return (
                  <button
                    key={plan.id}
                    type="button"
                    onClick={() => setSelectedPlanId(plan.id)}
                    style={{
                      textAlign: "left",
                      borderRadius: 16,
                      padding: 18,
                      border: selected ? "2px solid #b45309" : "1px solid #d9dee8",
                      background: selected ? "#fff7ed" : "#fff",
                      cursor: "pointer",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", gap: 12 }}>
                      <div>
                        <div style={{ fontWeight: 800, fontSize: 22, color: "#0f172a" }}>{plan.name}</div>
                        <div style={{ ...muted, marginTop: 4 }}>{formatPlanPrice(plan.priceCents, plan.interval)}</div>
                      </div>
                      {plan.mainOffer ? (
                        <div style={{ background: "#b45309", color: "#fff", padding: "6px 10px", borderRadius: 999, fontSize: 11, fontWeight: 700 }}>
                          MAIN OFFER
                        </div>
                      ) : null}
                    </div>
                    <div style={{ marginTop: 10, ...muted }}>{plan.description}</div>
                    <div style={{ marginTop: 12, display: "grid", gap: 6 }}>
                      {plan.features.map((feature) => (
                        <div key={feature} style={{ color: "#334155", fontSize: 14 }}>
                          • {feature}
                        </div>
                      ))}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div style={{ ...shellCard }}>
            <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 12, color: "#0f172a" }}>Current launch state</div>
            <div style={{ display: "grid", gap: 10 }}>
              <div><strong>Selected plan:</strong> {activePlan.name}</div>
              <div><strong>Subscription state:</strong> {launchState.subscriptionState}</div>
              <div><strong>Workspace gate:</strong> {launchState.workspace.gateState}</div>
              <div><strong>Commercially active:</strong> {String(launchState.isCommerciallyActive)}</div>
              <div><strong>Trial:</strong> {String(launchState.isTrial)}</div>
              <div><strong>Read only:</strong> {String(launchState.isReadOnly)}</div>
              <div><strong>Requires checkout:</strong> {String(launchState.requiresCheckout)}</div>
              <div><strong>Requires reactivation:</strong> {String(launchState.requiresReactivation)}</div>
              <div><strong>Consequence checkpoint:</strong> {launchState.consequenceCheckpointId ?? "none"}</div>
            </div>

            <div style={{ marginTop: 16, padding: 14, borderRadius: 14, background: "#f8fafc", border: "1px solid #e2e8f0" }}>
              <div style={{ fontWeight: 700, color: "#0f172a", marginBottom: 6 }}>Why this state exists</div>
              <div style={muted}>{launchState.workspace.reason}</div>
              {launchState.workspace.primaryActionLabel ? (
                <div style={{ marginTop: 10, color: "#0f172a", fontWeight: 700 }}>
                  Suggested action: {launchState.workspace.primaryActionLabel}
                </div>
              ) : null}
            </div>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
          <div style={{ ...shellCard }}>
            <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 12, color: "#0f172a" }}>Controlled actions</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
              <button
                type="button"
                onClick={() => setSubscription(beginCheckout("adrianlegalstuff@gmail.com", selectedPlanId))}
                style={actionButton("#0f172a")}
              >
                Begin checkout
              </button>

              <button
                type="button"
                onClick={() => setSubscription(activateFromCheckout("adrianlegalstuff@gmail.com", selectedPlanId, "stripe_demo_checkout"))}
                style={actionButton("#0f172a")}
              >
                Complete checkout
              </button>

              <button
                type="button"
                onClick={() => {
                  if (!subscription) return;
                  setSubscription(convertTrialToPaid(subscription, "stripe_demo_trial_to_paid"));
                }}
                style={actionButton("#0f172a")}
              >
                Convert annual trial to paid
              </button>

              <button
                type="button"
                onClick={() => {
                  if (!subscription) return;
                  setSubscription(renewSubscription(subscription, "stripe_demo_renewal"));
                }}
                style={actionButton("#0f172a")}
              >
                Renew subscription
              </button>

              <button
                type="button"
                onClick={() => {
                  if (!subscription) return;
                  setSubscription(markPaymentFailed(subscription));
                }}
                style={actionButton("#991b1b")}
              >
                Mark payment failed
              </button>

              <button
                type="button"
                onClick={() =>
                  setCourse((prev) => ({
                    ...prev,
                    blocked: !prev.blocked,
                  }))
                }
                style={actionButton("#7c2d12")}
              >
                Toggle blocked
              </button>

              <button
                type="button"
                onClick={() =>
                  setCourse((prev) => ({
                    ...prev,
                    trapped: !prev.trapped,
                  }))
                }
                style={actionButton("#7c2d12")}
              >
                Toggle trapped
              </button>

              <button
                type="button"
                onClick={() =>
                  setCourse((prev) => ({
                    ...prev,
                    activated: !prev.activated,
                    complete: !prev.complete,
                  }))
                }
                style={actionButton("#065f46")}
              >
                Toggle activated/complete
              </button>

              <button
                type="button"
                onClick={() => {
                  setSubscription(undefined);
                  setCourse({
                    onboardingComplete: true,
                    trialStarted: true,
                    paidPending: true,
                    activated: false,
                    complete: false,
                    blocked: false,
                    trapped: false,
                    consequenceCheckpointId: "cp_192",
                  });
                }}
                style={actionButton("#475569")}
              >
                Reset workbench
              </button>
            </div>
          </div>

          <div style={{ ...shellCard }}>
            <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 12, color: "#0f172a" }}>Stripe checkout payload staging</div>
            <pre
              style={{
                margin: 0,
                padding: 16,
                background: "#0f172a",
                color: "#e2e8f0",
                borderRadius: 14,
                overflowX: "auto",
                fontSize: 12,
                lineHeight: 1.55,
              }}
            >
{JSON.stringify(checkoutPayload, null, 2)}
            </pre>
          </div>
        </div>

        <div style={{ ...shellCard }}>
          <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 12, color: "#0f172a" }}>Subscription snapshot</div>
          <pre
            style={{
              margin: 0,
              padding: 16,
              background: "#f8fafc",
              color: "#0f172a",
              borderRadius: 14,
              overflowX: "auto",
              fontSize: 12,
              lineHeight: 1.55,
              border: "1px solid #e2e8f0",
            }}
          >
{JSON.stringify(
  {
    selectedPlan: activePlan.id,
    derivedSubscriptionState: deriveSubscriptionState(subscription),
    subscription,
    course,
    launchState,
  },
  null,
  2
)}
          </pre>
        </div>
      </div>
    </div>
  );
}

function actionButton(background: string): React.CSSProperties {
  return {
    padding: "12px 14px",
    borderRadius: 12,
    border: "none",
    background,
    color: "#fff",
    fontWeight: 700,
    cursor: "pointer",
  };
}

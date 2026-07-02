import type {
  OpeEvent,
  OpeExperience,
  OpeState,
} from "../../types/ope";

function nowIso(): string {
  return new Date().toISOString();
}

function makeEvent(
  type: OpeEvent["type"],
  stage: OpeEvent["stage"],
  actorType: OpeEvent["actorType"],
  actorId: string,
  subjectId: string,
  message: string,
  metadata?: Record<string, unknown>
): OpeEvent {
  return {
    id: crypto.randomUUID(),
    type,
    stage,
    actorType,
    actorId,
    subjectId,
    message,
    timestamp: nowIso(),
    metadata,
  };
}

export function getExperienceById(state: OpeState, experienceId?: string): OpeExperience | undefined {
  return state.experiences.find((x) => x.id === experienceId);
}

export function enterEnvironment(state: OpeState): OpeState {
  return {
    ...state,
    currentStage: "entered",
    events: [
      ...state.events,
      makeEvent(
        "entry",
        "entered",
        "consumer",
        state.consumer.id,
        state.consumer.id,
        `${state.consumer.name} entered the environment.`
      ),
    ],
  };
}

export function completeOnboarding(state: OpeState): OpeState {
  return {
    ...state,
    currentStage: "onboarded",
    events: [
      ...state.events,
      makeEvent(
        "onboarding",
        "onboarded",
        "consumer",
        state.consumer.id,
        state.consumer.id,
        `${state.consumer.name} completed adaptive onboarding.`,
        { preferences: state.consumer.preferences }
      ),
    ],
  };
}

export function selectExperience(state: OpeState, experienceId: string): OpeState {
  const experience = getExperienceById(state, experienceId);
  if (!experience) return state;

  return {
    ...state,
    selectedExperienceId: experienceId,
    currentStage: "experience_selected",
    events: [
      ...state.events,
      makeEvent(
        "selection",
        "experience_selected",
        "consumer",
        state.consumer.id,
        experience.id,
        `${state.consumer.name} selected ${experience.label}.`,
        { merchantId: experience.merchantId, priceCents: experience.priceCents }
      ),
    ],
  };
}

export function approvePurchase(state: OpeState): OpeState {
  const experience = getExperienceById(state, state.selectedExperienceId);
  if (!experience) return state;

  if (state.consumer.remainingBudget < experience.priceCents / 100) {
    return {
      ...state,
      currentStage: "exception",
      openException: {
        code: "BUDGET_SHORTFALL",
        message: "Purchase denied because remaining budget is too low.",
        fixMessage: "Increase budget or choose a lower-cost experience.",
      },
      events: [
        ...state.events,
        makeEvent(
          "exception",
          "exception",
          "operator",
          state.operator.id,
          experience.id,
          `Approval denied for ${experience.label} due to insufficient budget.`,
          { remainingBudget: state.consumer.remainingBudget, required: experience.priceCents / 100 }
        ),
      ],
    };
  }

  return {
    ...state,
    currentStage: "purchase_approved",
    openException: undefined,
    events: [
      ...state.events,
      makeEvent(
        "approval",
        "purchase_approved",
        "operator",
        state.operator.id,
        experience.id,
        `Purchase approved for ${experience.label}.`,
        { priceCents: experience.priceCents, merchantId: experience.merchantId }
      ),
      makeEvent(
        "purchase",
        "purchase_approved",
        "consumer",
        state.consumer.id,
        experience.id,
        `${state.consumer.name} committed to ${experience.label}.`,
        { priceCents: experience.priceCents }
      ),
    ],
  };
}

export function fulfillExperience(state: OpeState): OpeState {
  const experience = getExperienceById(state, state.selectedExperienceId);
  if (!experience) return state;

  return {
    ...state,
    currentStage: "fulfilled",
    merchant: {
      ...state.merchant,
      fulfilledCount: state.merchant.fulfilledCount + 1,
    },
    events: [
      ...state.events,
      makeEvent(
        "fulfillment",
        "fulfilled",
        "merchant",
        state.merchant.id,
        experience.id,
        `${state.merchant.name} fulfilled ${experience.label}.`,
        { availability: state.merchant.availability }
      ),
    ],
  };
}

export function settlePurchase(state: OpeState): OpeState {
  const experience = getExperienceById(state, state.selectedExperienceId);
  if (!experience) return state;

  const dollars = experience.priceCents / 100;
  const merchantShare = Math.round(experience.priceCents * 0.85);
  const operatorShare = experience.priceCents - merchantShare;

  return {
    ...state,
    currentStage: "settled",
    consumer: {
      ...state.consumer,
      remainingBudget: Number((state.consumer.remainingBudget - dollars).toFixed(2)),
      status: "completed",
    },
    merchant: {
      ...state.merchant,
      revenueCents: state.merchant.revenueCents + merchantShare,
    },
    operator: {
      ...state.operator,
      settledCents: state.operator.settledCents + experience.priceCents,
      allocationCents: state.operator.allocationCents + operatorShare,
    },
    events: [
      ...state.events,
      makeEvent(
        "allocation",
        "settled",
        "operator",
        state.operator.id,
        experience.id,
        `Allocation prepared: merchant ${merchantShare} cents, operator ${operatorShare} cents.`,
        { merchantShare, operatorShare }
      ),
      makeEvent(
        "settlement",
        "settled",
        "operator",
        state.operator.id,
        experience.id,
        `Settlement completed for ${experience.label}.`,
        { totalCents: experience.priceCents }
      ),
    ],
  };
}

export function injectAvailabilityException(state: OpeState): OpeState {
  const experience = getExperienceById(state, state.selectedExperienceId);
  if (!experience) return state;

  return {
    ...state,
    currentStage: "exception",
    openException: {
      code: "TABLE_UNAVAILABLE",
      message: "Selected experience cannot be fulfilled because no table/slot is available.",
      fixMessage: "Route to next available slot and continue fulfillment.",
    },
    operator: {
      ...state.operator,
      anomalyCount: state.operator.anomalyCount + 1,
    },
    events: [
      ...state.events,
      makeEvent(
        "exception",
        "exception",
        "operator",
        state.operator.id,
        experience.id,
        `Availability exception raised for ${experience.label}.`,
        { code: "TABLE_UNAVAILABLE" }
      ),
    ],
  };
}

export function fixAvailabilityException(state: OpeState): OpeState {
  if (!state.openException) return state;
  const experience = getExperienceById(state, state.selectedExperienceId);
  if (!experience) return state;

  return {
    ...state,
    currentStage: "purchase_approved",
    openException: undefined,
    merchant: {
      ...state.merchant,
      availability: "Re-routed to next available slot",
    },
    events: [
      ...state.events,
      makeEvent(
        "fix",
        "purchase_approved",
        "operator",
        state.operator.id,
        experience.id,
        `Exception resolved for ${experience.label}; moved to next available slot.`
      ),
    ],
  };
}

export function runAutoSimulation(initial: OpeState): OpeState {
  let state = enterEnvironment(initial);
  state = completeOnboarding(state);
  state = selectExperience(state, initial.experiences[0]?.id ?? "");
  state = approvePurchase(state);
  state = injectAvailabilityException(state);
  state = fixAvailabilityException(state);
  state = fulfillExperience(state);
  state = settlePurchase(state);
  return state;
}

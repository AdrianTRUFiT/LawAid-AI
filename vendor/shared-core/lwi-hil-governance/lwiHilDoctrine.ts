export const LWI_HIL_DOCTRINE = {
  name: "LWI / HIL Personal Operating Law",
  lwi: "Lead With Intelligence",
  hil: "Highest Intelligence Layer",
  status: "PERSONAL_LAW_FORWARD_USE",
  definition:
    "LWI requires every interaction, decision, build step, review, publication, route, authorization, exposure, or execution to operate from the Highest Intelligence Layer mathematically possible under the available context.",
  purpose: [
    "Prevent action from outrunning intelligence.",
    "Prevent intelligence from outrunning authority.",
    "Preserve adaptive intelligence before action.",
    "Reduce drift, exposure, false authority, and unnecessary consequence."
  ],
  placement: {
    isProduct: false,
    isUmbrella: false,
    isRateEngine: false,
    isDashboard: false,
    isAuthorityOverride: false,
    isOperatingDiscipline: true
  },
  hilIncludes: [
    "best available context",
    "correct authority layer",
    "verified source truth",
    "least architectural drift",
    "strongest boundary awareness",
    "clearest consequence map",
    "lowest unnecessary exposure",
    "highest human control",
    "adaptive intelligence before action"
  ],
  appliedQuestion:
    "What is the highest available intelligence layer that should govern this decision?",
  finalDoctrineLine:
    "LWI ensures action does not outrun intelligence. HIL ensures intelligence does not outrun authority."
} as const;

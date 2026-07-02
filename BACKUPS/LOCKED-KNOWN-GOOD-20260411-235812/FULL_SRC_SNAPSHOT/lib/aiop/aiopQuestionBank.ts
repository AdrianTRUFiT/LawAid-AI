import { AiopQuestion } from "./aiopContracts";

export const AIOP_QUESTIONS: AiopQuestion[] = [
  {
    id: "pressure",
    stage: "entry",
    prompt: "What is putting the most pressure on you right now?",
    helperText: "Choose the pressure center first. This sets the adaptive path.",
    type: "single_select",
    required: true,
    options: [
      { value: "deadline", label: "A deadline or date" },
      { value: "communication", label: "Communication problems" },
      { value: "money", label: "Money / cost pressure" },
      { value: "missing_access", label: "Missing access or missing information" },
      { value: "uncertainty", label: "I do not know what to do next" },
      { value: "evidence", label: "Records / evidence feel messy" },
      { value: "other", label: "Other" }
    ]
  },
  {
    id: "risk",
    stage: "reality_check",
    prompt: "What feels most exposed or at risk right now?",
    helperText: "This helps the system surface the hidden dependency sooner.",
    type: "single_select",
    required: true,
    options: [
      { value: "timeline", label: "My timeline is unstable" },
      { value: "documentation", label: "My documentation is incomplete" },
      { value: "misunderstanding", label: "I may be misunderstood" },
      { value: "position", label: "My position feels weak" },
      { value: "money", label: "The financial side feels exposed" },
      { value: "unknown", label: "I am not fully sure yet" }
    ]
  },
  {
    id: "posture",
    stage: "identity_posture",
    prompt: "How are you handling this right now?",
    type: "single_select",
    required: true,
    options: [
      { value: "solo", label: "I am handling this myself" },
      { value: "represented", label: "I am working with someone already" },
      { value: "transitioning", label: "I am in transition / changing support" },
      { value: "uncertain", label: "I am not sure yet" }
    ]
  },
  {
    id: "name",
    stage: "context_capture",
    prompt: "What name should this session be saved under?",
    helperText: "Optional now. Useful when you want to keep continuity.",
    type: "text",
    required: false
  },
  {
    id: "email",
    stage: "context_capture",
    prompt: "What email should be attached to this session?",
    helperText: "Optional in preview. Useful for continuity later.",
    type: "text",
    required: false
  },
  {
    id: "notes",
    stage: "system_preview",
    prompt: "Add one sentence that best describes the situation in your own words.",
    helperText: "Optional. This strengthens the handoff package.",
    type: "text",
    required: false
  }
];

export function getQuestionsForStage(stage: AiopQuestion["stage"]): AiopQuestion[] {
  return AIOP_QUESTIONS.filter((question) => question.stage === stage);
}

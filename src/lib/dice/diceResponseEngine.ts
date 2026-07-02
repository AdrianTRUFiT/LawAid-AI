import type {
  DiceClassification,
  DicePrimerResponse,
  DiceResponseMode,
} from './diceContracts';

function determineMode(classification: DiceClassification): DiceResponseMode {
  if (classification.problemClass === 'management_grade') {
    if (classification.emotionalWeight === 'high') return 'pressure_reduction';
    return 'system_recommendation';
  }

  if (classification.problemClass === 'structured') {
    if (classification.continuityBurden === 'high') return 'continuity_warning';
    return 'clarification';
  }

  return 'guidance';
}

export function buildDicePrimerResponse(
  classification: DiceClassification
): DicePrimerResponse {
  const mode = determineMode(classification);

  switch (mode) {
    case 'guidance':
      return {
        mode,
        directGuidance: [
          'This looks like a relatively simple issue and likely does not need a full management workflow yet.',
          'Handle the next practical step directly and keep a copy of what you send or receive.',
        ],
        problemFraming:
          'This appears to be a straightforward question with low continuity burden.',
        watchOut:
          'If the issue turns into repeated back-and-forth, missed timing, or document confusion, it stops being simple.',
        continuationSuggestion:
          'You may not need the full system for this right now. If the issue grows, continue with Ask LawAidAI.',
        recommendedNextStep: 'stop',
      };

    case 'clarification':
      return {
        mode,
        directGuidance: [
          'There is enough here to help, but the situation still needs one or two clarifying details.',
          'The next best move is to narrow the issue before acting too broadly.',
        ],
        problemFraming:
          'This appears to be a structured issue with more than one moving part.',
        watchOut:
          'If you respond without clarifying the posture, timing, or communication path, the situation can become harder to manage.',
        continuationSuggestion:
          'Continue with Ask LawAidAI so the system can narrow the issue and return a more targeted next step.',
        recommendedNextStep: 'clarify',
      };

    case 'continuity_warning':
      return {
        mode,
        directGuidance: [
          'The issue is not only about the answer. It is also about preserving continuity around the answer.',
          'Start organizing the records, dates, or communications tied to this issue now.',
        ],
        problemFraming:
          'This appears to have moderate continuity burden, which means missing context may create later problems.',
        watchOut:
          'If records, replies, or dates are not kept together, confusion can compound even if the first step is correct.',
        continuationSuggestion:
          'Continue with Ask LawAidAI so the system can identify what needs to be tracked and what should be protected first.',
        recommendedNextStep: 'continue_with_ask_lawaidai',
      };

    case 'pressure_reduction':
      return {
        mode,
        directGuidance: [
          'The first goal is not to do everything. It is to reduce the next action to something manageable.',
          'Take the smallest useful step first and avoid trying to solve the whole situation in one move.',
        ],
        problemFraming:
          'This appears to carry emotional or cognitive pressure that may reduce task capacity.',
        watchOut:
          'When pressure is high, important details are easier to miss if the situation is handled too broadly or too quickly.',
        continuationSuggestion:
          'Continue with Ask LawAidAI so the system can reduce action size and structure the situation without overwhelm.',
        recommendedNextStep: 'continue_with_ask_lawaidai',
      };

    case 'system_recommendation':
    default:
      return {
        mode: 'system_recommendation',
        directGuidance: [
          'This is no longer just a one-off question. It looks like something that benefits from ongoing management and continuity.',
          'The system can help organize deadlines, communications, documents, and next actions from one place.',
        ],
        problemFraming:
          'This appears to be a management-grade issue with meaningful continuity burden.',
        watchOut:
          'If this stays unmanaged, the risk is usually not one answer being wrong. The risk is fragmented follow-through, missed context, or accumulated confusion.',
        continuationSuggestion:
          'Begin guided continuation so the system can turn this into a structured, manageable workflow.',
        recommendedNextStep: 'begin_trial',
      };
  }
}

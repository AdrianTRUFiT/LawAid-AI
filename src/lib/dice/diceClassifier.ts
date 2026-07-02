import type {
  DiceCapturedSignalInput,
  DiceClassification,
} from "./diceContracts";

export function classifyDiceSignal(
  input: DiceCapturedSignalInput,
): DiceClassification {
  const text = input.rawText.toLowerCase();

  const hasLegal =
    /court|judge|lawyer|attorney|custody|divorce|motion|hearing|order|evidence|trial/.test(text);
  const hasFinancial =
    /invoice|payment|debt|billing|money|expense|bank|charge|processor|settlement/.test(text);
  const hasWellness =
    /stress|anxiety|sleep|burnout|wellness|mental|emotion|overwhelmed/.test(text);

  const dominantDomain =
    hasLegal && hasFinancial
      ? "mixed"
      : hasLegal
      ? "legal"
      : hasFinancial
      ? "financial"
      : hasWellness
      ? "wellness"
      : "mixed";

  const urgencyLevel =
    /urgent|immediately|asap|deadline|tomorrow|today|hearing|shut off|eviction/.test(text)
      ? "high"
      : /soon|worried|risk|behind|late|confused/.test(text)
      ? "moderate"
      : "low";

  const continuityBurden =
    /timeline|records|documents|evidence|messages|history|thread|paperwork/.test(text)
      ? "high"
      : /details|context|explain|multiple/.test(text)
      ? "moderate"
      : "low";

  const emotionalWeight =
    /panic|terrified|devastated|overwhelmed|exhausted|breaking/.test(text)
      ? "high"
      : /stress|anxious|worried|confused/.test(text)
      ? "moderate"
      : "low";

  const problemClass =
    continuityBurden === "high" || dominantDomain === "mixed"
      ? "management_grade"
      : urgencyLevel === "high" || emotionalWeight === "high"
      ? "structured"
      : "simple";

  const matchedSignals = [
    hasLegal ? "legal" : null,
    hasFinancial ? "financial" : null,
    hasWellness ? "wellness" : null,
    urgencyLevel === "high" ? "urgent" : null,
    continuityBurden === "high" ? "continuity_burden" : null,
  ].filter(Boolean) as string[];

  const signalConfidence =
    matchedSignals.length >= 3 ? 0.92 :
    matchedSignals.length === 2 ? 0.84 :
    matchedSignals.length === 1 ? 0.72 : 0.6;

  const continuationLikelihood =
    problemClass === "management_grade"
      ? "high"
      : problemClass === "structured"
      ? "medium"
      : "low";

  return {
    dominantDomain,
    problemClass,
    urgencyLevel,
    continuityBurden,
    emotionalWeight,
    signalConfidence,
    continuationLikelihood,
    matchedSignals,
  };
}

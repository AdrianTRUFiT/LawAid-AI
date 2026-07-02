export type MeterEvent = {
  eventId: string;
  type: string;
  artifactId: string;
  timestamp: number;
  fee: number;
};

export function calculateFee(type: string): number {
  const base = 0.001;

  if (type === "CONSEQUENCE") return base * 10;
  if (type === "VERIFICATION") return base * 5;
  if (type === "ROUTE") return base * 2;

  return base;
}

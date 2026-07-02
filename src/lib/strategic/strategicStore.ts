import type { StrategicIntakeItem } from "../../types/strategicIntake";
import seedItems from "../../dev/strategicIntake.seed.json";

const STORAGE_KEY = "lawaidai-strategic-intake";

function safeRead(): StrategicIntakeItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return seedItems as StrategicIntakeItem[];
    }
    return JSON.parse(raw) as StrategicIntakeItem[];
  } catch {
    return seedItems as StrategicIntakeItem[];
  }
}

function safeWrite(items: StrategicIntakeItem[]): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

export function listStrategicItems(): StrategicIntakeItem[] {
  return safeRead().sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function saveStrategicItems(items: StrategicIntakeItem[]): StrategicIntakeItem[] {
  safeWrite(items);
  return items;
}

export function clearStrategicItems(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(STORAGE_KEY);
}

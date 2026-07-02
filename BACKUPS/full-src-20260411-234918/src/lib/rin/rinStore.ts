import type { RinDecodeResult, RinIdentity, RinRecord } from '../../types/rin';

const RIN_STORAGE_KEY = 'lawaidai_rin_store_v1';

export interface RinStoreState {
  intakes: RinDecodeResult['intake'][];
  identities: RinIdentity[];
  records: RinRecord[];
}

export function loadRinStore(): RinStoreState {
  try {
    const raw = localStorage.getItem(RIN_STORAGE_KEY);
    if (!raw) return { intakes: [], identities: [], records: [] };
    return JSON.parse(raw) as RinStoreState;
  } catch {
    return { intakes: [], identities: [], records: [] };
  }
}

export function saveRinStore(state: RinStoreState): void {
  localStorage.setItem(RIN_STORAGE_KEY, JSON.stringify(state));
}

export function appendRinDecodeResult(result: RinDecodeResult): RinStoreState {
  const current = loadRinStore();
  const next: RinStoreState = {
    intakes: [...current.intakes, result.intake],
    identities: [...current.identities, ...result.identities],
    records: [...current.records, ...result.records],
  };
  saveRinStore(next);
  return next;
}

export function clearRinStore(): void {
  localStorage.removeItem(RIN_STORAGE_KEY);
}
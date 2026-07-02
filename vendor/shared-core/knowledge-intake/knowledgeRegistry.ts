import fs from 'fs';
import path from 'path';
import { RuntimeKnowledgeRegistryEntry } from './knowledgeContracts';

const registryDir = 'D:/DEV/AIVA/shared-data/knowledge-registry';

function ensureStore() {
  fs.mkdirSync(registryDir, { recursive: true });
}

function fileFor(entryId: string) {
  return path.join(registryDir, entryId + '.json');
}

export function saveKnowledgeEntry(entry: RuntimeKnowledgeRegistryEntry) {
  ensureStore();
  fs.writeFileSync(fileFor(entry.entryId), JSON.stringify(entry, null, 2), 'utf8');
  return entry;
}

export function getKnowledgeEntry(entryId: string): RuntimeKnowledgeRegistryEntry | null {
  ensureStore();
  const file = fileFor(entryId);
  if (!fs.existsSync(file)) return null;
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

export function listKnowledgeEntries(): RuntimeKnowledgeRegistryEntry[] {
  ensureStore();
  return fs.readdirSync(registryDir)
    .filter(f => f.endsWith('.json'))
    .map(f => JSON.parse(fs.readFileSync(path.join(registryDir, f), 'utf8')));
}

import type { ChecklistItem, ChecklistTemplate } from '../../types/checklist';

const STORAGE_KEY = 'lawaidai_checklists_v1';

function loadAll(): ChecklistItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as ChecklistItem[];
  } catch {
    return [];
  }
}

function saveAll(items: ChecklistItem[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

function makeId() {
  return `chk_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

export function getChecklistItems(projectId: string): ChecklistItem[] {
  return loadAll()
    .filter((item) => item.projectId === projectId)
    .sort((a, b) => {
      const aDue = a.dueDate ?? '';
      const bDue = b.dueDate ?? '';
      return aDue.localeCompare(bDue) || a.createdAt.localeCompare(b.createdAt);
    });
}

export function addChecklistItem(
  input: Omit<ChecklistItem, 'id' | 'createdAt' | 'updatedAt'>
): ChecklistItem {
  const current = loadAll();
  const now = new Date().toISOString();

  const item: ChecklistItem = {
    ...input,
    id: makeId(),
    createdAt: now,
    updatedAt: now,
  };

  const next = [...current, item];
  saveAll(next);
  return item;
}

export function updateChecklistItem(id: string, patch: Partial<ChecklistItem>): ChecklistItem | null {
  const current = loadAll();
  const index = current.findIndex((item) => item.id === id);
  if (index === -1) return null;

  const updated: ChecklistItem = {
    ...current[index],
    ...patch,
    updatedAt: new Date().toISOString(),
  };

  current[index] = updated;
  saveAll(current);
  return updated;
}

export function deleteChecklistItem(id: string): void {
  const current = loadAll();
  saveAll(current.filter((item) => item.id !== id));
}

export function seedChecklistTemplate(projectId: string, template: ChecklistTemplate): ChecklistItem[] {
  const created: ChecklistItem[] = [];

  for (const templateItem of template.items) {
    created.push(
      addChecklistItem({
        projectId,
        templateKey: template.key,
        title: templateItem.title,
        description: templateItem.description,
        category: templateItem.category,
        priority: templateItem.priority,
        status: 'not_started',
        blockedBy: [],
        linkedRecordIds: [],
        linkedTaskIds: [],
        linkedEventIds: [],
        notes: '',
      })
    );
  }

  return created;
}

export function clearChecklistProject(projectId: string) {
  const current = loadAll();
  saveAll(current.filter((item) => item.projectId !== projectId));
}
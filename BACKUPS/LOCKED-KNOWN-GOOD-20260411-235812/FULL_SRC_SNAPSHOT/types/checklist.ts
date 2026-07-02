export type ChecklistStatus = 'not_started' | 'in_progress' | 'blocked' | 'done';
export type ChecklistPriority = 'low' | 'medium' | 'high' | 'critical';
export type ChecklistCategory =
  | 'procedure'
  | 'evidence'
  | 'financial'
  | 'parenting'
  | 'witness'
  | 'testimony'
  | 'packet'
  | 'settlement'
  | 'communication'
  | 'other';

export interface ChecklistItem {
  id: string;
  projectId: string;
  templateKey?: string;
  title: string;
  description: string;
  category: ChecklistCategory;
  status: ChecklistStatus;
  priority: ChecklistPriority;
  dueDate?: string;
  owner?: string;
  notes?: string;
  blockedBy?: string[];
  linkedRecordIds?: string[];
  linkedTaskIds?: string[];
  linkedEventIds?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface ChecklistTemplateItem {
  title: string;
  description: string;
  category: ChecklistCategory;
  priority: ChecklistPriority;
}

export interface ChecklistTemplate {
  key: string;
  label: string;
  description: string;
  items: ChecklistTemplateItem[];
}
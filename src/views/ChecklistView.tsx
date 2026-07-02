import React, { useMemo, useState } from 'react';
import { CheckSquare, Plus, Trash2, ClipboardList, AlertCircle } from 'lucide-react';
import { useProject } from '../context/ProjectContext';
import type { ChecklistCategory, ChecklistItem, ChecklistPriority, ChecklistStatus } from '../types/checklist';
import {
  addChecklistItem,
  clearChecklistProject,
  deleteChecklistItem,
  getChecklistItems,
  seedChecklistTemplate,
  updateChecklistItem,
} from '../lib/checklist/checklistStore';
import { CHECKLIST_TEMPLATES, getChecklistTemplate } from '../lib/checklist/checklistTemplates';

export default function ChecklistView() {
  const { activeProject } = useProject();
  const [refreshKey, setRefreshKey] = useState(0);
  const [selectedTemplateKey, setSelectedTemplateKey] = useState(CHECKLIST_TEMPLATES[0]?.key ?? '');
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newCategory, setNewCategory] = useState<ChecklistCategory>('other');
  const [newPriority, setNewPriority] = useState<ChecklistPriority>('medium');

  const items = useMemo(() => {
    if (!activeProject) return [];
    return getChecklistItems(activeProject.id);
  }, [activeProject, refreshKey]);

  const grouped = useMemo(() => {
    return {
      critical: items.filter((i) => i.priority === 'critical' && i.status !== 'done'),
      inProgress: items.filter((i) => i.status === 'in_progress'),
      blocked: items.filter((i) => i.status === 'blocked'),
      done: items.filter((i) => i.status === 'done'),
      all: items,
    };
  }, [items]);

  if (!activeProject) {
    return (
      <div className="rounded-2xl border p-8 bg-white">
        <h1 className="text-2xl font-bold text-legal-navy">Checklist</h1>
        <p className="mt-3 text-slate-500">Select a case first to load a checklist workspace.</p>
      </div>
    );
  }

  const handleSeedTemplate = () => {
    const template = getChecklistTemplate(selectedTemplateKey);
    if (!template) return;
    seedChecklistTemplate(activeProject.id, template);
    setRefreshKey((v) => v + 1);
  };

  const handleAddManual = () => {
    if (!newTitle.trim()) return;

    addChecklistItem({
      projectId: activeProject.id,
      title: newTitle.trim(),
      description: newDescription.trim(),
      category: newCategory,
      priority: newPriority,
      status: 'not_started',
      blockedBy: [],
      linkedRecordIds: [],
      linkedTaskIds: [],
      linkedEventIds: [],
      notes: '',
    });

    setNewTitle('');
    setNewDescription('');
    setNewCategory('other');
    setNewPriority('medium');
    setRefreshKey((v) => v + 1);
  };

  const handleClearProject = () => {
    if (!confirm('Clear all checklist items for this case?')) return;
    clearChecklistProject(activeProject.id);
    setRefreshKey((v) => v + 1);
  };

  return (
    <div className="space-y-8 pb-20">
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-legal-navy">Checklist</h1>
          <p className="mt-2 text-slate-500">
            Convert case pressure into governed execution instead of loose memory.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <select
            value={selectedTemplateKey}
            onChange={(e) => setSelectedTemplateKey(e.target.value)}
            className="rounded-xl border px-4 py-3 text-sm bg-white"
          >
            {CHECKLIST_TEMPLATES.map((template) => (
              <option key={template.key} value={template.key}>
                {template.label}
              </option>
            ))}
          </select>

          <button
            onClick={handleSeedTemplate}
            className="rounded-xl bg-legal-navy text-white px-5 py-3 font-bold hover:bg-slate-800 transition-colors"
          >
            Load Template
          </button>

          <button
            onClick={handleClearProject}
            className="rounded-xl border border-red-200 text-red-600 px-5 py-3 font-bold hover:bg-red-50 transition-colors"
          >
            Clear Case Checklist
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <SummaryCard icon={<AlertCircle size={18} />} label="Critical Open" value={grouped.critical.length} />
        <SummaryCard icon={<ClipboardList size={18} />} label="In Progress" value={grouped.inProgress.length} />
        <SummaryCard icon={<AlertCircle size={18} />} label="Blocked" value={grouped.blocked.length} />
        <SummaryCard icon={<CheckSquare size={18} />} label="Done" value={grouped.done.length} />
      </div>

      <section className="rounded-2xl border bg-white p-6 space-y-4">
        <h2 className="text-xl font-bold text-legal-navy">Add Checklist Item</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="Checklist title"
            className="rounded-xl border px-4 py-3 text-sm"
          />
          <input
            value={newDescription}
            onChange={(e) => setNewDescription(e.target.value)}
            placeholder="Short description"
            className="rounded-xl border px-4 py-3 text-sm"
          />
          <select
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value as ChecklistCategory)}
            className="rounded-xl border px-4 py-3 text-sm bg-white"
          >
            <option value="procedure">Procedure</option>
            <option value="evidence">Evidence</option>
            <option value="financial">Financial</option>
            <option value="parenting">Parenting</option>
            <option value="witness">Witness</option>
            <option value="testimony">Testimony</option>
            <option value="packet">Packet</option>
            <option value="settlement">Settlement</option>
            <option value="communication">Communication</option>
            <option value="other">Other</option>
          </select>
          <select
            value={newPriority}
            onChange={(e) => setNewPriority(e.target.value as ChecklistPriority)}
            className="rounded-xl border px-4 py-3 text-sm bg-white"
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="critical">Critical</option>
          </select>
        </div>

        <button
          onClick={handleAddManual}
          className="inline-flex items-center gap-2 rounded-xl bg-amber-500 text-white px-5 py-3 font-bold hover:bg-amber-600 transition-colors"
        >
          <Plus size={18} />
          Add Item
        </button>
      </section>

      <section className="rounded-2xl border bg-white overflow-hidden">
        <div className="px-6 py-4 border-b bg-slate-50">
          <h2 className="text-xl font-bold text-legal-navy">Checklist Items</h2>
        </div>

        <div className="divide-y">
          {grouped.all.length === 0 ? (
            <div className="p-10 text-slate-500">No checklist items for this case yet.</div>
          ) : (
            grouped.all.map((item) => (
              <ChecklistRow
                key={item.id}
                item={item}
                onStatusChange={(status) => {
                  updateChecklistItem(item.id, { status });
                  setRefreshKey((v) => v + 1);
                }}
                onDelete={() => {
                  deleteChecklistItem(item.id);
                  setRefreshKey((v) => v + 1);
                }}
              />
            ))
          )}
        </div>
      </section>
    </div>
  );
}

function SummaryCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-2xl border bg-white p-5">
      <div className="flex items-center gap-2 text-slate-500 text-sm">
        {icon}
        <span>{label}</span>
      </div>
      <div className="mt-3 text-3xl font-bold text-legal-navy">{value}</div>
    </div>
  );
}

function ChecklistRow({
  item,
  onStatusChange,
  onDelete,
}: {
  item: ChecklistItem;
  onStatusChange: (status: ChecklistStatus) => void;
  onDelete: () => void;
}) {
  return (
    <div className="p-5 flex flex-col lg:flex-row lg:items-start justify-between gap-4">
      <div className="space-y-2 min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="font-bold text-legal-navy">{item.title}</h3>
          <Badge text={item.category} />
          <PriorityBadge priority={item.priority} />
          <StatusBadge status={item.status} />
        </div>

        {item.description && (
          <p className="text-sm text-slate-500">{item.description}</p>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        <button onClick={() => onStatusChange('not_started')} className="rounded-lg border px-3 py-2 text-xs font-bold">
          Not Started
        </button>
        <button onClick={() => onStatusChange('in_progress')} className="rounded-lg border px-3 py-2 text-xs font-bold">
          In Progress
        </button>
        <button onClick={() => onStatusChange('blocked')} className="rounded-lg border px-3 py-2 text-xs font-bold">
          Blocked
        </button>
        <button onClick={() => onStatusChange('done')} className="rounded-lg border px-3 py-2 text-xs font-bold">
          Done
        </button>
        <button
          onClick={onDelete}
          className="rounded-lg border border-red-200 text-red-600 px-3 py-2 text-xs font-bold hover:bg-red-50"
        >
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  );
}

function Badge({ text }: { text: string }) {
  return (
    <span className="px-2 py-1 rounded-md bg-slate-100 text-slate-600 text-[10px] font-bold uppercase tracking-wider">
      {text}
    </span>
  );
}

function PriorityBadge({ priority }: { priority: ChecklistPriority }) {
  const styles: Record<ChecklistPriority, string> = {
    low: 'bg-slate-100 text-slate-600',
    medium: 'bg-blue-50 text-blue-700',
    high: 'bg-amber-50 text-amber-700',
    critical: 'bg-red-50 text-red-700',
  };

  return (
    <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${styles[priority]}`}>
      {priority}
    </span>
  );
}

function StatusBadge({ status }: { status: ChecklistStatus }) {
  const styles: Record<ChecklistStatus, string> = {
    not_started: 'bg-slate-100 text-slate-600',
    in_progress: 'bg-blue-50 text-blue-700',
    blocked: 'bg-red-50 text-red-700',
    done: 'bg-emerald-50 text-emerald-700',
  };

  return (
    <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${styles[status]}`}>
      {status.replace('_', ' ')}
    </span>
  );
}

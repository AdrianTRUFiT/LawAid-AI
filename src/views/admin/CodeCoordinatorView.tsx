// src/views/admin/CodeCoordinatorView.tsx
import React, { useState } from 'react';
import { Files, GitCompare, LayoutDashboard } from 'lucide-react';
import { cn } from '../../lib/utils';

// Keep these imports pointed at wherever you place the two AI Studio versions.
import CodeCoordinatorIntakeWorkspace from '../../components/code-coordinator/CodeCoordinatorIntakeWorkspace';
import CodeCoordinatorPatchWorkspace from '../../components/code-coordinator/CodeCoordinatorPatchWorkspace';

type CoordinatorTab = 'intake' | 'patch' | 'dashboard';

export default function CodeCoordinatorView() {
  const [activeTab, setActiveTab] = useState<CoordinatorTab>('intake');

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-[#f8f9fa] text-gray-900">
      <header className="h-16 border-b border-gray-200 bg-white flex items-center justify-between px-8 shrink-0 z-20">
        <div className="flex flex-col leading-tight">
          <h1 className="text-sm font-bold text-gray-900">CodeCoordinatorAI</h1>
          <p className="text-[10px] text-gray-400 font-medium uppercase tracking-widest">
            Intake â†’ Reconcile â†’ Patch
          </p>
        </div>

        <div className="flex bg-gray-100 p-1 rounded-xl border border-gray-200">
          <button
            onClick={() => setActiveTab('intake')}
            className={cn(
              'px-5 py-2 rounded-lg text-xs font-bold transition-all flex items-center space-x-2',
              activeTab === 'intake'
                ? 'bg-white text-blue-600 shadow-sm border border-gray-200'
                : 'text-gray-400 hover:text-gray-600'
            )}
          >
            <Files size={14} />
            <span>Intake</span>
          </button>

          <button
            onClick={() => setActiveTab('patch')}
            className={cn(
              'px-5 py-2 rounded-lg text-xs font-bold transition-all flex items-center space-x-2',
              activeTab === 'patch'
                ? 'bg-white text-blue-600 shadow-sm border border-gray-200'
                : 'text-gray-400 hover:text-gray-600'
            )}
          >
            <GitCompare size={14} />
            <span>Patch</span>
          </button>

          <button
            onClick={() => setActiveTab('dashboard')}
            className={cn(
              'px-5 py-2 rounded-lg text-xs font-bold transition-all flex items-center space-x-2',
              activeTab === 'dashboard'
                ? 'bg-white text-blue-600 shadow-sm border border-gray-200'
                : 'text-gray-400 hover:text-gray-600'
            )}
          >
            <LayoutDashboard size={14} />
            <span>Dashboard</span>
          </button>
        </div>
      </header>

      <div className="flex-1 min-h-0 overflow-hidden">
        {activeTab === 'intake' && <CodeCoordinatorIntakeWorkspace initialTab="workspace" />}
        {activeTab === 'patch' && <CodeCoordinatorPatchWorkspace />}
        {activeTab === 'dashboard' && <CodeCoordinatorIntakeWorkspace initialTab="dashboard" />}
      </div>
    </div>
  );
}

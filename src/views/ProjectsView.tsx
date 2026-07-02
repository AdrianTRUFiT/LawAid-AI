import React, { useState } from 'react';
import {
  Briefcase,
  Plus,
  Filter,
  MoreVertical,
  ShieldCheck,
  Clock,
  ChevronRight,
  ClipboardList,
  Trash2
} from 'lucide-react';
import { useProject } from '../context/ProjectContext';
import { motion } from 'framer-motion';

interface ProjectsViewProps {
  onNavigate: (tab: string) => void;
}

export default function ProjectsView({ onNavigate }: ProjectsViewProps) {
  const {
    projects,
    activeProject,
    setActiveProject,
    createProject,
    deleteProject
  } = useProject();

  const [filter, setFilter] = useState('all');
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);

  const filteredProjects = projects.filter((p) => {
    if (filter === 'active') return p.status === 'active';
    if (filter === 'archived') return p.status === 'archived';
    return true;
  });

  const handleNewCase = () => {
    const newCase = createProject();
    setActiveProject(newCase);
    setMenuOpenId(null);
    onNavigate('intake');
  };

  const handleEditCase = (project: any) => {
    setActiveProject(project);
    setMenuOpenId(null);
    onNavigate('intake');
  };

  const handleDeleteCase = (projectId: string, projectName: string) => {
    const confirmed = window.confirm(
      `Delete "${projectName}"?\n\nThis will remove the case and its linked records from the current app state.`
    );

    if (!confirmed) return;

    deleteProject(projectId);
    setMenuOpenId(null);
  };

  const showEmptyState = filteredProjects.length === 0;

  return (
    <div className="space-y-8 pb-20">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1
            className="text-3xl md:text-4xl font-bold text-legal-navy"
            style={{ fontFamily: 'Arial, sans-serif' }}
          >
            Cases
          </h1>
          <p className="text-slate-500 mt-2">
            Manage your active legal matters and record containers
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <button
            onClick={handleNewCase}
            className="flex items-center justify-center space-x-2 bg-white border border-legal-navy text-legal-navy px-6 py-3 rounded-xl font-bold shadow-sm hover:bg-slate-50 transition-all"
          >
            <ClipboardList size={20} />
            <span>Case Intake</span>
          </button>

          <button
            onClick={handleNewCase}
            className="flex items-center justify-center space-x-2 bg-legal-navy text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:bg-slate-800 transition-all"
          >
            <Plus size={20} />
            <span>New Case</span>
          </button>
        </div>
      </div>

      <div className="flex items-center space-x-2 overflow-x-auto pb-2 scrollbar-hide">
        <div className="flex bg-white p-1 rounded-lg border border-legal-border flex-shrink-0">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-1.5 rounded-md text-xs font-bold transition-colors ${
              filter === 'all'
                ? 'bg-slate-100 text-legal-navy'
                : 'text-slate-500 hover:text-legal-navy'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter('active')}
            className={`px-4 py-1.5 rounded-md text-xs font-bold transition-colors ${
              filter === 'active'
                ? 'bg-slate-100 text-legal-navy'
                : 'text-slate-500 hover:text-legal-navy'
            }`}
          >
            Active
          </button>
          <button
            onClick={() => setFilter('archived')}
            className={`px-4 py-1.5 rounded-md text-xs font-bold transition-colors ${
              filter === 'archived'
                ? 'bg-slate-100 text-legal-navy'
                : 'text-slate-500 hover:text-legal-navy'
            }`}
          >
            Archived
          </button>
        </div>

        <button className="p-2 text-slate-500 hover:bg-white rounded-lg border border-transparent hover:border-legal-border transition-all flex-shrink-0">
          <Filter size={18} />
        </button>
      </div>

      {showEmptyState ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center shadow-sm">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-slate-50 text-slate-500">
            <Briefcase size={28} />
          </div>

          <h2
            className="text-2xl font-bold text-legal-navy"
            style={{ fontFamily: 'Arial, sans-serif' }}
          >
            No cases yet
          </h2>

          <p className="mx-auto mt-3 max-w-xl text-sm text-slate-500">
            You do not have any cases in this view yet. Start a new case to begin
            organizing your matter and building continuity.
          </p>

          <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
            <button
              onClick={handleNewCase}
              className="flex items-center justify-center space-x-2 rounded-xl bg-legal-navy px-6 py-3 font-bold text-white shadow-lg transition-all hover:bg-slate-800"
            >
              <Plus size={20} />
              <span>Create New Case</span>
            </button>

            <button
              onClick={() => setFilter('all')}
              className="rounded-xl border border-slate-200 px-6 py-3 font-bold text-slate-700 transition-all hover:bg-slate-50"
            >
              Show All Filters
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredProjects.map((project) => (
            <motion.div
              key={project.id}
              whileHover={{ y: -4 }}
              onClick={() => handleEditCase(project)}
              className={`glass-panel group relative cursor-pointer p-6 transition-all duration-300 ${
                activeProject?.id === project.id
                  ? 'ring-2 ring-amber-500 border-amber-200 shadow-md'
                  : 'hover:shadow-md hover:border-slate-300'
              }`}
            >
              <div className="mb-6 flex items-start justify-between">
                <div
                  className={`rounded-xl p-3 ${
                    activeProject?.id === project.id
                      ? 'bg-amber-50 text-amber-600'
                      : 'bg-slate-50 text-slate-400 group-hover:bg-slate-100 group-hover:text-legal-navy transition-colors'
                  }`}
                >
                  <Briefcase size={24} />
                </div>

                <div className="relative">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setMenuOpenId((current) => (current === project.id ? null : project.id));
                    }}
                    className="p-1 text-slate-300 hover:text-slate-600"
                  >
                    <MoreVertical size={20} />
                  </button>

                  {menuOpenId === project.id && (
                    <div
                      onClick={(e) => e.stopPropagation()}
                      className="absolute right-0 top-8 z-20 w-40 rounded-xl border border-slate-200 bg-white p-2 shadow-xl"
                    >
                      <button
                        onClick={() => handleEditCase(project)}
                        className="flex w-full items-center rounded-lg px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
                      >
                        Edit Case
                      </button>

                      <button
                        onClick={() => handleDeleteCase(project.id, project.name)}
                        className="flex w-full items-center rounded-lg px-3 py-2 text-sm text-rose-600 hover:bg-rose-50"
                      >
                        <Trash2 size={14} className="mr-2" />
                        Delete Case
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <h3
                className="mb-1 line-clamp-1 text-xl font-bold text-legal-navy"
                style={{ fontFamily: 'Arial, sans-serif' }}
              >
                {project.name}
              </h3>
              <p className="mb-6 line-clamp-1 text-sm text-slate-500">{project.type}</p>

              <div className="space-y-3 border-t border-slate-50 pt-4">
                <div className="flex items-center justify-between text-[10px]">
                  <span className="font-bold uppercase tracking-widest text-slate-400">Status</span>
                  <span className="rounded bg-emerald-50 px-2 py-1 font-bold uppercase tracking-tighter text-emerald-600">
                    {project.status}
                  </span>
                </div>

                <div className="flex items-center justify-between text-[10px]">
                  <span className="font-bold uppercase tracking-widest text-slate-400">Created</span>
                  <span className="font-medium text-slate-600">
                    {new Date(project.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>

              <div className="mt-6 flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center text-[10px] font-bold text-slate-400">
                    <ShieldCheck size={12} className="mr-1 text-emerald-500" />
                    PROTECTED
                  </div>
                  <div className="flex items-center text-[10px] font-bold text-slate-400">
                    <Clock size={12} className="mr-1 text-blue-500" />
                    64 DAYS
                  </div>
                </div>

                <div className="flex items-center text-xs font-bold text-legal-navy transition-transform group-hover:translate-x-1">
                  Edit Case <ChevronRight size={16} className="ml-1" />
                </div>
              </div>
            </motion.div>
          ))}

          <button
            onClick={handleNewCase}
            className="min-h-[200px] rounded-xl border-2 border-dashed border-slate-200 p-6 flex flex-col items-center justify-center text-slate-400 transition-all group hover:border-slate-300 hover:text-slate-500"
          >
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-slate-50 transition-colors group-hover:bg-slate-100">
              <Plus size={24} />
            </div>
            <p className="text-sm font-bold">Add New Case</p>
            <p className="mt-1 text-center text-[10px]">Initialize a new evidence container</p>
          </button>
        </div>
      )}
    </div>
  );
}

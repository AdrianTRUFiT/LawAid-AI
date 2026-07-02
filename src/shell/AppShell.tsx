import React, { useState, useEffect } from 'react';
import {
  Calendar,
  CheckSquare,
  FileText,
  DollarSign,
  BrainCircuit,
  Settings,
  Menu,
  X,
  ChevronRight,
  Search,
  Plus,
  Bell,
  Activity,
  Scale,
  HelpCircle,
  Users,
  FolderClock,
  Phone,
  Briefcase,
  MessageSquare,
  Network,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useProject, Record } from '../context/ProjectContext';
import SearchModal from '../components/SearchModal';
import AddRecordModal from '../components/AddRecordModal';
import CaseAssistant from '../components/CaseAssistant';

// Import Views
import DashboardView from '../views/DashboardView';
import CalendarView from '../views/CalendarView';
import ProjectsView from '../views/ProjectsView';
import EventsView from '../views/EventsView';
import TasksView from '../views/TasksView';
import DocumentsView from '../views/DocumentsView';
import ExpensesView from '../views/ExpensesView';
import SignalsView from '../views/SignalsView';
import MemoryHubView from '../views/MemoryHubView';
import OnboardingView from '../views/OnboardingView';
import SettingsView from '../views/SettingsView';
import PerformanceWellnessAIView from '../views/PerformanceWellnessAIView';
import FinancialWorkspaceView from '../views/FinancialWorkspaceView';
import ChecklistView from '../views/ChecklistView';
import AskLawAidView from '../views/AskLawAidView';
import AiopIntakeView from '../views/AiopIntakeView';
import GovernedRealityView from '../views/GovernedRealityView';

// Internal support views remain available, but are not primary-nav items
import ActivationQueueView from '../views/admin/ActivationQueueView';
import FrictionAuditView from '../views/admin/FrictionAuditView';
import WorkflowView from '../views/WorkflowView';
import StrategicIntakeView from '../views/admin/StrategicIntakeView';

interface NavItem {
  id: string;
  label: string;
  icon: React.ElementType;
}

interface NavGroup {
  label: string;
  items: NavItem[];
}

const NAV_GROUPS: NavGroup[] = [
  {
    label: 'Overview',
    items: [{ id: 'caseStatus', label: 'Case Status', icon: Briefcase }],
  },
  {
    label: 'Understand',
    items: [
      { id: 'meaning', label: 'Case Overview', icon: HelpCircle },
      { id: 'aiopIntake', label: 'Adaptive Intake', icon: BrainCircuit },
      { id: 'askLawAid', label: 'Ask LawAidAI', icon: MessageSquare },
      { id: 'governedReality', label: 'Verified Timeline', icon: Network },
      { id: 'whatHappened', label: 'What Happened', icon: FolderClock },
      { id: 'representation', label: 'Representation', icon: Users },
      { id: 'wellness', label: 'Personal Wellness', icon: Activity },
    ],
  },
  {
    label: 'My Records',
    items: [
      { id: 'appointments', label: 'Dates & Deadlines', icon: Calendar },
      { id: 'contacts', label: 'Contacts', icon: Phone },
      { id: 'costs', label: 'Costs', icon: DollarSign },
      { id: 'evidence', label: 'Evidence', icon: FileText },
    ],
  },
  {
    label: 'Execution',
    items: [
      { id: 'workflow', label: 'Workflow', icon: FolderClock },
      { id: 'checklist', label: 'Checklist', icon: CheckSquare },
      { id: 'settings', label: 'Settings', icon: Settings },
    ],
  },
];

function getTabFromPath(pathname: string): string {
  switch (pathname.toLowerCase()) {
    case '/':
      return 'caseStatus';
    case '/workflow':
      return 'workflow';
    case '/aiop-intake':
      return 'aiopIntake';
    case '/ask':
    case '/asklawaidai':
      return 'askLawAid';
    case '/governed-reality':
      return 'governedReality';
    case '/evidence':
      return 'evidence';
    case '/costs':
      return 'costs';
    case '/appointments':
      return 'appointments';
    case '/contacts':
      return 'contacts';
    case '/checklist':
      return 'checklist';
    case '/wellness':
      return 'wellness';
    case '/settings':
      return 'settings';
    case '/activation-queue':
      return 'activationQueue';
    case '/friction-audit':
      return 'frictionAudit';
    case '/strategic-intake':
      return 'strategicIntake';
    case '/financial':
      return 'financial';
    default:
      return 'caseStatus';
  }
}

function getPathFromTab(tab: string): string {
  switch (tab) {
    case 'workflow':
      return '/workflow';
    case 'aiopIntake':
      return '/aiop-intake';
    case 'askLawAid':
      return '/ask';
    case 'governedReality':
      return '/governed-reality';
    case 'evidence':
      return '/evidence';
    case 'costs':
      return '/costs';
    case 'appointments':
      return '/appointments';
    case 'contacts':
      return '/contacts';
    case 'checklist':
      return '/checklist';
    case 'wellness':
      return '/wellness';
    case 'settings':
      return '/settings';
    case 'activationQueue':
      return '/activation-queue';
    case 'frictionAudit':
      return '/friction-audit';
    case 'strategicIntake':
      return '/strategic-intake';
    case 'financial':
      return '/financial';
    case 'caseStatus':
    default:
      return '/';
  }
}

export default function AppShell() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState(() => getTabFromPath(window.location.pathname));
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [addModalType, setAddModalType] = useState<Record['type']>('task');
  const [searchQuery, setSearchQuery] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);
  const [isAssistantOpen, setIsAssistantOpen] = useState(false);
  const { activeProject } = useProject();

  useEffect(() => {
    const syncFromLocation = () => {
      setActiveTab(getTabFromPath(window.location.pathname));
    };

    syncFromLocation();
    window.addEventListener('popstate', syncFromLocation);

    return () => window.removeEventListener('popstate', syncFromLocation);
  }, []);

  useEffect(() => {
    const nextPath = getPathFromTab(activeTab);
    if (window.location.pathname !== nextPath) {
      window.history.replaceState({}, '', nextPath);
    }
  }, [activeTab]);

  useEffect(() => {
    if (window.innerWidth <= 768) {
      setIsSidebarOpen(false);
    }
  }, [activeTab]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen(true);
      }
      if (e.key === 'Escape') {
        setIsSearchOpen(false);
        setShowNotifications(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const openAddModal = (type: Record['type'] = 'task') => {
    setAddModalType(type);
    setIsAddModalOpen(true);
  };

  const getHeaderMeta = () => {
    switch (activeTab) {
      case 'caseStatus':
        return {
          eyebrow: 'Overview',
          title: activeProject?.name ? `${activeProject.name} Â· Case Status` : 'Case Status',
          subtitle: 'Where things stand, what is pending, and what comes next.',
        };
      case 'aiopIntake':
        return {
          eyebrow: 'Understand',
          title: 'Adaptive Intake',
          subtitle:
            'Acquire-stage intelligence that adapts to pressure, surfaces hidden dependency, and packages a Verified Opportunity.',
        };
      case 'askLawAid':
        return {
          eyebrow: 'Understand',
          title: 'Ask LawAidAI',
          subtitle:
            'Signal-first entry surface that classifies the issue, returns useful guidance, and continues only when deeper structure is warranted.',
        };
      case 'governedReality':
        return {
          eyebrow: 'Understand',
          title: 'Verified Timeline',
          subtitle:
            'Inspect subject, event, claim, artifact, verification, and consequence through one bounded truth model.',
        };
      case 'meaning':
        return {
          eyebrow: 'Understand',
          title: activeProject?.name ? `${activeProject.name} Â· What Does This Mean?` : 'What Does This Mean?',
          subtitle: 'Guided interpretation of filings, process, and what the matter means right now.',
        };
      case 'representation':
        return {
          eyebrow: 'Understand',
          title: activeProject?.name ? `${activeProject.name} Â· Representation` : 'Representation',
          subtitle: 'Counsel posture, support structure, and representation status.',
        };
      case 'whatHappened':
        return {
          eyebrow: 'Understand',
          title: activeProject?.name ? `${activeProject.name} Â· What Happened` : 'What Happened',
          subtitle: 'Story, timeline, and event-driven continuity.',
        };
      case 'evidence':
        return {
          eyebrow: 'My Records',
          title: activeProject?.name ? `${activeProject.name} Â· Evidence` : 'Evidence',
          subtitle: 'Documents, proof organization, and evidence-oriented retrieval.',
        };
      case 'costs':
        return {
          eyebrow: 'My Records',
          title: activeProject?.name ? `${activeProject.name} Â· Costs` : 'Costs',
          subtitle: 'Expenses, fees, and financial record visibility.',
        };
      case 'appointments':
        return {
          eyebrow: 'Dates & People',
          title: activeProject?.name
            ? `${activeProject.name} Â· Appointments & Deadlines`
            : 'Appointments & Deadlines',
          subtitle: 'Calendar, hearings, deadlines, and date-bound action.',
        };
      case 'contacts':
        return {
          eyebrow: 'Dates & People',
          title: activeProject?.name ? `${activeProject.name} Â· Contacts` : 'Contacts',
          subtitle: 'Lawyers, court contacts, witnesses, and support people.',
        };
      case 'checklist':
        return {
          eyebrow: 'Execution',
          title: activeProject?.name ? `${activeProject.name} Â· Checklist` : 'Checklist',
          subtitle: 'Convert pressure into governed execution and readiness tracking.',
        };
      case 'wellness':
        return {
          eyebrow: 'Execution',
          title: activeProject?.name ? `${activeProject.name} Â· Wellness` : 'Wellness',
          subtitle: 'Functional stability, regulation, and capacity-aware support.',
        };
      case 'settings':
        return {
          eyebrow: 'Execution',
          title: 'Settings',
          subtitle: 'Workspace preferences and operating controls.',
        };
      case 'signals':
        return {
          eyebrow: 'Internal',
          title: activeProject?.name || 'Audit Trail',
          subtitle: 'Recorded signal, review, and proof visibility.',
        };
      case 'activationQueue':
        return {
          eyebrow: 'Internal',
          title: 'Activation Queue',
          subtitle: 'Reviewed-shell to live-record visibility surface.',
        };
      case 'frictionAudit':
        return {
          eyebrow: 'Internal',
          title: 'Friction Audit',
          subtitle: 'Capture real-use friction before refinement.',
        };
      case 'workflow':
        return {
          eyebrow: 'Internal',
          title: 'Workflow',
          subtitle: 'Post, refine, hold, and prepare assisted outbox movement.',
        };
      case 'strategicIntake':
        return {
          eyebrow: 'Internal',
          title: 'Strategic Intake',
          subtitle: 'Convert raw build signal into controlled next action.',
        };
      case 'financial':
        return {
          eyebrow: 'Internal',
          title: activeProject?.name ? `${activeProject.name} Â· Financial` : 'Financial Workspace',
          subtitle: 'Estimate, review, reconcile, and preserve proof.',
        };
      default:
        return {
          eyebrow: 'Overview',
          title: activeProject?.name ? `${activeProject.name} Â· Case Status` : 'Case Status',
          subtitle: 'Where things stand, what is pending, and what comes next.',
        };
    }
  };

  const renderView = () => {
    switch (activeTab) {
      case 'caseStatus':
        return <DashboardView onNavigate={setActiveTab} />;

      case 'intake':
        return <OnboardingView onNavigate={setActiveTab} />;

      // user-facing routing
      case 'aiopIntake':
        return <AiopIntakeView />;
      case 'askLawAid':
        return <AskLawAidView />;
      case 'governedReality':
        return <GovernedRealityView />;
      case 'meaning':
        return <OnboardingView onNavigate={setActiveTab} />;
      case 'representation':
        return <ProjectsView onNavigate={setActiveTab} />;
      case 'whatHappened':
        return <EventsView onAddRecord={() => openAddModal('event')} />;
      case 'evidence':
        return <DocumentsView onAddRecord={() => openAddModal('document')} />;
      case 'costs':
        return <ExpensesView onAddRecord={() => openAddModal('expense')} />;
      case 'appointments':
        return <CalendarView onAddRecord={() => openAddModal('event')} />;
      case 'contacts':
        return <ProjectsView onNavigate={setActiveTab} />;
      case 'checklist':
        return <ChecklistView />;
      case 'wellness':
        return <PerformanceWellnessAIView />;
      case 'settings':
        return <SettingsView />;

      // internal routes preserved
      case 'projects':
        return <ProjectsView onNavigate={setActiveTab} />;
      case 'events':
        return <EventsView onAddRecord={() => openAddModal('event')} />;
      case 'tasks':
        return <TasksView onAddRecord={() => openAddModal('task')} />;
      case 'documents':
        return <DocumentsView onAddRecord={() => openAddModal('document')} />;
      case 'expenses':
        return <ExpensesView onAddRecord={() => openAddModal('expense')} />;
      case 'signals':
        return <SignalsView />;
      case 'activationQueue':
        return <ActivationQueueView />;
      case 'frictionAudit':
        return <FrictionAuditView />;
      case 'workflow':
        return <WorkflowView />;
      case 'strategicIntake':
        return <StrategicIntakeView />;
      case 'memory':
        return <MemoryHubView />;
      case 'financial':
        return <FinancialWorkspaceView />;
      default:
        return <DashboardView onNavigate={setActiveTab} />;
    }
  };

  const headerMeta = getHeaderMeta();

  return (
    <div className="flex h-screen bg-legal-slate overflow-hidden relative">
      <AnimatePresence>
        {isSidebarOpen && window.innerWidth <= 768 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 bg-black/50 z-20 md:hidden backdrop-blur-sm"
          />
        )}
      </AnimatePresence>

      <motion.aside
        initial={false}
        animate={{
          width: isSidebarOpen ? 250 : window.innerWidth <= 768 ? 0 : 80,
          x: isSidebarOpen ? 0 : window.innerWidth <= 768 ? -250 : 0,
        }}
        className="bg-legal-navy text-white flex flex-col z-30 fixed md:relative h-full shadow-2xl transition-all duration-300"
      >
        <div className="p-6 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-amber-500 rounded-lg flex items-center justify-center flex-shrink-0 shadow-lg shadow-amber-500/20">
              <Scale size={18} className="text-legal-navy" />
            </div>
            <AnimatePresence mode="wait">
              {isSidebarOpen && (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="text-xl font-bold tracking-tight text-white"
                  style={{ fontFamily: 'Arial, sans-serif' }}
                >
                  LawAid<span className="text-amber-500">AI</span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
          >
            {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        <nav className="flex-1 px-3 mt-2 overflow-y-auto scrollbar-hide">
          {NAV_GROUPS.map((group) => (
            <div key={group.label} className="mb-4">
              {isSidebarOpen && (
                <div className="px-3 pb-2 pt-2 text-[10px] uppercase tracking-[0.16em] text-slate-500 font-semibold">
                  {group.label}
                </div>
              )}

              <div className="space-y-1">
                {group.items.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center px-3 py-3 rounded-xl transition-all duration-200 group ${
                      activeTab === item.id
                        ? 'bg-white/10 text-white shadow-inner'
                        : 'text-slate-400 hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    <item.icon size={20} className={activeTab === item.id ? 'text-amber-500' : ''} />
                    <AnimatePresence>
                      {isSidebarOpen && (
                        <motion.span
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -10 }}
                          className="ml-3 font-medium text-sm whitespace-nowrap"
                        >
                          {item.label}
                        </motion.span>
                      )}
                    </AnimatePresence>
                    {activeTab === item.id && isSidebarOpen && (
                      <motion.div layoutId="active-indicator" className="ml-auto">
                        <ChevronRight size={14} className="text-amber-500" />
                      </motion.div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </nav>

        <div className="p-4 border-t border-white/5">
          <div className={`flex items-center ${isSidebarOpen ? 'px-2' : 'justify-center'}`}>
            <div className="w-8 h-8 rounded-full bg-amber-600 flex items-center justify-center font-bold text-xs">
              AL
            </div>
            {isSidebarOpen && (
              <div className="ml-3 overflow-hidden">
                <p className="text-sm font-medium truncate">Adrian Legal</p>
                <p className="text-xs text-slate-400 truncate">Pro Plan</p>
              </div>
            )}
          </div>
        </div>
      </motion.aside>

      <main className="flex-1 flex flex-col relative overflow-hidden">
        <header className="h-16 bg-white border-b border-legal-border flex items-center justify-between px-4 md:px-8 z-20">
          <div className="flex items-center space-x-2 md:space-x-4">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="md:hidden p-2 text-slate-500 hover:bg-slate-100 rounded-lg"
            >
              <Menu size={20} />
            </button>

            <div className="flex flex-col min-w-0">
              <span className="text-[10px] md:text-xs font-semibold text-slate-500 uppercase tracking-wider">
                {headerMeta.eyebrow}
              </span>
              <h2
                className="text-sm md:text-lg font-semibold text-legal-navy leading-tight truncate"
                style={{ fontFamily: 'Arial, sans-serif' }}
              >
                {headerMeta.title}
              </h2>
              <p className="hidden md:block text-xs text-slate-500 mt-0.5 truncate">
                {headerMeta.subtitle}
              </p>
            </div>

            <div className="hidden md:block h-8 w-px bg-slate-200 mx-2" />

            <div className="hidden lg:block relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input
                type="text"
                placeholder="Search evidence... (âŒ˜K)"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  if (e.target.value.length > 0) setIsSearchOpen(true);
                }}
                onFocus={() => setIsSearchOpen(true)}
                className="pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-legal-navy/5 focus:border-slate-300 w-64 transition-all"
              />
            </div>
          </div>

          <div className="flex items-center space-x-2 md:space-x-4">
            <button
              onClick={() => setIsAssistantOpen(true)}
              className="p-2 text-slate-500 hover:bg-slate-100 rounded-full transition-colors"
              title="AI Assistant"
            >
              <BrainCircuit size={20} className="text-legal-navy" />
            </button>

            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className={`p-2 hover:bg-slate-100 rounded-full transition-colors relative ${
                  showNotifications ? 'bg-slate-100' : 'text-slate-500'
                }`}
              >
                <Bell size={20} />
                <span className="absolute top-2 right-2 w-2 h-2 bg-amber-500 rounded-full border-2 border-white" />
              </button>

              <AnimatePresence>
                {showNotifications && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden z-50"
                  >
                    <div className="p-4 border-b border-slate-50 flex items-center justify-between">
                      <h3 className="font-bold text-sm">Notifications</h3>
                      <button className="text-[10px] font-bold text-amber-600 uppercase tracking-widest">
                        Mark all read
                      </button>
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                      <NotificationItem
                        title="New Document Uploaded"
                        desc="Attorney uploaded 'Custody_Draft_V1.pdf'"
                        time="2h ago"
                        isNew
                      />
                      <NotificationItem
                        title="Task Overdue"
                        desc="Follow up on Custody Draft is now overdue."
                        time="4h ago"
                        isNew
                      />
                      <NotificationItem
                        title="Billing Verified"
                        desc="Retainer replenishment has been verified."
                        time="1d ago"
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <button
              onClick={() => openAddModal('task')}
              className="flex items-center space-x-2 bg-legal-navy text-white px-3 md:px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors shadow-sm"
            >
              <Plus size={18} />
              <span className="hidden sm:inline">Add Record</span>
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="max-w-7xl mx-auto">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2 }}
              >
                {renderView()}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </main>

      <AnimatePresence>
        {isSearchOpen && (
          <SearchModal
            isOpen={isSearchOpen}
            onClose={() => {
              setIsSearchOpen(false);
              setSearchQuery('');
            }}
            initialQuery={searchQuery}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isAddModalOpen && (
          <AddRecordModal
            isOpen={isAddModalOpen}
            onClose={() => setIsAddModalOpen(false)}
            initialType={addModalType}
          />
        )}
      </AnimatePresence>

      <CaseAssistant isOpen={isAssistantOpen} onClose={() => setIsAssistantOpen(false)} />
    </div>
  );
}

function NotificationItem({ title, desc, time, isNew }: any) {
  return (
    <div
      className={`p-4 border-b border-slate-50 hover:bg-slate-50 transition-colors cursor-pointer ${
        isNew ? 'bg-amber-50/30' : ''
      }`}
    >
      <div className="flex items-start justify-between">
        <h4 className="text-sm font-bold text-legal-navy">{title}</h4>
        <span className="text-[10px] text-slate-400">{time}</span>
      </div>
      <p className="text-xs text-slate-500 mt-1">{desc}</p>
    </div>
  );
}

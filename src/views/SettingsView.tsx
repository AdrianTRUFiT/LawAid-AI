import React, { useState } from 'react';
import { Settings as SettingsIcon, User, Shield, Bell, CreditCard, HelpCircle, LogOut, ChevronRight, Download, Trash2, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { useProject } from '../context/ProjectContext';
import { motion, AnimatePresence } from 'motion/react';

export default function SettingsView() {
  const { user, updateUser, exportAllData, clearAllData } = useProject();
  const [activeTab, setActiveTab] = useState('Profile');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteStep, setDeleteStep] = useState(1);
  const [deleteInput, setDeleteInput] = useState('');
  
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);

  const handleDeleteAll = () => {
    if (deleteInput === 'DELETE ALL') {
      clearAllData();
      setShowDeleteConfirm(false);
      setDeleteStep(1);
      setDeleteInput('');
      alert('All data has been cleared.');
    }
  };

  const handleSaveProfile = () => {
    updateUser({ name, email });
    alert('Profile updated successfully.');
  };

  const handleLogout = () => {
    if (confirm('Are you sure you want to log out?')) {
      window.location.reload();
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'Profile':
        return (
          <section className="glass-panel p-6 md:p-8">
            <h3 className="text-xl font-bold mb-6" style={{ fontFamily: 'Arial, sans-serif' }}>Profile Settings</h3>
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row items-center gap-6 pb-6 border-b border-slate-50">
                <div className="relative group">
                  <div className="w-20 h-20 rounded-full bg-amber-600 flex items-center justify-center text-2xl font-bold text-white shadow-lg flex-shrink-0 overflow-hidden">
                    {user.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <label className="absolute inset-0 bg-black/40 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer rounded-full text-[10px] font-bold uppercase tracking-widest">
                    Edit
                    <input type="file" className="hidden" onChange={() => alert('Avatar upload simulated.')} />
                  </label>
                </div>
                <div className="text-center sm:text-left">
                  <h4 className="font-bold text-legal-navy">{user.name}</h4>
                  <p className="text-xs text-slate-500">{user.email}</p>
                  <button 
                    onClick={() => alert('Avatar upload simulated.')}
                    className="mt-3 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-colors"
                  >
                    Change Avatar
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Full Name</label>
                  <input 
                    type="text" 
                    value={name} 
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-legal-navy/5 transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Email Address</label>
                  <input 
                    type="email" 
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-legal-navy/5 transition-all"
                  />
                </div>
              </div>
            </div>
            <div className="mt-8 pt-8 border-t border-slate-50 flex justify-end">
              <button 
                onClick={handleSaveProfile}
                className="w-full sm:w-auto px-8 py-3 bg-legal-navy text-white rounded-xl font-bold shadow-lg hover:bg-slate-800 transition-all"
              >
                Save Changes
              </button>
            </div>
          </section>
        );
      case 'Security':
        return (
          <section className="glass-panel p-6 md:p-8">
            <h3 className="text-xl font-bold mb-6" style={{ fontFamily: 'Arial, sans-serif' }}>Security & Custody</h3>
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-emerald-50 rounded-xl border border-emerald-100 gap-4">
                <div className="flex items-center space-x-4">
                  <Shield className="text-emerald-600 flex-shrink-0" size={24} />
                  <div>
                    <p className="text-sm font-bold text-emerald-900">Two-Factor Authentication</p>
                    <p className="text-xs text-emerald-700">Your account is protected with 2FA.</p>
                  </div>
                </div>
                <button className="text-[10px] font-bold text-emerald-800 uppercase tracking-widest hover:underline text-left sm:text-right">Manage</button>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-bold text-legal-navy">Data Custody Plane</p>
                  <button 
                    onClick={() => alert('Opening local custody plane manager...')}
                    className="text-[10px] font-bold text-legal-navy uppercase tracking-widest hover:underline"
                  >
                    Manage
                  </button>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Your private source files are currently stored in your local custody plane. LawAidAI does not have access to raw files unless they are explicitly promoted to ThinkBaseAI.
                </p>
              </div>
              
              <div className="pt-6 border-t border-slate-100">
                <h4 className="text-sm font-bold text-legal-navy mb-4">Password Management</h4>
                <button className="px-6 py-2 bg-white border border-slate-200 rounded-lg text-xs font-bold text-legal-navy hover:bg-slate-50 transition-colors">
                  Change Password
                </button>
              </div>
            </div>
          </section>
        );
      case 'Notifications':
        return (
          <section className="glass-panel p-6 md:p-8">
            <h3 className="text-xl font-bold mb-6" style={{ fontFamily: 'Arial, sans-serif' }}>Notification Preferences</h3>
            <div className="space-y-4">
              <NotificationToggle label="Email Notifications" description="Receive case updates and signals via email." defaultChecked />
              <NotificationToggle label="Push Notifications" description="Real-time alerts for urgent tasks and events." defaultChecked />
              <NotificationToggle label="Billing Alerts" description="Get notified when retainer thresholds are reached." defaultChecked />
              <NotificationToggle label="AI Insights" description="Weekly summaries of case intelligence." />
            </div>
          </section>
        );
      case 'Billing':
        return (
          <section className="glass-panel p-6 md:p-8">
            <h3 className="text-xl font-bold mb-6" style={{ fontFamily: 'Arial, sans-serif' }}>Billing & Subscription</h3>
            <div className="p-6 bg-legal-navy text-white rounded-2xl mb-8">
              <div className="flex justify-between items-start mb-8">
                <div>
                  <p className="text-xs text-slate-400 uppercase tracking-widest font-bold mb-1">Current Plan</p>
                  <h4 className="text-2xl font-bold">Pro Individual</h4>
                </div>
                <span className="px-3 py-1 bg-emerald-500 text-white text-[10px] font-bold rounded-full">ACTIVE</span>
              </div>
              <div className="flex justify-between items-end">
                <div>
                  <p className="text-xs text-slate-400 mb-1">Next Billing Date</p>
                  <p className="font-bold">April 15, 2024</p>
                </div>
                <button className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-xs font-bold transition-colors">
                  Manage Plan
                </button>
              </div>
            </div>
            <div className="space-y-4">
              <h4 className="text-sm font-bold text-legal-navy">Payment Methods</h4>
              <div className="flex items-center justify-between p-4 border border-slate-100 rounded-xl">
                <div className="flex items-center space-x-3">
                  <CreditCard size={20} className="text-slate-400" />
                  <span className="text-sm font-medium">Visa ending in 4242</span>
                </div>
                <button className="text-xs font-bold text-legal-navy hover:underline">Edit</button>
              </div>
            </div>
          </section>
        );
      case 'Support':
        return (
          <section className="glass-panel p-6 md:p-8">
            <h3 className="text-xl font-bold mb-6" style={{ fontFamily: 'Arial, sans-serif' }}>Support & Resources</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <SupportCard icon={HelpCircle} title="Help Center" description="Browse our knowledge base and tutorials." />
              <SupportCard icon={MessageSquare} title="Live Chat" description="Speak with our support team in real-time." />
              <SupportCard icon={Shield} title="Privacy Policy" description="Learn how we protect your legal data." />
              <SupportCard icon={FileText} title="Terms of Service" description="Review our platform usage agreements." />
            </div>
            <div className="mt-8 p-6 bg-slate-50 rounded-2xl text-center">
              <p className="text-sm text-slate-600 mb-4">Need direct assistance?</p>
              <button className="px-8 py-3 bg-legal-navy text-white rounded-xl font-bold shadow-lg hover:bg-slate-800 transition-all">
                Contact Support
              </button>
            </div>
          </section>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-8 pb-20">
      <div>
        <h1 className="text-3xl md:text-4xl font-bold text-legal-navy" style={{ fontFamily: 'Arial, sans-serif' }}>Settings</h1>
        <p className="text-slate-500 mt-2">Manage your account, security, and platform preferences</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar Navigation */}
        <div className="lg:col-span-1 flex lg:flex-col overflow-x-auto lg:overflow-visible scrollbar-hide gap-2 pb-2 lg:pb-0">
          <SettingsNavItem 
            icon={User} 
            label="Profile" 
            active={activeTab === 'Profile'} 
            onClick={() => setActiveTab('Profile')}
          />
          <SettingsNavItem 
            icon={Shield} 
            label="Security" 
            active={activeTab === 'Security'} 
            onClick={() => setActiveTab('Security')}
          />
          <SettingsNavItem 
            icon={Bell} 
            label="Notifications" 
            active={activeTab === 'Notifications'} 
            onClick={() => setActiveTab('Notifications')}
          />
          <SettingsNavItem 
            icon={CreditCard} 
            label="Billing" 
            active={activeTab === 'Billing'} 
            onClick={() => setActiveTab('Billing')}
          />
          <SettingsNavItem 
            icon={HelpCircle} 
            label="Support" 
            active={activeTab === 'Support'} 
            onClick={() => setActiveTab('Support')}
          />
          <div className="hidden lg:block pt-4 mt-4 border-t border-slate-200">
            <SettingsNavItem 
              icon={LogOut} 
              label="Log Out" 
              color="text-red-500" 
              onClick={handleLogout}
            />
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3 space-y-8">
          {renderTabContent()}

          {/* Data Management is always visible at the bottom of any tab or maybe just on Security? 
              User request says "ensure all of the settings are connected and functional", 
              I'll keep Data Management visible as it's a critical feature. */}
          <section className="glass-panel p-6 md:p-8 border-red-100">
            <h3 className="text-xl font-bold mb-6 text-red-900" style={{ fontFamily: 'Arial, sans-serif' }}>Data Management</h3>
            <div className="space-y-6">
              <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="space-y-1">
                    <h4 className="font-bold text-legal-navy flex items-center gap-2">
                      <Download size={18} className="text-amber-600" />
                      Export All Case Data
                    </h4>
                    <p className="text-xs text-slate-500 max-w-md">
                      Download a complete record of all cases, evidence, audit trails, and intake data in a structured JSON format.
                    </p>
                  </div>
                  <button 
                    onClick={exportAllData}
                    className="px-6 py-3 bg-white border border-slate-200 text-legal-navy rounded-xl font-bold text-sm hover:bg-slate-50 transition-all shadow-sm flex items-center justify-center gap-2"
                  >
                    <Download size={16} />
                    Export Data
                  </button>
                </div>
              </div>

              <div className="p-6 bg-red-50 rounded-2xl border border-red-100">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="space-y-1">
                    <h4 className="font-bold text-red-900 flex items-center gap-2">
                      <Trash2 size={18} />
                      Clear Entire Application
                    </h4>
                    <p className="text-xs text-red-700 max-w-md">
                      Permanently delete all cases, records, and files. This action cannot be undone. We strongly recommend exporting your data first.
                    </p>
                  </div>
                  <button 
                    onClick={() => setShowDeleteConfirm(true)}
                    className="px-6 py-3 bg-red-600 text-white rounded-xl font-bold text-sm hover:bg-red-700 transition-all shadow-lg shadow-red-200 flex items-center justify-center gap-2"
                  >
                    <Trash2 size={16} />
                    DELETE ALL
                  </button>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden"
            >
              <div className="p-6 bg-red-600 text-white flex items-center gap-3">
                <AlertTriangle size={24} />
                <h3 className="text-xl font-bold" style={{ fontFamily: 'Arial, sans-serif' }}>Critical Safeguard</h3>
              </div>
              
              <div className="p-8 space-y-6">
                {deleteStep === 1 ? (
                  <>
                    <div className="space-y-4">
                      <p className="text-slate-600 leading-relaxed">
                        You are about to perform a <span className="font-bold text-red-600">destructive operation</span>. This will erase all case records, evidence, and AI analysis.
                      </p>
                      <div className="p-4 bg-amber-50 border border-amber-100 rounded-xl flex items-start gap-3">
                        <Download size={20} className="text-amber-600 mt-1 flex-shrink-0" />
                        <div>
                          <p className="text-sm font-bold text-amber-900">Recommendation</p>
                          <p className="text-xs text-amber-700">Download your data before proceeding to ensure you have a backup.</p>
                          <button 
                            onClick={exportAllData}
                            className="mt-2 text-xs font-bold text-amber-800 underline hover:text-amber-900"
                          >
                            Export Now
                          </button>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <button 
                        onClick={() => setShowDeleteConfirm(false)}
                        className="flex-1 px-6 py-3 bg-slate-100 text-slate-700 rounded-xl font-bold"
                      >
                        Cancel
                      </button>
                      <button 
                        onClick={() => setDeleteStep(2)}
                        className="flex-1 px-6 py-3 bg-red-600 text-white rounded-xl font-bold shadow-lg shadow-red-200"
                      >
                        I Understand
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="space-y-4">
                      <p className="text-sm font-bold text-slate-700">Final Confirmation</p>
                      <p className="text-xs text-slate-500">
                        To confirm deletion, please type <span className="font-mono font-bold text-red-600">DELETE ALL</span> in the field below.
                      </p>
                      <input 
                        type="text"
                        value={deleteInput}
                        onChange={(e) => setDeleteInput(e.target.value)}
                        placeholder="Type DELETE ALL"
                        className="w-full px-4 py-3 bg-slate-50 border border-red-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-500/10 transition-all font-mono"
                      />
                    </div>
                    <div className="flex gap-3">
                      <button 
                        onClick={() => {
                          setDeleteStep(1);
                          setShowDeleteConfirm(false);
                        }}
                        className="flex-1 px-6 py-3 bg-slate-100 text-slate-700 rounded-xl font-bold"
                      >
                        Back
                      </button>
                      <button 
                        disabled={deleteInput !== 'DELETE ALL'}
                        onClick={handleDeleteAll}
                        className="flex-1 px-6 py-3 bg-red-600 text-white rounded-xl font-bold shadow-lg shadow-red-200 disabled:opacity-50"
                      >
                        Clear Everything
                      </button>
                    </div>
                  </>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function SettingsNavItem({ icon: Icon, label, active, color, onClick }: any) {
  return (
    <button 
      onClick={onClick}
      className={`flex items-center px-4 py-3 rounded-xl text-sm font-bold transition-all whitespace-nowrap flex-shrink-0 lg:w-full ${
      active 
        ? 'bg-legal-navy text-white shadow-md' 
        : `${color || 'text-slate-500'} hover:bg-white hover:shadow-sm`
    }`}>
      <Icon size={18} className="mr-3" />
      {label}
    </button>
  );
}

function NotificationToggle({ label, description, defaultChecked }: any) {
  const [checked, setChecked] = useState(defaultChecked);
  return (
    <div className="flex items-center justify-between p-4 border border-slate-100 rounded-xl">
      <div>
        <p className="text-sm font-bold text-legal-navy">{label}</p>
        <p className="text-xs text-slate-500">{description}</p>
      </div>
      <button 
        onClick={() => setChecked(!checked)}
        className={`w-10 h-6 rounded-full transition-colors relative ${checked ? 'bg-legal-navy' : 'bg-slate-200'}`}
      >
        <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${checked ? 'left-5' : 'left-1'}`} />
      </button>
    </div>
  );
}

function SupportCard({ icon: Icon, title, description }: any) {
  return (
    <div className="p-4 border border-slate-100 rounded-xl hover:border-legal-navy/20 transition-colors cursor-pointer group">
      <div className="p-2 bg-slate-50 rounded-lg w-fit mb-3 group-hover:bg-legal-navy group-hover:text-white transition-colors">
        <Icon size={18} />
      </div>
      <p className="text-sm font-bold text-legal-navy">{title}</p>
      <p className="text-xs text-slate-500">{description}</p>
    </div>
  );
}

import { MessageSquare, FileText } from 'lucide-react';


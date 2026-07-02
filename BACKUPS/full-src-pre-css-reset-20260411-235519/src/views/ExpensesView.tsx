import React, { useMemo, useState } from 'react';
import { DollarSign, Plus, Filter, TrendingUp, AlertCircle, FileText, CheckCircle2 } from 'lucide-react';
import { useProject } from '../context/ProjectContext';
import { motion } from 'motion/react';

interface ExpensesViewProps {
  onAddRecord?: () => void;
}

export default function ExpensesView({ onAddRecord }: ExpensesViewProps) {
  const { records, activeProject, updateRecord } = useProject();
  const [filter, setFilter] = useState<'all' | 'verified' | 'pending'>('all');

  const expenses = useMemo(() => {
    let filtered = records.filter(r => r.projectId === activeProject?.id && r.type === 'expense');
    if (filter === 'verified') filtered = filtered.filter(e => e.verified);
    if (filter === 'pending') filtered = filtered.filter(e => !e.verified);
    return filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [records, activeProject, filter]);

  const stats = useMemo(() => {
    const totalExpenses = expenses.reduce((sum, r) => sum + (r.amount || 0), 0);
    const verifiedCount = expenses.filter(e => e.verified).length;
    const pendingCount = expenses.length - verifiedCount;
    return {
      totalAmount: totalExpenses.toLocaleString('en-US', { style: 'currency', currency: 'USD' }),
      verifiedCount,
      pendingCount,
      totalCount: expenses.length
    };
  }, [expenses]);

  const handleToggleVerified = (expense: any) => {
    updateRecord(expense.id, { verified: !expense.verified });
  };

  return (
    <div className="space-y-8 pb-20">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-legal-navy">Financial Record</h1>
          <p className="text-slate-500 mt-2">Timestamped truth layer for project-level billing and costs</p>
        </div>
        <button 
          onClick={onAddRecord}
          className="flex items-center justify-center space-x-2 bg-legal-navy text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:bg-slate-800 transition-all w-full sm:w-auto"
        >
          <Plus size={20} />
          <span>Log Expense</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="glass-panel p-6 border-l-4 border-l-emerald-500">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total Expenses</p>
          <h3 className="text-2xl md:text-3xl font-bold text-legal-navy mt-2">{stats.totalAmount}</h3>
          <div className="flex items-center text-emerald-600 text-[10px] font-bold mt-2 uppercase tracking-widest">
            <TrendingUp size={14} className="mr-1" />
            Active tracking
          </div>
        </div>
        <div className="glass-panel p-6 border-l-4 border-l-amber-500">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Pending Verification</p>
          <h3 className="text-2xl md:text-3xl font-bold text-legal-navy mt-2">{stats.pendingCount}</h3>
          <p className="text-xs text-slate-400 mt-2">Items requiring review</p>
        </div>
        <div className="glass-panel p-6 border-l-4 border-l-blue-500 sm:col-span-2 lg:col-span-1">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Verified Records</p>
          <h3 className="text-2xl md:text-3xl font-bold text-legal-navy mt-2">{stats.verifiedCount}</h3>
          <p className="text-xs text-slate-400 mt-2">Validated financial data</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-3 space-y-6">
          <div className="flex items-center space-x-2 overflow-x-auto pb-2 scrollbar-hide">
            <div className="flex bg-white p-1 rounded-lg border border-legal-border shadow-sm flex-shrink-0">
              <button 
                onClick={() => setFilter('all')}
                className={`px-4 py-1.5 rounded-md text-xs font-bold transition-colors ${filter === 'all' ? 'bg-slate-100 text-legal-navy' : 'text-slate-500 hover:text-legal-navy'}`}
              >
                All
              </button>
              <button 
                onClick={() => setFilter('verified')}
                className={`px-4 py-1.5 rounded-md text-xs font-bold transition-colors ${filter === 'verified' ? 'bg-slate-100 text-legal-navy' : 'text-slate-500 hover:text-legal-navy'}`}
              >
                Verified
              </button>
              <button 
                onClick={() => setFilter('pending')}
                className={`px-4 py-1.5 rounded-md text-xs font-bold transition-colors ${filter === 'pending' ? 'bg-slate-100 text-legal-navy' : 'text-slate-500 hover:text-legal-navy'}`}
              >
                Pending
              </button>
            </div>
            <button className="p-2 text-slate-500 hover:bg-white rounded-lg border border-transparent hover:border-legal-border transition-all flex-shrink-0">
              <Filter size={18} />
            </button>
          </div>

          <div className="glass-panel overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left min-w-[600px]">
                <thead>
                  <tr className="text-xs uppercase tracking-wider text-slate-400 border-b border-legal-border bg-slate-50/50">
                    <th className="px-6 py-4 font-bold">Description</th>
                    <th className="px-6 py-4 font-bold">Date</th>
                    <th className="px-6 py-4 font-bold">Amount</th>
                    <th className="px-6 py-4 font-bold">Status</th>
                    <th className="px-6 py-4 font-bold">Action</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {expenses.length > 0 ? (
                    expenses.map(expense => (
                      <ExpenseRow 
                        key={expense.id}
                        title={expense.title} 
                        date={new Date(expense.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} 
                        amount={expense.amount.toLocaleString('en-US', { style: 'currency', currency: 'USD' })} 
                        status={expense.verified ? 'Verified' : 'Pending'} 
                        onToggle={() => handleToggleVerified(expense)}
                      />
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-slate-400 italic">
                        No expenses recorded for this matter.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <section className="glass-panel p-6">
            <h3 className="font-bold mb-4">Integrity Check</h3>
            <div className={`p-4 rounded-xl border ${stats.pendingCount === 0 ? 'bg-emerald-50 border-emerald-100' : 'bg-amber-50 border-amber-100'}`}>
              <div className={`flex items-center space-x-2 mb-2 ${stats.pendingCount === 0 ? 'text-emerald-700' : 'text-amber-700'}`}>
                {stats.pendingCount === 0 ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
                <span className="font-bold text-sm">
                  {stats.pendingCount === 0 ? 'All Records Verified' : `${stats.pendingCount} Pending Verification`}
                </span>
              </div>
              <p className={`text-xs leading-relaxed ${stats.pendingCount === 0 ? 'text-emerald-600' : 'text-amber-600'}`}>
                {stats.pendingCount === 0 
                  ? 'All financial records have been verified against supporting documentation.'
                  : 'Some expenses require verification to ensure accuracy and completeness.'}
              </p>
            </div>
          </section>

          <section className="glass-panel p-6">
            <h3 className="font-bold mb-4">Financial Health</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-500">Verified Rate</span>
                <span className="text-sm font-bold">{stats.totalCount > 0 ? Math.round((stats.verifiedCount / stats.totalCount) * 100) : 0}%</span>
              </div>
              <div className="pt-4 border-t border-slate-50">
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-2">Verification Progress</p>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${(stats.totalCount > 0 ? (stats.verifiedCount / stats.totalCount) : 0) * 100}%` }}
                    className="bg-emerald-500 h-full rounded-full" 
                  />
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

function ExpenseRow({ title, date, amount, status, onToggle }: any) {
  return (
    <tr className="border-b border-legal-border hover:bg-slate-50/50 transition-colors group">
      <td className="px-6 py-4">
        <p className="font-bold text-legal-navy truncate max-w-[150px] md:max-w-none">{title}</p>
        <p className="text-[10px] text-slate-400 uppercase tracking-widest">Legal Expense</p>
      </td>
      <td className="px-6 py-4 text-slate-500 text-xs font-medium whitespace-nowrap">{date}</td>
      <td className="px-6 py-4 font-mono font-bold text-legal-navy whitespace-nowrap">{amount}</td>
      <td className="px-6 py-4">
        <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider whitespace-nowrap ${
          status === 'Verified' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
        }`}>
          {status}
        </span>
      </td>
      <td className="px-6 py-4">
        <button 
          onClick={onToggle}
          className={`flex items-center space-x-1 transition-colors whitespace-nowrap ${status === 'Verified' ? 'text-emerald-500' : 'text-slate-400 hover:text-legal-navy'}`}
        >
          <CheckCircle2 size={14} />
          <span className="text-[10px] font-bold uppercase tracking-widest">{status === 'Verified' ? 'Verified' : 'Verify'}</span>
        </button>
      </td>
    </tr>
  );
}



import React, { useState, useMemo } from 'react';
import Markdown from 'react-markdown';
import { FileText, Plus, Search, Filter, ShieldCheck, MoreHorizontal, Download, Eye, ChevronDown, Trash2, CheckCircle, Sparkles, Loader2, BrainCircuit, X, Upload } from 'lucide-react';
import { useProject, Record } from '../context/ProjectContext';
import { motion, AnimatePresence } from 'motion/react';
import { suggestCategory, analyzeDocument } from '../lib/geminiService';
import { RinWorkbench } from '../components/rin/RinWorkbench';

interface DocumentsViewProps {
  onAddRecord?: () => void;
}

export default function DocumentsView({ onAddRecord }: DocumentsViewProps) {
  const { records, activeProject, updateRecord, deleteRecords, addRecord, addFile } = useProject();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [showBulkMenu, setShowBulkMenu] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    category: 'all',
    verificationStatus: 'all',
    fileType: 'all',
    dateStart: '',
    dateEnd: ''
  });
  const [isAutoTagging, setIsAutoTagging] = useState(false);
  const [isBulkUploading, setIsBulkUploading] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const [analyzingDoc, setAnalyzingDoc] = useState<Record | null>(null);
  const [analysisResult, setAnalysisResult] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleBulkUpload = async () => {
    if (!activeProject) return;
    setIsBulkUploading(true);

    await new Promise(resolve => setTimeout(resolve, 2000));

    const bulkRecords: Omit<Record, 'id'>[] = [
      {
        projectId: activeProject.id,
        title: 'Case File - Full Discovery.pdf',
        type: 'document',
        status: 'pending',
        date: '2024-03-15',
        description: 'Bulk ingested discovery file containing multiple correspondence items.',
        verified: false,
        category: 'Correspondence'
      },
      {
        projectId: activeProject.id,
        title: 'Bank Statements - 2023 Q1-Q4.zip',
        type: 'document',
        status: 'pending',
        date: '2024-03-15',
        description: 'Bulk ingested financial records for the previous year.',
        verified: false,
        category: 'Financial'
      },
      {
        projectId: activeProject.id,
        title: 'Court Filing - Motion to Dismiss.pdf',
        type: 'document',
        status: 'pending',
        date: '2024-03-14',
        description: 'Bulk ingested court filing.',
        verified: false,
        category: 'Filing'
      }
    ];

    bulkRecords.forEach(rec => addRecord(rec));
    setIsBulkUploading(false);
  };

  const documents = useMemo(() => {
    return records.filter(r => {
      if (r.type !== 'document') return false;
      if (activeProject && r.projectId !== activeProject.id) return false;

      if (filters.category !== 'all' && r.category?.toLowerCase() !== filters.category.toLowerCase()) return false;

      if (filters.verificationStatus !== 'all') {
        const isVerified = filters.verificationStatus === 'verified';
        if (r.verified !== isVerified) return false;
      }

      if (filters.fileType !== 'all') {
        const ext = r.title.split('.').pop()?.toLowerCase();
        if (filters.fileType === 'pdf' && ext !== 'pdf') return false;
        if (filters.fileType === 'image' && !['jpg', 'jpeg', 'png', 'gif'].includes(ext || '')) return false;
        if (filters.fileType === 'doc' && !['doc', 'docx', 'txt'].includes(ext || '')) return false;
      }

      if (filters.dateStart && new Date(r.date) < new Date(filters.dateStart)) return false;
      if (filters.dateEnd && new Date(r.date) > new Date(filters.dateEnd)) return false;

      if (searchQuery && !r.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;

      return true;
    });
  }, [records, activeProject, filters, searchQuery]);

  const toggleSelectAll = () => {
    if (selectedIds.length === documents.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(documents.map(d => d.id));
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleBulkVerify = () => {
    selectedIds.forEach(id => updateRecord(id, { verified: true, status: 'verified' }));
    setSelectedIds([]);
    setShowBulkMenu(false);
  };

  const handleBulkDelete = () => {
    if (confirm(`Are you sure you want to delete ${selectedIds.length} documents?`)) {
      deleteRecords(selectedIds);
      setSelectedIds([]);
      setShowBulkMenu(false);
    }
  };

  const handleAssignCategory = (category: string) => {
    selectedIds.forEach(id => updateRecord(id, { category }));
    setSelectedIds([]);
    setShowBulkMenu(false);
  };

  const handleAutoTag = async () => {
    if (selectedIds.length === 0) return;
    setIsAutoTagging(true);

    try {
      const promises = selectedIds.map(async (id) => {
        const doc = records.find(r => r.id === id);
        if (doc) {
          const category = await suggestCategory(doc.title, doc.description);
          updateRecord(id, { category });
        }
      });

      await Promise.all(promises);
    } catch (error) {
      console.error('Auto-tagging error:', error);
    } finally {
      setIsAutoTagging(false);
      setSelectedIds([]);
      setShowBulkMenu(false);
    }
  };

  const handleAnalyze = async (doc: Record) => {
    setAnalyzingDoc(doc);
    setIsAnalyzing(true);
    setAnalysisResult(null);

    try {
      const result = await analyzeDocument(doc);
      setAnalysisResult(result);
    } catch (error) {
      console.error('Analysis error:', error);
      setAnalysisResult('Failed to analyze document.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || !activeProject) return;

    Array.from(files).forEach(file => {
      const sizeLabel =
        file.size >= 1024 * 1024
          ? `${(file.size / 1024 / 1024).toFixed(2)} MB`
          : `${Math.max(1, Math.round(file.size / 1024))} KB`;

      addFile({
        projectId: activeProject.id,
        name: file.name,
        size: sizeLabel,
        type: file.type || 'application/octet-stream'
      });

      addRecord({
        projectId: activeProject.id,
        title: file.name,
        type: 'document',
        status: 'pending',
        date: new Date().toISOString().slice(0, 10),
        description: `Uploaded file: ${file.name}`,
        verified: false,
        category: 'Uncategorized',
        size: sizeLabel
      } as Omit<Record, 'id'>);
    });

    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="space-y-8 pb-20">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        className="hidden"
        multiple
      />

      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-legal-navy">Documents</h1>
          <p className="text-slate-500 mt-2">Evidence-oriented repository with chain-of-custody tracking</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center justify-center space-x-2 bg-amber-500 text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:bg-amber-600 transition-all w-full sm:w-auto"
          >
            <Upload size={20} />
            <span>Upload Evidence</span>
          </button>
          <button
            onClick={onAddRecord}
            className="flex items-center justify-center space-x-2 bg-legal-navy text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:bg-slate-800 transition-all w-full sm:w-auto"
          >
            <Plus size={20} />
            <span>Add Record</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-3 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-2">
            <div className="flex items-center space-x-2 overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
              <div className="flex bg-white p-1 rounded-lg border border-legal-border shadow-sm flex-shrink-0">
                <button
                  onClick={() => setFilters(f => ({ ...f, category: 'all' }))}
                  className={`px-3 py-1.5 rounded-md text-xs font-bold transition-colors ${filters.category === 'all' ? 'bg-slate-100 text-legal-navy' : 'text-slate-500 hover:text-legal-navy'}`}
                >
                  All
                </button>
                <button
                  onClick={() => setFilters(f => ({ ...f, category: 'filing' }))}
                  className={`px-3 py-1.5 rounded-md text-xs font-bold transition-colors ${filters.category === 'filing' ? 'bg-slate-100 text-legal-navy' : 'text-slate-500 hover:text-legal-navy'}`}
                >
                  Filings
                </button>
                <button
                  onClick={() => setFilters(f => ({ ...f, category: 'correspondence' }))}
                  className={`px-3 py-1.5 rounded-md text-xs font-bold transition-colors ${filters.category === 'correspondence' ? 'bg-slate-100 text-legal-navy' : 'text-slate-500 hover:text-legal-navy'}`}
                >
                  Correspondence
                </button>
                <button
                  onClick={() => setFilters(f => ({ ...f, category: 'financial' }))}
                  className={`px-3 py-1.5 rounded-md text-xs font-bold transition-colors ${filters.category === 'financial' ? 'bg-slate-100 text-legal-navy' : 'text-slate-500 hover:text-legal-navy'}`}
                >
                  Financial
                </button>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleBulkUpload}
                  disabled={isBulkUploading}
                  className={`p-2 rounded-lg border transition-all flex items-center space-x-2 flex-shrink-0 ${isBulkUploading ? 'bg-slate-100 text-slate-400 border-slate-200' : 'text-slate-500 hover:bg-white border-transparent hover:border-legal-border'}`}
                  title="Bulk Upload Simulation"
                >
                  <Upload size={18} className={isBulkUploading ? 'animate-bounce' : ''} />
                  <span className="text-xs font-bold hidden sm:inline">{isBulkUploading ? 'Ingesting...' : 'Bulk Upload'}</span>
                </button>
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={`p-2 rounded-lg border transition-all flex-shrink-0 ${showFilters ? 'bg-legal-navy text-white border-legal-navy' : 'text-slate-500 hover:bg-white border-transparent hover:border-legal-border'}`}
                >
                  <Filter size={18} />
                </button>
              </div>
            </div>
            <div className="relative w-full md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search documents..."
                className="pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-legal-navy/5 w-full"
              />
            </div>
          </div>

          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden mb-4"
              >
                <div className="glass-panel p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Verification Status</label>
                    <select
                      value={filters.verificationStatus}
                      onChange={(e) => setFilters(f => ({ ...f, verificationStatus: e.target.value }))}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-legal-navy/5"
                    >
                      <option value="all">All Statuses</option>
                      <option value="verified">Verified</option>
                      <option value="pending">Pending</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">File Type</label>
                    <select
                      value={filters.fileType}
                      onChange={(e) => setFilters(f => ({ ...f, fileType: e.target.value }))}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-legal-navy/5"
                    >
                      <option value="all">All Types</option>
                      <option value="pdf">PDF Documents</option>
                      <option value="image">Images (JPG, PNG)</option>
                      <option value="doc">Word/Text Docs</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Date Range</label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="date"
                        value={filters.dateStart}
                        onChange={(e) => setFilters(f => ({ ...f, dateStart: e.target.value }))}
                        className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-2 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-legal-navy/5"
                      />
                      <span className="text-slate-400">-</span>
                      <input
                        type="date"
                        value={filters.dateEnd}
                        onChange={(e) => setFilters(f => ({ ...f, dateEnd: e.target.value }))}
                        className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-2 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-legal-navy/5"
                      />
                    </div>
                  </div>
                  <div className="md:col-span-3 flex justify-end">
                    <button
                      onClick={() => setFilters({
                        category: 'all',
                        verificationStatus: 'all',
                        fileType: 'all',
                        dateStart: '',
                        dateEnd: ''
                      })}
                      className="text-xs font-bold text-slate-400 hover:text-legal-navy transition-colors"
                    >
                      Reset All Filters
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {selectedIds.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex flex-col sm:flex-row items-center justify-between p-3 bg-legal-navy text-white rounded-xl shadow-lg gap-3"
              >
                <div className="flex items-center space-x-4 ml-2">
                  <span className="text-sm font-bold">{selectedIds.length} documents selected</span>
                </div>
                <div className="flex items-center space-x-2 relative w-full sm:w-auto">
                  <button
                    onClick={handleAutoTag}
                    disabled={isAutoTagging}
                    className="flex-1 sm:flex-none flex items-center justify-center space-x-2 px-4 py-1.5 bg-amber-500 hover:bg-amber-600 rounded-lg text-sm font-bold transition-colors disabled:opacity-50"
                  >
                    {isAutoTagging ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
                    <span>Auto-Tag AI</span>
                  </button>
                  <button
                    onClick={() => setShowBulkMenu(!showBulkMenu)}
                    className="flex-1 sm:flex-none flex items-center justify-center space-x-2 px-4 py-1.5 bg-white/10 hover:bg-white/20 rounded-lg text-sm font-bold transition-colors"
                  >
                    <span>Bulk Actions</span>
                    <ChevronDown size={16} />
                  </button>

                  {showBulkMenu && (
                    <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-2xl border border-slate-100 overflow-hidden z-30 text-legal-navy">
                      <button
                        onClick={handleBulkVerify}
                        className="w-full flex items-center px-4 py-3 hover:bg-slate-50 text-sm font-bold text-left transition-colors"
                      >
                        <CheckCircle size={16} className="mr-3 text-emerald-500" />
                        Mark as Verified
                      </button>
                      <div className="px-4 py-2 bg-slate-50 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Assign Category</div>
                      <button onClick={() => handleAssignCategory('Filing')} className="w-full px-4 py-2 hover:bg-slate-50 text-xs font-medium text-left">Filing</button>
                      <button onClick={() => handleAssignCategory('Correspondence')} className="w-full px-4 py-2 hover:bg-slate-50 text-xs font-medium text-left">Correspondence</button>
                      <button onClick={() => handleAssignCategory('Financial')} className="w-full px-4 py-2 hover:bg-slate-50 text-xs font-medium text-left">Financial</button>
                      <div className="h-px bg-slate-100 my-1" />
                      <button
                        onClick={handleBulkDelete}
                        className="w-full flex items-center px-4 py-3 hover:bg-red-50 text-sm font-bold text-red-600 text-left transition-colors"
                      >
                        <Trash2 size={16} className="mr-3" />
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <RinWorkbench matterId={activeProject?.id || 'divorce_case_primary'} />

          <div className="glass-panel overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left min-w-[700px]">
                <thead>
                  <tr className="text-xs uppercase tracking-wider text-slate-400 border-b border-legal-border bg-slate-50/50">
                    <th className="px-6 py-4 w-10">
                      <input
                        type="checkbox"
                        checked={documents.length > 0 && selectedIds.length === documents.length}
                        onChange={toggleSelectAll}
                        className="rounded border-slate-300 text-legal-navy focus:ring-legal-navy"
                      />
                    </th>
                    <th className="px-6 py-4 font-bold">Document Name</th>
                    <th className="px-6 py-4 font-bold">Category</th>
                    <th className="px-6 py-4 font-bold">Date Added</th>
                    <th className="px-6 py-4 font-bold">Status</th>
                    <th className="px-6 py-4 font-bold">Actions</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {documents.map(doc => (
                    <DocRow
                      key={doc.id}
                      doc={doc}
                      isSelected={selectedIds.includes(doc.id)}
                      onToggle={() => toggleSelect(doc.id)}
                      onAnalyze={() => handleAnalyze(doc)}
                    />
                  ))}
                  {documents.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-6 py-20 text-center text-slate-400">
                        No documents found matching your criteria.
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
            <h3 className="font-bold mb-4">Storage Metrics</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-500">Total Files</span>
                <span className="text-sm font-bold">{documents.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-500">Storage Used</span>
                <span className="text-sm font-bold">14.2 MB</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full mt-2">
                <div className="bg-legal-navy h-full w-[14%] rounded-full" />
              </div>
              <p className="text-[10px] text-slate-400 text-center font-bold uppercase tracking-widest">14% of 100MB Vault</p>
            </div>
          </section>

          <section className="glass-panel p-6">
            <h3 className="font-bold mb-4">Integrity State</h3>
            <div className="space-y-4">
              <div className="flex items-center space-x-3 p-3 bg-emerald-50 rounded-lg border border-emerald-100">
                <ShieldCheck size={20} className="text-emerald-600 flex-shrink-0" />
                <div>
                  <p className="text-xs font-bold text-emerald-800 uppercase tracking-widest">Chain of Custody</p>
                  <p className="text-[10px] text-emerald-600">All files timestamped and hashed.</p>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>

      <AnimatePresence>
        {analyzingDoc && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-legal-navy/40 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col overflow-hidden"
            >
              <div className="p-6 bg-legal-navy text-white flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-white/10 rounded-lg">
                    <BrainCircuit size={20} className="text-amber-400" />
                  </div>
                  <div>
                    <h3 className="font-bold">AI Document Analysis</h3>
                    <p className="text-xs text-slate-300 truncate max-w-[300px]">{analyzingDoc.title}</p>
                  </div>
                </div>
                <button
                  onClick={() => setAnalyzingDoc(null)}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-8">
                {isAnalyzing ? (
                  <div className="h-full flex flex-col items-center justify-center space-y-4 py-12">
                    <Loader2 size={40} className="animate-spin text-legal-navy" />
                    <p className="text-slate-500 font-medium italic">Performing deep analysis of document content...</p>
                  </div>
                ) : (
                  <div className="markdown-body">
                    <Markdown>{analysisResult || 'No analysis available.'}</Markdown>
                  </div>
                )}
              </div>

              <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end">
                <button
                  onClick={() => setAnalyzingDoc(null)}
                  className="px-6 py-2 bg-legal-navy text-white rounded-lg font-bold hover:bg-slate-800 transition-colors"
                >
                  Close Analysis
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function DocRow({ doc, isSelected, onToggle, onAnalyze }: any) {
  return (
    <tr className={`border-b border-legal-border hover:bg-slate-50/50 transition-colors group ${isSelected ? 'bg-slate-50' : ''}`}>
      <td className="px-6 py-4">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={onToggle}
          className="rounded border-slate-300 text-legal-navy focus:ring-legal-navy"
        />
      </td>
      <td className="px-6 py-4">
        <div className="flex items-center space-x-3 min-w-0">
          <div className="p-2 bg-slate-100 rounded text-slate-400 group-hover:bg-legal-navy group-hover:text-white transition-colors flex-shrink-0">
            <FileText size={18} />
          </div>
          <div className="min-w-0">
            <p className="font-bold text-legal-navy truncate max-w-[200px]">{doc.title}</p>
            <p className="text-[10px] text-slate-400 uppercase tracking-widest">{doc.size || '0 KB'}</p>
          </div>
        </div>
      </td>
      <td className="px-6 py-4">
        <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded text-[10px] font-bold uppercase tracking-wider whitespace-nowrap">{doc.category || 'Uncategorized'}</span>
      </td>
      <td className="px-6 py-4 text-slate-500 text-xs font-medium whitespace-nowrap">{doc.date}</td>
      <td className="px-6 py-4">
        <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider whitespace-nowrap ${
          doc.verified ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
        }`}>
          {doc.verified ? 'Verified' : 'Pending'}
        </span>
      </td>
      <td className="px-6 py-4">
        <div className="flex items-center space-x-2 text-slate-400">
          <button
            onClick={onAnalyze}
            className="p-1.5 hover:text-legal-navy hover:bg-slate-100 rounded-lg transition-all flex items-center space-x-1"
            title="AI Analysis"
          >
            <BrainCircuit size={16} />
            <span className="text-[10px] font-bold uppercase hidden sm:inline">Analyze</span>
          </button>
          <button className="p-1 hover:text-legal-navy transition-colors"><Eye size={16} /></button>
          <button className="p-1 hover:text-legal-navy transition-colors"><Download size={16} /></button>
          <button className="p-1 hover:text-legal-navy transition-colors"><MoreHorizontal size={16} /></button>
        </div>
      </td>
    </tr>
  );
}
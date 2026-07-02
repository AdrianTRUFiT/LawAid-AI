import React, { useState, useEffect, useRef } from 'react';
import Markdown from 'react-markdown';
import { 
  BrainCircuit, 
  MessageSquare, 
  Send, 
  X, 
  Loader2 
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useProject } from '../context/ProjectContext';
import { chatWithAssistant } from '../lib/geminiService';

interface CaseAssistantProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CaseAssistant({ isOpen, onClose }: CaseAssistantProps) {
  const { records, activeProject } = useProject();
  const [chatMessage, setChatMessage] = useState('');
  const [chatHistory, setChatHistory] = useState<{ role: 'user' | 'model', parts: { text: string }[] }[]>([]);
  const [isChatLoading, setIsChatLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const handleSendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!chatMessage.trim() || isChatLoading) return;

    const userMsg = chatMessage;
    setChatMessage('');
    setChatHistory(prev => [...prev, { role: 'user', parts: [{ text: userMsg }] }]);
    setIsChatLoading(true);

    const response = await chatWithAssistant(userMsg, records.filter(r => r.projectId === activeProject?.id), chatHistory);
    
    setChatHistory(prev => [...prev, { role: 'model', parts: [{ text: response || "I'm sorry, I couldn't process that." }] }]);
    setIsChatLoading(false);
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          className="fixed inset-0 md:inset-auto md:bottom-8 md:right-8 md:w-[500px] md:h-[600px] bg-white z-50 shadow-2xl rounded-none md:rounded-3xl border border-slate-200 flex flex-col overflow-hidden"
        >
          <div className="p-4 bg-legal-navy text-white flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-white/10 rounded-lg">
                <BrainCircuit size={20} className="text-amber-400" />
              </div>
              <div>
                <h3 className="font-bold">LawAidAI Assistant</h3>
                <p className="text-[10px] text-slate-300 uppercase tracking-widest">Case Intelligence</p>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50/50">
            {chatHistory.length === 0 && (
              <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-60">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center">
                  <MessageSquare size={32} className="text-slate-400" />
                </div>
                <div>
                  <p className="font-bold text-slate-600">How can I help you today?</p>
                  <p className="text-sm text-slate-400 max-w-[250px] mx-auto mt-1">
                    Ask about your documents, upcoming events, or financial records.
                  </p>
                </div>
              </div>
            )}
            {chatHistory.map((msg, i) => (
              <div key={i} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                {msg.role === 'model' && (
                  <span className="text-[10px] font-bold text-legal-navy uppercase tracking-widest mb-1 ml-1">
                    AI Assistant
                  </span>
                )}
                <div className={`max-w-[85%] p-4 rounded-2xl text-sm ${
                  msg.role === 'user' 
                    ? 'bg-legal-navy text-white rounded-tr-none' 
                    : 'bg-white border border-slate-100 text-slate-700 shadow-sm rounded-tl-none'
                }`}>
                  <div className="markdown-body">
                    <Markdown>{msg.parts[0].text}</Markdown>
                  </div>
                </div>
              </div>
            ))}
            {isChatLoading && (
              <div className="flex justify-start">
                <div className="bg-white border border-slate-100 p-4 rounded-2xl rounded-tl-none shadow-sm flex items-center space-x-2">
                  <Loader2 size={16} className="animate-spin text-legal-navy" />
                  <span className="text-sm text-slate-500">Thinking...</span>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          <form onSubmit={handleSendMessage} className="p-4 bg-white border-t border-slate-100 flex items-center space-x-2">
            <input 
              type="text" 
              value={chatMessage}
              onChange={(e) => setChatMessage(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-legal-navy/5 focus:border-slate-300 transition-all"
            />
            <button 
              type="submit"
              disabled={!chatMessage.trim() || isChatLoading}
              className="p-3 bg-legal-navy text-white rounded-xl hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-legal-navy/20"
            >
              <Send size={20} />
            </button>
          </form>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

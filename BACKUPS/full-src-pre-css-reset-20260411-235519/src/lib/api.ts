// LawAidAI Service Layer - Data Contracts & API Stubs

export interface Record {
  id: string;
  projectId: string;
  title: string;
  type: 'event' | 'task' | 'document' | 'expense';
  status: string;
  date: string;
  description?: string;
  verified: boolean;
  metadata?: any;
}

export const api = {
  // Projects
  getProjects: async () => {
    // Mock API call
    return [
      { id: '1', name: 'Family Matter - Custody', type: 'Family Law', status: 'active' },
      { id: '2', name: 'Personal Injury Claim', type: 'Civil Litigation', status: 'active' }
    ];
  },

  // Records
  getRecords: async (projectId: string) => {
    return [
      { id: 'r1', projectId, title: 'Attorney Phone Call', type: 'event', status: 'verified', date: '2024-03-20', verified: true },
      { id: 'r2', projectId, title: 'Follow up on Custody Draft', type: 'task', status: 'open', date: '2024-03-22', verified: false },
      { id: 'r3', projectId, title: 'Financial Disclosure', type: 'document', status: 'verified', date: '2024-03-18', verified: true },
      { id: 'r4', projectId, title: 'Retainer Replenishment', type: 'expense', status: 'verified', date: '2024-03-15', verified: true },
    ];
  },

  // Analysis
  getAnalysis: async (projectId: string) => {
    return {
      summary: "The record indicates a potential discrepancy in the Mar 20 phone call log. The attorney promised a draft by Friday (Mar 22), but no document receipt has been recorded.",
      integrityScore: 0.88,
      riskLevel: 'low'
    };
  }
};

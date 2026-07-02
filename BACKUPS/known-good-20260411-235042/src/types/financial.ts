// src/types/financial.ts

export type InvoiceStatus =
  | 'imported'
  | 'categorized'
  | 'under_review'
  | 'approved'
  | 'partially_approved'
  | 'disputed'
  | 'scheduled'
  | 'paid'
  | 'archived';

export type ObligationStatus =
  | 'received'
  | 'approved'
  | 'scheduled'
  | 'paid'
  | 'overdue'
  | 'disputed'
  | 'closed';

export type PaymentStatus =
  | 'ready'
  | 'scheduled'
  | 'processing'
  | 'paid'
  | 'failed'
  | 'reversed'
  | 'canceled';

export type ReconciliationStatus =
  | 'pending_match'
  | 'matched'
  | 'partial_match'
  | 'unmatched'
  | 'disputed'
  | 'resolved';

export type ReviewFlagSeverity = 'low' | 'medium' | 'high';
export type ReviewFlagStatus = 'open' | 'resolved';
export type AlertSeverity = 'info' | 'warning' | 'critical';

export type ReviewFlagType =
  | 'vague_entry'
  | 'repeated_task'
  | 'repeated_review'
  | 'role_mismatch'
  | 'amount_anomaly'
  | 'missing_support'
  | 'unmatched_payment'
  | 'unmatched_invoice'
  | 'budget_overrun'
  | 'due_soon'
  | 'overdue';

export interface CounterpartyProfile {
  id: string;
  workspaceId: string;
  name: string;
  type: 'law_firm' | 'attorney' | 'court' | 'expert' | 'mediator' | 'vendor' | 'other';
  contactMethods?: string[];
  paymentTerms?: string;
  expectedSubmissionMethod?: string;
  notes?: string;
  activityState?: 'active' | 'inactive';
}

export interface InvoiceLineItem {
  id: string;
  invoiceId: string;
  description: string;
  quantity?: number;
  unit?: string;
  unitRate?: number;
  hours?: number;
  amount: number;
  billedRole?: string;
  category?: string;
  datePerformed?: string;
  linkedEvidenceIds?: string[];
  reviewFlagIds?: string[];
}

export interface InvoiceRecord {
  id: string;
  workspaceId: string;
  vendorId?: string;
  vendorName: string;
  invoiceNumber: string;
  invoiceDate: string;
  dueDate: string;
  subtotal: number;
  tax: number;
  total: number;
  currency: string;
  lineItems: InvoiceLineItem[];
  supportingDocumentIds: string[];
  status: InvoiceStatus;
  reviewFlagIds: string[];
  notes?: string;
  uploadedAt: string;
  parsedAt?: string;
}

export interface PaymentObligation {
  id: string;
  workspaceId: string;
  title: string;
  description?: string;
  category: string;
  vendorId?: string;
  vendorName: string;
  sourceDocumentIds: string[];
  dueDate: string;
  expectedAmount: number;
  approvedAmount?: number;
  status: ObligationStatus;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  linkedInvoiceId?: string;
  linkedPaymentIds: string[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PaymentRecord {
  id: string;
  workspaceId: string;
  obligationId?: string;
  invoiceId?: string;
  vendorId?: string;
  vendorName: string;
  amount: number;
  datePaid: string;
  paymentMethodSummary: string;
  processorReference?: string;
  status: PaymentStatus;
  receiptDocumentIds: string[];
  notes?: string;
}

export interface ReceiptRecord {
  id: string;
  workspaceId: string;
  amount: number;
  vendorId?: string;
  vendorName: string;
  date: string;
  sourceType: 'receipt' | 'bank_statement' | 'credit_card' | 'manual';
  documentId?: string;
  linkedPaymentId?: string;
  linkedInvoiceId?: string;
  category?: string;
  notes?: string;
}

export interface ReconciliationMatch {
  id: string;
  workspaceId: string;
  invoiceId?: string;
  paymentId?: string;
  receiptId?: string;
  matchType: 'exact' | 'partial' | 'manual';
  confidence: number;
  discrepancyReason?: string;
  status: ReconciliationStatus;
  reviewedBy?: string;
  reviewedAt?: string;
}

export interface ReviewFlag {
  id: string;
  workspaceId: string;
  targetType: 'invoice' | 'invoice_line_item' | 'payment' | 'receipt' | 'budget';
  targetId: string;
  flagType: ReviewFlagType;
  severity: ReviewFlagSeverity;
  explanation: string;
  status: ReviewFlagStatus;
  createdAt: string;
  resolvedAt?: string;
}

export interface WorkspaceBudget {
  id: string;
  workspaceId: string;
  projectedLow: number;
  projectedHigh: number;
  allocatedTotal: number;
  availableFunds?: number;
  actualSpend: number;
  categoryAllocations: Array<{
    category: string;
    allocated: number;
    spent: number;
  }>;
  notes?: string;
  updatedAt: string;
}

export interface CostEstimate {
  id: string;
  workspaceId: string;
  lowEstimate: number;
  highEstimate: number;
  confidence: 'low' | 'medium' | 'high';
  assumptions: string;
  expectedUpcomingCosts: Array<{
    label: string;
    amount: number;
    dueDate?: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

export interface FinancialAlert {
  id: string;
  workspaceId: string;
  type: ReviewFlagType | 'budget_depletion' | 'proof_missing';
  severity: AlertSeverity;
  title: string;
  description: string;
  relatedId?: string;
  createdAt: string;
}

export interface FinancialWorkspaceState {
  workspaceId: string;
  invoices: InvoiceRecord[];
  obligations: PaymentObligation[];
  payments: PaymentRecord[];
  receipts: ReceiptRecord[];
  matches: ReconciliationMatch[];
  flags: ReviewFlag[];
  counterparties: CounterpartyProfile[];
  budget: WorkspaceBudget | null;
  estimate: CostEstimate | null;
  updatedAt: string;
}
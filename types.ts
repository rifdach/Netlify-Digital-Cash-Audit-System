// Enums for Status and Roles
export enum RiskLevel {
  LOW = 'Low',
  MEDIUM = 'Medium',
  HIGH = 'High'
}

export enum KKPStatus {
  DRAFT = 'Draft',
  IN_PROGRESS = 'In Progress',
  FINISH = 'Finish',
  APPROVED = 'Approved'
}

export enum UserRole {
  JUNIOR = 'Junior Auditor',
  SENIOR = 'Senior Auditor',
  MANAGER = 'Manager',
  PARTNER = 'Partner'
}

// T_Transaksi_Kas
export interface Transaction {
  id: string;
  date: string;
  description: string;
  referenceNo: string; // Journal ID
  amount: number;
  type: 'DEBIT' | 'CREDIT';
  accountCode: string;
  counterparty: string; // Supplier/Customer
  riskScore?: number; // 0-100
  riskLevel?: RiskLevel;
  anomalyFlag?: boolean;
}

// T_Bukti
export interface Evidence {
  id: string;
  transactionId: string;
  fileName: string;
  uploadDate: string;
  extractedAmount?: number;
  extractedDate?: string;
  fileUrl?: string; // Mock URL
}

// T_Vouching_Result
export interface VouchingResult {
  transactionId: string;
  status: 'MATCH' | 'DISCREPANCY' | 'MISSING_EVIDENCE';
  notes: string;
  verifiedBy: string;
  verifiedAt: string;
}

// T_Temuan_Audit & T_KKP combined for UI simplicity in this demo
export interface KKPDocument {
  id: string;
  period: string;
  preparedBy: string;
  reviewedBy?: string;
  status: KKPStatus;
  findings: AuditFinding[];
}

export interface AuditFinding {
  id: string;
  transactionId: string;
  title: string;
  condition: string; // The problem
  criteria: string; // The rule violated
  cause: string;
  effect: string; // Financial impact
  recommendation: string;
  managementResponse?: string;
  status: 'OPEN' | 'CLOSED';
}

export interface Task {
  id: string;
  title: string;
  assignee: string;
  status: 'TODO' | 'DOING' | 'DONE';
  dueDate: string;
}

export interface ChatMessage {
  id: string;
  sender: string;
  content: string;
  timestamp: string;
}

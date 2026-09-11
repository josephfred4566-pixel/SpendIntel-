export type ExpenseCategory = 
  | 'Travel' 
  | 'Software' 
  | 'Meals' 
  | 'Office Supplies' 
  | 'Cloud & Hosting' 
  | 'Marketing' 
  | 'Other'
  | (string & {});

export interface CategoryDefinition {
  id: string;
  category: string; // The primary label / name
  description: string;
  budgetCap: number;
  labels: string[]; // custom classification tag labels
  color?: string;
}

export type ExpenseStatus = 'Approved' | 'Pending' | 'Flagged';

export type Department = 
  | 'Finance'
  | 'Engineering' 
  | 'Sales' 
  | 'Marketing' 
  | 'Operations' 
  | 'Executive' 
  | 'Design'
  | 'Legal & HR'
  | (string & {});

export type ViolationSeverity = 'critical' | 'warning' | 'info';

export interface PolicyViolation {
  id: string;
  expenseId: string;
  code: string;
  ruleName: string;
  severity: ViolationSeverity;
  description: string;
  suggestedAction: string;
  date: string;
}

export interface Expense {
  id: string;
  date: string;
  merchant: string;
  category: ExpenseCategory;
  amount: number;
  currency: string;
  status: ExpenseStatus;
  employeeName: string;
  department: Department;
  tax?: number;
  receiptUrl?: string;
  hasReceipt?: boolean;
  notes?: string;
  description?: string;
  isAiExtracted?: boolean;
  violations?: PolicyViolation[];
}

export interface MonthlySpend {
  month: string;
  Travel: number;
  Software: number;
  Meals: number;
  Office: number;
  Cloud: number;
  Marketing: number;
  total: number;
}

export interface CategorySummary {
  category: ExpenseCategory;
  total: number;
  count: number;
  color: string;
  budgetCap: number;
}

export interface DepartmentSpend {
  department: Department;
  total: number;
  budget: number;
  expenseCount: number;
  flaggedCount: number;
  color: string;
}

export type ActiveNavTab = 'home' | 'settings';

export interface AccountingIntegration {
  id: 'quickbooks' | 'xero' | 'ramp' | 'termux-server' | (string & {});
  name: string;
  tagline: string;
  category: string;
  status: 'connected' | 'disconnected';
  lastSynced: string | null;
  syncInterval: 'Realtime' | 'Hourly' | 'Daily' | 'On-Demand / Scriptable' | (string & {});
  mappedLedger: string;
  features: string[];
}

export type CompanyType = 'Small Business' | 'Enterprise' | 'Corporate';

export type UserRole = 
  | 'Financial Controller' 
  | 'VP of Finance' 
  | 'Senior Auditor' 
  | 'Corporate Accountant' 
  | 'Staff Employee';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  title?: string;
  department?: Department | string;
  phoneNumber?: string;
  bio?: string;
  location?: string;
  companyName: string;
  companyType: CompanyType;
  avatarUrl?: string;
}

export interface AuthSession {
  user: AuthUser;
  token: string;
  createdAt: string;
  hasOnboarded: boolean;
  rememberMe: boolean;
}

export type ActivityLogActionType =
  | 'AUTH_LOGIN'
  | 'AUTH_REGISTER'
  | 'AUTH_LOGOUT'
  | 'ONBOARDING_COMPLETED'
  | 'PROFILE_UPDATED'
  | 'EXPENSE_CREATED'
  | 'EXPENSE_STATUS_CHANGE'
  | 'BULK_APPROVAL'
  | 'VIOLATION_WAIVED'
  | 'EXCEPTION_APPROVED'
  | 'EXPENSE_REJECTED'
  | 'RECEIPT_REQUESTED'
  | 'RECEIPT_ATTACHED'
  | 'REAUDIT_EXECUTED'
  | 'CURRENCY_CHANGED'
  | 'INTEGRATION_SYNC'
  | 'INTEGRATION_TOGGLE'
  | 'PREFERENCES_SAVED'
  | 'CSV_EXPORTED'
  | 'DATA_RESET'
  | 'BACKUP_RESTORED';

export interface ActivityLogEntry {
  id: string;
  timestamp: string; // ISO string
  displayTime: string;
  actionType: ActivityLogActionType;
  actor: string;
  title: string;
  details: string;
  severity?: 'normal' | 'warning' | 'success' | 'alert';
  relatedExpenseId?: string;
  metadata?: Record<string, any>;
}

export interface CompanyProfileData {
  companyName: string;
  legalEntity: string;
  taxId: string;
  fiscalYearEnd: string;
  defaultCurrency: string;
  accountingStandard: 'US_GAAP' | 'IFRS' | 'UK_GAAP';
  lastUpdated?: string;
}

export interface AppPreferences {
  autoReconcile: boolean;
  receiptUploadRequirement: number;
  strictPerDiem: boolean;
  activeCurrencyCode: string;
  auditStrictness: 'standard' | 'high' | 'maximum';
  theme: 'light' | 'dark';
}


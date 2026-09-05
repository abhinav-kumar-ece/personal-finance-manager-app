export type AccountType = 'checking' | 'savings' | 'credit_card' | 'investment';
export type SyncStatus = 'active' | 'syncing' | 'error' | 'disconnected';
export type TransactionType = 'expense' | 'income' | 'transfer';
export type ExpenseTag = 'essential' | 'discretionary' | 'recurring' | 'tax_deductible';
export type CategorizedBy = 'ai' | 'rule' | 'manual';

export interface BankAccount {
  id: string;
  institutionName: string;
  accountName: string;
  accountType: AccountType;
  mask: string;
  balance: number;
  availableBalance?: number;
  currency: string;
  syncStatus: SyncStatus;
  lastSyncedAt: string;
  color: string;
  institutionCode: string;
  autoSyncEnabled: boolean;
}

export interface Transaction {
  id: string;
  accountId: string;
  date: string; // YYYY-MM-DD
  amount: number; // positive for expense, positive for income (differentiated by type)
  type: TransactionType;
  merchant: string;
  rawDescription: string;
  category: string;
  subCategory?: string;
  tags: ExpenseTag[];
  confidenceScore?: number; // e.g. 96
  categorizedBy: CategorizedBy;
  reasoning?: string;
  isRecurring?: boolean;
  recurringInterval?: 'monthly' | 'weekly' | 'yearly';
  status: 'posted' | 'pending';
  notes?: string;
}

export interface CategorizationRule {
  id: string;
  keyword: string;
  targetCategory: string;
  targetTags: ExpenseTag[];
  active: boolean;
}

export interface BudgetLimit {
  category: string;
  monthlyLimit: number;
}

export interface RecurringSubscription {
  id: string;
  merchant: string;
  category: string;
  amount: number;
  frequency: 'monthly' | 'weekly' | 'yearly';
  nextDueDate: string;
  accountId: string;
  status: 'active' | 'review_suggested' | 'cancelled';
  annualCost: number;
}

export interface FinancialInsightsReport {
  overallHealthScore: number;
  executiveSummary: string;
  keyObservations: string[];
  anomaliesDetected: {
    category: string;
    description: string;
    percentageChange: number;
  }[];
  costSavingSuggestions: {
    title: string;
    potentialMonthlySavings: number;
    action: string;
  }[];
  generatedAt: string;
}

export type ChatbotRole = 'wealth_strategist' | 'budget_coach' | 'rapid_auditor' | 'custom';
export type GeminiChatModel = 'gemini-3.5-flash' | 'gemini-3.1-pro-preview' | 'gemini-3.1-flash-lite' | 'auto';

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: string;
  modelUsed?: string;
  roleUsed?: string;
}

export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL?: string | null;
  isAnonymous?: boolean;
}

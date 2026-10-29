export type BillingCycle = 'monthly' | 'yearly' | 'quarterly' | 'weekly';

export type SubscriptionCategory =
  | 'Infrastructure'
  | 'Software'
  | 'Media'
  | 'Fitness'
  | 'Utilities'
  | 'Other';

export type SubscriptionStatus = 'active' | 'paused' | 'trial';

export type CurrencySymbol = '$' | '€' | '£' | 'ETB' | '¥' | '₹' | 'C$' | 'A$' | 'CHF';

export interface Subscription {
  id: string;
  name: string;
  cost: number;
  currency: CurrencySymbol;
  billingCycle: BillingCycle;
  category: SubscriptionCategory;
  status: SubscriptionStatus;
  nextBillingDate: string; // YYYY-MM-DD
  alertLeadDays: number; // e.g. 1, 3, 7, 14
  trialEndDate?: string; // YYYY-MM-DD for trials
  paymentMethod?: string; // e.g. "Visa •••• 4242", "Amex Corporate"
  notes?: string;
  cancellationUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface FinancialSummary {
  monthlyBurnRate: number;
  annualRunRate: number;
  activeCount: number;
  pausedCount: number;
  trialCount: number;
  dueNext7DaysCount: number;
  dueNext7DaysTotal: number;
  categoryBreakdown: {
    category: SubscriptionCategory;
    totalMonthly: number;
    count: number;
    percentage: number;
    color: string;
  }[];
}

export type SortField = 'nextBillingDate' | 'monthlyCost' | 'name' | 'category';
export type SortDirection = 'asc' | 'desc';

export interface FilterState {
  searchQuery: string;
  category: string; // 'all' or SubscriptionCategory
  status: string; // 'all' | 'active' | 'paused' | 'trial' | 'due-7-days'
  sortField: SortField;
  sortDirection: SortDirection;
}

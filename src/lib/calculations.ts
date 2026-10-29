import type {
  BillingCycle,
  FinancialSummary,
  Subscription,
  SubscriptionCategory,
} from '../types/subscription';

export const CATEGORY_COLORS: Record<SubscriptionCategory, string> = {
  Infrastructure: '#38BDF8', // Sky
  Software: '#818CF8',       // Indigo
  Media: '#F472B6',          // Pink
  Fitness: '#34D399',        // Emerald
  Utilities: '#FBBF24',      // Amber
  Other: '#9CA3AF',          // Slate
};

/**
 * Precision rounding to 2 decimal places preventing IEEE 754 floating point drift.
 */
export function roundToCents(val: number): number {
  if (!Number.isFinite(val)) return 0;
  return Math.round((val + Number.EPSILON) * 100) / 100;
}

/**
 * Normalizes subscription cost to exact monthly burn rate.
 */
export function normalizeToMonthly(cost: number, cycle: BillingCycle): number {
  if (!Number.isFinite(cost) || cost <= 0) return 0;
  switch (cycle) {
    case 'monthly':
      return roundToCents(cost);
    case 'yearly':
      return roundToCents(cost / 12);
    case 'quarterly':
      return roundToCents(cost / 3);
    case 'weekly':
      return roundToCents((cost * 52) / 12);
    default:
      return roundToCents(cost);
  }
}

/**
 * Normalizes subscription cost to projected annual run rate.
 */
export function normalizeToAnnual(cost: number, cycle: BillingCycle): number {
  if (!Number.isFinite(cost) || cost <= 0) return 0;
  switch (cycle) {
    case 'monthly':
      return roundToCents(cost * 12);
    case 'yearly':
      return roundToCents(cost);
    case 'quarterly':
      return roundToCents(cost * 4);
    case 'weekly':
      return roundToCents(cost * 52);
    default:
      return roundToCents(cost * 12);
  }
}

/**
 * Formats a currency amount with comma separators and 2 decimal places.
 */
export function formatCurrency(amount: number, symbol: string = '$'): string {
  const rounded = roundToCents(amount);
  const parts = rounded.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return `${symbol}${parts}`;
}

/**
 * Helper to convert a Date or ISO string into YYYY-MM-DD
 */
export function toIsoDateString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Parses a YYYY-MM-DD string into a local Date at 00:00:00
 */
export function parseIsoDateLocal(isoDate: string): Date {
  const [yearStr, monthStr, dayStr] = isoDate.split('-');
  const year = parseInt(yearStr, 10);
  const month = parseInt(monthStr, 10) - 1;
  const day = parseInt(dayStr, 10);
  return new Date(year, month, day, 0, 0, 0, 0);
}

/**
 * Automatically advances past billing dates to the next valid future billing cycle occurrence.
 * Preserves anchor day of month where applicable (e.g. 31st clamping to 28th/30th).
 */
export function autoAdvanceBillingDate(
  dateStr: string,
  cycle: BillingCycle,
  referenceDate: Date = new Date()
): string {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    return dateStr;
  }

  const today = new Date(
    referenceDate.getFullYear(),
    referenceDate.getMonth(),
    referenceDate.getDate(),
    0, 0, 0, 0
  );

  let current = parseIsoDateLocal(dateStr);
  if (isNaN(current.getTime())) return dateStr;

  // If already today or in the future, keep it
  if (current.getTime() >= today.getTime()) {
    return dateStr;
  }

  const originalDay = current.getDate();

  // Advance iteratively until future or today
  let iterations = 0;
  const maxIterations = 1000; // Protection against infinite loop

  while (current.getTime() < today.getTime() && iterations < maxIterations) {
    iterations++;
    switch (cycle) {
      case 'weekly':
        current.setDate(current.getDate() + 7);
        break;
      case 'monthly': {
        const nextMonth = current.getMonth() + 1;
        const targetYear = current.getFullYear() + Math.floor(nextMonth / 12);
        const normalizedMonth = nextMonth % 12;
        // Determine days in target month
        const daysInTargetMonth = new Date(targetYear, normalizedMonth + 1, 0).getDate();
        const clampedDay = Math.min(originalDay, daysInTargetMonth);
        current = new Date(targetYear, normalizedMonth, clampedDay, 0, 0, 0, 0);
        break;
      }
      case 'quarterly': {
        const nextMonth = current.getMonth() + 3;
        const targetYear = current.getFullYear() + Math.floor(nextMonth / 12);
        const normalizedMonth = nextMonth % 12;
        const daysInTargetMonth = new Date(targetYear, normalizedMonth + 1, 0).getDate();
        const clampedDay = Math.min(originalDay, daysInTargetMonth);
        current = new Date(targetYear, normalizedMonth, clampedDay, 0, 0, 0, 0);
        break;
      }
      case 'yearly': {
        const targetYear = current.getFullYear() + 1;
        const targetMonth = current.getMonth();
        const daysInTargetMonth = new Date(targetYear, targetMonth + 1, 0).getDate();
        const clampedDay = Math.min(originalDay, daysInTargetMonth);
        current = new Date(targetYear, targetMonth, clampedDay, 0, 0, 0, 0);
        break;
      }
    }
  }

  return toIsoDateString(current);
}

/**
 * Calculates remaining days from referenceDate to targetDateStr.
 */
export function calculateDaysRemaining(
  targetDateStr: string,
  referenceDate: Date = new Date()
): number {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(targetDateStr)) return 999;

  const today = new Date(
    referenceDate.getFullYear(),
    referenceDate.getMonth(),
    referenceDate.getDate(),
    0, 0, 0, 0
  );
  const target = parseIsoDateLocal(targetDateStr);
  if (isNaN(target.getTime())) return 999;

  const diffMs = target.getTime() - today.getTime();
  return Math.round(diffMs / (1000 * 60 * 60 * 24));
}

/**
 * Checks whether the renewal is due within the next 7 days (inclusive of today).
 */
export function isDueWithin7Days(dateStr: string, referenceDate: Date = new Date()): boolean {
  const days = calculateDaysRemaining(dateStr, referenceDate);
  return days >= 0 && days <= 7;
}

/**
 * Computes high-precision financial summary and category distribution.
 */
export function calculateFinancialSummary(
  subscriptions: Subscription[],
  referenceDate: Date = new Date()
): FinancialSummary {
  let monthlyBurnRate = 0;
  let annualRunRate = 0;
  let activeCount = 0;
  let pausedCount = 0;
  let trialCount = 0;
  let dueNext7DaysCount = 0;
  let dueNext7DaysTotal = 0;

  const categoryTotals: Record<SubscriptionCategory, { monthly: number; count: number }> = {
    Infrastructure: { monthly: 0, count: 0 },
    Software: { monthly: 0, count: 0 },
    Media: { monthly: 0, count: 0 },
    Fitness: { monthly: 0, count: 0 },
    Utilities: { monthly: 0, count: 0 },
    Other: { monthly: 0, count: 0 },
  };

  for (const sub of subscriptions) {
    const isPaused = sub.status === 'paused';
    const isTrial = sub.status === 'trial';
    const isActive = sub.status === 'active';

    if (isPaused) {
      pausedCount++;
      continue; // Paused subscriptions do not count toward active burn rate
    }

    if (isTrial) {
      trialCount++;
      // Active trial: check if trial ending within 7 days
      if (sub.trialEndDate && isDueWithin7Days(sub.trialEndDate, referenceDate)) {
        dueNext7DaysCount++;
      }
    }

    if (isActive) {
      activeCount++;
      const monthly = normalizeToMonthly(sub.cost, sub.billingCycle);
      const annual = normalizeToAnnual(sub.cost, sub.billingCycle);

      monthlyBurnRate += monthly;
      annualRunRate += annual;

      const cat = categoryTotals[sub.category] || categoryTotals.Other;
      cat.monthly += monthly;
      cat.count += 1;

      if (isDueWithin7Days(sub.nextBillingDate, referenceDate)) {
        dueNext7DaysCount++;
        dueNext7DaysTotal += sub.cost;
      }
    }
  }

  monthlyBurnRate = roundToCents(monthlyBurnRate);
  annualRunRate = roundToCents(annualRunRate);
  dueNext7DaysTotal = roundToCents(dueNext7DaysTotal);

  const categories: SubscriptionCategory[] = [
    'Infrastructure',
    'Software',
    'Media',
    'Fitness',
    'Utilities',
    'Other',
  ];

  const categoryBreakdown = categories
    .map((category) => {
      const data = categoryTotals[category];
      const roundedTotal = roundToCents(data.monthly);
      const percentage =
        monthlyBurnRate > 0 ? roundToCents((roundedTotal / monthlyBurnRate) * 100) : 0;
      return {
        category,
        totalMonthly: roundedTotal,
        count: data.count,
        percentage,
        color: CATEGORY_COLORS[category],
      };
    })
    .filter((c) => c.count > 0 || c.totalMonthly > 0)
    .sort((a, b) => b.totalMonthly - a.totalMonthly);

  return {
    monthlyBurnRate,
    annualRunRate,
    activeCount,
    pausedCount,
    trialCount,
    dueNext7DaysCount,
    dueNext7DaysTotal,
    categoryBreakdown,
  };
}

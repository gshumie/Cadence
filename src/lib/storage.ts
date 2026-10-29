import type { Subscription } from '../types/subscription';
import { autoAdvanceBillingDate } from './calculations';
import { stripPrototypePollution, validateSubscriptionPayload } from './security';
import { createInitialSeedData } from './seedData';

const STORAGE_KEY = 'cadence_subscriptions_v1';

/**
 * Loads subscriptions from localStorage with strict runtime validation and automatic cycle advances.
 */
export function loadSubscriptions(): Subscription[] {
  if (typeof window === 'undefined') {
    return createInitialSeedData();
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const initial = createInitialSeedData();
      saveSubscriptions(initial);
      return initial;
    }

    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      console.warn('Malformed storage payload: resetting to seed data');
      const fallback = createInitialSeedData();
      saveSubscriptions(fallback);
      return fallback;
    }

    const validatedList: Subscription[] = [];
    const today = new Date();

    for (const item of parsed) {
      const clean = stripPrototypePollution(item);
      const res = validateSubscriptionPayload(clean);
      if (res.valid && res.subscription) {
        // Auto-advance past billing dates to next future occurrence
        const sub = res.subscription;
        if (sub.status === 'active' || sub.status === 'trial') {
          const advancedDate = autoAdvanceBillingDate(sub.nextBillingDate, sub.billingCycle, today);
          if (advancedDate !== sub.nextBillingDate) {
            sub.nextBillingDate = advancedDate;
            sub.updatedAt = new Date().toISOString();
          }
        }
        validatedList.push(sub);
      }
    }

    if (validatedList.length === 0) {
      const fallback = createInitialSeedData();
      saveSubscriptions(fallback);
      return fallback;
    }

    return validatedList;
  } catch (err) {
    console.error('Failed to load subscriptions from localStorage', err);
    return createInitialSeedData();
  }
}

/**
 * Safely persists subscriptions into localStorage.
 */
export function saveSubscriptions(subscriptions: Subscription[]): boolean {
  if (typeof window === 'undefined') return false;

  try {
    const safeData = stripPrototypePollution(subscriptions);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(safeData));
    return true;
  } catch (err) {
    console.error('Failed to save subscriptions to localStorage', err);
    return false;
  }
}

/**
 * Resets ledger state to default demo dataset.
 */
export function resetSubscriptionsToDemo(): Subscription[] {
  const seed = createInitialSeedData();
  saveSubscriptions(seed);
  return seed;
}

/**
 * Clears all subscriptions from ledger.
 */
export function clearAllSubscriptions(): Subscription[] {
  saveSubscriptions([]);
  return [];
}

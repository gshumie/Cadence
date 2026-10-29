import React from 'react';
import type { Subscription } from '../types/subscription';
import { calculateDaysRemaining, formatCurrency } from '../lib/calculations';
import { AlertTriangle, Clock, ChevronRight } from 'lucide-react';

interface RenewalAlertStripProps {
  subscriptions: Subscription[];
  onFilterDueSoon: () => void;
  onSelectSubscription: (sub: Subscription) => void;
  isFilteredToDueSoon: boolean;
}

export const RenewalAlertStrip: React.FC<RenewalAlertStripProps> = ({
  subscriptions,
  onFilterDueSoon,
  onSelectSubscription,
  isFilteredToDueSoon,
}) => {
  const today = new Date();

  // Find all active subscriptions renewing within 7 days
  const dueSoonSubs = subscriptions.filter((sub) => {
    if (sub.status === 'paused') return false;
    const days = calculateDaysRemaining(sub.nextBillingDate, today);
    return days >= 0 && days <= 7;
  });

  // Find any trials ending within 7 days
  const trialEndingSubs = subscriptions.filter((sub) => {
    if (sub.status !== 'trial' || !sub.trialEndDate) return false;
    const days = calculateDaysRemaining(sub.trialEndDate, today);
    return days >= 0 && days <= 7;
  });

  if (dueSoonSubs.length === 0 && trialEndingSubs.length === 0) {
    return null;
  }

  return (
    <div className="w-full bg-[#14171C] hairline-border-b px-4 sm:px-6 py-2.5">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Left: Alerts Summary */}
        <div className="flex items-start sm:items-center gap-3">
          <div className="p-1.5 bg-[#F59E0B]/10 border border-[#F59E0B]/20 rounded shrink-0 mt-0.5 sm:mt-0">
            <AlertTriangle className="w-4 h-4 text-[#F59E0B]" />
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="font-semibold text-[#F3F4F6]">
              Upcoming Renewals Alert:
            </span>
            <span className="text-[#8E95A2]">
              {dueSoonSubs.length} subscription{dueSoonSubs.length === 1 ? '' : 's'} renewing in the next 7 days.
            </span>

            {/* Trial ending badge if any */}
            {trialEndingSubs.length > 0 && (
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[11px] font-mono bg-[#EF4444]/15 text-[#EF4444] border border-[#EF4444]/30">
                <Clock className="w-3 h-3" />
                {trialEndingSubs.length} trial{trialEndingSubs.length === 1 ? '' : 's'} ending
              </span>
            )}
          </div>
        </div>

        {/* Right: Pill list of upcoming items with countdown days & Filter Toggle */}
        <div className="flex flex-wrap items-center gap-2">
          {dueSoonSubs.slice(0, 3).map((sub) => {
            const days = calculateDaysRemaining(sub.nextBillingDate, today);
            const countdownText =
              days === 0 ? 'Due today' : days === 1 ? 'Due tomorrow' : `Due in ${days}d`;

            return (
              <button
                key={sub.id}
                type="button"
                onClick={() => onSelectSubscription(sub)}
                className="inline-flex items-center gap-1.5 px-2 py-1 text-xs rounded bg-[#1B1F26] hover:bg-[#22262F] border border-[#22262F] text-[#F3F4F6] transition-colors"
                title={`Click to inspect ${sub.name}`}
              >
                <span className="font-medium">{sub.name}</span>
                <span className="font-mono text-[#8E95A2]">{formatCurrency(sub.cost, sub.currency)}</span>
                <span className="font-mono text-[10px] px-1 py-0.2 rounded bg-[#F59E0B]/15 text-[#F59E0B] font-semibold">
                  {countdownText}
                </span>
              </button>
            );
          })}

          {dueSoonSubs.length > 3 && (
            <span className="text-xs font-mono text-[#8E95A2]">
              +{dueSoonSubs.length - 3} more
            </span>
          )}

          {/* Toggle filter */}
          <button
            type="button"
            onClick={onFilterDueSoon}
            className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded transition-colors ${
              isFilteredToDueSoon
                ? 'bg-[#F59E0B] text-[#0D0F12] font-semibold'
                : 'text-[#F59E0B] hover:bg-[#F59E0B]/10 border border-[#F59E0B]/30'
            }`}
          >
            <span>{isFilteredToDueSoon ? 'Show All' : 'Filter ≤ 7d'}</span>
            <ChevronRight className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );
};

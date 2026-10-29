import React from 'react';
import type { Subscription } from '../types/subscription';
import {
  CATEGORY_COLORS,
  formatCurrency,
  toIsoDateString,
} from '../lib/calculations';
import { Calendar } from 'lucide-react';

interface CashflowTimelineProps {
  subscriptions: Subscription[];
  currencySymbol?: string;
  onSelectSubscription: (sub: Subscription) => void;
}

export const CashflowTimeline: React.FC<CashflowTimelineProps> = ({
  subscriptions,
  currencySymbol = '$',
  onSelectSubscription,
}) => {
  const today = new Date();

  // Create 30 days bucket
  const daysList: {
    date: Date;
    dateStr: string;
    dayNum: number;
    monthName: string;
    dayName: string;
    daysDiff: number;
    subs: Subscription[];
    totalCost: number;
  }[] = [];

  for (let i = 0; i < 30; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    const dateStr = toIsoDateString(d);

    const matchingSubs = subscriptions.filter(
      (s) => s.status !== 'paused' && s.nextBillingDate === dateStr
    );
    const totalCost = matchingSubs.reduce((acc, curr) => acc + curr.cost, 0);

    daysList.push({
      date: d,
      dateStr,
      dayNum: d.getDate(),
      monthName: d.toLocaleString('en-US', { month: 'short' }),
      dayName: d.toLocaleString('en-US', { weekday: 'short' }),
      daysDiff: i,
      subs: matchingSubs,
      totalCost,
    });
  }

  const activeDays = daysList.filter((d) => d.subs.length > 0);
  const totalUpcoming30Days = activeDays.reduce((acc, d) => acc + d.totalCost, 0);

  return (
    <div className="w-full p-4 sm:p-6 bg-[#0D0F12]">
      {/* Timeline Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-[#22262F]">
        <div>
          <h2 className="text-sm font-semibold text-[#F3F4F6] flex items-center gap-2">
            <Calendar className="w-4 h-4 text-[#10B981]" />
            30-Day Upcoming Renewal Schedule &amp; Cashflow
          </h2>
          <p className="text-xs text-[#8E95A2] mt-0.5">
            Chronological distribution of projected subscription charges.
          </p>
        </div>
        <div className="flex items-center gap-2 bg-[#14171C] border border-[#22262F] px-3 py-1.5 rounded">
          <span className="text-[11px] font-mono text-[#8E95A2] uppercase">
            30-DAY OUTFLOW:
          </span>
          <span className="font-mono-nums font-bold text-sm text-[#F3F4F6]">
            {formatCurrency(totalUpcoming30Days, currencySymbol)}
          </span>
        </div>
      </div>

      {/* Timeline Grid */}
      <div className="space-y-3">
        {activeDays.length > 0 ? (
          activeDays.map((day) => {
            const isToday = day.daysDiff === 0;
            const isTomorrow = day.daysDiff === 1;
            const isWithin7Days = day.daysDiff <= 7;

            return (
              <div
                key={day.dateStr}
                className={`p-3 rounded-lg hairline-border transition-colors ${
                  isToday
                    ? 'bg-[#EF4444]/10 border-[#EF4444]/30'
                    : isWithin7Days
                    ? 'bg-[#F59E0B]/10 border-[#F59E0B]/30'
                    : 'bg-[#14171C] border-[#22262F]'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2 pb-2 border-b border-[#22262F]/50">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-xs font-mono font-bold px-2 py-0.5 rounded ${
                        isToday
                          ? 'bg-[#EF4444] text-white'
                          : isWithin7Days
                          ? 'bg-[#F59E0B] text-[#0D0F12]'
                          : 'bg-[#1B1F26] text-[#F3F4F6]'
                      }`}
                    >
                      {day.monthName} {day.dayNum} ({day.dayName})
                    </span>
                    <span className="text-xs text-[#8E95A2] font-mono">
                      {isToday
                        ? 'Due Today!'
                        : isTomorrow
                        ? 'Due Tomorrow'
                        : `In ${day.daysDiff} days`}
                    </span>
                  </div>

                  <div className="text-right">
                    <span className="text-xs font-mono-nums font-semibold text-[#F3F4F6]">
                      {formatCurrency(day.totalCost, currencySymbol)}
                    </span>
                    <span className="text-[10px] text-[#8E95A2] ml-1 font-mono">
                      ({day.subs.length} renewal{day.subs.length === 1 ? '' : 's'})
                    </span>
                  </div>
                </div>

                {/* Subscriptions due on this day */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                  {day.subs.map((sub) => {
                    const catColor = CATEGORY_COLORS[sub.category] || CATEGORY_COLORS.Other;
                    return (
                      <div
                        key={sub.id}
                        onClick={() => onSelectSubscription(sub)}
                        className="flex items-center justify-between p-2 rounded bg-[#0D0F12] border border-[#22262F] hover:border-[#10B981] cursor-pointer transition-colors"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <span
                            className="w-2 h-2 rounded-full shrink-0"
                            style={{ backgroundColor: catColor }}
                          />
                          <div className="truncate">
                            <span className="text-xs font-medium text-[#F3F4F6] truncate block">
                              {sub.name}
                            </span>
                            <span className="text-[10px] text-[#8E95A2] font-mono block">
                              {sub.category} • {sub.billingCycle}
                            </span>
                          </div>
                        </div>

                        <div className="text-right shrink-0 pl-2">
                          <span className="font-mono-nums text-xs font-semibold text-[#10B981]">
                            {formatCurrency(sub.cost, sub.currency)}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })
        ) : (
          <div className="py-12 text-center text-xs text-[#8E95A2]">
            No renewals scheduled within the next 30 days.
          </div>
        )}
      </div>
    </div>
  );
};

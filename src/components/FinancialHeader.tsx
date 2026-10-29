import React from 'react';
import type { FinancialSummary } from '../types/subscription';
import { formatCurrency } from '../lib/calculations';
import { ShieldCheck } from 'lucide-react';

interface FinancialHeaderProps {
  summary: FinancialSummary;
  currencySymbol?: string;
  onFilterDueSoon?: () => void;
}

export const FinancialHeader: React.FC<FinancialHeaderProps> = ({
  summary,
  currencySymbol = '$',
  onFilterDueSoon,
}) => {
  return (
    <section className="w-full bg-[#0D0F12] hairline-border-b px-4 sm:px-6 py-5">
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-5">
        {/* Dominant Primary Metric: Tabular Monospace Monthly Burn Rate */}
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono tracking-wider uppercase text-[#8E95A2]">
              MONTHLY NORMALIZED BURN RATE
            </span>
            <span className="inline-flex items-center gap-1 text-[10px] font-mono px-1.5 py-0.2 bg-[#10B981]/10 text-[#10B981] border border-[#10B981]/20 rounded">
              <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse" />
              LIVE
            </span>
          </div>

          <div className="flex items-baseline gap-2">
            <div
              className="font-mono-nums font-bold text-[#F3F4F6] tracking-tight"
              style={{ fontSize: 'clamp(1.75rem, 3vw, 2.5rem)', lineHeight: 1.1 }}
            >
              {formatCurrency(summary.monthlyBurnRate, currencySymbol)}
            </div>
            <span className="text-sm font-mono text-[#8E95A2]">/ month</span>
          </div>
        </div>

        {/* Quiet Subordinate Inline Metadata */}
        <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-4 sm:gap-6 text-xs border-t lg:border-t-0 border-[#22262F] pt-3 lg:pt-0">
          {/* Annual Run Rate */}
          <div className="flex flex-col">
            <span className="text-[10px] font-mono tracking-wider uppercase text-[#8E95A2]">
              PROJECTED ANNUAL RUN RATE
            </span>
            <span className="font-mono-nums font-semibold text-[#F3F4F6] text-sm mt-0.5">
              {formatCurrency(summary.annualRunRate, currencySymbol)}{' '}
              <span className="text-xs font-normal text-[#8E95A2]">/ yr</span>
            </span>
          </div>

          <div className="hidden sm:block h-7 w-[1px] bg-[#22262F]" />

          {/* Active Subscriptions Count */}
          <div className="flex flex-col">
            <span className="text-[10px] font-mono tracking-wider uppercase text-[#8E95A2]">
              ACTIVE LEDGER ITEMS
            </span>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="font-mono-nums font-semibold text-[#F3F4F6] text-sm">
                {summary.activeCount}
              </span>
              <span className="text-[11px] text-[#8E95A2]">
                ({summary.pausedCount} paused, {summary.trialCount} trial)
              </span>
            </div>
          </div>

          <div className="hidden sm:block h-7 w-[1px] bg-[#22262F]" />

          {/* 7-Day Upcoming Total */}
          <div
            onClick={onFilterDueSoon}
            className={`flex flex-col ${
              summary.dueNext7DaysCount > 0 ? 'cursor-pointer group' : ''
            }`}
            title={
              summary.dueNext7DaysCount > 0
                ? 'Click to filter ledger to subscriptions due within 7 days'
                : 'No renewals due in next 7 days'
            }
          >
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-mono tracking-wider uppercase text-[#8E95A2]">
                DUE IN 7 DAYS
              </span>
              {summary.dueNext7DaysCount > 0 && (
                <span className="w-1.5 h-1.5 rounded-full bg-[#F59E0B]" />
              )}
            </div>
            <div className="flex items-center gap-2 mt-0.5">
              <span
                className={`font-mono-nums font-semibold text-sm ${
                  summary.dueNext7DaysCount > 0
                    ? 'text-[#F59E0B] group-hover:underline'
                    : 'text-[#F3F4F6]'
                }`}
              >
                {formatCurrency(summary.dueNext7DaysTotal, currencySymbol)}
              </span>
              <span
                className={`text-[11px] px-1.5 py-0.5 rounded font-mono ${
                  summary.dueNext7DaysCount > 0
                    ? 'bg-[#F59E0B]/10 text-[#F59E0B] border border-[#F59E0B]/20'
                    : 'text-[#8E95A2]'
                }`}
              >
                {summary.dueNext7DaysCount} DUE
              </span>
            </div>
          </div>

          <div className="hidden sm:block h-7 w-[1px] bg-[#22262F]" />

          {/* Security & Verification Status */}
          <div className="flex flex-col">
            <span className="text-[10px] font-mono tracking-wider uppercase text-[#8E95A2]">
              INTEGRITY
            </span>
            <div className="flex items-center gap-1.5 text-xs text-[#10B981] mt-0.5">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span className="font-mono text-[11px]">HARDENED</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

import React, { useState } from 'react';
import type { FinancialSummary, SubscriptionCategory } from '../types/subscription';
import { formatCurrency } from '../lib/calculations';

interface CategoryBreakdownBarProps {
  summary: FinancialSummary;
  currencySymbol?: string;
  selectedCategory?: string;
  onSelectCategory?: (category: SubscriptionCategory | 'all') => void;
}

export const CategoryBreakdownBar: React.FC<CategoryBreakdownBarProps> = ({
  summary,
  currencySymbol = '$',
  selectedCategory = 'all',
  onSelectCategory,
}) => {
  const [hoveredCategory, setHoveredCategory] = useState<SubscriptionCategory | null>(null);

  const breakdown = summary.categoryBreakdown;

  if (breakdown.length === 0 || summary.monthlyBurnRate === 0) {
    return (
      <div className="w-full bg-[#0D0F12] hairline-border-b px-4 sm:px-6 py-2 text-xs text-[#8E95A2]">
        No active category spending recorded.
      </div>
    );
  }

  return (
    <div className="w-full bg-[#0D0F12] hairline-border-b px-4 sm:px-6 py-3">
      {/* Top Label & Interactive Hover Indicator */}
      <div className="flex items-center justify-between text-xs mb-2">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono uppercase tracking-wider text-[#8E95A2]">
            CATEGORY SPENDING BREAKDOWN
          </span>
          {hoveredCategory && (
            <span className="text-[11px] font-mono text-[#F3F4F6] transition-opacity">
              {hoveredCategory}:{' '}
              {formatCurrency(
                breakdown.find((b) => b.category === hoveredCategory)?.totalMonthly || 0,
                currencySymbol
              )}{' '}
              (
              {breakdown.find((b) => b.category === hoveredCategory)?.percentage.toFixed(1)}
              %)
            </span>
          )}
        </div>
        <span className="text-[10px] font-mono text-[#8E95A2]">
          TOTAL: {formatCurrency(summary.monthlyBurnRate, currencySymbol)} / MO
        </span>
      </div>

      {/* Flush 8px Horizontal Stacked Proportion Bar */}
      <div
        className="w-full h-2 rounded-full overflow-hidden flex bg-[#14171C] border border-[#22262F]"
        role="progressbar"
        aria-label="Category Spending Breakdown"
      >
        {breakdown.map((item) => {
          const isSelected = selectedCategory === item.category;
          const isHovered = hoveredCategory === item.category;
          const opacity = selectedCategory !== 'all' && !isSelected ? 'opacity-35' : 'opacity-100';

          return (
            <div
              key={item.category}
              style={{
                width: `${Math.max(item.percentage, 0.5)}%`,
                backgroundColor: item.color,
              }}
              onMouseEnter={() => setHoveredCategory(item.category)}
              onMouseLeave={() => setHoveredCategory(null)}
              onClick={() =>
                onSelectCategory?.(selectedCategory === item.category ? 'all' : item.category)
              }
              title={`${item.category}: ${formatCurrency(item.totalMonthly, currencySymbol)} (${item.percentage.toFixed(1)}%)`}
              className={`h-full cursor-pointer transition-all ${opacity} ${
                isHovered ? 'brightness-125' : ''
              }`}
            />
          );
        })}
      </div>

      {/* Flush Category Legend with dot indicators, totals, and percentages */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 mt-2.5 pt-1 text-xs">
        {breakdown.map((item) => {
          const isSelected = selectedCategory === item.category;
          return (
            <button
              type="button"
              key={item.category}
              onClick={() =>
                onSelectCategory?.(selectedCategory === item.category ? 'all' : item.category)
              }
              className={`inline-flex items-center gap-1.5 py-0.5 px-1.5 rounded transition-colors text-left ${
                isSelected
                  ? 'bg-[#14171C] border border-[#22262F]'
                  : 'hover:bg-[#14171C]/50'
              }`}
            >
              <span
                className="w-2 h-2 rounded-full shrink-0"
                style={{ backgroundColor: item.color }}
              />
              <span
                className={`text-[11px] ${
                  isSelected ? 'text-[#F3F4F6] font-medium' : 'text-[#8E95A2]'
                }`}
              >
                {item.category}
              </span>
              <span className="font-mono-nums text-[11px] text-[#F3F4F6]">
                {formatCurrency(item.totalMonthly, currencySymbol)}
              </span>
              <span className="font-mono text-[10px] text-[#8E95A2]">
                {item.percentage.toFixed(0)}%
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

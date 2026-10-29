import React from 'react';
import type { Subscription } from '../types/subscription';
import {
  calculateDaysRemaining,
  CATEGORY_COLORS,
  formatCurrency,
  normalizeToMonthly,
} from '../lib/calculations';
import {
  Calendar,
  CreditCard,
  Edit2,
  ExternalLink,
  Pause,
  Play,
  Trash2,
  Copy,
} from 'lucide-react';

interface SubscriptionRowProps {
  subscription: Subscription;
  isSelected: boolean;
  onToggleSelect: (id: string) => void;
  onEdit: (sub: Subscription) => void;
  onToggleStatus: (sub: Subscription) => void;
  onDelete: (id: string) => void;
  onDuplicate: (sub: Subscription) => void;
}

export const SubscriptionRow: React.FC<SubscriptionRowProps> = ({
  subscription: sub,
  isSelected,
  onToggleSelect,
  onEdit,
  onToggleStatus,
  onDelete,
  onDuplicate,
}) => {
  const today = new Date();
  const daysUntil = calculateDaysRemaining(sub.nextBillingDate, today);
  const monthlyCost = normalizeToMonthly(sub.cost, sub.billingCycle);

  // Status color logic
  const isPaused = sub.status === 'paused';

  // Countdown badge format
  let countdownText = '';
  let countdownClass = 'text-[#8E95A2] bg-[#14171C]';

  if (isPaused) {
    countdownText = 'Paused';
    countdownClass = 'text-[#8E95A2] bg-[#1B1F26]';
  } else if (daysUntil === 0) {
    countdownText = 'Due Today';
    countdownClass = 'text-[#EF4444] bg-[#EF4444]/15 border border-[#EF4444]/30 font-semibold';
  } else if (daysUntil === 1) {
    countdownText = 'Due Tomorrow';
    countdownClass = 'text-[#F59E0B] bg-[#F59E0B]/15 border border-[#F59E0B]/30 font-semibold';
  } else if (daysUntil > 1 && daysUntil <= 7) {
    countdownText = `In ${daysUntil} days`;
    countdownClass = 'text-[#F59E0B] bg-[#F59E0B]/15 border border-[#F59E0B]/20 font-semibold';
  } else if (daysUntil > 7) {
    countdownText = `In ${daysUntil} days`;
    countdownClass = 'text-[#8E95A2] bg-[#14171C]';
  } else {
    countdownText = 'Overdue';
    countdownClass = 'text-[#EF4444] bg-[#EF4444]/15 border border-[#EF4444]/30';
  }

  const categoryColor = CATEGORY_COLORS[sub.category] || CATEGORY_COLORS.Other;

  return (
    <tr
      className={`group hairline-border-b transition-colors ${
        isSelected
          ? 'bg-[#1B1F26]'
          : isPaused
          ? 'bg-[#0D0F12]/60 hover:bg-[#14171C]/50 opacity-70'
          : 'bg-[#0D0F12] hover:bg-[#14171C]'
      }`}
    >
      {/* Selection Checkbox */}
      <td className="w-10 px-3 py-3 text-center">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={() => onToggleSelect(sub.id)}
          className="rounded border-[#22262F] bg-[#14171C] text-[#10B981] focus:ring-0 focus:ring-offset-0 cursor-pointer"
        />
      </td>

      {/* Service Name & Subtitle Details */}
      <td className="px-3 py-3">
        <div className="flex items-center gap-2.5">
          {/* Category Dot Indicator */}
          <span
            className="w-2 h-2 rounded-full shrink-0"
            style={{ backgroundColor: categoryColor }}
            title={`Category: ${sub.category}`}
          />
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span
                onClick={() => onEdit(sub)}
                className="font-medium text-xs text-[#F3F4F6] hover:text-[#10B981] cursor-pointer truncate transition-colors"
              >
                {sub.name}
              </span>
              {sub.cancellationUrl && (
                <a
                  href={sub.cancellationUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  title="Open cancellation/settings portal"
                  className="text-[#8E95A2] hover:text-[#F3F4F6] transition-colors"
                >
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>

            <div className="flex items-center gap-2 text-[11px] text-[#8E95A2] truncate mt-0.5">
              {sub.paymentMethod && (
                <span className="flex items-center gap-1">
                  <CreditCard className="w-3 h-3" />
                  {sub.paymentMethod}
                </span>
              )}
              {sub.notes && (
                <span className="truncate max-w-[200px]" title={sub.notes}>
                  • {sub.notes}
                </span>
              )}
            </div>
          </div>
        </div>
      </td>

      {/* Category */}
      <td className="px-3 py-3 hidden md:table-cell">
        <span
          className="inline-flex items-center px-2 py-0.5 text-[11px] font-mono rounded"
          style={{
            backgroundColor: `${categoryColor}15`,
            color: categoryColor,
            border: `1px solid ${categoryColor}30`,
          }}
        >
          {sub.category}
        </span>
      </td>

      {/* Billing Cycle */}
      <td className="px-3 py-3 hidden sm:table-cell">
        <span className="text-xs text-[#8E95A2] capitalize font-mono">
          {sub.billingCycle}
        </span>
      </td>

      {/* Normalized Monthly Burn Rate */}
      <td className="px-3 py-3 text-right">
        <div className="flex flex-col items-end">
          <span className="font-mono-nums font-semibold text-xs text-[#F3F4F6]">
            {formatCurrency(monthlyCost, sub.currency)}
          </span>
          <span className="text-[10px] text-[#8E95A2] font-mono">/ mo</span>
        </div>
      </td>

      {/* Raw Amount & Frequency */}
      <td className="px-3 py-3 text-right hidden lg:table-cell">
        <div className="flex flex-col items-end text-xs text-[#8E95A2]">
          <span className="font-mono-nums font-normal">
            {formatCurrency(sub.cost, sub.currency)}
          </span>
          <span className="text-[10px] font-mono">
            {sub.billingCycle === 'yearly'
              ? '/ yr'
              : sub.billingCycle === 'quarterly'
              ? '/ qtr'
              : sub.billingCycle === 'weekly'
              ? '/ wk'
              : '/ mo'}
          </span>
        </div>
      </td>

      {/* Next Renewal Date & Countdown */}
      <td className="px-3 py-3">
        <div className="flex flex-col items-start gap-1">
          <div className="flex items-center gap-1.5 text-xs text-[#F3F4F6] font-mono">
            <Calendar className="w-3 h-3 text-[#8E95A2]" />
            <span>{sub.nextBillingDate}</span>
          </div>
          <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded ${countdownClass}`}>
            {countdownText}
          </span>
        </div>
      </td>

      {/* Status Badge */}
      <td className="px-3 py-3 hidden sm:table-cell text-center">
        {sub.status === 'active' && (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-mono bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/25">
            Active
          </span>
        )}
        {sub.status === 'paused' && (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-mono bg-[#8E95A2]/15 text-[#8E95A2] border border-[#8E95A2]/25">
            Paused
          </span>
        )}
        {sub.status === 'trial' && (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-mono bg-[#F472B6]/15 text-[#F472B6] border border-[#F472B6]/25">
            Trial
          </span>
        )}
      </td>

      {/* Quick Actions */}
      <td className="px-3 py-3 text-right">
        <div className="flex items-center justify-end gap-1 opacity-90 group-hover:opacity-100 transition-opacity">
          {/* Pause / Resume */}
          <button
            type="button"
            onClick={() => onToggleStatus(sub)}
            title={sub.status === 'paused' ? 'Resume subscription' : 'Pause subscription'}
            className="p-1 rounded text-[#8E95A2] hover:text-[#F3F4F6] hover:bg-[#1B1F26] transition-colors"
          >
            {sub.status === 'paused' ? (
              <Play className="w-3.5 h-3.5 text-[#10B981]" />
            ) : (
              <Pause className="w-3.5 h-3.5" />
            )}
          </button>

          {/* Edit */}
          <button
            type="button"
            onClick={() => onEdit(sub)}
            title="Edit subscription details"
            className="p-1 rounded text-[#8E95A2] hover:text-[#F3F4F6] hover:bg-[#1B1F26] transition-colors"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>

          {/* Duplicate */}
          <button
            type="button"
            onClick={() => onDuplicate(sub)}
            title="Duplicate subscription"
            className="p-1 rounded text-[#8E95A2] hover:text-[#F3F4F6] hover:bg-[#1B1F26] transition-colors"
          >
            <Copy className="w-3.5 h-3.5" />
          </button>

          {/* Delete */}
          <button
            type="button"
            onClick={() => onDelete(sub.id)}
            title="Delete subscription"
            className="p-1 rounded text-[#8E95A2] hover:text-[#EF4444] hover:bg-[#1B1F26] transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </td>
    </tr>
  );
};

import React from 'react';
import type { FilterState, SortField, Subscription } from '../types/subscription';
import { SubscriptionRow } from './SubscriptionRow';
import { ArrowDown, ArrowUp, ArrowUpDown, Plus } from 'lucide-react';

interface SubscriptionTableProps {
  subscriptions: Subscription[];
  selectedIds: Set<string>;
  onToggleSelect: (id: string) => void;
  onToggleSelectAll: () => void;
  onEdit: (sub: Subscription) => void;
  onToggleStatus: (sub: Subscription) => void;
  onDelete: (id: string) => void;
  onDuplicate: (sub: Subscription) => void;
  onAddNew: () => void;
  filters: FilterState;
  onSortChange: (field: SortField) => void;
}

export const SubscriptionTable: React.FC<SubscriptionTableProps> = ({
  subscriptions,
  selectedIds,
  onToggleSelect,
  onToggleSelectAll,
  onEdit,
  onToggleStatus,
  onDelete,
  onDuplicate,
  onAddNew,
  filters,
  onSortChange,
}) => {
  const allSelected =
    subscriptions.length > 0 && subscriptions.every((s) => selectedIds.has(s.id));
  const someSelected =
    subscriptions.some((s) => selectedIds.has(s.id)) && !allSelected;

  const renderSortIndicator = (field: SortField) => {
    if (filters.sortField !== field) {
      return <ArrowUpDown className="w-3 h-3 text-[#525866] opacity-0 group-hover:opacity-100" />;
    }
    return filters.sortDirection === 'asc' ? (
      <ArrowUp className="w-3 h-3 text-[#10B981]" />
    ) : (
      <ArrowDown className="w-3 h-3 text-[#10B981]" />
    );
  };

  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full text-left border-collapse text-xs">
        {/* Table Header */}
        <thead>
          <tr className="bg-[#14171C] hairline-border-b text-[#8E95A2] font-mono text-[11px] uppercase tracking-wider select-none">
            {/* Select All */}
            <th className="w-10 px-3 py-2.5 text-center">
              <input
                type="checkbox"
                checked={allSelected}
                ref={(el) => {
                  if (el) el.indeterminate = someSelected;
                }}
                onChange={onToggleSelectAll}
                className="rounded border-[#22262F] bg-[#0D0F12] text-[#10B981] focus:ring-0 cursor-pointer"
              />
            </th>

            {/* Service Name */}
            <th
              onClick={() => onSortChange('name')}
              className="px-3 py-2.5 cursor-pointer group hover:text-[#F3F4F6] transition-colors"
            >
              <div className="flex items-center gap-1.5">
                <span>Service Name</span>
                {renderSortIndicator('name')}
              </div>
            </th>

            {/* Category */}
            <th
              onClick={() => onSortChange('category')}
              className="px-3 py-2.5 cursor-pointer group hover:text-[#F3F4F6] transition-colors hidden md:table-cell"
            >
              <div className="flex items-center gap-1.5">
                <span>Category</span>
                {renderSortIndicator('category')}
              </div>
            </th>

            {/* Cycle */}
            <th className="px-3 py-2.5 hidden sm:table-cell">Cycle</th>

            {/* Normalized Monthly Burn */}
            <th
              onClick={() => onSortChange('monthlyCost')}
              className="px-3 py-2.5 text-right cursor-pointer group hover:text-[#F3F4F6] transition-colors"
            >
              <div className="flex items-center justify-end gap-1.5">
                <span>Monthly Burn</span>
                {renderSortIndicator('monthlyCost')}
              </div>
            </th>

            {/* Raw Billing Amount */}
            <th className="px-3 py-2.5 text-right hidden lg:table-cell">
              Stated Cost
            </th>

            {/* Next Renewal Date */}
            <th
              onClick={() => onSortChange('nextBillingDate')}
              className="px-3 py-2.5 cursor-pointer group hover:text-[#F3F4F6] transition-colors"
            >
              <div className="flex items-center gap-1.5">
                <span>Next Renewal</span>
                {renderSortIndicator('nextBillingDate')}
              </div>
            </th>

            {/* Status */}
            <th className="px-3 py-2.5 text-center hidden sm:table-cell">Status</th>

            {/* Actions */}
            <th className="px-3 py-2.5 text-right">Actions</th>
          </tr>
        </thead>

        {/* Table Body */}
        <tbody>
          {subscriptions.length > 0 ? (
            subscriptions.map((sub) => (
              <SubscriptionRow
                key={sub.id}
                subscription={sub}
                isSelected={selectedIds.has(sub.id)}
                onToggleSelect={onToggleSelect}
                onEdit={onEdit}
                onToggleStatus={onToggleStatus}
                onDelete={onDelete}
                onDuplicate={onDuplicate}
              />
            ))
          ) : (
            <tr>
              <td colSpan={9} className="py-12 text-center">
                <div className="flex flex-col items-center justify-center gap-2">
                  <span className="text-sm font-medium text-[#F3F4F6]">
                    No subscriptions match your filter criteria
                  </span>
                  <span className="text-xs text-[#8E95A2]">
                    Try clearing search parameters or record a new recurring expense.
                  </span>
                  <button
                    type="button"
                    onClick={onAddNew}
                    className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#0D0F12] bg-[#10B981] hover:bg-[#059669] rounded transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                    <span>Add New Subscription</span>
                  </button>
                </div>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

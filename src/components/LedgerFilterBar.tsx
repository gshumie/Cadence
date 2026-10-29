import React from 'react';
import type { FilterState, SortDirection, SortField } from '../types/subscription';
import { Search, ArrowUpDown, Calendar, Table, Trash2, PauseCircle } from 'lucide-react';

interface LedgerFilterBarProps {
  filters: FilterState;
  onFilterChange: (filters: Partial<FilterState>) => void;
  selectedCount: number;
  totalFilteredCount: number;
  totalLedgerCount: number;
  viewMode: 'table' | 'timeline';
  onViewModeChange: (mode: 'table' | 'timeline') => void;
  onBatchPause?: () => void;
  onBatchDelete?: () => void;
  onToggleSelectAll?: () => void;
  allSelected?: boolean;
}

const STATUS_OPTIONS = [
  { id: 'all', label: 'All Items' },
  { id: 'active', label: 'Active' },
  { id: 'due-7-days', label: 'Due in 7d' },
  { id: 'trial', label: 'Trials' },
  { id: 'paused', label: 'Paused' },
];

export const LedgerFilterBar: React.FC<LedgerFilterBarProps> = ({
  filters,
  onFilterChange,
  selectedCount,
  totalFilteredCount,
  totalLedgerCount,
  viewMode,
  onViewModeChange,
  onBatchPause,
  onBatchDelete,
}) => {
  return (
    <div className="w-full bg-[#0D0F12] hairline-border-b px-4 sm:px-6 py-2.5 flex flex-col gap-2.5">
      {/* Top Row: Search & View Modes & Sort */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Left: Search input */}
        <div className="flex items-center gap-2 flex-1 min-w-[220px] max-w-md">
          <div className="relative w-full">
            <Search className="w-3.5 h-3.5 text-[#8E95A2] absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={filters.searchQuery}
              onChange={(e) => onFilterChange({ searchQuery: e.target.value })}
              placeholder="Search by service name, notes, payment method..."
              className="w-full bg-[#14171C] border border-[#22262F] focus:border-[#10B981] rounded text-xs text-[#F3F4F6] placeholder-[#8E95A2] pl-8 pr-3 py-1.5 focus:outline-none transition-colors"
            />
            {filters.searchQuery && (
              <button
                type="button"
                onClick={() => onFilterChange({ searchQuery: '' })}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-[#8E95A2] hover:text-[#F3F4F6]"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Right: View Toggle & Sort Controls */}
        <div className="flex items-center gap-2">
          {/* Sort By Dropdown */}
          <div className="flex items-center gap-1.5 bg-[#14171C] border border-[#22262F] rounded px-2 py-1 text-xs">
            <ArrowUpDown className="w-3 h-3 text-[#8E95A2]" />
            <span className="text-[11px] text-[#8E95A2] hidden sm:inline">Sort:</span>
            <select
              value={`${filters.sortField}_${filters.sortDirection}`}
              onChange={(e) => {
                const [field, direction] = e.target.value.split('_') as [SortField, SortDirection];
                onFilterChange({ sortField: field, sortDirection: direction });
              }}
              className="bg-transparent text-[#F3F4F6] text-xs focus:outline-none cursor-pointer"
            >
              <option value="nextBillingDate_asc" className="bg-[#14171C] text-[#F3F4F6]">
                Renewal Date (Soonest first)
              </option>
              <option value="nextBillingDate_desc" className="bg-[#14171C] text-[#F3F4F6]">
                Renewal Date (Furthest first)
              </option>
              <option value="monthlyCost_desc" className="bg-[#14171C] text-[#F3F4F6]">
                Monthly Burn (Highest first)
              </option>
              <option value="monthlyCost_asc" className="bg-[#14171C] text-[#F3F4F6]">
                Monthly Burn (Lowest first)
              </option>
              <option value="name_asc" className="bg-[#14171C] text-[#F3F4F6]">
                Name (A to Z)
              </option>
            </select>
          </div>

          {/* View Mode Toggle: Table vs Timeline */}
          <div className="flex items-center bg-[#14171C] border border-[#22262F] rounded p-0.5">
            <button
              type="button"
              onClick={() => onViewModeChange('table')}
              className={`inline-flex items-center gap-1 px-2 py-1 text-xs rounded transition-colors ${
                viewMode === 'table'
                  ? 'bg-[#1B1F26] text-[#F3F4F6] font-medium'
                  : 'text-[#8E95A2] hover:text-[#F3F4F6]'
              }`}
            >
              <Table className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Ledger</span>
            </button>
            <button
              type="button"
              onClick={() => onViewModeChange('timeline')}
              className={`inline-flex items-center gap-1 px-2 py-1 text-xs rounded transition-colors ${
                viewMode === 'timeline'
                  ? 'bg-[#1B1F26] text-[#F3F4F6] font-medium'
                  : 'text-[#8E95A2] hover:text-[#F3F4F6]'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Timeline</span>
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Row: Status Filter Pills, Category Filter, and Batch Actions */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-[#14171C]">
        {/* Status Filter Pills */}
        <div className="flex flex-wrap items-center gap-1">
          {STATUS_OPTIONS.map((opt) => {
            const isSelected = filters.status === opt.id;
            return (
              <button
                type="button"
                key={opt.id}
                onClick={() => onFilterChange({ status: opt.id })}
                className={`px-2 py-1 text-[11px] font-mono rounded transition-colors ${
                  isSelected
                    ? 'bg-[#14171C] text-[#10B981] border border-[#10B981]/30 font-medium'
                    : 'text-[#8E95A2] hover:text-[#F3F4F6] hover:bg-[#14171C]'
                }`}
              >
                {opt.label}
              </button>
            );
          })}
        </div>

        {/* Category Pills / Batch Selection Indicator */}
        <div className="flex items-center gap-2">
          {selectedCount > 0 ? (
            <div className="flex items-center gap-2 bg-[#14171C] border border-[#22262F] px-2 py-1 rounded text-xs text-[#F3F4F6]">
              <span className="font-mono text-[#10B981] font-semibold">{selectedCount}</span> selected
              <button
                type="button"
                onClick={onBatchPause}
                title="Pause selected"
                className="inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] text-[#8E95A2] hover:text-[#F3F4F6] bg-[#1B1F26] rounded"
              >
                <PauseCircle className="w-3 h-3" />
                <span>Toggle Pause</span>
              </button>
              <button
                type="button"
                onClick={onBatchDelete}
                title="Delete selected"
                className="inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] text-[#EF4444] hover:bg-[#EF4444]/15 bg-[#1B1F26] rounded"
              >
                <Trash2 className="w-3 h-3" />
                <span>Delete</span>
              </button>
            </div>
          ) : (
            <div className="text-[11px] font-mono text-[#8E95A2]">
              Showing <span className="text-[#F3F4F6] font-semibold">{totalFilteredCount}</span> of{' '}
              {totalLedgerCount} entries
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

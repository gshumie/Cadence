import React from 'react';
import { Plus, Download, RotateCcw, Trash2 } from 'lucide-react';
import { CadenceLogo } from './CadenceLogo';

interface HeaderProps {
  onNewSubscription: () => void;
  onOpenDataModal: () => void;
  onResetDemo: () => void;
  onClearLedger: () => void;
  activeCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  onNewSubscription,
  onOpenDataModal,
  onResetDemo,
  onClearLedger,
}) => {
  return (
    <header className="w-full bg-[#0D0F12] hairline-border-b px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-3 sticky top-0 z-20">
      {/* Brand & Wordmark */}
      <div className="flex items-center gap-4">
        <CadenceLogo size={30} />
        <div className="hidden md:flex items-center gap-2 border-l border-[#22262F] pl-4">
          <span className="text-xs text-[#8E95A2] font-mono tracking-tight">
            Precision Recurring Expense &amp; Subscription Ledger
          </span>
        </div>
      </div>

      {/* Header Actions */}
      <div className="flex items-center gap-2">
        {/* Reset Demo Data */}
        <button
          type="button"
          onClick={onResetDemo}
          title="Reset to default demo data"
          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs text-[#8E95A2] hover:text-[#F3F4F6] bg-[#14171C] hover:bg-[#1B1F26] hairline-border rounded transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Reset Demo</span>
        </button>

        {/* Clear Ledger */}
        <button
          type="button"
          onClick={onClearLedger}
          title="Clear all records from ledger"
          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs text-[#8E95A2] hover:text-[#EF4444] bg-[#14171C] hover:bg-[#1B1F26] hairline-border rounded transition-colors"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Clear</span>
        </button>

        {/* Data Portability (CSV / JSON) */}
        <button
          type="button"
          onClick={onOpenDataModal}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#F3F4F6] bg-[#14171C] hover:bg-[#1B1F26] hairline-border rounded transition-colors"
        >
          <Download className="w-3.5 h-3.5 text-[#8E95A2]" />
          <span>Import / Export</span>
        </button>

        {/* Add Subscription Button */}
        <button
          type="button"
          onClick={onNewSubscription}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-[#0D0F12] bg-[#10B981] hover:bg-[#059669] rounded transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>New Entry</span>
          <kbd className="hidden sm:inline-block ml-1 px-1 py-0.2 text-[9px] font-mono bg-black/20 rounded">
            N
          </kbd>
        </button>
      </div>
    </header>
  );
};

import React from 'react';
import { AlertTriangle } from 'lucide-react';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  isDestructive?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  title,
  message,
  confirmLabel = 'Confirm',
  isDestructive = true,
  onConfirm,
  onCancel,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/75 backdrop-blur-[2px]"
        onClick={onCancel}
      />

      {/* Dialog Window */}
      <div className="relative w-full max-w-sm bg-[#14171C] border border-[#22262F] rounded-lg shadow-2xl z-10 p-5">
        <div className="flex items-start gap-3">
          <div
            className={`p-2 rounded-lg shrink-0 ${
              isDestructive
                ? 'bg-[#EF4444]/15 text-[#EF4444] border border-[#EF4444]/30'
                : 'bg-[#F59E0B]/15 text-[#F59E0B] border border-[#F59E0B]/30'
            }`}
          >
            <AlertTriangle className="w-5 h-5" />
          </div>

          <div className="space-y-1">
            <h4 className="text-sm font-semibold text-[#F3F4F6]">{title}</h4>
            <p className="text-xs text-[#8E95A2] leading-relaxed">{message}</p>
          </div>
        </div>

        <div className="mt-5 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="px-3 py-1.5 rounded text-xs text-[#8E95A2] hover:text-[#F3F4F6] hover:bg-[#1B1F26] transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={`px-3 py-1.5 rounded text-xs font-semibold text-white transition-colors ${
              isDestructive
                ? 'bg-[#EF4444] hover:bg-[#DC2626]'
                : 'bg-[#10B981] text-[#0D0F12] hover:bg-[#059669]'
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

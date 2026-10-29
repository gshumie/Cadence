import React, { useRef, useState } from 'react';
import type { Subscription } from '../types/subscription';
import {
  downloadCsv,
  downloadJsonBackup,
  importJsonFile,
  parseCsvPayloadString,
} from '../lib/exportImport';
import type { ImportResult } from '../lib/exportImport';
import {
  X,
  Download,
  Upload,
  FileSpreadsheet,
  FileJson,
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';

interface ExportImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  subscriptions: Subscription[];
  onImportSuccess: (imported: Subscription[]) => void;
}

export const ExportImportModal: React.FC<ExportImportModalProps> = ({
  isOpen,
  onClose,
  subscriptions,
  onImportSuccess,
}) => {
  const [activeTab, setActiveTab] = useState<'export' | 'import'>('export');
  const [dragActive, setDragActive] = useState(false);
  const [importStatus, setImportStatus] = useState<ImportResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleExportCsv = () => {
    downloadCsv(subscriptions);
  };

  const handleExportJson = () => {
    downloadJsonBackup(subscriptions);
  };

  const handleFileProcess = async (file: File) => {
    setIsProcessing(true);
    setImportStatus(null);

    try {
      if (file.name.toLowerCase().endsWith('.json') || file.type.includes('json')) {
        const result = await importJsonFile(file);
        setImportStatus(result);
        if (result.success && result.imported.length > 0) {
          onImportSuccess(result.imported);
        }
      } else if (file.name.toLowerCase().endsWith('.csv') || file.type.includes('csv')) {
        const text = await file.text();
        const result = parseCsvPayloadString(text);
        setImportStatus(result);
        if (result.success && result.imported.length > 0) {
          onImportSuccess(result.imported);
        }
      } else {
        setImportStatus({
          success: false,
          imported: [],
          count: 0,
          message: 'Unsupported file type. Please upload a .json backup or .csv ledger file.',
        });
      }
    } catch (err: any) {
      setImportStatus({
        success: false,
        imported: [],
        count: 0,
        message: `File processing error: ${err?.message || 'Unknown error'}`,
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileProcess(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-[2px]"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-lg bg-[#14171C] border border-[#22262F] rounded-lg shadow-2xl z-10 overflow-hidden">
        {/* Header */}
        <div className="px-5 py-4 border-b border-[#22262F] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold text-[#F3F4F6]">
              Data Portability &amp; Persistence
            </h3>
            <span className="text-[10px] font-mono text-[#8E95A2] bg-[#1B1F26] px-1.5 py-0.5 rounded border border-[#22262F]">
              CWE-1236 PROTECTED
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded text-[#8E95A2] hover:text-[#F3F4F6] hover:bg-[#1B1F26] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Controls */}
        <div className="flex border-b border-[#22262F] bg-[#0D0F12]">
          <button
            type="button"
            onClick={() => {
              setActiveTab('export');
              setImportStatus(null);
            }}
            className={`flex-1 py-2.5 text-xs font-medium text-center border-b-2 transition-colors flex items-center justify-center gap-2 ${
              activeTab === 'export'
                ? 'border-[#10B981] text-[#10B981] bg-[#14171C]'
                : 'border-transparent text-[#8E95A2] hover:text-[#F3F4F6]'
            }`}
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Ledger Data</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('import');
              setImportStatus(null);
            }}
            className={`flex-1 py-2.5 text-xs font-medium text-center border-b-2 transition-colors flex items-center justify-center gap-2 ${
              activeTab === 'import'
                ? 'border-[#10B981] text-[#10B981] bg-[#14171C]'
                : 'border-transparent text-[#8E95A2] hover:text-[#F3F4F6]'
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Import / Restore</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 text-xs">
          {activeTab === 'export' ? (
            <div className="space-y-4">
              <p className="text-[#8E95A2]">
                Export your active subscription ledger records for spreadsheet accounting or encrypted local backup.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* CSV Export Option */}
                <div
                  onClick={handleExportCsv}
                  className="p-4 rounded-lg bg-[#0D0F12] border border-[#22262F] hover:border-[#10B981] cursor-pointer transition-colors group flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="w-8 h-8 rounded bg-[#10B981]/10 border border-[#10B981]/25 flex items-center justify-center text-[#10B981]">
                      <FileSpreadsheet className="w-4 h-4" />
                    </div>
                    <div className="font-semibold text-[#F3F4F6] group-hover:text-[#10B981] transition-colors">
                      Export as CSV (.csv)
                    </div>
                    <div className="text-[11px] text-[#8E95A2]">
                      Includes formula injection neutralizing sanitization for Excel, Apple Numbers, and Google Sheets.
                    </div>
                  </div>
                  <div className="mt-3 text-[11px] font-mono text-[#10B981]">
                    Download .CSV →
                  </div>
                </div>

                {/* JSON Export Option */}
                <div
                  onClick={handleExportJson}
                  className="p-4 rounded-lg bg-[#0D0F12] border border-[#22262F] hover:border-[#10B981] cursor-pointer transition-colors group flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="w-8 h-8 rounded bg-[#38BDF8]/10 border border-[#38BDF8]/25 flex items-center justify-center text-[#38BDF8]">
                      <FileJson className="w-4 h-4" />
                    </div>
                    <div className="font-semibold text-[#F3F4F6] group-hover:text-[#38BDF8] transition-colors">
                      Export Backup (.json)
                    </div>
                    <div className="text-[11px] text-[#8E95A2]">
                      Full structured ledger schema with complete metadata for 1:1 cross-device restoration.
                    </div>
                  </div>
                  <div className="mt-3 text-[11px] font-mono text-[#38BDF8]">
                    Download .JSON →
                  </div>
                </div>
              </div>

              {/* Security Guarantee Note */}
              <div className="p-2.5 rounded bg-[#0D0F12] border border-[#22262F] text-[11px] text-[#8E95A2] flex items-start gap-2">
                <ShieldAlert className="w-4 h-4 text-[#10B981] shrink-0 mt-0.5" />
                <span>
                  <strong>Security Guardrail:</strong> All exported cells starting with <code>=</code>, <code>+</code>, <code>-</code>, <code>@</code>, <code>\t</code>, or <code>\r</code> are safely escaped with single quotes to neutralize DDE / Formula Injection attacks.
                </span>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-[#8E95A2]">
                Restore your ledger from a previous Cadence <code>.json</code> backup or import a <code>.csv</code> spreadsheet.
              </p>

              {/* Drag & Drop Zone */}
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`p-6 border-2 border-dashed rounded-lg text-center cursor-pointer transition-colors ${
                  dragActive
                    ? 'border-[#10B981] bg-[#10B981]/5'
                    : 'border-[#22262F] bg-[#0D0F12] hover:border-[#8E95A2]'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".json,.csv,application/json,text/csv"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      handleFileProcess(e.target.files[0]);
                    }
                  }}
                />
                <div className="flex flex-col items-center justify-center gap-2">
                  <div className="w-10 h-10 rounded-full bg-[#14171C] border border-[#22262F] flex items-center justify-center text-[#8E95A2]">
                    <Upload className="w-5 h-5" />
                  </div>
                  <div className="text-xs font-semibold text-[#F3F4F6]">
                    Drag and drop file here, or click to browse
                  </div>
                  <div className="text-[11px] text-[#8E95A2]">
                    Supports .json and .csv (Max 1MB)
                  </div>
                </div>
              </div>

              {/* Status or Errors */}
              {isProcessing && (
                <div className="text-center py-2 text-xs text-[#8E95A2]">
                  Scanning payload against prototype pollution &amp; schema rules...
                </div>
              )}

              {importStatus && (
                <div
                  className={`p-3 rounded border text-xs flex items-start gap-2.5 ${
                    importStatus.success
                      ? 'bg-[#10B981]/10 border-[#10B981]/30 text-[#10B981]'
                      : 'bg-[#EF4444]/10 border-[#EF4444]/30 text-[#EF4444]'
                  }`}
                >
                  {importStatus.success ? (
                    <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                  )}
                  <div>
                    <div className="font-semibold">{importStatus.message}</div>
                    {importStatus.errors && importStatus.errors.length > 0 && (
                      <ul className="list-disc pl-4 mt-1 space-y-0.5 text-[11px] text-[#8E95A2]">
                        {importStatus.errors.slice(0, 3).map((err, idx) => (
                          <li key={idx}>{err}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

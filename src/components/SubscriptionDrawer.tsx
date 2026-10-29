import React, { useEffect, useState } from 'react';
import type {
  BillingCycle,
  CurrencySymbol,
  Subscription,
  SubscriptionCategory,
  SubscriptionStatus,
} from '../types/subscription';
import {
  autoAdvanceBillingDate,
  formatCurrency,
  normalizeToAnnual,
  normalizeToMonthly,
  toIsoDateString,
} from '../lib/calculations';
import {
  sanitizeText,
  validateAmount,
  validateIsoDate,
} from '../lib/security';
import { X, Check, AlertCircle } from 'lucide-react';

interface SubscriptionDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (subscriptionData: Partial<Subscription>) => void;
  subscriptionToEdit: Subscription | null;
}

const TEMPLATES = [
  { name: 'Vercel Pro', cost: 20, cycle: 'monthly' as BillingCycle, category: 'Software' as SubscriptionCategory },
  { name: 'AWS Cloud', cost: 85, cycle: 'monthly' as BillingCycle, category: 'Infrastructure' as SubscriptionCategory },
  { name: 'GitHub Copilot', cost: 10, cycle: 'monthly' as BillingCycle, category: 'Software' as SubscriptionCategory },
  { name: 'Claude Pro', cost: 20, cycle: 'monthly' as BillingCycle, category: 'Software' as SubscriptionCategory },
  { name: 'Netflix 4K', cost: 22.99, cycle: 'monthly' as BillingCycle, category: 'Media' as SubscriptionCategory },
  { name: 'Spotify Family', cost: 19.99, cycle: 'monthly' as BillingCycle, category: 'Media' as SubscriptionCategory },
  { name: 'Figma Org', cost: 45, cycle: 'monthly' as BillingCycle, category: 'Software' as SubscriptionCategory },
  { name: 'Equinox Gym', cost: 195, cycle: 'monthly' as BillingCycle, category: 'Fitness' as SubscriptionCategory },
  { name: 'Sonic Fiber', cost: 70, cycle: 'monthly' as BillingCycle, category: 'Utilities' as SubscriptionCategory },
  { name: 'Google One 2TB', cost: 99.99, cycle: 'yearly' as BillingCycle, category: 'Infrastructure' as SubscriptionCategory },
];

const CURRENCIES: CurrencySymbol[] = ['$', '€', '£', 'ETB', '¥', '₹', 'C$', 'A$', 'CHF'];

export const SubscriptionDrawer: React.FC<SubscriptionDrawerProps> = ({
  isOpen,
  onClose,
  onSave,
  subscriptionToEdit,
}) => {
  const isEditing = Boolean(subscriptionToEdit);

  // Form states
  const [name, setName] = useState('');
  const [cost, setCost] = useState('');
  const [currency, setCurrency] = useState<CurrencySymbol>('$');
  const [billingCycle, setBillingCycle] = useState<BillingCycle>('monthly');
  const [category, setCategory] = useState<SubscriptionCategory>('Software');
  const [status, setStatus] = useState<SubscriptionStatus>('active');
  const [nextBillingDate, setNextBillingDate] = useState(toIsoDateString(new Date()));
  const [alertLeadDays, setAlertLeadDays] = useState(7);
  const [paymentMethod, setPaymentMethod] = useState('');
  const [notes, setNotes] = useState('');
  const [cancellationUrl, setCancellationUrl] = useState('');
  const [trialEndDate, setTrialEndDate] = useState('');

  // Validation errors
  const [error, setError] = useState<string | null>(null);

  // Populate or reset form
  useEffect(() => {
    if (subscriptionToEdit) {
      setName(subscriptionToEdit.name);
      setCost(subscriptionToEdit.cost.toString());
      setCurrency(subscriptionToEdit.currency);
      setBillingCycle(subscriptionToEdit.billingCycle);
      setCategory(subscriptionToEdit.category);
      setStatus(subscriptionToEdit.status);
      setNextBillingDate(subscriptionToEdit.nextBillingDate);
      setAlertLeadDays(subscriptionToEdit.alertLeadDays || 7);
      setPaymentMethod(subscriptionToEdit.paymentMethod || '');
      setNotes(subscriptionToEdit.notes || '');
      setCancellationUrl(subscriptionToEdit.cancellationUrl || '');
      setTrialEndDate(subscriptionToEdit.trialEndDate || '');
      setError(null);
    } else {
      setName('');
      setCost('');
      setCurrency('$');
      setBillingCycle('monthly');
      setCategory('Software');
      setStatus('active');
      setNextBillingDate(toIsoDateString(new Date()));
      setAlertLeadDays(7);
      setPaymentMethod('');
      setNotes('');
      setCancellationUrl('');
      setTrialEndDate('');
      setError(null);
    }
  }, [subscriptionToEdit, isOpen]);

  // Keyboard shortcut listener: Escape to close, Ctrl/Cmd + Enter to save
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      } else if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        handleSubmit();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  });

  // Calculate live preview metrics
  const numericCost = parseFloat(cost) || 0;
  const liveMonthly = normalizeToMonthly(numericCost, billingCycle);
  const liveAnnual = normalizeToAnnual(numericCost, billingCycle);

  const applyTemplate = (tmpl: (typeof TEMPLATES)[number]) => {
    setName(tmpl.name);
    setCost(tmpl.cost.toString());
    setBillingCycle(tmpl.cycle);
    setCategory(tmpl.category);
  };

  const handleAutoAdvanceDate = () => {
    const advanced = autoAdvanceBillingDate(nextBillingDate, billingCycle, new Date());
    setNextBillingDate(advanced);
  };

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError(null);

    const cleanName = sanitizeText(name);
    if (!cleanName || cleanName.length === 0) {
      setError('Service name is required');
      return;
    }

    const costValidation = validateAmount(cost);
    if (!costValidation.valid) {
      setError(costValidation.error || 'Please enter a valid cost between $0.01 and $999,999.99');
      return;
    }

    if (!validateIsoDate(nextBillingDate)) {
      setError('Please provide a valid ISO date (YYYY-MM-DD)');
      return;
    }

    const payload: Partial<Subscription> = {
      ...(subscriptionToEdit ? { id: subscriptionToEdit.id } : {}),
      name: cleanName,
      cost: costValidation.value,
      currency,
      billingCycle,
      category,
      status,
      nextBillingDate,
      alertLeadDays,
      paymentMethod: paymentMethod ? sanitizeText(paymentMethod) : undefined,
      notes: notes ? sanitizeText(notes) : undefined,
      cancellationUrl: cancellationUrl ? sanitizeText(cancellationUrl) : undefined,
      trialEndDate: status === 'trial' && trialEndDate ? trialEndDate : undefined,
    };

    onSave(payload);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex justify-end">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-[2px] transition-opacity"
        onClick={onClose}
      />

      {/* Slide-out Drawer Panel */}
      <div className="relative w-full max-w-md bg-[#14171C] hairline-border-l h-full flex flex-col shadow-2xl z-10 overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-[#14171C] hairline-border-b px-5 py-4 flex items-center justify-between z-10">
          <div>
            <h2 className="text-sm font-semibold text-[#F3F4F6] flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#10B981]" />
              {isEditing ? 'Edit Subscription Ledger' : 'New Recurring Expense Entry'}
            </h2>
            <p className="text-[11px] text-[#8E95A2] font-mono mt-0.5">
              Precision entry with automatic burn normalization
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded text-[#8E95A2] hover:text-[#F3F4F6] hover:bg-[#1B1F26] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 flex-1 space-y-4 text-xs">
          {/* Error Banner if any */}
          {error && (
            <div className="p-2.5 rounded bg-[#EF4444]/15 border border-[#EF4444]/30 text-[#EF4444] text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Quick Preset Templates (if creating new) */}
          {!isEditing && (
            <div>
              <label className="block text-[10px] font-mono uppercase tracking-wider text-[#8E95A2] mb-1.5">
                Quick Fill Templates
              </label>
              <div className="flex flex-wrap gap-1">
                {TEMPLATES.map((tmpl) => (
                  <button
                    type="button"
                    key={tmpl.name}
                    onClick={() => applyTemplate(tmpl)}
                    className="px-2 py-0.5 text-[10px] rounded bg-[#1B1F26] hover:bg-[#22262F] text-[#8E95A2] hover:text-[#F3F4F6] border border-[#22262F] transition-colors"
                  >
                    + {tmpl.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Service Name */}
          <div>
            <label className="block text-[11px] font-medium text-[#F3F4F6] mb-1">
              Service Name <span className="text-[#EF4444]">*</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. AWS Cloud, Netflix 4K, GitHub Copilot"
              className="w-full bg-[#0D0F12] border border-[#22262F] focus:border-[#10B981] rounded px-3 py-2 text-xs text-[#F3F4F6] focus:outline-none transition-colors"
            />
          </div>

          {/* Cost & Currency Symbol */}
          <div className="grid grid-cols-3 gap-2">
            <div className="col-span-1">
              <label className="block text-[11px] font-medium text-[#F3F4F6] mb-1">
                Currency
              </label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value as CurrencySymbol)}
                className="w-full bg-[#0D0F12] border border-[#22262F] focus:border-[#10B981] rounded px-2.5 py-2 text-xs text-[#F3F4F6] focus:outline-none cursor-pointer"
              >
                {CURRENCIES.map((c) => (
                  <option key={c} value={c} className="bg-[#14171C] text-[#F3F4F6]">
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div className="col-span-2">
              <label className="block text-[11px] font-medium text-[#F3F4F6] mb-1">
                Amount <span className="text-[#EF4444]">*</span>
              </label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                max="999999.99"
                required
                value={cost}
                onChange={(e) => setCost(e.target.value)}
                placeholder="20.00"
                className="w-full bg-[#0D0F12] border border-[#22262F] focus:border-[#10B981] rounded px-3 py-2 text-xs font-mono-nums text-[#F3F4F6] focus:outline-none transition-colors"
              />
            </div>
          </div>

          {/* Billing Cycle & Category */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[11px] font-medium text-[#F3F4F6] mb-1">
                Billing Cycle
              </label>
              <select
                value={billingCycle}
                onChange={(e) => setBillingCycle(e.target.value as BillingCycle)}
                className="w-full bg-[#0D0F12] border border-[#22262F] focus:border-[#10B981] rounded px-2.5 py-2 text-xs text-[#F3F4F6] focus:outline-none cursor-pointer"
              >
                <option value="monthly">Monthly</option>
                <option value="yearly">Yearly (/ 12)</option>
                <option value="quarterly">Quarterly (/ 3)</option>
                <option value="weekly">Weekly (* 52 / 12)</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-medium text-[#F3F4F6] mb-1">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as SubscriptionCategory)}
                className="w-full bg-[#0D0F12] border border-[#22262F] focus:border-[#10B981] rounded px-2.5 py-2 text-xs text-[#F3F4F6] focus:outline-none cursor-pointer"
              >
                <option value="Software">Software</option>
                <option value="Infrastructure">Infrastructure</option>
                <option value="Media">Media</option>
                <option value="Fitness">Fitness</option>
                <option value="Utilities">Utilities</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          {/* Live Calculation Preview Card */}
          <div className="p-3 rounded bg-[#0D0F12] hairline-border space-y-1 select-none">
            <div className="flex items-center justify-between text-[11px]">
              <span className="font-mono text-[#8E95A2]">NORMALIZED MONTHLY:</span>
              <span className="font-mono-nums font-bold text-[#10B981]">
                {formatCurrency(liveMonthly, currency)} / mo
              </span>
            </div>
            <div className="flex items-center justify-between text-[11px]">
              <span className="font-mono text-[#8E95A2]">PROJECTED ANNUAL RUN:</span>
              <span className="font-mono-nums font-semibold text-[#F3F4F6]">
                {formatCurrency(liveAnnual, currency)} / yr
              </span>
            </div>
          </div>

          {/* Next Renewal Date */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-[11px] font-medium text-[#F3F4F6]">
                Next Billing Date <span className="text-[#EF4444]">*</span>
              </label>
              <button
                type="button"
                onClick={handleAutoAdvanceDate}
                className="text-[10px] font-mono text-[#10B981] hover:underline"
                title="If in the past, advance to next future occurrence"
              >
                Auto-Advance
              </button>
            </div>
            <input
              type="date"
              required
              value={nextBillingDate}
              onChange={(e) => setNextBillingDate(e.target.value)}
              className="w-full bg-[#0D0F12] border border-[#22262F] focus:border-[#10B981] rounded px-3 py-2 text-xs font-mono text-[#F3F4F6] focus:outline-none transition-colors"
            />
          </div>

          {/* Status & Alert Lead Time */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[11px] font-medium text-[#F3F4F6] mb-1">
                Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as SubscriptionStatus)}
                className="w-full bg-[#0D0F12] border border-[#22262F] focus:border-[#10B981] rounded px-2.5 py-2 text-xs text-[#F3F4F6] focus:outline-none cursor-pointer"
              >
                <option value="active">Active</option>
                <option value="paused">Paused</option>
                <option value="trial">Free Trial</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-medium text-[#F3F4F6] mb-1">
                Alert Lead Time
              </label>
              <select
                value={alertLeadDays}
                onChange={(e) => setAlertLeadDays(Number(e.target.value))}
                className="w-full bg-[#0D0F12] border border-[#22262F] focus:border-[#10B981] rounded px-2.5 py-2 text-xs text-[#F3F4F6] focus:outline-none cursor-pointer"
              >
                <option value={1}>1 day before</option>
                <option value={3}>3 days before</option>
                <option value={7}>7 days before</option>
                <option value={14}>14 days before</option>
              </select>
            </div>
          </div>

          {/* Trial End Date (if status is trial) */}
          {status === 'trial' && (
            <div>
              <label className="block text-[11px] font-medium text-[#F472B6] mb-1">
                Trial Expiration Date
              </label>
              <input
                type="date"
                value={trialEndDate}
                onChange={(e) => setTrialEndDate(e.target.value)}
                className="w-full bg-[#0D0F12] border border-[#F472B6]/40 focus:border-[#F472B6] rounded px-3 py-2 text-xs font-mono text-[#F3F4F6] focus:outline-none transition-colors"
              />
            </div>
          )}

          {/* Payment Method reference */}
          <div>
            <label className="block text-[11px] font-medium text-[#F3F4F6] mb-1">
              Payment Method / Card
            </label>
            <input
              type="text"
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              placeholder="e.g. Visa •••• 4242, Amex Corporate, PayPal"
              className="w-full bg-[#0D0F12] border border-[#22262F] focus:border-[#10B981] rounded px-3 py-2 text-xs text-[#F3F4F6] focus:outline-none transition-colors"
            />
          </div>

          {/* Cancellation or Portal URL */}
          <div>
            <label className="block text-[11px] font-medium text-[#F3F4F6] mb-1">
              Manage / Cancellation URL
            </label>
            <input
              type="url"
              value={cancellationUrl}
              onChange={(e) => setCancellationUrl(e.target.value)}
              placeholder="https://service.com/account/billing"
              className="w-full bg-[#0D0F12] border border-[#22262F] focus:border-[#10B981] rounded px-3 py-2 text-xs font-mono text-[#F3F4F6] focus:outline-none transition-colors"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-[11px] font-medium text-[#F3F4F6] mb-1">
              Ledger Notes
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Billing contact, department tag, or renewal instructions..."
              className="w-full bg-[#0D0F12] border border-[#22262F] focus:border-[#10B981] rounded px-3 py-2 text-xs text-[#F3F4F6] focus:outline-none transition-colors resize-none"
            />
          </div>

          {/* Submit Actions */}
          <div className="sticky bottom-0 bg-[#14171C] pt-3 pb-1 border-t border-[#22262F] flex items-center justify-between gap-2">
            <span className="text-[10px] font-mono text-[#8E95A2]">
              <kbd className="px-1 py-0.5 bg-[#0D0F12] border border-[#22262F] rounded text-[9px]">
                Ctrl+Enter
              </kbd>{' '}
              to save
            </span>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3 py-1.5 rounded text-xs text-[#8E95A2] hover:text-[#F3F4F6] hover:bg-[#1B1F26] transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded text-xs font-semibold text-[#0D0F12] bg-[#10B981] hover:bg-[#059669] transition-colors shadow-sm"
              >
                <Check className="w-4 h-4 stroke-[2.5]" />
                <span>{isEditing ? 'Save Changes' : 'Record Entry'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

import React, { useEffect, useMemo, useState } from 'react';
import type {
  FilterState,
  FinancialSummary,
  Subscription,
} from './types/subscription';
import {
  calculateFinancialSummary,
  isDueWithin7Days,
  normalizeToMonthly,
} from './lib/calculations';
import {
  clearAllSubscriptions,
  loadSubscriptions,
  resetSubscriptionsToDemo,
  saveSubscriptions,
} from './lib/storage';
import { Header } from './components/Header';
import { FinancialHeader } from './components/FinancialHeader';
import { RenewalAlertStrip } from './components/RenewalAlertStrip';
import { CategoryBreakdownBar } from './components/CategoryBreakdownBar';
import { LedgerFilterBar } from './components/LedgerFilterBar';
import { SubscriptionTable } from './components/SubscriptionTable';
import { CashflowTimeline } from './components/CashflowTimeline';
import { SubscriptionDrawer } from './components/SubscriptionDrawer';
import { ExportImportModal } from './components/ExportImportModal';
import { ConfirmDialog } from './components/ConfirmDialog';

export const App: React.FC = () => {
  // Core Ledger State
  const [subscriptions, setSubscriptions] = useState<Subscription[]>(() => loadSubscriptions());
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Navigation / View Modes
  const [viewMode, setViewMode] = useState<'table' | 'timeline'>('table');

  // Drawer & Modal States
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingSub, setEditingSub] = useState<Subscription | null>(null);
  const [isDataModalOpen, setIsDataModalOpen] = useState(false);

  // Confirm Dialog State
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    confirmLabel?: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
  });

  // Filter & Sort State
  const [filters, setFilters] = useState<FilterState>({
    searchQuery: '',
    category: 'all',
    status: 'all',
    sortField: 'nextBillingDate',
    sortDirection: 'asc',
  });

  // Sync to localStorage on changes
  useEffect(() => {
    saveSubscriptions(subscriptions);
  }, [subscriptions]);

  // Global Keyboard Shortcuts (N for new entry, Escape to close)
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if typing in an input or textarea
      const target = e.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.tagName === 'SELECT'
      ) {
        return;
      }

      if ((e.key === 'n' || e.key === 'N') && !e.ctrlKey && !e.metaKey && !e.altKey) {
        e.preventDefault();
        setEditingSub(null);
        setIsDrawerOpen(true);
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, []);

  // Compute live financial summary
  const summary: FinancialSummary = useMemo(() => {
    return calculateFinancialSummary(subscriptions);
  }, [subscriptions]);

  // Filter & Sort Logic
  const filteredSubscriptions = useMemo(() => {
    const today = new Date();
    const query = filters.searchQuery.trim().toLowerCase();

    return subscriptions
      .filter((sub) => {
        // Search query
        if (query) {
          const matchName = sub.name.toLowerCase().includes(query);
          const matchNotes = sub.notes ? sub.notes.toLowerCase().includes(query) : false;
          const matchPayment = sub.paymentMethod
            ? sub.paymentMethod.toLowerCase().includes(query)
            : false;
          if (!matchName && !matchNotes && !matchPayment) {
            return false;
          }
        }

        // Category filter
        if (filters.category !== 'all' && sub.category !== filters.category) {
          return false;
        }

        // Status filter
        if (filters.status === 'active' && sub.status !== 'active') return false;
        if (filters.status === 'paused' && sub.status !== 'paused') return false;
        if (filters.status === 'trial' && sub.status !== 'trial') return false;
        if (filters.status === 'due-7-days') {
          if (sub.status === 'paused') return false;
          if (!isDueWithin7Days(sub.nextBillingDate, today)) return false;
        }

        return true;
      })
      .sort((a, b) => {
        const factor = filters.sortDirection === 'asc' ? 1 : -1;

        if (filters.sortField === 'nextBillingDate') {
          return a.nextBillingDate.localeCompare(b.nextBillingDate) * factor;
        }

        if (filters.sortField === 'monthlyCost') {
          const aMonthly = normalizeToMonthly(a.cost, a.billingCycle);
          const bMonthly = normalizeToMonthly(b.cost, b.billingCycle);
          return (aMonthly - bMonthly) * factor;
        }

        if (filters.sortField === 'name') {
          return a.name.localeCompare(b.name) * factor;
        }

        if (filters.sortField === 'category') {
          return a.category.localeCompare(b.category) * factor;
        }

        return 0;
      });
  }, [subscriptions, filters]);

  // Handle Multi-Select Checkboxes
  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleToggleSelectAll = () => {
    if (
      filteredSubscriptions.length > 0 &&
      filteredSubscriptions.every((s) => selectedIds.has(s.id))
    ) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredSubscriptions.map((s) => s.id)));
    }
  };

  // CRUD Actions
  const handleAddNew = () => {
    setEditingSub(null);
    setIsDrawerOpen(true);
  };

  const handleEdit = (sub: Subscription) => {
    setEditingSub(sub);
    setIsDrawerOpen(true);
  };

  const handleSaveSubscription = (data: Partial<Subscription>) => {
    if (editingSub) {
      // Update existing
      setSubscriptions((prev) =>
        prev.map((sub) =>
          sub.id === editingSub.id
            ? ({
                ...sub,
                ...data,
                updatedAt: new Date().toISOString(),
              } as Subscription)
            : sub
        )
      );
    } else {
      // Create new
      const newSub: Subscription = {
        id: `sub_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        name: data.name || 'New Service',
        cost: data.cost || 0,
        currency: data.currency || '$',
        billingCycle: data.billingCycle || 'monthly',
        category: data.category || 'Other',
        status: data.status || 'active',
        nextBillingDate: data.nextBillingDate || new Date().toISOString().split('T')[0],
        alertLeadDays: data.alertLeadDays || 7,
        paymentMethod: data.paymentMethod,
        notes: data.notes,
        cancellationUrl: data.cancellationUrl,
        trialEndDate: data.trialEndDate,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setSubscriptions((prev) => [newSub, ...prev]);
    }

    setIsDrawerOpen(false);
    setEditingSub(null);
  };

  const handleToggleStatus = (sub: Subscription) => {
    setSubscriptions((prev) =>
      prev.map((s) => {
        if (s.id !== sub.id) return s;
        const newStatus = s.status === 'paused' ? 'active' : 'paused';
        return {
          ...s,
          status: newStatus,
          updatedAt: new Date().toISOString(),
        };
      })
    );
  };

  const handleDuplicate = (sub: Subscription) => {
    const clone: Subscription = {
      ...sub,
      id: `sub_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      name: `${sub.name} (Copy)`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setSubscriptions((prev) => [clone, ...prev]);
  };

  const handleDelete = (id: string) => {
    const sub = subscriptions.find((s) => s.id === id);
    setConfirmDialog({
      isOpen: true,
      title: 'Delete Subscription',
      message: `Are you sure you want to permanently delete "${
        sub?.name || 'this item'
      }" from your ledger?`,
      confirmLabel: 'Delete Record',
      onConfirm: () => {
        setSubscriptions((prev) => prev.filter((s) => s.id !== id));
        setSelectedIds((prev) => {
          const next = new Set(prev);
          next.delete(id);
          return next;
        });
        setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
      },
    });
  };

  // Batch Operations
  const handleBatchPause = () => {
    if (selectedIds.size === 0) return;
    setSubscriptions((prev) =>
      prev.map((s) => {
        if (selectedIds.has(s.id)) {
          return {
            ...s,
            status: s.status === 'paused' ? 'active' : 'paused',
            updatedAt: new Date().toISOString(),
          };
        }
        return s;
      })
    );
  };

  const handleBatchDelete = () => {
    if (selectedIds.size === 0) return;
    setConfirmDialog({
      isOpen: true,
      title: 'Batch Delete Selected Records',
      message: `Are you sure you want to permanently delete ${selectedIds.size} selected subscriptions?`,
      confirmLabel: `Delete ${selectedIds.size} Records`,
      onConfirm: () => {
        setSubscriptions((prev) => prev.filter((s) => !selectedIds.has(s.id)));
        setSelectedIds(new Set());
        setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
      },
    });
  };

  // Reset & Clear Ledger
  const handleResetDemo = () => {
    setConfirmDialog({
      isOpen: true,
      title: 'Reset to Demo Seed Data',
      message:
        'This will replace your current ledger with the default curated subscription dataset (Vercel, GitHub, AWS, Netflix, etc.).',
      confirmLabel: 'Reset Ledger',
      onConfirm: () => {
        const seed = resetSubscriptionsToDemo();
        setSubscriptions(seed);
        setSelectedIds(new Set());
        setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
      },
    });
  };

  const handleClearLedger = () => {
    setConfirmDialog({
      isOpen: true,
      title: 'Clear Entire Ledger',
      message:
        'Are you sure you want to clear all subscription entries? You can restore them anytime using a JSON backup or the Reset Demo button.',
      confirmLabel: 'Clear All Data',
      onConfirm: () => {
        clearAllSubscriptions();
        setSubscriptions([]);
        setSelectedIds(new Set());
        setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
      },
    });
  };

  const handleImportSuccess = (imported: Subscription[]) => {
    setSubscriptions(imported);
    setSelectedIds(new Set());
    setIsDataModalOpen(false);
  };

  const handleFilterDueSoon = () => {
    setFilters((prev) => ({
      ...prev,
      status: prev.status === 'due-7-days' ? 'all' : 'due-7-days',
    }));
  };

  return (
    <div className="min-h-screen bg-[#0D0F12] text-[#F3F4F6] flex flex-col antialiased">
      {/* Top Header & Brand Identity */}
      <Header
        onNewSubscription={handleAddNew}
        onOpenDataModal={() => setIsDataModalOpen(true)}
        onResetDemo={handleResetDemo}
        onClearLedger={handleClearLedger}
        activeCount={summary.activeCount}
      />

      {/* Primary Typographic Financial Header (Burn Rate & Run Rate) */}
      <FinancialHeader
        summary={summary}
        currencySymbol="$"
        onFilterDueSoon={handleFilterDueSoon}
      />

      {/* Inline Renewal Alert Strip (7-day window & trial warnings) */}
      <RenewalAlertStrip
        subscriptions={subscriptions}
        onFilterDueSoon={handleFilterDueSoon}
        onSelectSubscription={handleEdit}
        isFilteredToDueSoon={filters.status === 'due-7-days'}
      />

      {/* Category Breakdown Proportion Bar (8px flush bar) */}
      <CategoryBreakdownBar
        summary={summary}
        currencySymbol="$"
        selectedCategory={filters.category}
        onSelectCategory={(cat) => setFilters((prev) => ({ ...prev, category: cat }))}
      />

      {/* Interactive Controls: Search, Sort, Filters, and View Modes */}
      <LedgerFilterBar
        filters={filters}
        onFilterChange={(newFilters) => setFilters((prev) => ({ ...prev, ...newFilters }))}
        selectedCount={selectedIds.size}
        totalFilteredCount={filteredSubscriptions.length}
        totalLedgerCount={subscriptions.length}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        onBatchPause={handleBatchPause}
        onBatchDelete={handleBatchDelete}
        onToggleSelectAll={handleToggleSelectAll}
        allSelected={
          filteredSubscriptions.length > 0 &&
          filteredSubscriptions.every((s) => selectedIds.has(s.id))
        }
      />

      {/* Main Ledger Content Area */}
      <main className="flex-1 w-full flex flex-col bg-[#0D0F12]">
        {viewMode === 'table' ? (
          <SubscriptionTable
            subscriptions={filteredSubscriptions}
            selectedIds={selectedIds}
            onToggleSelect={handleToggleSelect}
            onToggleSelectAll={handleToggleSelectAll}
            onEdit={handleEdit}
            onToggleStatus={handleToggleStatus}
            onDelete={handleDelete}
            onDuplicate={handleDuplicate}
            onAddNew={handleAddNew}
            filters={filters}
            onSortChange={(field) => {
              setFilters((prev) => ({
                ...prev,
                sortField: field,
                sortDirection:
                  prev.sortField === field && prev.sortDirection === 'asc' ? 'desc' : 'asc',
              }));
            }}
          />
        ) : (
          <CashflowTimeline
            subscriptions={filteredSubscriptions}
            currencySymbol="$"
            onSelectSubscription={handleEdit}
          />
        )}
      </main>

      {/* Right Pane: Quick-Entry & Inspector Drawer */}
      <SubscriptionDrawer
        isOpen={isDrawerOpen}
        onClose={() => {
          setIsDrawerOpen(false);
          setEditingSub(null);
        }}
        onSave={handleSaveSubscription}
        subscriptionToEdit={editingSub}
      />

      {/* Import / Export Modal (JSON & CSV with formula injection neutralization) */}
      <ExportImportModal
        isOpen={isDataModalOpen}
        onClose={() => setIsDataModalOpen(false)}
        subscriptions={subscriptions}
        onImportSuccess={handleImportSuccess}
      />

      {/* Accessible Confirmation Modal */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title={confirmDialog.title}
        message={confirmDialog.message}
        confirmLabel={confirmDialog.confirmLabel}
        onConfirm={confirmDialog.onConfirm}
        onCancel={() => setConfirmDialog((prev) => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
};

export default App;

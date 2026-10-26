'use client';

import React, { useState, useEffect } from 'react';
import { Header } from '@/components/Header';
import { SummaryCards } from '@/components/SummaryCards';
import { ActionButtons } from '@/components/ActionButtons';
import { TransactionList } from '@/components/TransactionList';
import { TransactionModal } from '@/components/TransactionModal';
import { DebtBookModal } from '@/components/DebtBookModal';
import { WhatsAppShareModal } from '@/components/WhatsAppShareModal';
import { StoreSwitcherModal } from '@/components/StoreSwitcherModal';
import { LocalStore } from '@/lib/storage';
import {
  TransactionItem,
  DebtItem,
  StoreProfile,
  CategoryItem,
  TransactionType,
  TransactionScope,
  DateFilter,
} from '@/lib/types';
import { getTodayDateString, formatDateRangeLabel } from '@/lib/formatters';
import { exportTransactionsToExcel } from '@/lib/excel';

export default function BukuKasirHome() {
  const [stores, setStores] = useState<StoreProfile[]>([]);
  const [activeStore, setActiveStore] = useState<StoreProfile>({
    id: 'store-utama',
    storeName: 'Toko Berkah Saya',
    ownerName: 'Pemilik',
    businessType: 'WARUNG',
    createdAt: '2026-01-01',
  });

  const [dateFilter, setDateFilter] = useState<DateFilter>({
    mode: 'TODAY',
    startDate: '',
    endDate: '',
  });

  const [transactions, setTransactions] = useState<TransactionItem[]>([]);
  const [debts, setDebts] = useState<DebtItem[]>([]);
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [scopeFilter, setScopeFilter] = useState<'ALL' | 'BUSINESS' | 'PERSONAL'>('ALL');

  // Modals state
  const [modalType, setModalType] = useState<TransactionType | null>(null);
  const [isDebtsOpen, setIsDebtsOpen] = useState<boolean>(false);
  const [isWhatsAppOpen, setIsWhatsAppOpen] = useState<boolean>(false);
  const [isStoreSwitcherOpen, setIsStoreSwitcherOpen] = useState<boolean>(false);

  // Load stores & data on client mount
  useEffect(() => {
    const today = getTodayDateString();
    setDateFilter({
      mode: 'TODAY',
      startDate: today,
      endDate: today,
    });

    const storeList = LocalStore.getStores();
    setStores(storeList);

    const active = LocalStore.getActiveStore();
    setActiveStore(active);

    setTransactions(LocalStore.getTransactions(active.id));
    setDebts(LocalStore.getDebts(active.id));
    setCategories(LocalStore.getCategories());
  }, []);

  // Filter items by Date Range & Scope
  const filteredByDateTransactions = transactions.filter((t) => {
    if (!dateFilter.startDate || !dateFilter.endDate) return true;
    return t.date >= dateFilter.startDate && t.date <= dateFilter.endDate;
  });

  const displayedTransactions = filteredByDateTransactions.filter((t) => {
    if (scopeFilter === 'ALL') return true;
    if (t.type === 'IN') return true;
    return t.scope === scopeFilter;
  });

  // Calculate totals for selected period
  let totalIn = 0;
  let totalOutBusiness = 0;
  let totalOutPersonal = 0;

  filteredByDateTransactions.forEach((t) => {
    if (t.type === 'IN') {
      totalIn += t.amount;
    } else if (t.scope === 'BUSINESS') {
      totalOutBusiness += t.amount;
    } else {
      totalOutPersonal += t.amount;
    }
  });

  const unpaidDebtCount = debts.filter((d) => d.status !== 'LUNAS').length;

  // Handlers for Store Switching
  const handleSelectStore = (storeId: string) => {
    LocalStore.setActiveStoreId(storeId);
    const store = stores.find((s) => s.id === storeId) || LocalStore.getActiveStore();
    setActiveStore(store);
    setTransactions(LocalStore.getTransactions(storeId));
    setDebts(LocalStore.getDebts(storeId));
  };

  const handleCreateStore = (data: {
    storeName: string;
    ownerName?: string;
    businessType: string;
    phone?: string;
    pin?: string;
  }) => {
    const newStore = LocalStore.createStore(data);
    const updatedStores = LocalStore.getStores();
    setStores(updatedStores);
    setActiveStore(newStore);
    setTransactions(LocalStore.getTransactions(newStore.id));
    setDebts(LocalStore.getDebts(newStore.id));
  };

  const handleDeleteStore = (storeId: string) => {
    LocalStore.deleteStore(storeId);
    const updatedStores = LocalStore.getStores();
    setStores(updatedStores);
    const newActive = LocalStore.getActiveStore();
    setActiveStore(newActive);
    setTransactions(LocalStore.getTransactions(newActive.id));
    setDebts(LocalStore.getDebts(newActive.id));
  };

  // Handlers for Transactions
  const handleSaveTransaction = (data: {
    type: TransactionType;
    scope: TransactionScope;
    amount: number;
    categoryName: string;
    note: string;
    date: string;
    paymentMethod: 'TUNAI' | 'TRANSFER' | 'QRIS';
  }) => {
    const newItem: TransactionItem = {
      id: 'tx-' + Date.now(),
      storeId: activeStore.id,
      type: data.type,
      scope: data.scope,
      amount: data.amount,
      categoryName: data.categoryName,
      note: data.note,
      date: data.date,
      paymentMethod: data.paymentMethod,
      createdAt: new Date().toISOString(),
    };

    const updated = [newItem, ...transactions];
    setTransactions(updated);
    LocalStore.saveTransactions(updated, activeStore.id);

    // If transaction date is outside current view range, adjust range so user sees what was just saved
    if (data.date < dateFilter.startDate || data.date > dateFilter.endDate) {
      setDateFilter({
        mode: 'CUSTOM',
        startDate: data.date,
        endDate: data.date,
      });
    }
  };

  const handleDeleteTransaction = (id: string) => {
    const updated = transactions.filter((t) => t.id !== id);
    setTransactions(updated);
    LocalStore.saveTransactions(updated, activeStore.id);
  };

  // Handlers for Debts
  const handleSaveDebt = (debtData: Omit<DebtItem, 'id' | 'createdAt' | 'status' | 'paidAmount'>) => {
    const newDebt: DebtItem = {
      ...debtData,
      id: 'debt-' + Date.now(),
      storeId: activeStore.id,
      paidAmount: 0,
      status: 'BELUM_LUNAS',
      createdAt: new Date().toISOString(),
    };
    const updated = [newDebt, ...debts];
    setDebts(updated);
    LocalStore.saveDebts(updated, activeStore.id);
  };

  const handlePayDebt = (id: string, amount: number) => {
    const updated = debts.map((d) => {
      if (d.id === id) {
        const curPaid = (d.paidAmount || 0) + amount;
        return {
          ...d,
          paidAmount: curPaid,
          status: curPaid >= d.amount ? ('LUNAS' as const) : ('SEBAGIAN' as const),
        };
      }
      return d;
    });
    setDebts(updated);
    LocalStore.saveDebts(updated, activeStore.id);
  };

  const handleDeleteDebt = (id: string) => {
    const updated = debts.filter((d) => d.id !== id);
    setDebts(updated);
    LocalStore.saveDebts(updated, activeStore.id);
  };

  const handleExportExcel = () => {
    exportTransactionsToExcel(
      activeStore.storeName,
      filteredByDateTransactions,
      dateFilter.startDate,
      dateFilter.endDate
    );
  };

  return (
    <main className="min-h-screen bg-slate-100 text-slate-900 pb-28">
      {/* Top Header */}
      <Header
        activeStore={activeStore}
        dateFilter={dateFilter}
        onChangeDateFilter={setDateFilter}
        onOpenStoreSwitcher={() => setIsStoreSwitcherOpen(true)}
        onOpenWhatsApp={() => setIsWhatsAppOpen(true)}
        onExportExcel={handleExportExcel}
        onOpenDebts={() => setIsDebtsOpen(true)}
        debtCount={unpaidDebtCount}
      />

      {/* Main Container */}
      <div className="max-w-2xl mx-auto px-4 pt-4 space-y-4">
        {/* Ringkasan Keuangan Periode Ini */}
        <SummaryCards
          totalIn={totalIn}
          totalOutBusiness={totalOutBusiness}
          totalOutPersonal={totalOutPersonal}
          periodLabel={formatDateRangeLabel(dateFilter.startDate, dateFilter.endDate)}
          scopeFilter={scopeFilter}
          onFilterChange={setScopeFilter}
        />

        {/* Daftar Transaksi Sesuai Rentang Tanggal */}
        <TransactionList
          items={displayedTransactions}
          selectedDate={dateFilter.startDate}
          onDeleteItem={handleDeleteTransaction}
        />
      </div>

      {/* Bottom Sticky Action Buttons */}
      <ActionButtons
        onAddIncome={() => setModalType('IN')}
        onAddExpense={() => setModalType('OUT')}
      />

      {/* Modals */}
      <TransactionModal
        isOpen={modalType !== null}
        type={modalType || 'IN'}
        categories={categories}
        selectedDate={dateFilter.endDate || dateFilter.startDate || ''}
        onClose={() => setModalType(null)}
        onSave={handleSaveTransaction}
      />

      <DebtBookModal
        isOpen={isDebtsOpen}
        storeName={activeStore.storeName}
        debts={debts}
        onClose={() => setIsDebtsOpen(false)}
        onSaveDebt={handleSaveDebt}
        onPayDebt={handlePayDebt}
        onDeleteDebt={handleDeleteDebt}
      />

      <WhatsAppShareModal
        isOpen={isWhatsAppOpen}
        storeName={activeStore.storeName}
        startDate={dateFilter.startDate}
        endDate={dateFilter.endDate}
        transactions={filteredByDateTransactions}
        onClose={() => setIsWhatsAppOpen(false)}
      />

      <StoreSwitcherModal
        isOpen={isStoreSwitcherOpen}
        stores={stores}
        activeStoreId={activeStore.id}
        onClose={() => setIsStoreSwitcherOpen(false)}
        onSelectStore={handleSelectStore}
        onCreateStore={handleCreateStore}
        onDeleteStore={handleDeleteStore}
        onSyncCloud={() => {}}
      />
    </main>
  );
}

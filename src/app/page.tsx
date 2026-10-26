'use client';

import React, { useState, useEffect } from 'react';
import { Header } from '@/components/Header';
import { SummaryCards } from '@/components/SummaryCards';
import { ActionButtons } from '@/components/ActionButtons';
import { TransactionList } from '@/components/TransactionList';
import { TransactionModal } from '@/components/TransactionModal';
import { DebtBookModal } from '@/components/DebtBookModal';
import { WhatsAppShareModal } from '@/components/WhatsAppShareModal';
import { ProfileModal } from '@/components/ProfileModal';
import { LocalStore } from '@/lib/storage';
import { TransactionItem, DebtItem, UserProfile, CategoryItem, TransactionType, TransactionScope } from '@/lib/types';
import { getTodayDateString, getYesterdayDateString } from '@/lib/formatters';
import { exportTransactionsToExcel } from '@/lib/excel';

export default function BukuKasirHome() {
  const [profile, setProfile] = useState<UserProfile>({
    storeName: 'Toko Berkah Saya',
    ownerName: 'Pemilik',
    businessType: 'WARUNG',
  });
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [todayDate, setTodayDate] = useState<string>('');
  const [yesterdayDate, setYesterdayDate] = useState<string>('');
  const [isMounted, setIsMounted] = useState<boolean>(false);
  const [transactions, setTransactions] = useState<TransactionItem[]>([]);
  const [debts, setDebts] = useState<DebtItem[]>([]);
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [scopeFilter, setScopeFilter] = useState<'ALL' | 'BUSINESS' | 'PERSONAL'>('ALL');

  // Modals state
  const [modalType, setModalType] = useState<TransactionType | null>(null);
  const [isDebtsOpen, setIsDebtsOpen] = useState<boolean>(false);
  const [isWhatsAppOpen, setIsWhatsAppOpen] = useState<boolean>(false);
  const [isProfileOpen, setIsProfileOpen] = useState<boolean>(false);

  // Load from local store on mount (client-safe)
  useEffect(() => {
    const today = getTodayDateString();
    const yesterday = getYesterdayDateString();
    setTodayDate(today);
    setYesterdayDate(yesterday);
    setSelectedDate(today);
    setProfile(LocalStore.getProfile());
    setTransactions(LocalStore.getTransactions());
    setDebts(LocalStore.getDebts());
    setCategories(LocalStore.getCategories());
    setIsMounted(true);
  }, []);

  // Filter items by date & scope
  const dateTransactions = transactions.filter((t) => t.date === selectedDate);
  const displayedTransactions = dateTransactions.filter((t) => {
    if (scopeFilter === 'ALL') return true;
    if (t.type === 'IN') return true;
    return t.scope === scopeFilter;
  });

  // Calculate totals for selected date
  let totalIn = 0;
  let totalOutBusiness = 0;
  let totalOutPersonal = 0;

  dateTransactions.forEach((t) => {
    if (t.type === 'IN') {
      totalIn += t.amount;
    } else if (t.scope === 'BUSINESS') {
      totalOutBusiness += t.amount;
    } else {
      totalOutPersonal += t.amount;
    }
  });

  const unpaidDebtCount = debts.filter((d) => d.status !== 'LUNAS').length;

  // Handlers
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
    LocalStore.saveTransactions(updated);

    // If transaction date is different from selectedDate, auto-switch view to that date so user sees it
    if (data.date !== selectedDate) {
      setSelectedDate(data.date);
    }
  };

  const handleDeleteTransaction = (id: string) => {
    const updated = transactions.filter((t) => t.id !== id);
    setTransactions(updated);
    LocalStore.saveTransactions(updated);
  };

  const handleSaveDebt = (debtData: Omit<DebtItem, 'id' | 'createdAt' | 'status' | 'paidAmount'>) => {
    const newDebt: DebtItem = {
      ...debtData,
      id: 'debt-' + Date.now(),
      paidAmount: 0,
      status: 'BELUM_LUNAS',
      createdAt: new Date().toISOString(),
    };
    const updated = [newDebt, ...debts];
    setDebts(updated);
    LocalStore.saveDebts(updated);
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
    LocalStore.saveDebts(updated);
  };

  const handleDeleteDebt = (id: string) => {
    const updated = debts.filter((d) => d.id !== id);
    setDebts(updated);
    LocalStore.saveDebts(updated);
  };

  const handleSaveProfile = (newProfile: UserProfile) => {
    setProfile(newProfile);
    LocalStore.saveProfile(newProfile);
  };

  const handleExportExcel = () => {
    exportTransactionsToExcel(profile.storeName, transactions);
  };

  return (
    <main className="min-h-screen bg-slate-100 text-slate-900 pb-28">
      {/* Top Header */}
      <Header
        profile={profile}
        selectedDate={selectedDate || todayDate}
        todayDate={todayDate}
        yesterdayDate={yesterdayDate}
        onSelectDate={setSelectedDate}
        onOpenProfile={() => setIsProfileOpen(true)}
        onOpenWhatsApp={() => setIsWhatsAppOpen(true)}
        onExportExcel={handleExportExcel}
        onOpenDebts={() => setIsDebtsOpen(true)}
        debtCount={unpaidDebtCount}
      />

      {/* Main Container */}
      <div className="max-w-2xl mx-auto px-4 pt-4 space-y-4">
        {/* Ringkasan Keuangan */}
        <SummaryCards
          totalIn={totalIn}
          totalOutBusiness={totalOutBusiness}
          totalOutPersonal={totalOutPersonal}
          scopeFilter={scopeFilter}
          onFilterChange={setScopeFilter}
        />

        {/* Daftar Transaksi */}
        <TransactionList
          items={displayedTransactions}
          selectedDate={selectedDate}
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
        selectedDate={selectedDate}
        onClose={() => setModalType(null)}
        onSave={handleSaveTransaction}
      />

      <DebtBookModal
        isOpen={isDebtsOpen}
        storeName={profile.storeName}
        debts={debts}
        onClose={() => setIsDebtsOpen(false)}
        onSaveDebt={handleSaveDebt}
        onPayDebt={handlePayDebt}
        onDeleteDebt={handleDeleteDebt}
      />

      <WhatsAppShareModal
        isOpen={isWhatsAppOpen}
        storeName={profile.storeName}
        selectedDate={selectedDate}
        transactions={transactions}
        onClose={() => setIsWhatsAppOpen(false)}
      />

      <ProfileModal
        isOpen={isProfileOpen}
        profile={profile}
        onClose={() => setIsProfileOpen(false)}
        onSave={handleSaveProfile}
      />
    </main>
  );
}

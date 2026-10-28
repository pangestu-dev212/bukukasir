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
import { ProfileModal } from '@/components/ProfileModal';
import { AuthScreen } from '@/components/AuthScreen';
import { LocalStore } from '@/lib/storage';
import {
  TransactionItem,
  DebtItem,
  StoreProfile,
  CategoryItem,
  TransactionType,
  TransactionScope,
  DateFilter,
  UserAccount,
  UserProfile,
} from '@/lib/types';
import { getTodayDateString, formatDateRangeLabel } from '@/lib/formatters';
import { exportTransactionsToExcel } from '@/lib/excel';

export default function BukuKasirHome() {
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(null);
  const [isClientLoaded, setIsClientLoaded] = useState<boolean>(false);

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
  const [isProfileModalOpen, setIsProfileModalOpen] = useState<boolean>(false);
  const [storeToEdit, setStoreToEdit] = useState<StoreProfile | null>(null);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);

  // Load user session on mount
  useEffect(() => {
    const today = getTodayDateString();
    setDateFilter({
      mode: 'TODAY',
      startDate: today,
      endDate: today,
    });
    setCategories(LocalStore.getCategories());

    const user = LocalStore.getCurrentUser();
    if (user) {
      setCurrentUser(user);
      loadTenantData(user);
    }
    setIsClientLoaded(true);
  }, []);

  // Helper sinkronisasi data ke Cloud Supabase
  const triggerCloudSync = async (
    targetUser?: UserAccount | null,
    targetStore?: StoreProfile,
    txList?: TransactionItem[],
    debtList?: DebtItem[]
  ) => {
    const user = targetUser !== undefined ? targetUser : currentUser;
    if (!user) return;

    const store = targetStore || activeStore;
    const curTx = txList || transactions;
    const curDebts = debtList || debts;

    setIsSyncing(true);
    try {
      await fetch('/api/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          username: user.username,
          profile: store,
          transactions: curTx,
          debts: curDebts,
        }),
      });
    } catch (err) {
      console.warn('Sync to cloud offline/failed:', err);
    } finally {
      setIsSyncing(false);
    }
  };

  // Helper untuk memuat data toko & transaksi sesuai user aktif
  const loadTenantData = (user: UserAccount) => {
    const storeList = LocalStore.getStores();
    setStores(storeList);

    const active = LocalStore.getActiveStore();
    setActiveStore(active);

    const localTx = LocalStore.getTransactions(active.id);
    const localDebts = LocalStore.getDebts(active.id);
    setTransactions(localTx);
    setDebts(localDebts);

    // Ambil data terbaru dari Cloud Supabase jika pengguna terdaftar
    if (user && (user.id || user.username)) {
      setIsSyncing(true);
      fetch(`/api/sync?userId=${user.id}&username=${user.username}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.success && (data.transactions || data.debts)) {
            const cloudTx: TransactionItem[] = data.transactions || [];
            const cloudDebts: DebtItem[] = data.debts || [];

            // Gabungkan transaksi
            const existingTxMap = new Map(localTx.map((t) => [t.id, t]));
            cloudTx.forEach((t) => {
              if (!existingTxMap.has(t.id)) existingTxMap.set(t.id, t);
            });
            const mergedTx = Array.from(existingTxMap.values()).sort(
              (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
            );

            // Gabungkan kasbon
            const existingDebtMap = new Map(localDebts.map((d) => [d.id, d]));
            cloudDebts.forEach((d) => {
              if (!existingDebtMap.has(d.id)) existingDebtMap.set(d.id, d);
            });
            const mergedDebts = Array.from(existingDebtMap.values());

            setTransactions(mergedTx);
            setDebts(mergedDebts);
            LocalStore.saveTransactions(mergedTx, active.id);
            LocalStore.saveDebts(mergedDebts, active.id);

            // Jika ada data di lokal yang belum masuk cloud, sinkronkan balik
            if (localTx.length > cloudTx.length || localDebts.length > cloudDebts.length) {
              triggerCloudSync(user, active, mergedTx, mergedDebts);
            }
          }
        })
        .catch((err) => console.warn('Fetch cloud data error:', err))
        .finally(() => setIsSyncing(false));
    }
  };

  // Handler saat login / register sukses
  const handleLoginSuccess = (user: UserAccount) => {
    setCurrentUser(user);
    loadTenantData(user);
  };

  // Handler Logout
  const handleLogout = () => {
    if (confirm(`Yakin ingin keluar dari akun "${currentUser?.username || 'admin'}"?`)) {
      LocalStore.logout();
      setCurrentUser(null);
    }
  };

  // Handlers for Store Edit
  const handleOpenEditActiveStore = () => {
    setStoreToEdit(activeStore);
    setIsProfileModalOpen(true);
  };

  const handleOpenEditStoreFromList = (store: StoreProfile) => {
    setStoreToEdit(store);
    setIsStoreSwitcherOpen(false);
    setIsProfileModalOpen(true);
  };

  const handleSaveStoreEdit = (updatedData: UserProfile) => {
    const targetId = storeToEdit ? storeToEdit.id : activeStore.id;
    const updated = LocalStore.updateStore(targetId, {
      storeName: updatedData.storeName,
      ownerName: updatedData.ownerName,
      businessType: updatedData.businessType,
    });

    const updatedStores = LocalStore.getStores();
    setStores(updatedStores);

    if (targetId === activeStore.id && updated) {
      setActiveStore(updated);
    }

    // Sinkronisasi update ke backend jika ada
    if (currentUser && currentUser.id) {
      fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update_store',
          userId: currentUser.id,
          storeName: updatedData.storeName,
          ownerName: updatedData.ownerName,
          businessType: updatedData.businessType,
        }),
      }).catch(() => {});
    }

    setIsProfileModalOpen(false);
    setStoreToEdit(null);
  };

  // Handlers for Categories
  const handleAddCategory = (data: { name: string; type: TransactionType; scope: TransactionScope }) => {
    LocalStore.addCategory(data);
    setCategories(LocalStore.getCategories());
  };

  // Filter items by Date Range & Scope
  const filteredByDateTransactions = transactions.filter((t) => {
    if (!dateFilter.startDate || !dateFilter.endDate) return true;
    return t.date >= dateFilter.startDate && t.date <= dateFilter.endDate;
  });

  const displayedTransactions = filteredByDateTransactions.filter((t) => {
    if (scopeFilter === 'ALL') return true;
    return t.scope === scopeFilter;
  });

  // Calculate totals for selected period (Toko vs Pribadi)
  let totalInBusiness = 0;
  let totalInPersonal = 0;
  let totalOutBusiness = 0;
  let totalOutPersonal = 0;

  filteredByDateTransactions.forEach((t) => {
    if (t.type === 'IN') {
      if (t.scope === 'PERSONAL') {
        totalInPersonal += t.amount;
      } else {
        totalInBusiness += t.amount;
      }
    } else {
      if (t.scope === 'PERSONAL') {
        totalOutPersonal += t.amount;
      } else {
        totalOutBusiness += t.amount;
      }
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
    triggerCloudSync(currentUser, activeStore, updated, debts);

    // Adjust date filter if transaction is outside view range
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
    triggerCloudSync(currentUser, activeStore, updated, debts);
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
    triggerCloudSync(currentUser, activeStore, transactions, updated);
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
    triggerCloudSync(currentUser, activeStore, transactions, updated);
  };

  const handleDeleteDebt = (id: string) => {
    const updated = debts.filter((d) => d.id !== id);
    setDebts(updated);
    LocalStore.saveDebts(updated, activeStore.id);
    triggerCloudSync(currentUser, activeStore, transactions, updated);
  };

  const handleExportExcel = () => {
    exportTransactionsToExcel(
      activeStore.storeName,
      filteredByDateTransactions,
      dateFilter.startDate,
      dateFilter.endDate
    );
  };

  // Jika halaman sedang loading di client, tampilkan skeleton ringkas
  if (!isClientLoaded) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center text-emerald-400 font-bold">
        Memuat BukuKasir...
      </div>
    );
  }

  // Jika belum login, tampilkan layar Login / Registrasi Mandiri
  if (!currentUser) {
    return <AuthScreen onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-100 via-slate-50 to-slate-100 text-slate-900 pb-28">
      {/* Top Header */}
      <Header
        activeStore={activeStore}
        currentUser={currentUser}
        dateFilter={dateFilter}
        onChangeDateFilter={setDateFilter}
        onOpenStoreSwitcher={() => setIsStoreSwitcherOpen(true)}
        onEditActiveStore={handleOpenEditActiveStore}
        onOpenWhatsApp={() => setIsWhatsAppOpen(true)}
        onExportExcel={handleExportExcel}
        onOpenDebts={() => setIsDebtsOpen(true)}
        onLogout={handleLogout}
        debtCount={unpaidDebtCount}
        isSyncing={isSyncing}
        onTriggerSync={() => triggerCloudSync()}
      />

      {/* Main Container */}
      <div className="max-w-2xl mx-auto px-4 pt-4 space-y-4">
        {/* Ringkasan Keuangan Periode Ini */}
        <SummaryCards
          totalInBusiness={totalInBusiness}
          totalInPersonal={totalInPersonal}
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
        onAddCategory={handleAddCategory}
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
        onEditStore={handleOpenEditStoreFromList}
        onCreateStore={handleCreateStore}
        onDeleteStore={handleDeleteStore}
        onSyncCloud={() => {}}
      />

      {/* Modal Edit Nama Toko & Profil Usaha */}
      <ProfileModal
        isOpen={isProfileModalOpen}
        profile={storeToEdit || activeStore}
        onClose={() => {
          setIsProfileModalOpen(false);
          setStoreToEdit(null);
        }}
        onSave={handleSaveStoreEdit}
      />
    </main>
  );
}

import { TransactionItem, DebtItem, UserProfile, DEFAULT_CATEGORIES, CategoryItem } from './types';

const STORAGE_KEY_PREFIX = 'bukukasir_v1_';

export const LocalStore = {
  getProfile(): UserProfile {
    if (typeof window === 'undefined') {
      return { storeName: 'Toko Berkah Saya', ownerName: 'Pemilik', businessType: 'WARUNG' };
    }
    const raw = localStorage.getItem(STORAGE_KEY_PREFIX + 'profile');
    if (!raw) {
      const defaultProf: UserProfile = { storeName: 'Toko Berkah Saya', ownerName: 'Pemilik', businessType: 'WARUNG' };
      localStorage.setItem(STORAGE_KEY_PREFIX + 'profile', JSON.stringify(defaultProf));
      return defaultProf;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return { storeName: 'Toko Berkah Saya', ownerName: 'Pemilik', businessType: 'WARUNG' };
    }
  },

  saveProfile(profile: UserProfile): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEY_PREFIX + 'profile', JSON.stringify(profile));
  },

  getTransactions(): TransactionItem[] {
    if (typeof window === 'undefined') return [];
    const raw = localStorage.getItem(STORAGE_KEY_PREFIX + 'transactions');
    if (!raw) {
      // Data sampel awal agar user 35+ langsung paham begitu buka aplikasi
      const sampleDate = new Date().toISOString().split('T')[0];
      const initialSample: TransactionItem[] = [
        {
          id: 'sample-1',
          type: 'IN',
          scope: 'BUSINESS',
          amount: 350000,
          categoryName: 'Penjualan / Kasir',
          note: 'Penjualan pagi - siang',
          date: sampleDate,
          paymentMethod: 'TUNAI',
          createdAt: new Date().toISOString(),
        },
        {
          id: 'sample-2',
          type: 'OUT',
          scope: 'BUSINESS',
          amount: 150000,
          categoryName: 'Kulakan / Belanja Stok',
          note: 'Beli minyak goreng & telur',
          date: sampleDate,
          paymentMethod: 'TUNAI',
          createdAt: new Date().toISOString(),
        },
        {
          id: 'sample-3',
          type: 'OUT',
          scope: 'PERSONAL',
          amount: 35000,
          categoryName: 'Belanja Dapur & Makan',
          note: 'Beli lauk makan siang keluarga',
          date: sampleDate,
          paymentMethod: 'TUNAI',
          createdAt: new Date().toISOString(),
        },
      ];
      localStorage.setItem(STORAGE_KEY_PREFIX + 'transactions', JSON.stringify(initialSample));
      return initialSample;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return [];
    }
  },

  saveTransactions(items: TransactionItem[]): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEY_PREFIX + 'transactions', JSON.stringify(items));
  },

  getDebts(): DebtItem[] {
    if (typeof window === 'undefined') return [];
    const raw = localStorage.getItem(STORAGE_KEY_PREFIX + 'debts');
    if (!raw) {
      const initialDebts: DebtItem[] = [
        {
          id: 'debt-sample-1',
          personName: 'Bu Joko (Tetangga Depan)',
          personPhone: '081234567890',
          type: 'RECEIVABLE', // Orang Kasbon
          amount: 75000,
          paidAmount: 0,
          note: 'Kasbon beras 5kg & gula 1kg',
          status: 'BELUM_LUNAS',
          createdAt: new Date().toISOString(),
        },
      ];
      localStorage.setItem(STORAGE_KEY_PREFIX + 'debts', JSON.stringify(initialDebts));
      return initialDebts;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return [];
    }
  },

  saveDebts(debts: DebtItem[]): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEY_PREFIX + 'debts', JSON.stringify(debts));
  },

  getCategories(): CategoryItem[] {
    if (typeof window === 'undefined') return DEFAULT_CATEGORIES;
    const raw = localStorage.getItem(STORAGE_KEY_PREFIX + 'categories');
    if (!raw) {
      localStorage.setItem(STORAGE_KEY_PREFIX + 'categories', JSON.stringify(DEFAULT_CATEGORIES));
      return DEFAULT_CATEGORIES;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return DEFAULT_CATEGORIES;
    }
  },
};

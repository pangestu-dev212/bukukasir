import { TransactionItem, DebtItem, StoreProfile, DEFAULT_CATEGORIES, CategoryItem } from './types';

const STORAGE_PREFIX = 'bukukasir_v2_';

export const LocalStore = {
  // --- MULTI-TOKO (STORE PROFILES) ---
  getStores(): StoreProfile[] {
    if (typeof window === 'undefined') return [];
    const raw = localStorage.getItem(STORAGE_PREFIX + 'stores');
    if (!raw) {
      // Cek apakah ada profil v1 lama
      const oldRaw = localStorage.getItem('bukukasir_v1_profile');
      let defaultName = 'Toko Berkah Saya';
      let defaultOwner = 'Pemilik';
      let defaultType = 'WARUNG';
      if (oldRaw) {
        try {
          const old = JSON.parse(oldRaw);
          if (old.storeName) defaultName = old.storeName;
          if (old.ownerName) defaultOwner = old.ownerName;
          if (old.businessType) defaultType = old.businessType;
        } catch {}
      }

      const initialStores: StoreProfile[] = [
        {
          id: 'store-utama',
          storeName: defaultName,
          ownerName: defaultOwner,
          businessType: defaultType,
          createdAt: new Date().toISOString(),
        },
      ];
      localStorage.setItem(STORAGE_PREFIX + 'stores', JSON.stringify(initialStores));
      localStorage.setItem(STORAGE_PREFIX + 'active_store_id', 'store-utama');
      return initialStores;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return [];
    }
  },

  saveStores(stores: StoreProfile[]): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_PREFIX + 'stores', JSON.stringify(stores));
  },

  getActiveStoreId(): string {
    if (typeof window === 'undefined') return 'store-utama';
    const active = localStorage.getItem(STORAGE_PREFIX + 'active_store_id');
    if (active) return active;
    const stores = this.getStores();
    return stores[0]?.id || 'store-utama';
  },

  setActiveStoreId(id: string): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_PREFIX + 'active_store_id', id);
  },

  getActiveStore(): StoreProfile {
    const stores = this.getStores();
    const activeId = this.getActiveStoreId();
    const found = stores.find((s) => s.id === activeId);
    if (found) return found;
    if (stores.length > 0) return stores[0];
    return {
      id: 'store-utama',
      storeName: 'Toko Berkah Saya',
      ownerName: 'Pemilik',
      businessType: 'WARUNG',
      createdAt: new Date().toISOString(),
    };
  },

  createStore(data: { storeName: string; ownerName?: string; businessType: string; phone?: string; pin?: string }): StoreProfile {
    const stores = this.getStores();
    const newStore: StoreProfile = {
      id: 'store-' + Date.now(),
      storeName: data.storeName.trim(),
      ownerName: data.ownerName?.trim() || undefined,
      businessType: data.businessType,
      phone: data.phone?.trim() || undefined,
      pin: data.pin?.trim() || undefined,
      createdAt: new Date().toISOString(),
    };
    const updated = [...stores, newStore];
    this.saveStores(updated);
    this.setActiveStoreId(newStore.id);
    return newStore;
  },

  updateStore(id: string, data: Partial<StoreProfile>): void {
    const stores = this.getStores();
    const updated = stores.map((s) => (s.id === id ? { ...s, ...data } : s));
    this.saveStores(updated);
  },

  deleteStore(id: string): void {
    const stores = this.getStores();
    if (stores.length <= 1) {
      alert('Tidak bisa menghapus satu-satunya buku toko yang aktif.');
      return;
    }
    const filtered = stores.filter((s) => s.id !== id);
    this.saveStores(filtered);
    this.setActiveStoreId(filtered[0].id);
    // Bersihkan data transaksi toko tersebut
    localStorage.removeItem(STORAGE_PREFIX + 'transactions_' + id);
    localStorage.removeItem(STORAGE_PREFIX + 'debts_' + id);
  },

  // --- TRANSAKSI PER TOKO ---
  getTransactions(storeId?: string): TransactionItem[] {
    if (typeof window === 'undefined') return [];
    const sid = storeId || this.getActiveStoreId();
    const key = STORAGE_PREFIX + 'transactions_' + sid;
    const raw = localStorage.getItem(key);

    if (!raw) {
      // Jika store-utama, periksa apakah ada data v1 yang bisa dimigrasi
      if (sid === 'store-utama') {
        const v1Raw = localStorage.getItem('bukukasir_v1_transactions');
        if (v1Raw) {
          try {
            const v1Items = JSON.parse(v1Raw);
            localStorage.setItem(key, JSON.stringify(v1Items));
            return v1Items;
          } catch {}
        }
      }

      // Sampel awal jika baru
      const sampleDate = new Date().toISOString().split('T')[0];
      const initialSample: TransactionItem[] = [
        {
          id: 'sample-1',
          storeId: sid,
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
          storeId: sid,
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
          storeId: sid,
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
      localStorage.setItem(key, JSON.stringify(initialSample));
      return initialSample;
    }

    try {
      return JSON.parse(raw);
    } catch {
      return [];
    }
  },

  saveTransactions(items: TransactionItem[], storeId?: string): void {
    if (typeof window === 'undefined') return;
    const sid = storeId || this.getActiveStoreId();
    localStorage.setItem(STORAGE_PREFIX + 'transactions_' + sid, JSON.stringify(items));
  },

  // --- KASBON & UTANG PER TOKO ---
  getDebts(storeId?: string): DebtItem[] {
    if (typeof window === 'undefined') return [];
    const sid = storeId || this.getActiveStoreId();
    const key = STORAGE_PREFIX + 'debts_' + sid;
    const raw = localStorage.getItem(key);

    if (!raw) {
      if (sid === 'store-utama') {
        const v1Debts = localStorage.getItem('bukukasir_v1_debts');
        if (v1Debts) {
          try {
            const parsed = JSON.parse(v1Debts);
            localStorage.setItem(key, JSON.stringify(parsed));
            return parsed;
          } catch {}
        }
      }
      const initialDebts: DebtItem[] = [
        {
          id: 'debt-sample-1',
          storeId: sid,
          personName: 'Bu Joko (Tetangga Depan)',
          personPhone: '081234567890',
          type: 'RECEIVABLE',
          amount: 75000,
          paidAmount: 0,
          note: 'Kasbon beras 5kg & gula 1kg',
          status: 'BELUM_LUNAS',
          createdAt: new Date().toISOString(),
        },
      ];
      localStorage.setItem(key, JSON.stringify(initialDebts));
      return initialDebts;
    }

    try {
      return JSON.parse(raw);
    } catch {
      return [];
    }
  },

  saveDebts(debts: DebtItem[], storeId?: string): void {
    if (typeof window === 'undefined') return;
    const sid = storeId || this.getActiveStoreId();
    localStorage.setItem(STORAGE_PREFIX + 'debts_' + sid, JSON.stringify(debts));
  },

  getCategories(): CategoryItem[] {
    return DEFAULT_CATEGORIES;
  },
};

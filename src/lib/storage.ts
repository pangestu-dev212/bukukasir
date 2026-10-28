import { TransactionItem, DebtItem, StoreProfile, DEFAULT_CATEGORIES, CategoryItem, UserAccount, TransactionType, TransactionScope } from './types';
import { getTodayDateString } from './formatters';

const STORAGE_PREFIX = 'bukukasir_v2_';

const DEFAULT_ADMIN: UserAccount = {
  id: 'tenant-admin',
  username: 'admin',
  password: 'admin1234',
  name: 'Admin / Pemilik',
  storeName: 'Toko Berkah Saya',
  businessType: 'WARUNG',
  role: 'ADMIN',
  createdAt: '2026-01-01',
};

export const LocalStore = {
  // --- MULTI-USER & MULTI-TENANT ACCOUNTS ---
  getAccounts(): UserAccount[] {
    if (typeof window === 'undefined') return [DEFAULT_ADMIN];
    const raw = localStorage.getItem(STORAGE_PREFIX + 'accounts');
    if (!raw) {
      const initial = [DEFAULT_ADMIN];
      localStorage.setItem(STORAGE_PREFIX + 'accounts', JSON.stringify(initial));
      return initial;
    }
    try {
      const list = JSON.parse(raw);
      // Pastikan akun admin default selalu ada
      if (!list.some((a: UserAccount) => a.username.toLowerCase() === 'admin')) {
        list.unshift(DEFAULT_ADMIN);
        localStorage.setItem(STORAGE_PREFIX + 'accounts', JSON.stringify(list));
      }
      return list;
    } catch {
      return [DEFAULT_ADMIN];
    }
  },

  saveAccounts(accounts: UserAccount[]): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_PREFIX + 'accounts', JSON.stringify(accounts));
  },

  getCurrentUser(): UserAccount | null {
    if (typeof window === 'undefined') return null;
    const raw = localStorage.getItem(STORAGE_PREFIX + 'session_user');
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  },

  setCurrentUser(user: UserAccount | null): void {
    if (typeof window === 'undefined') return;
    if (user) {
      localStorage.setItem(STORAGE_PREFIX + 'session_user', JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_PREFIX + 'session_user');
    }
  },

  login(username: string, password: string): { success: boolean; error?: string; user?: UserAccount } {
    const cleanUser = username.trim().toLowerCase();
    const cleanPass = password.trim();

    const accounts = this.getAccounts();
    const found = accounts.find(
      (a) => a.username.toLowerCase() === cleanUser || (a.phone && a.phone === cleanUser)
    );

    if (!found) {
      return { success: false, error: 'Username atau No HP tidak ditemukan. Belum punya akun? Silakan daftar.' };
    }

    if (found.password !== cleanPass) {
      return { success: false, error: 'Password salah. Periksa kembali huruf besar/kecil.' };
    }

    this.setCurrentUser(found);
    return { success: true, user: found };
  },

  register(data: {
    username: string;
    password: string;
    name: string;
    storeName: string;
    businessType: string;
    phone?: string;
  }): { success: boolean; error?: string; user?: UserAccount } {
    const cleanUser = data.username.trim().toLowerCase();
    const accounts = this.getAccounts();

    if (accounts.some((a) => a.username.toLowerCase() === cleanUser)) {
      return { success: false, error: 'Username sudah digunakan. Silakan gunakan username lain.' };
    }

    const newId = 'tenant-' + Date.now();
    const newUser: UserAccount = {
      id: newId,
      username: cleanUser,
      password: data.password.trim(),
      name: data.name.trim(),
      storeName: data.storeName.trim(),
      businessType: data.businessType || 'WARUNG',
      phone: data.phone?.trim() || undefined,
      role: 'USER',
      createdAt: new Date().toISOString(),
    };

    const updatedAccounts = [...accounts, newUser];
    this.saveAccounts(updatedAccounts);

    // Siapkan toko bawaan pertama untuk tenant baru ini
    const initialStore: StoreProfile = {
      id: 'store-' + newId,
      storeName: data.storeName.trim(),
      ownerName: data.name.trim(),
      businessType: data.businessType || 'WARUNG',
      phone: data.phone?.trim() || undefined,
      createdAt: new Date().toISOString(),
    };

    const tenantPrefix = `${STORAGE_PREFIX}${newId}_`;
    localStorage.setItem(tenantPrefix + 'stores', JSON.stringify([initialStore]));
    localStorage.setItem(tenantPrefix + 'active_store_id', initialStore.id);

    // Set sample transaksi pertama untuk toko baru
    const today = getTodayDateString();
    const initialSample: TransactionItem[] = [
      {
        id: 'sample-' + Date.now(),
        storeId: initialStore.id,
        type: 'IN',
        scope: 'BUSINESS',
        amount: 100000,
        categoryName: 'Penjualan / Kasir',
        note: 'Modal awal / Penjualan pertama',
        date: today,
        paymentMethod: 'TUNAI',
        createdAt: new Date().toISOString(),
      },
    ];
    localStorage.setItem(tenantPrefix + 'transactions_' + initialStore.id, JSON.stringify(initialSample));
    localStorage.setItem(tenantPrefix + 'debts_' + initialStore.id, JSON.stringify([]));

    this.setCurrentUser(newUser);
    return { success: true, user: newUser };
  },

  logout(): void {
    this.setCurrentUser(null);
  },

  // Helper untuk prefix data per akun/tenant
  getTenantPrefix(): string {
    const user = this.getCurrentUser();
    if (user && user.id) {
      return `${STORAGE_PREFIX}${user.id}_`;
    }
    return STORAGE_PREFIX;
  },

  // --- MULTI-TOKO (STORE PROFILES) PER TENANT ---
  getStores(): StoreProfile[] {
    if (typeof window === 'undefined') return [];
    const prefix = this.getTenantPrefix();
    const raw = localStorage.getItem(prefix + 'stores');

    if (!raw) {
      const user = this.getCurrentUser();

      // Cek migrasi data toko admin lama
      if (user?.id === 'tenant-admin') {
        const legacyRaw = localStorage.getItem(STORAGE_PREFIX + 'stores');
        if (legacyRaw) {
          try {
            const parsed = JSON.parse(legacyRaw);
            localStorage.setItem(prefix + 'stores', legacyRaw);
            const activeId = localStorage.getItem(STORAGE_PREFIX + 'active_store_id') || 'store-utama';
            localStorage.setItem(prefix + 'active_store_id', activeId);
            return parsed;
          } catch {}
        }
      }

      let defaultName = user?.storeName || 'Toko Berkah Saya';
      let defaultOwner = user?.name || 'Pemilik';
      let defaultType = user?.businessType || 'WARUNG';

      const initialStores: StoreProfile[] = [
        {
          id: user ? 'store-' + user.id : 'store-utama',
          storeName: defaultName,
          ownerName: defaultOwner,
          businessType: defaultType,
          createdAt: new Date().toISOString(),
        },
      ];
      localStorage.setItem(prefix + 'stores', JSON.stringify(initialStores));
      localStorage.setItem(prefix + 'active_store_id', initialStores[0].id);
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
    const prefix = this.getTenantPrefix();
    localStorage.setItem(prefix + 'stores', JSON.stringify(stores));
  },

  getActiveStoreId(): string {
    if (typeof window === 'undefined') return 'store-utama';
    const prefix = this.getTenantPrefix();
    const active = localStorage.getItem(prefix + 'active_store_id');
    if (active) return active;
    const stores = this.getStores();
    return stores[0]?.id || 'store-utama';
  },

  setActiveStoreId(id: string): void {
    if (typeof window === 'undefined') return;
    const prefix = this.getTenantPrefix();
    localStorage.setItem(prefix + 'active_store_id', id);
  },

  getActiveStore(): StoreProfile {
    const stores = this.getStores();
    const activeId = this.getActiveStoreId();
    const found = stores.find((s) => s.id === activeId);
    if (found) return found;
    if (stores.length > 0) return stores[0];

    const user = this.getCurrentUser();
    return {
      id: user ? 'store-' + user.id : 'store-utama',
      storeName: user?.storeName || 'Toko Berkah Saya',
      ownerName: user?.name || 'Pemilik',
      businessType: user?.businessType || 'WARUNG',
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

  updateStore(id: string, data: Partial<StoreProfile>): StoreProfile | null {
    const stores = this.getStores();
    let updatedStore: StoreProfile | null = null;
    const updated = stores.map((s) => {
      if (s.id === id) {
        updatedStore = { ...s, ...data };
        return updatedStore;
      }
      return s;
    });
    this.saveStores(updated);

    // Update active user profile jika toko utama diedit
    const user = this.getCurrentUser();
    if (user && updatedStore) {
      const activeId = this.getActiveStoreId();
      if (id === activeId && (updatedStore as StoreProfile).storeName) {
        user.storeName = (updatedStore as StoreProfile).storeName;
        if (data.ownerName) user.name = data.ownerName;
        this.setCurrentUser(user);

        const accounts = this.getAccounts();
        const updatedAccounts = accounts.map((a) =>
          a.id === user.id
            ? { ...a, storeName: (updatedStore as StoreProfile).storeName, name: data.ownerName || a.name }
            : a
        );
        this.saveAccounts(updatedAccounts);
      }
    }

    return updatedStore;
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

    const prefix = this.getTenantPrefix();
    localStorage.removeItem(prefix + 'transactions_' + id);
    localStorage.removeItem(prefix + 'debts_' + id);
  },

  // --- TRANSAKSI PER TOKO ---
  getTransactions(storeId?: string): TransactionItem[] {
    if (typeof window === 'undefined') return [];
    const prefix = this.getTenantPrefix();
    const sid = storeId || this.getActiveStoreId();
    const key = prefix + 'transactions_' + sid;
    const raw = localStorage.getItem(key);

    if (!raw) {
      const user = this.getCurrentUser();
      // Migrasi data v2 lama untuk admin
      if (user?.id === 'tenant-admin') {
        const legacyKey = STORAGE_PREFIX + 'transactions_' + sid;
        const legacyRaw = localStorage.getItem(legacyKey);
        if (legacyRaw) {
          try {
            const legacyItems = JSON.parse(legacyRaw);
            localStorage.setItem(key, JSON.stringify(legacyItems));
            return legacyItems;
          } catch {}
        }
      }

      // Sampel awal jika baru
      const sampleDate = getTodayDateString();
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
    const prefix = this.getTenantPrefix();
    const sid = storeId || this.getActiveStoreId();
    localStorage.setItem(prefix + 'transactions_' + sid, JSON.stringify(items));
  },

  // --- KASBON & UTANG PER TOKO ---
  getDebts(storeId?: string): DebtItem[] {
    if (typeof window === 'undefined') return [];
    const prefix = this.getTenantPrefix();
    const sid = storeId || this.getActiveStoreId();
    const key = prefix + 'debts_' + sid;
    const raw = localStorage.getItem(key);

    if (!raw) {
      const user = this.getCurrentUser();
      if (user?.id === 'tenant-admin') {
        const legacyKey = STORAGE_PREFIX + 'debts_' + sid;
        const legacyDebts = localStorage.getItem(legacyKey);
        if (legacyDebts) {
          try {
            const parsed = JSON.parse(legacyDebts);
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
    const prefix = this.getTenantPrefix();
    const sid = storeId || this.getActiveStoreId();
    localStorage.setItem(prefix + 'debts_' + sid, JSON.stringify(debts));
  },

  getCategories(): CategoryItem[] {
    if (typeof window === 'undefined') return DEFAULT_CATEGORIES;
    const prefix = this.getTenantPrefix();
    const raw = localStorage.getItem(prefix + 'categories');
    if (!raw) {
      localStorage.setItem(prefix + 'categories', JSON.stringify(DEFAULT_CATEGORIES));
      return DEFAULT_CATEGORIES;
    }
    try {
      const list: CategoryItem[] = JSON.parse(raw);
      const existingIds = new Set(list.map((c) => c.id));
      let hasNew = false;
      DEFAULT_CATEGORIES.forEach((def) => {
        if (!existingIds.has(def.id)) {
          list.push(def);
          hasNew = true;
        }
      });
      if (hasNew) {
        localStorage.setItem(prefix + 'categories', JSON.stringify(list));
      }
      return list;
    } catch {
      return DEFAULT_CATEGORIES;
    }
  },

  saveCategories(categories: CategoryItem[]): void {
    if (typeof window === 'undefined') return;
    const prefix = this.getTenantPrefix();
    localStorage.setItem(prefix + 'categories', JSON.stringify(categories));
  },

  addCategory(data: { name: string; type: TransactionType; scope: TransactionScope }): CategoryItem {
    const list = this.getCategories();
    const newCat: CategoryItem = {
      id: 'cat-custom-' + Date.now(),
      name: data.name.trim(),
      type: data.type,
      scope: data.scope,
      icon: data.type === 'IN' ? 'Coins' : 'Tag',
      color: data.type === 'IN' ? 'emerald' : data.scope === 'BUSINESS' ? 'blue' : 'purple',
    };
    const updated = [...list, newCat];
    this.saveCategories(updated);
    return newCat;
  },
};

export type TransactionType = 'IN' | 'OUT';
export type TransactionScope = 'BUSINESS' | 'PERSONAL';
export type DebtType = 'RECEIVABLE' | 'PAYABLE';
export type DebtStatus = 'BELUM_LUNAS' | 'SEBAGIAN' | 'LUNAS';

export type DateFilterMode = 'TODAY' | 'YESTERDAY' | 'LAST_7' | 'THIS_MONTH' | 'CUSTOM';

export interface DateFilter {
  mode: DateFilterMode;
  startDate: string; // YYYY-MM-DD
  endDate: string;   // YYYY-MM-DD
}

export type UserProfile = StoreProfile;

export interface StoreProfile {
  id: string;
  storeName: string;
  ownerName?: string;
  phone?: string;
  pin?: string;
  businessType: string;
  isCloudSynced?: boolean;
  createdAt: string;
}

export interface CategoryItem {
  id: string;
  name: string;
  type: TransactionType;
  scope: TransactionScope;
  icon?: string;
  color?: string;
}

export interface TransactionItem {
  id: string;
  storeId?: string;
  type: TransactionType;
  scope: TransactionScope; // 'BUSINESS' (Usaha) | 'PERSONAL' (Pribadi)
  amount: number;
  categoryName: string;
  note: string;
  date: string; // ISO date format YYYY-MM-DD
  paymentMethod: 'TUNAI' | 'TRANSFER' | 'QRIS';
  createdAt?: string;
}

export interface DebtPaymentLog {
  date: string;
  amount: number;
  note: string;
}

export interface DebtItem {
  id: string;
  storeId?: string;
  personName: string;
  personPhone?: string;
  type: DebtType; // 'RECEIVABLE' = Kasbon Pelanggan, 'PAYABLE' = Utang Suplier
  amount: number;
  paidAmount: number;
  note?: string;
  dueDate?: string;
  status: DebtStatus;
  history?: DebtPaymentLog[];
  createdAt: string;
}

export const DEFAULT_CATEGORIES: CategoryItem[] = [
  // Pemasukan Usaha
  { id: 'cat-in-1', name: 'Penjualan / Kasir', type: 'IN', scope: 'BUSINESS', icon: 'ShoppingBag', color: 'emerald' },
  { id: 'cat-in-2', name: 'Pendapatan Jasa / Ongkos', type: 'IN', scope: 'BUSINESS', icon: 'Wrench', color: 'teal' },
  { id: 'cat-in-3', name: 'Pendapatan Lain Toko', type: 'IN', scope: 'BUSINESS', icon: 'Coins', color: 'cyan' },

  // Pengeluaran Usaha (Toko)
  { id: 'cat-out-b1', name: 'Kulakan / Belanja Stok', type: 'OUT', scope: 'BUSINESS', icon: 'Truck', color: 'amber' },
  { id: 'cat-out-b2', name: 'Gaji Karyawan', type: 'OUT', scope: 'BUSINESS', icon: 'Users', color: 'blue' },
  { id: 'cat-out-b3', name: 'Listrik, Air & Wi-Fi Toko', type: 'OUT', scope: 'BUSINESS', icon: 'Zap', color: 'yellow' },
  { id: 'cat-out-b4', name: 'Sewa Tempat / Ruko', type: 'OUT', scope: 'BUSINESS', icon: 'Home', color: 'indigo' },
  { id: 'cat-out-b5', name: 'Plastik, Kemasan & ATK', type: 'OUT', scope: 'BUSINESS', icon: 'Package', color: 'orange' },
  { id: 'cat-out-b6', name: 'Operasional Toko Lainnya', type: 'OUT', scope: 'BUSINESS', icon: 'HelpCircle', color: 'slate' },

  // Pengeluaran Pribadi / Keluarga
  { id: 'cat-out-p1', name: 'Belanja Dapur & Makan', type: 'OUT', scope: 'PERSONAL', icon: 'Utensils', color: 'rose' },
  { id: 'cat-out-p2', name: 'Uang Jajan / Anak / Sekolah', type: 'OUT', scope: 'PERSONAL', icon: 'GraduationCap', color: 'purple' },
  { id: 'cat-out-p3', name: 'Bensin & Transport Pribadi', type: 'OUT', scope: 'PERSONAL', icon: 'Fuel', color: 'violet' },
  { id: 'cat-out-p4', name: 'Kebutuhan Rumah Tangga', type: 'OUT', scope: 'PERSONAL', icon: 'Heart', color: 'pink' },
  { id: 'cat-out-p5', name: 'Pengeluaran Pribadi Lain', type: 'OUT', scope: 'PERSONAL', icon: 'User', color: 'stone' },
];

export const BUSINESS_TYPES = [
  { id: 'WARUNG', label: '🏪 Warung Kelontong / Sembako' },
  { id: 'KULINER', label: '🍜 Makanan / Minuman / Cafe' },
  { id: 'BENGKEL_JASA', label: '🔧 Bengkel / Jasa / Servis' },
  { id: 'LAUNDRY', label: '🧺 Laundry / Jasa Cuci' },
  { id: 'FASHION', label: '👗 Toko Baju / Hijab / Aksesoris' },
  { id: 'ONLINE_SHOP', label: '📦 Online Shop / Reseller' },
  { id: 'PERTANIAN', label: '🌾 Pertanian / Peternakan' },
  { id: 'PRIBADI', label: '🏠 Keuangan Rumah Tangga Murni' },
  { id: 'LAINNYA', label: '💼 Usaha Lainnya' },
];

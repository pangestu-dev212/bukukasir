import * as XLSX from 'xlsx';
import { TransactionItem } from './types';

export function exportTransactionsToExcel(
  storeName: string,
  transactions: TransactionItem[],
  startDate: string,
  endDate: string
): void {
  const rows = transactions.map((t, idx) => ({
    No: idx + 1,
    Tanggal: t.date,
    Tipe: t.type === 'IN' ? 'UANG MASUK' : 'UANG KELUAR',
    Kategori_Alur: t.type === 'IN' ? 'Pemasukan' : t.scope === 'BUSINESS' ? '🏪 Toko / Usaha' : '🏠 Pribadi / Keluarga',
    Kategori: t.categoryName,
    Keterangan: t.note || '-',
    Nominal: t.amount,
    Metode_Bayar: t.paymentMethod,
  }));

  const worksheet = XLSX.utils.json_to_sheet(rows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Catatan Kas');

  const safeStore = storeName.replace(/\s+/g, '_');
  const fileName = `Laporan_Kas_${safeStore}_${startDate}_sd_${endDate}.xlsx`;
  XLSX.writeFile(workbook, fileName);
}

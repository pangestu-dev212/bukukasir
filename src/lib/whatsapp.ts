import { formatRupiah, formatDateIndo } from './formatters';

export function generateDailyWhatsAppReport(
  storeName: string,
  dateStr: string,
  transactions: any[]
): string {
  const filtered = transactions.filter((t) => t.date === dateStr);

  // Hitung Totals
  let totalIn = 0;
  let totalOutBusiness = 0;
  let totalOutPersonal = 0;

  filtered.forEach((t) => {
    if (t.type === 'IN') {
      totalIn += t.amount;
    } else if (t.scope === 'BUSINESS') {
      totalOutBusiness += t.amount;
    } else {
      totalOutPersonal += t.amount;
    }
  });

  const totalOut = totalOutBusiness + totalOutPersonal;
  const sisaBersihKas = totalIn - totalOut;
  const labaKotorUsaha = totalIn - totalOutBusiness;

  let text = `*📊 LAPORAN BUKU KASIR - ${storeName.toUpperCase()}*\n`;
  text += `📅 Tanggal: ${formatDateIndo(dateStr)}\n`;
  text += `─────────────────────────\n`;
  text += `💰 *Total Uang Masuk:* ${formatRupiah(totalIn)}\n`;
  text += `🏪 *Pengeluaran Usaha/Toko:* ${formatRupiah(totalOutBusiness)}\n`;
  text += `🏠 *Pengeluaran Pribadi/Dapur:* ${formatRupiah(totalOutPersonal)}\n`;
  text += `─────────────────────────\n`;
  text += `📈 *Hasil Bersih Usaha:* ${formatRupiah(labaKotorUsaha)}\n`;
  text += `💵 *Sisa Uang di Dompet/Kas:* ${formatRupiah(sisaBersihKas)}\n\n`;

  if (filtered.length > 0) {
    text += `*Rincian Catatan:*\n`;
    filtered.forEach((item, idx) => {
      const icon = item.type === 'IN' ? '🟢' : item.scope === 'BUSINESS' ? '🔴' : '🟡';
      const labelScope = item.type === 'IN' ? 'Masuk' : item.scope === 'BUSINESS' ? 'Toko' : 'Pribadi';
      text += `${idx + 1}. ${icon} [${labelScope}] ${item.categoryName}: ${formatRupiah(item.amount)}\n`;
      if (item.note) {
        text += `   _${item.note}_\n`;
      }
    });
  } else {
    text += `_Belum ada catatan transaksi pada tanggal ini._\n`;
  }

  text += `\n_Dicatat dengan rapi via BukuKasir UMKM_`;
  return text;
}

export function generateDebtReminderWhatsApp(
  storeName: string,
  personName: string,
  amount: number,
  note?: string
): string {
  let text = `Halo Ibu/Bapak *${personName}*,\n\n`;
  text += `Salam hangat dari *${storeName}*.\n`;
  text += `Hanya sekadar mengingatkan catatan kasbon sebesar *${formatRupiah(amount)}*`;
  if (note) {
    text += ` untuk keperluan _(${note})_.`;
  } else {
    text += `.`;
  }
  text += `\n\nJika sudah ada kelonggaran, bisa dititipkan ke toko kami ya. Terima kasih banyak atas kepercayaannya. 🙏😊`;
  return text;
}

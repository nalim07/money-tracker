
import { Transaction, Wallet, Category } from '../types/finance';

/**
 * Export transactions to CSV with the same column format as import.
 * Columns: Tanggal, Jenis Transaksi, Kategori, Deskripsi/Keterangan, Dompet, Jumlah (Rp)
 */
const isUUID = (str: string): boolean => {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str.trim());
};

export const exportTransactionsToCSV = (
  transactions: Transaction[],
  wallets: Wallet[],
  categories: Category[]
) => {
  const headers = ['Tanggal', 'Jenis Transaksi', 'Kategori', 'Deskripsi/Keterangan', 'Dompet', 'Jumlah (Rp)'];

  const rows = transactions.map(transaction => {
    const wallet = wallets.find(w => w.id === transaction.wallet);
    
    // Perform robust case-insensitive and trimmed lookup
    const category = categories.find(c => {
      const catId = (c.id || '').trim().toLowerCase();
      const catName = (c.name || '').trim().toLowerCase();
      const txCat = (transaction.category || '').trim().toLowerCase();
      return catId === txCat || catName === txCat;
    });

    const dateStr = new Date(transaction.date).toLocaleDateString('id-ID', {
      day: '2-digit', month: '2-digit', year: 'numeric'
    });

    const categoryName = category
      ? (isUUID(category.name) ? 'Lainnya' : category.name)
      : (isUUID(transaction.category) ? 'Lainnya' : (transaction.category || 'Lainnya'));

    return [
      dateStr,
      transaction.type === 'income' ? 'Pemasukan' : 'Pengeluaran',
      categoryName,
      transaction.description,
      wallet?.name || '',
      transaction.amount.toString(),
    ];
  });

  const csvContent = [headers, ...rows]
    .map(row => row.map(cell => `"${cell}"`).join(','))
    .join('\n');

  triggerDownload(csvContent, `transaksi_${new Date().toISOString().split('T')[0]}.csv`);
};

/**
 * Download a sample CSV file so users know the expected import format.
 */
export const downloadExampleCSV = () => {
  const headers = ['Tanggal', 'Jenis Transaksi', 'Kategori', 'Deskripsi/Keterangan', 'Dompet', 'Jumlah (Rp)'];
  const examples = [
    ['01/01/2025', 'Pengeluaran', 'Contoh Kategori(makan)', 'Contoh Deskripsi', 'Contoh Dompet', '1000'],
    ['02/01/2025', 'Pemasukan', 'Contoh Kategori(gaji)', 'Contoh Deskripsi', 'Contoh Dompet', '1000'],
  ];

  const csvContent = [headers, ...examples]
    .map(row => row.map(cell => `"${cell}"`).join(','))
    .join('\n');

  triggerDownload(csvContent, 'contoh_import_transaksi.csv');
};

function triggerDownload(content: string, filename: string) {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}

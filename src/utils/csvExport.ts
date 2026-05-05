
import { Transaction, Wallet, Category } from '../types/finance';

/**
 * Export transactions to CSV with the same column format as import.
 * Columns: Tanggal, Jenis Transaksi, Kategori, Deskripsi/Keterangan, Dompet, Jumlah (Rp)
 */
export const exportTransactionsToCSV = (
  transactions: Transaction[],
  wallets: Wallet[],
  categories: Category[]
) => {
  const headers = ['Tanggal', 'Jenis Transaksi', 'Kategori', 'Deskripsi/Keterangan', 'Dompet', 'Jumlah (Rp)'];

  const rows = transactions.map(transaction => {
    const wallet = wallets.find(w => w.id === transaction.wallet);
    const category = categories.find(c => c.name === transaction.category);
    const dateStr = new Date(transaction.date).toLocaleDateString('id-ID', {
      day: '2-digit', month: '2-digit', year: 'numeric'
    });

    return [
      dateStr,
      transaction.type === 'income' ? 'Pemasukan' : 'Pengeluaran',
      category?.name || transaction.category,
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

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
    // Lookup wallet by ID
    const wallet = wallets.find(w => w.id === transaction.wallet);
    
    // Lookup category by ID first, then by name
    const category = categories.find(c => c.id === transaction.category) || 
                     categories.find(c => c.name.toLowerCase() === (transaction.category || '').toLowerCase());

    const dateStr = new Date(transaction.date).toLocaleDateString('id-ID', {
      day: '2-digit', month: '2-digit', year: 'numeric'
    });

    // Use category name if found, otherwise never show raw UUID — fallback to 'Lainnya'
    const categoryName = category
      ? category.name
      : (transaction.category && !isUUID(transaction.category) ? transaction.category : 'Lainnya');

    // Use wallet name if found, otherwise never show raw UUID
    const walletName = wallet
      ? wallet.name
      : (transaction.wallet && !isUUID(transaction.wallet) ? transaction.wallet : '');

    return [
      dateStr,
      transaction.type === 'income' ? 'Pemasukan' : 'Pengeluaran',
      categoryName,
      transaction.description,
      walletName,
      transaction.amount.toString(),
    ];
  });

  // Add UTF-8 BOM for proper Excel compatibility with Indonesian characters
  const BOM = '\uFEFF';
  const csvContent = BOM + [headers, ...rows]
    .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
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

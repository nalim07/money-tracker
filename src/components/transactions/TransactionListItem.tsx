
import React from 'react';
import { TrendingUp, TrendingDown, Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Transaction, Wallet, Category } from '@/types/finance';

interface TransactionListItemProps {
  transaction: Transaction;
  wallet?: Wallet;
  category?: Category;
  formatCurrency: (amount: number) => string;
  onEdit: (transaction: Transaction) => void;
  onDelete: (id: string) => void;
}

export default function TransactionListItem({
  transaction,
  wallet,
  category,
  formatCurrency,
  onEdit,
  onDelete
}: TransactionListItemProps) {
  const isWithin24Hours = React.useMemo(() => {
    if (!transaction.createdAt) return true;
    const createdTime = new Date(transaction.createdAt).getTime();
    const now = new Date().getTime();
    return (now - createdTime) <= 24 * 60 * 60 * 1000;
  }, [transaction.createdAt]);

  return (
    <div
      className="flex items-start sm:items-center justify-between p-3 sm:p-4 rounded-lg bg-white/50 dark:bg-gray-700/50 border border-gray-100 dark:border-gray-600 hover:bg-white/80 dark:hover:bg-gray-700/80 transition-all duration-200"
    >
      <div className="flex items-start sm:items-center space-x-3 flex-1 min-w-0">
        <div
          className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center flex-shrink-0 ${
            transaction.type === 'income' 
              ? 'bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400' 
              : 'bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-400'
          }`}
        >
          {transaction.type === 'income' ? (
            <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6" />
          ) : (
            <TrendingDown className="w-5 h-5 sm:w-6 sm:h-6" />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-gray-800 dark:text-white text-sm sm:text-base truncate">
            {transaction.description}
          </p>
          <div className="flex flex-wrap items-center gap-1 sm:gap-2 text-xs sm:text-sm text-gray-600 dark:text-gray-300">
            <span className="whitespace-nowrap">{new Date(transaction.date).toLocaleDateString('id-ID')}</span>
            <span className="text-gray-400">•</span>
            <span className="truncate max-w-[80px] sm:max-w-none">{wallet?.name}</span>
            <span className="text-gray-400">•</span>
            <span className="truncate max-w-[80px] sm:max-w-none">{category?.name || 'Lainnya'}</span>
          </div>
        </div>
      </div>
      <div className="flex flex-col sm:flex-row items-end sm:items-center space-y-2 sm:space-y-0 sm:space-x-3 flex-shrink-0 ml-2">
        <div className="text-right">
          <p
            className={`font-bold text-sm sm:text-lg ${
              transaction.type === 'income' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
            }`}
          >
            {transaction.type === 'income' ? '+' : '-'}
            <span className="hidden sm:inline">{formatCurrency(transaction.amount)}</span>
            <span className="sm:hidden">
              Rp {new Intl.NumberFormat('id-ID').format(transaction.amount)}
            </span>
          </p>
        </div>
        <div className="flex gap-1 sm:gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit(transaction)}
            disabled={!isWithin24Hours}
            title={!isWithin24Hours ? "Tidak dapat diubah setelah 24 jam" : "Edit transaksi"}
            className="text-blue-500 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20 disabled:opacity-30 disabled:hover:bg-transparent h-8 w-8 p-0"
          >
            <Edit className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(transaction.id)}
            disabled={!isWithin24Hours}
            title={!isWithin24Hours ? "Tidak dapat dihapus setelah 24 jam" : "Hapus transaksi"}
            className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 disabled:opacity-30 disabled:hover:bg-transparent h-8 w-8 p-0"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

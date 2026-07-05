import React from 'react';
import { Edit, Trash2, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Transaction, Wallet, Category } from '@/types/finance';
import { CategoryIcon } from '../CategoryIcon';

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
      className="flex items-center justify-between p-3.5 rounded-2xl bg-muted/40 hover:bg-muted/70 transition-all group"
    >
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <div 
          className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: (category?.color || '#FFB400') + '20' }}
        >
          <CategoryIcon 
            icon={category?.icon || 'tag'} 
            className="w-5 h-5" 
            color={category?.color || '#FFB400'} 
          />
        </div>
        <div className="flex-1 min-w-0">
          <span className="text-xs sm:text-sm font-bold text-foreground block truncate">{transaction.description}</span>
          <span className="text-[10px] text-muted-foreground mt-0.5 block">
            {category?.name || (transaction.category === 'Transfer' ? 'Transfer' : 'Lainnya')} • {wallet?.name || 'Dompet'}
          </span>
        </div>
      </div>

      <div className="text-right pl-4 flex items-center gap-2">
        <div>
          <span className={`text-xs sm:text-sm font-extrabold block ${
            transaction.type === 'income' ? 'text-[#2ECC71]' : 'text-foreground'
          }`}>
            {transaction.type === 'income' ? '+' : '-'} Rp {transaction.amount.toLocaleString('id-ID')}
          </span>
          <span className="text-[9px] text-muted-foreground block mt-0.5">
            {new Date(transaction.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
          </span>
        </div>
        
        {/* Quick Edit & Delete Actions (enabled if within 24h) */}
        <div className="flex items-center gap-1 ml-1 opacity-60 group-hover:opacity-100 transition-opacity">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit(transaction)}
            disabled={!isWithin24Hours}
            title={!isWithin24Hours ? "Tidak dapat diubah setelah 24 jam" : "Edit transaksi"}
            className="text-blue-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 disabled:opacity-30 h-8 w-8 p-0 rounded-lg"
          >
            <Edit className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(transaction.id)}
            disabled={!isWithin24Hours}
            title={!isWithin24Hours ? "Tidak dapat dihapus setelah 24 jam" : "Hapus transaksi"}
            className="text-[#FF5C5C] hover:text-[#FF5C5C]/90 hover:bg-red-50 dark:hover:bg-red-900/30 disabled:opacity-30 h-8 w-8 p-0 rounded-lg"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

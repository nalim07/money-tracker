
import React from 'react';
import { Plus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import TransactionListItem from './TransactionListItem';
import { Transaction, Wallet, Category } from '@/types/finance';

interface TransactionsListProps {
  filteredTransactions: Transaction[];
  wallets: Wallet[];
  categories?: Category[];
  formatCurrency: (amount: number) => string;
  onEdit: (transaction: Transaction) => void;
  onDelete: (id: string) => void;
  onAddTransaction: () => void;
}

export default function TransactionsList({
  filteredTransactions,
  wallets,
  categories = [],
  formatCurrency,
  onEdit,
  onDelete,
  onAddTransaction
}: TransactionsListProps) {
  return (
    <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-green-100 dark:border-gray-700">
      <CardHeader className="p-3 sm:p-6 pb-3">
        <CardTitle className="dark:text-white text-lg sm:text-xl">
          Daftar Transaksi ({filteredTransactions.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="p-3 sm:p-6 pt-0">
        {filteredTransactions.length > 0 ? (
          <div className="space-y-2 sm:space-y-3">
            {filteredTransactions.map((transaction) => {
              const wallet = wallets.find(w => w.id === transaction.wallet);
              const category = categories.find(c => c.id === transaction.category);
              return (
                <TransactionListItem
                  key={transaction.id}
                  transaction={transaction}
                  wallet={wallet}
                  category={category}
                  formatCurrency={formatCurrency}
                  onEdit={onEdit}
                  onDelete={onDelete}
                />
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8 sm:py-12">
            <p className="text-gray-500 dark:text-gray-400 mb-4 text-sm sm:text-base">
              {filteredTransactions.length === 0 && 'Belum ada transaksi'}
            </p>
            <Button 
              onClick={onAddTransaction}
              className="bg-finance-primary hover:bg-finance-secondary text-sm sm:text-base"
            >
              <Plus className="w-4 h-4 mr-2" />
              Tambah Transaksi Pertama
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

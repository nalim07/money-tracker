import React from 'react';
import { Plus, ListTodo } from 'lucide-react';
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
    <Card className="bg-card border border-gray-100 dark:border-zinc-800 rounded-3xl p-5 shadow-sm">
      <CardHeader className="p-0 pb-4">
        <CardTitle className="text-sm sm:text-base font-extrabold text-foreground flex items-center gap-2">
          <ListTodo className="w-5 h-5 text-[#FFB400]" />
          Daftar Transaksi ({filteredTransactions.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {filteredTransactions.length > 0 ? (
          <div className="space-y-2">
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
          <div className="text-center py-10">
            <p className="text-muted-foreground text-xs font-semibold mb-4">
              Belum ada transaksi yang sesuai dengan filter
            </p>
            <Button 
              onClick={onAddTransaction}
              className="bg-primary hover:bg-primary/95 text-white font-bold h-10 rounded-xl transition-all shadow-[0_4px_12px_hsl(var(--primary)/0.2)]"
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

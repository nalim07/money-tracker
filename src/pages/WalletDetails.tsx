import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useFinance } from '../contexts/FinanceContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Wallet, PlusCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import EditTransactionForm from '../components/EditTransactionForm';
import { Transaction } from '../types/finance';

const WalletDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { wallets, transactions, categories, getWalletBalance, deleteTransaction } = useFinance();
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);

  const wallet = wallets.find(w => w.id === id);

  if (!wallet) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <div className="text-xl font-medium">Dompet tidak ditemukan</div>
        <Button onClick={() => navigate('/transactions')}>Kembali ke Transaksi</Button>
      </div>
    );
  }

  // Filter transactions for this specific wallet
  const walletTransactions = transactions
    .filter(t => t.wallet === id)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const balance = getWalletBalance(wallet.id);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Button variant="outline" size="icon" onClick={() => navigate('/transactions?tab=wallet-groups')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-2xl font-bold text-foreground">Detail Dompet</h1>
      </div>

      <Card className="border-t-4" style={{ borderTopColor: wallet.color }}>
        <CardContent className="pt-6 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center"
              style={{ backgroundColor: wallet.color + '20' }}
            >
              <Wallet className="w-8 h-8" style={{ color: wallet.color }} />
            </div>
            <div>
              <h2 className="text-3xl font-bold">{wallet.name}</h2>
              <div className="flex items-center space-x-2 mt-1">
                <Badge variant="outline">{wallet.group || 'Lainnya'}</Badge>
              </div>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-muted-foreground mb-1">Total Saldo</p>
            <p className="text-4xl font-bold">{formatCurrency(balance)}</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Riwayat Transaksi Dompet</CardTitle>
          <CardDescription>Semua transaksi yang menggunakan {wallet.name}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {walletTransactions.length > 0 ? (
              walletTransactions.map((transaction) => {
                const category = categories.find(c => c.id === transaction.category);
                
                return (
                  <div key={transaction.id} className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
                    <div className="flex-1 cursor-pointer" onClick={() => setEditingTransaction(transaction)}>
                      <div className="flex items-center space-x-2">
                        <Badge 
                          className={transaction.type === 'income' 
                            ? 'bg-green-500 hover:bg-green-600 text-white border-transparent' 
                            : 'bg-red-500 hover:bg-red-600 text-white border-transparent'}
                        >
                          {transaction.type === 'income' ? 'Masuk' : 'Keluar'}
                        </Badge>
                        <span className="font-medium text-lg">{transaction.description}</span>
                      </div>
                      <div className="text-sm text-muted-foreground mt-1">
                        {new Date(transaction.date).toLocaleDateString('id-ID', {
                          weekday: 'long', 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric'
                        })} • {category?.name || (transaction.category === 'Transfer' ? 'Transfer' : 'Lainnya')}
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className={`font-bold text-lg ${transaction.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                        {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <p>Belum ada transaksi pada dompet ini.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Edit Transaction Dialog */}
      {editingTransaction && (
        <Dialog
          open={!!editingTransaction}
          onOpenChange={(open) => !open && setEditingTransaction(null)}
        >
          <DialogContent className="w-[95vw] max-w-md mx-auto">
            <EditTransactionForm
              transaction={editingTransaction}
              open={!!editingTransaction}
              onOpenChange={(open) => !open && setEditingTransaction(null)}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default WalletDetails;

import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useFinance } from '../contexts/FinanceContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Wallet, Edit, Trash2, ChevronRight, PlusCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import EditTransactionForm from '../components/EditTransactionForm';
import { CategoryIcon } from '../components/CategoryIcon';
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
        <div className="text-xl font-extrabold text-foreground">Dompet tidak ditemukan</div>
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
    <div className="space-y-6 max-w-2xl mx-auto px-1">
      {/* Header */}
      <div className="flex items-center space-x-3">
        <Button 
          variant="outline" 
          size="icon" 
          onClick={() => navigate('/transactions?tab=wallet-groups')}
          className="rounded-xl border-gray-150 hover:bg-muted"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-foreground tracking-tight">Detail Dompet</h1>
          <p className="text-xs text-muted-foreground">Monitor riwayat dan saldo kantong Anda</p>
        </div>
      </div>

      {/* Wallet Card */}
      <Card className="bg-gradient-to-br from-[#1D1D1F] to-[#2D2D30] dark:from-[#111112] dark:to-[#1E1E22] text-white rounded-3xl p-6 shadow-xl relative overflow-hidden transition-all duration-300">
        <div className="absolute w-44 h-44 rounded-full -top-12 -right-10 blur-sm pointer-events-none" style={{ backgroundColor: wallet.color + '18' }} />
        <div className="absolute w-24 h-24 rounded-full -bottom-6 right-16 blur-sm pointer-events-none" style={{ backgroundColor: wallet.color + '12' }} />
        
        <CardContent className="p-0 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 z-10 relative">
          <div className="flex items-center space-x-4">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: wallet.color + '25', border: `1px solid ${wallet.color}40` }}
            >
              <CategoryIcon icon={wallet.icon || 'wallet'} color={wallet.color} className="w-7 h-7" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black tracking-tight">{wallet.name}</h2>
              <div className="flex items-center space-x-2 mt-1">
                <Badge className="bg-white/10 hover:bg-white/20 text-white border-transparent text-[10px] py-0.5 px-2 rounded-full font-bold">
                  {wallet.actualGroup || 'Lainnya'}
                </Badge>
              </div>
            </div>
          </div>
          <div className="sm:text-right">
            <p className="text-[10px] text-white/55 font-bold uppercase tracking-wider mb-1">Total Saldo</p>
            <p className="text-2xl sm:text-3xl font-black tracking-tight">{formatCurrency(balance)}</p>
          </div>
        </CardContent>
      </Card>

      {/* Transaction History Card */}
      <Card className="bg-card border border-gray-100 dark:border-zinc-800 rounded-3xl p-5 shadow-sm">
        <CardHeader className="p-0 pb-4">
          <CardTitle className="text-sm sm:text-base font-extrabold text-foreground">Riwayat Transaksi Dompet</CardTitle>
          <CardDescription className="text-xs">Semua transaksi yang menggunakan {wallet.name}</CardDescription>
        </CardHeader>
        <CardContent className="p-0 pt-2">
          <div className="space-y-2.5">
            {walletTransactions.length > 0 ? (
              walletTransactions.map((transaction) => {
                const category = categories.find(c => c.id === transaction.category || c.name === transaction.category);
                
                return (
                  <div 
                    key={transaction.id} 
                    onClick={() => setEditingTransaction(transaction)}
                    className="p-3 bg-muted/45 hover:bg-muted/80 rounded-2xl cursor-pointer flex items-center justify-between transition-all hover:-translate-y-0.5"
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
                          {category?.name || (transaction.category === 'Transfer' ? 'Transfer' : 'Lainnya')}
                        </span>
                      </div>
                    </div>
                    
                    <div className="text-right pl-4 flex items-center gap-1.5">
                      <div>
                        <span className={`text-xs sm:text-sm font-extrabold block ${
                          transaction.type === 'income' ? 'text-[#2ECC71]' : 'text-foreground'
                        }`}>
                          {transaction.type === 'income' ? '+' : '-'} {formatCurrency(transaction.amount)}
                        </span>
                        <span className="text-[9px] text-muted-foreground block mt-0.5">
                          {new Date(transaction.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                        </span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-10 text-muted-foreground text-xs font-semibold">
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
          <DialogContent className="w-[95vw] max-w-md mx-auto rounded-sm">
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

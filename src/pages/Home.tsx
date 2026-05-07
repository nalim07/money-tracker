
import React from 'react';
import { useFinance } from '../contexts/FinanceContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { PlusCircle, Wallet, TrendingUp, TrendingDown, ArrowLeftRight } from 'lucide-react';
import { Dialog, DialogContent, DialogTrigger } from '../components/ui/dialog';
import AddTransactionForm from '../components/AddTransactionForm';
import BalanceTransferDialog from '../components/BalanceTransferDialog';

export default function Home() {
  const { getFinancialSummary, wallets, categories, getWalletBalance, transactions, loading } = useFinance();
  const [isAddTransactionOpen, setIsAddTransactionOpen] = React.useState(false);
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  const summary = getFinancialSummary();
  const recentTransactions = transactions.slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Financial Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Saldo</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              Rp {summary.totalBalance.toLocaleString('id-ID')}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pemasukan Bulan Ini</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              Rp {summary.monthlyIncome.toLocaleString('id-ID')}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pengeluaran Bulan Ini</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              Rp {summary.monthlyExpense.toLocaleString('id-ID')}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Net Bulan Ini</CardTitle>
            <TrendingUp className={`h-4 w-4 ${summary.monthlyNet >= 0 ? 'text-green-600' : 'text-red-600'}`} />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${summary.monthlyNet >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              Rp {summary.monthlyNet.toLocaleString('id-ID')}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Aksi Cepat</CardTitle>
          <CardDescription>Aksi yang sering digunakan</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Dialog open={isAddTransactionOpen} onOpenChange={setIsAddTransactionOpen}>
              <DialogTrigger asChild>
                <Button>
                  <PlusCircle className="w-4 h-4 mr-2" />
                  Tambah Transaksi
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <AddTransactionForm onClose={() => setIsAddTransactionOpen(false)} />
              </DialogContent>
            </Dialog>
            
            <BalanceTransferDialog />
          </div>
        </CardContent>
      </Card>

      {/* Wallets Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Dompet</CardTitle>
          <CardDescription>Ringkasan saldo semua dompet</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {wallets.map((wallet) => {
              const balance = getWalletBalance(wallet.id);
              return (
                <div key={wallet.id} className="p-4 rounded-lg bg-muted/50">
                  <div className="flex items-center space-x-2 mb-2">
                    <div 
                      className="w-4 h-4 rounded-full" 
                      style={{ backgroundColor: wallet.color }}
                    />
                    <h3 className="font-medium text-foreground">{wallet.name}</h3>
                  </div>
                  <p className="text-2xl font-bold text-foreground">
                    Rp {balance.toLocaleString('id-ID')}
                  </p>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Recent Transactions */}
      <Card>
        <CardHeader>
          <CardTitle>Transaksi Terbaru</CardTitle>
          <CardDescription>5 transaksi terakhir</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentTransactions.length > 0 ? (
              recentTransactions.map((transaction) => {
                const wallet = wallets.find(w => w.id === transaction.wallet);
                const category = categories.find(c => c.id === transaction.category);
                
                return (
                  <div key={transaction.id} className="flex items-center justify-between p-3 rounded-md bg-muted/50">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <Badge 
                          className={transaction.type === 'income' 
                            ? 'bg-green-500 hover:bg-green-600 text-white border-transparent' 
                            : 'bg-red-500 hover:bg-red-600 text-white border-transparent'}
                        >
                          {transaction.type === 'income' ? 'Masuk' : 'Keluar'}
                        </Badge>
                        <span className="font-medium">{transaction.description}</span>
                      </div>
                      <div className="text-sm text-muted-foreground mt-1">
                        {transaction.date.toLocaleDateString('id-ID')} • {wallet?.name} • {category?.name || (transaction.category === 'Transfer' ? 'Transfer' : 'Lainnya')}
                      </div>
                    </div>
                    <div className={`font-bold ${transaction.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                      {transaction.type === 'income' ? '+' : '-'}Rp {transaction.amount.toLocaleString('id-ID')}
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-muted-foreground">Belum ada transaksi</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

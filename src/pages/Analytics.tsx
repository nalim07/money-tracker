
import React from 'react';
import { useFinance } from '../contexts/FinanceContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import InteractivePieChart from '../components/analytics/InteractivePieChart';

const Analytics: React.FC = () => {
  const { transactions, categories, wallets } = useFinance();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  // Get current month data
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const currentMonthTransactions = transactions.filter(t => {
    const transactionDate = new Date(t.date);
    return transactionDate.getMonth() === currentMonth && 
           transactionDate.getFullYear() === currentYear;
  });

  // Monthly trend (last 6 months)
  const monthlyTrend = [];
  for (let i = 5; i >= 0; i--) {
    const date = new Date(currentYear, currentMonth - i, 1);
    const monthTransactions = transactions.filter(t => {
      const transactionDate = new Date(t.date);
      return transactionDate.getMonth() === date.getMonth() && 
             transactionDate.getFullYear() === date.getFullYear();
    });

    const income = monthTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);

    const expense = monthTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    monthlyTrend.push({
      month: date.toLocaleDateString('id-ID', { month: 'short', year: '2-digit' }),
      Pemasukan: income,
      Pengeluaran: expense,
      Net: income - expense,
    });
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-foreground">Analisis Keuangan</h1>
      
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-card backdrop-blur-sm border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Pemasukan Bulan Ini
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500 dark:text-green-400">
              {formatCurrency(
                currentMonthTransactions
                  .filter(t => t.type === 'income')
                  .reduce((sum, t) => sum + t.amount, 0)
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card backdrop-blur-sm border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Pengeluaran Bulan Ini
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500 dark:text-red-400">
              {formatCurrency(
                currentMonthTransactions
                  .filter(t => t.type === 'expense')
                  .reduce((sum, t) => sum + t.amount, 0)
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card backdrop-blur-sm border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Jumlah Transaksi Bulan Ini
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              {currentMonthTransactions.length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Interactive Pie Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <InteractivePieChart
          title="Pemasukan per Kategori"
          transactions={currentMonthTransactions}
          categories={categories}
          wallets={wallets}
          type="income"
          formatCurrency={formatCurrency}
        />

        <InteractivePieChart
          title="Pengeluaran per Kategori"
          transactions={currentMonthTransactions}
          categories={categories}
          wallets={wallets}
          type="expense"
          formatCurrency={formatCurrency}
        />
      </div>

      {/* Monthly Trend */}
      <Card className="bg-card backdrop-blur-sm border-border">
        <CardHeader>
          <CardTitle>Tren 6 Bulan Terakhir</CardTitle>
        </CardHeader>
        <CardContent>
          {monthlyTrend.some(m => m.Pemasukan > 0 || m.Pengeluaran > 0) ? (
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={monthlyTrend}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="month" className="text-muted-foreground" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                <YAxis tickFormatter={(value) => formatCurrency(value)} tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                <Tooltip 
                  formatter={(value) => formatCurrency(Number(value))} 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))', 
                    borderColor: 'hsl(var(--border))',
                    color: 'hsl(var(--foreground))'
                  }}
                />
                <Legend wrapperStyle={{ color: 'hsl(var(--foreground))' }} />
                <Bar dataKey="Pemasukan" fill="#10B981" />
                <Bar dataKey="Pengeluaran" fill="#EF4444" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[400px] flex items-center justify-center text-muted-foreground">
              Belum ada data transaksi untuk ditampilkan
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Analytics;

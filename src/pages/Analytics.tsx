import React, { useState, useMemo } from 'react';
import { useFinance } from '../contexts/FinanceContext';
import { Card, CardContent } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { CategoryIcon } from '../components/CategoryIcon';
import { ArrowDownLeft, Calendar, FileText, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

type Period = 'weekly' | 'monthly' | '3months' | 'yearly';

const Analytics: React.FC = () => {
  const navigate = useNavigate();
  const { transactions, categories } = useFinance();
  const [period, setPeriod] = useState<Period>('monthly');

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  // 1. Calculate Period Date Range
  const periodRange = useMemo(() => {
    const now = new Date();
    let start = new Date();
    let label = '';

    switch (period) {
      case 'weekly':
        start.setDate(now.getDate() - 7);
        label = '7 Hari Terakhir';
        break;
      case 'monthly':
        start = new Date(now.getFullYear(), now.getMonth(), 1);
        label = now.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
        break;
      case '3months':
        start.setDate(now.getDate() - 90);
        label = '3 Bulan Terakhir';
        break;
      case 'yearly':
        start = new Date(now.getFullYear(), 0, 1);
        label = `Tahun ${now.getFullYear()}`;
        break;
    }
    return { start, end: now, label };
  }, [period]);

  // 2. Filter transactions based on active period
  const periodTransactions = useMemo(() => {
    return transactions.filter(t => {
      const d = new Date(t.date);
      return d >= periodRange.start && d <= periodRange.end;
    });
  }, [transactions, periodRange]);

  // 3. Summary stats
  const totalIncome = useMemo(() => {
    return periodTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
  }, [periodTransactions]);

  const totalExpense = useMemo(() => {
    return periodTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
  }, [periodTransactions]);

  const netBalance = totalIncome - totalExpense;

  const totalSavings = useMemo(() => {
    return netBalance > 0 ? netBalance : 0;
  }, [netBalance]);

  const savingRate = useMemo(() => {
    return totalIncome > 0 ? Math.min(100, Math.round((totalSavings / totalIncome) * 100)) : 0;
  }, [totalIncome, totalSavings]);

  // 4. Cash Flow Chart Data (Last 6 Months)
  const cashFlowData = useMemo(() => {
    const now = new Date();
    const data = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const mStart = new Date(d.getFullYear(), d.getMonth(), 1);
      const mEnd = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59);

      const monthTxs = transactions.filter(t => {
        const txDate = new Date(t.date);
        return txDate >= mStart && txDate <= mEnd;
      });

      const income = monthTxs.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
      const expense = monthTxs.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);

      data.push({
        month: d.toLocaleDateString('id-ID', { month: 'short' }),
        income,
        expense,
        isActive: i === 0
      });
    }
    return data;
  }, [transactions]);

  // 5. Category breakdown calculations
  const categoryExpenses = useMemo(() => {
    const raw = categories.map(cat => {
      const total = periodTransactions
        .filter(t => t.type === 'expense' && (t.category === cat.id || t.category === cat.name))
        .reduce((sum, t) => sum + t.amount, 0);
      return { ...cat, total };
    }).filter(c => c.total > 0).sort((a, b) => b.total - a.total);

    const totalCategoryExpense = raw.reduce((sum, c) => sum + c.total, 0);
    
    // Group categories (top 4 and Lainnya)
    if (raw.length > 5) {
      const top = raw.slice(0, 4);
      const others = raw.slice(4);
      const othersTotal = others.reduce((sum, o) => sum + o.total, 0);
      
      const result = top.map(c => ({
        name: c.name,
        color: c.color,
        pct: totalCategoryExpense > 0 ? Math.round((c.total / totalCategoryExpense) * 100) : 0
      }));

      result.push({
        name: 'Lainnya',
        color: '#00AED6',
        pct: totalCategoryExpense > 0 ? Math.round((othersTotal / totalCategoryExpense) * 100) : 0
      });

      return result;
    }

    return raw.map(c => ({
      name: c.name,
      color: c.color,
      pct: totalCategoryExpense > 0 ? Math.round((c.total / totalCategoryExpense) * 100) : 0
    }));
  }, [categories, periodTransactions]);

  // 6. Top Transactions (Pengeluaran Terbesar)
  const topTransactions = useMemo(() => {
    return periodTransactions
      .filter(t => t.type === 'expense')
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 4);
  }, [periodTransactions]);

  const maxExpenseVal = topTransactions.length > 0 ? topTransactions[0].amount : 1;

  return (
    <div className="space-y-4 px-1">
      
      {/* HEADER SECTION - NO TOP HEADER OR BUTTONS AS PER SPEC */}
      <div className="flex flex-col gap-0.5 py-2">
        <h1 className="text-[22px] font-extrabold text-foreground tracking-tight leading-tight">Laporan</h1>
        <p className="text-xs text-muted-foreground">Ringkasan keuanganmu bulan ini</p>
      </div>

      {/* PERIOD TABS */}
      <div className="bg-white dark:bg-[#121214] p-1 rounded-xl shadow-[0_2px_12px_rgba(0,0,0,0.04)] max-w-md flex items-center gap-0.5 border border-gray-100 dark:border-zinc-900">
        <button 
          onClick={() => setPeriod('weekly')}
          className={`flex-1 text-center py-2 text-[12px] font-bold rounded-lg transition-all ${
            period === 'weekly' ? 'bg-primary text-white shadow-sm font-extrabold' : 'text-muted-foreground hover:text-foreground font-semibold'
          }`}
        >
          Mingguan
        </button>
        <button 
          onClick={() => setPeriod('monthly')}
          className={`flex-1 text-center py-2 text-[12px] font-bold rounded-lg transition-all ${
            period === 'monthly' ? 'bg-primary text-white shadow-sm font-extrabold' : 'text-muted-foreground hover:text-foreground font-semibold'
          }`}
        >
          Bulanan
        </button>
        <button 
          onClick={() => setPeriod('3months')}
          className={`flex-1 text-center py-2 text-[12px] font-bold rounded-lg transition-all ${
            period === '3months' ? 'bg-primary text-white shadow-sm font-extrabold' : 'text-muted-foreground hover:text-foreground font-semibold'
          }`}
        >
          3 Bulan
        </button>
        <button 
          onClick={() => setPeriod('yearly')}
          className={`flex-1 text-center py-2 text-[12px] font-bold rounded-lg transition-all ${
            period === 'yearly' ? 'bg-primary text-white shadow-sm font-extrabold' : 'text-muted-foreground hover:text-foreground font-semibold'
          }`}
        >
          Tahunan
        </button>
      </div>

      {/* RESPONSIVE LAYOUT CONTAINER */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start pt-2">
        
        {/* LEFT COLUMN: SUMMARY & CHART */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* SUMMARY DARK GRADIENT CARD */}
          <div className="bg-gradient-to-br from-[#1D1D1F] to-[#3A3A3C] text-white rounded-[18px] p-[18px] pb-5 shadow-2xl relative overflow-hidden">
            {/* Background decorative circles from Banani */}
            <div className="absolute w-[130px] h-[130px] rounded-full -top-[35px] -right-[25px] bg-white/[0.05] pointer-events-none" />
            <div className="absolute w-[75px] h-[75px] rounded-full -bottom-[18px] left-[28px] bg-white/[0.04] pointer-events-none" />

            <div className="z-10 relative">
              <span className="text-[11px] font-medium text-white/60 tracking-wider block">{periodRange.label}</span>
              <h2 className={`text-[26px] font-extrabold tracking-tight mt-1 ${
                netBalance >= 0 ? 'text-[#2ECC71]' : 'text-[#FF5C5C]'
              }`}>
                {netBalance >= 0 ? '+' : ''}Rp {netBalance.toLocaleString('id-ID')}
              </h2>
              <span className="text-[11px] text-white/55 font-medium block mt-1">Saldo Bersih Bulan Ini</span>

              {/* Stats Row */}
              <div className="flex items-center justify-between border-t border-white/10 pt-4 mt-4">
                <div className="flex-1 min-w-0">
                  <span className="text-[10px] text-white/55 font-medium uppercase block">Pemasukan</span>
                  <span className="text-[14px] font-bold text-[#2ECC71] block mt-0.5 truncate">Rp {totalIncome.toLocaleString('id-ID')}</span>
                </div>
                <div className="w-[1px] h-8 bg-white/15 mx-2 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <span className="text-[10px] text-white/55 font-medium uppercase block">Pengeluaran</span>
                  <span className="text-[14px] font-bold text-[#FF5C5C] block mt-0.5 truncate">Rp {totalExpense.toLocaleString('id-ID')}</span>
                </div>
                <div className="w-[1px] h-8 bg-white/15 mx-2 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <span className="text-[10px] text-white/55 font-medium uppercase block">Tabungan</span>
                  <span className="text-[14px] font-bold text-primary block mt-0.5 truncate">Rp {totalSavings.toLocaleString('id-ID')}</span>
                </div>
              </div>

              {/* Saving Rate progress bar */}
              <div className="mt-4 space-y-1.5">
                <div className="flex items-center justify-between text-[11px] font-medium">
                  <span className="text-white/60">Tingkat Tabungan</span>
                  <span className="text-[#2ECC71] font-bold">{savingRate}%</span>
                </div>
                <div className="w-full bg-white/[0.12] h-[5px] rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-[#2ECC71] transition-all duration-500" 
                    style={{ width: `${savingRate}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* ARUS KAS 6 BULAN (BAR CHART) */}
          <div className="bg-card border border-gray-100 dark:border-zinc-900 rounded-3xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm sm:text-base font-extrabold text-foreground">Arus Kas 6 Bulan</h3>
              <button 
                onClick={() => navigate('/transactions')}
                className="text-xs font-bold text-primary hover:underline"
              >
                Detail
              </button>
            </div>

            {/* Custom BarChart Area */}
            <div className="h-[200px] w-full pt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={cashFlowData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-gray-100 dark:stroke-zinc-800" />
                  <XAxis 
                    dataKey="month" 
                    tick={{ fill: 'currentColor', fontSize: 10 }}
                    className="text-muted-foreground font-semibold"
                  />
                  <YAxis 
                    tickFormatter={(value) => `Rp ${(value / 1000000).toFixed(0)}Jt`}
                    tick={{ fill: 'currentColor', fontSize: 10 }}
                    className="text-muted-foreground font-semibold"
                  />
                  <Tooltip 
                    formatter={(value) => formatCurrency(Number(value))}
                    contentStyle={{ 
                      backgroundColor: 'var(--card)', 
                      borderColor: 'var(--border)',
                      color: 'var(--foreground)',
                      borderRadius: '16px',
                      fontSize: '11px'
                    }}
                  />
                  <Bar dataKey="income" name="Pemasukan" fill="#2ECC71" radius={[4, 4, 0, 0]}>
                    {cashFlowData.map((entry, index) => (
                      <Cell 
                        key={`cell-inc-${index}`} 
                        fill={entry.isActive ? '#2ECC71' : '#2ECC7180'}
                        style={entry.isActive ? { filter: 'drop-shadow(0px 2px 6px rgba(46,204,113,0.35))' } : {}}
                      />
                    ))}
                  </Bar>
                  <Bar dataKey="expense" name="Pengeluaran" fill="#FF5C5C" radius={[4, 4, 0, 0]}>
                    {cashFlowData.map((entry, index) => (
                      <Cell 
                        key={`cell-exp-${index}`} 
                        fill={entry.isActive ? '#FF5C5C' : '#FF5C5C80'}
                        style={entry.isActive ? { filter: 'drop-shadow(0px 2px 6px rgba(255,92,92,0.35))' } : {}}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: CATEGORIES & TOP SPENDINGS */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* KATEGORI BREAKDOWN (DONUT CHART & LIST) */}
          <div className="bg-card border border-gray-100 dark:border-zinc-900 rounded-3xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm sm:text-base font-extrabold text-foreground">Kategori Pengeluaran</h3>
              <button 
                onClick={() => navigate('/transactions')}
                className="text-xs font-bold text-primary hover:underline"
              >
                Semua
              </button>
            </div>

            <div className="flex items-center gap-5 justify-between">
              {/* Custom SVG Donut Chart */}
              <div className="relative w-22 h-22 flex-shrink-0">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                  <circle cx="18" cy="18" r="15.9" fill="none" stroke="currentColor" className="text-muted/20" strokeWidth="3.8" />
                  {(() => {
                    let accumulatedPercent = 0;
                    return categoryExpenses.map((cat, idx) => {
                      if (cat.pct <= 0) return null;
                      const segmentDash = cat.pct;
                      const offset = -accumulatedPercent;
                      accumulatedPercent += cat.pct;
                      
                      return (
                        <circle
                          key={idx}
                          cx="18"
                          cy="18"
                          r="15.9"
                          fill="none"
                          stroke={cat.color}
                          strokeWidth="3.8"
                          strokeDasharray={`${segmentDash} 100`}
                          strokeDashoffset={offset}
                        />
                      );
                    });
                  })()}
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <span className="text-xs font-extrabold text-foreground">100%</span>
                  <span className="text-[8px] text-muted-foreground font-semibold">Total</span>
                </div>
              </div>

              {/* Legends list */}
              <div className="flex-1 space-y-2 max-w-[150px]">
                {categoryExpenses.map((cat, idx) => (
                  <div key={idx} className="flex justify-between items-center text-xs font-medium min-w-0">
                    <div className="flex items-center gap-1.5 truncate flex-1 min-w-0">
                      <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: cat.color }} />
                      <span className="text-muted-foreground truncate">{cat.name}</span>
                    </div>
                    <span className="font-bold text-foreground pl-1.5 flex-shrink-0">{cat.pct}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* TOP TRANSACTIONS (PENGELUARAN TERBESAR) */}
          <div className="bg-card border border-gray-100 dark:border-zinc-900 rounded-3xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm sm:text-base font-extrabold text-foreground">Pengeluaran Terbesar</h3>
              <button 
                onClick={() => navigate('/transactions')}
                className="text-xs font-bold text-primary hover:underline"
              >
                Lihat Semua
              </button>
            </div>

            <div className="space-y-0.5">
              {topTransactions.length > 0 ? (
                topTransactions.map((tx) => {
                  const category = categories.find(c => c.id === tx.category || c.name === tx.category);
                  const pct = Math.round((tx.amount / maxExpenseVal) * 100);

                  return (
                    <div 
                      key={tx.id}
                      onClick={() => navigate('/transactions')}
                      className="py-3 border-b border-gray-100 dark:border-zinc-900/40 last:border-none flex items-center justify-between cursor-pointer transition-all group"
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div 
                          className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                          style={{ backgroundColor: (category?.color || '#FFB400') + '15' }}
                        >
                          <CategoryIcon 
                            icon={category?.icon || 'tag'} 
                            className="w-4.5 h-4.5" 
                            color={category?.color || '#FFB400'} 
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <span className="text-[13px] font-bold text-foreground block truncate">{tx.description}</span>
                          <span className="text-[11px] text-muted-foreground mt-0.5 block truncate">
                            {new Date(tx.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })} • {category?.name || 'Belanja'}
                          </span>
                          
                          {/* Mini Progress Bar */}
                          <div className="w-full bg-gray-100 dark:bg-zinc-800 h-[3px] rounded-full overflow-hidden mt-1.5">
                            <div 
                              className="h-full rounded-full transition-all duration-300"
                              style={{ 
                                width: `${pct}%`, 
                                backgroundColor: category?.color || '#FFB400' 
                              }}
                            />
                          </div>
                        </div>
                      </div>
                      
                      <div className="text-right pl-4">
                        <span className="text-[13px] font-extrabold text-[#FF5C5C] block">
                          -Rp {tx.amount.toLocaleString('id-ID')}
                        </span>
                      </div>
                    </div>
                  );
                })
              ) : (
                <p className="text-[11px] text-muted-foreground text-center py-4">
                  Belum ada catatan pengeluaran di periode ini.
                </p>
              )}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};

export default Analytics;

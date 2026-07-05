import React, { useState, useMemo } from 'react';
import { useFinance } from '../contexts/FinanceContext';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import EditTransactionForm from '../components/EditTransactionForm';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AddTransactionForm from '../components/AddTransactionForm';
import ConfirmDialog from '../components/ConfirmDialog';
import { CategoryIcon } from '../components/CategoryIcon';
import { Transaction } from '../types/finance';
import { toast } from 'sonner';
import { 
  ArrowDownCircle, ArrowUpCircle, Wallet, Search, Plus, 
  ChevronLeft, ChevronRight, SlidersHorizontal, List, 
  Send, Edit, Trash2, HelpCircle, BarChart2, FileText, Landmark,
  TrendingUp, TrendingDown, ArrowLeftRight, Upload
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import BalanceTransferDialog from '../components/BalanceTransferDialog';
import ImportCSVDialog from '../components/ImportCSVDialog';
import ExportButton from '../components/ExportButton';

const Transactions: React.FC = () => {
  const navigate = useNavigate();
  const { 
    transactions, 
    deleteTransaction, 
    wallets, 
    categories, 
    getWalletBalance 
  } = useFinance();

  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [deletingTransaction, setDeletingTransaction] = useState<Transaction | null>(null);

  // Filters State
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>('all');
  const [filterWallet, setFilterWallet] = useState<string>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  
  // Date State: Month-based navigation
  const [selectedMonth, setSelectedMonth] = useState<Date>(new Date());

  const handlePrevMonth = () => {
    setSelectedMonth(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setSelectedMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  // Date ranges based on selectedMonth
  const startOfMonth = useMemo(() => new Date(selectedMonth.getFullYear(), selectedMonth.getMonth(), 1), [selectedMonth]);
  const endOfMonth = useMemo(() => new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() + 1, 0, 23, 59, 59), [selectedMonth]);

  // Previous month ranges for percentage changes
  const prevMonthStart = useMemo(() => new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() - 1, 1), [selectedMonth]);
  const prevMonthEnd = useMemo(() => new Date(selectedMonth.getFullYear(), selectedMonth.getMonth(), 0, 23, 59, 59), [selectedMonth]);

  // Base transactions in the selected month
  const monthTransactions = useMemo(() => {
    return transactions.filter(t => {
      const d = new Date(t.date);
      return d >= startOfMonth && d <= endOfMonth;
    });
  }, [transactions, startOfMonth, endOfMonth]);

  const prevMonthTransactions = useMemo(() => {
    return transactions.filter(t => {
      const d = new Date(t.date);
      return d >= prevMonthStart && d <= prevMonthEnd;
    });
  }, [transactions, prevMonthStart, prevMonthEnd]);

  // Calculate Summary metrics
  const totalIncome = useMemo(() => {
    return monthTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
  }, [monthTransactions]);

  const totalExpense = useMemo(() => {
    return monthTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
  }, [monthTransactions]);

  const netBalance = totalIncome - totalExpense;

  // Percent changes from previous month
  const incomeChange = useMemo(() => {
    const prevIncome = prevMonthTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    return prevIncome > 0 ? ((totalIncome - prevIncome) / prevIncome) * 100 : 0;
  }, [totalIncome, prevMonthTransactions]);

  const expenseChange = useMemo(() => {
    const prevExpense = prevMonthTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
    return prevExpense > 0 ? ((totalExpense - prevExpense) / prevExpense) * 100 : 0;
  }, [totalExpense, prevMonthTransactions]);

  // Apply visual filtering (Search, Type, Wallet, Category)
  const filteredTransactions = useMemo(() => {
    return monthTransactions.filter(t => {
      const matchesSearch = t.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            t.category.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = filterType === 'all' || t.type === filterType;
      const matchesWallet = filterWallet === 'all' || t.wallet === filterWallet;
      const matchesCategory = filterCategory === 'all' || t.category === filterCategory;

      return matchesSearch && matchesType && matchesWallet && matchesCategory;
    }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [monthTransactions, searchTerm, filterType, filterWallet, filterCategory]);

  // Group transactions by date for the grouped display
  const groupedTransactions = useMemo(() => {
    const groups: { [key: string]: Transaction[] } = {};
    filteredTransactions.forEach(t => {
      const txDate = new Date(t.date);
      const today = new Date();
      const yesterday = new Date();
      yesterday.setDate(today.getDate() - 1);
      
      let dateLabel = '';
      if (txDate.toDateString() === today.toDateString()) {
        dateLabel = `Hari Ini — ${txDate.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}`;
      } else if (txDate.toDateString() === yesterday.toDateString()) {
        dateLabel = `Kemarin — ${txDate.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}`;
      } else {
        dateLabel = txDate.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
      }
      
      if (!groups[dateLabel]) {
        groups[dateLabel] = [];
      }
      groups[dateLabel].push(t);
    });
    return groups;
  }, [filteredTransactions]);

  // Right Panel Category list (with counts for the selected month)
  const categoryFilterList = useMemo(() => {
    return categories.map(cat => {
      const count = monthTransactions.filter(t => t.category === cat.id || t.category === cat.name).length;
      return { ...cat, count };
    }).filter(cat => cat.count > 0);
  }, [categories, monthTransactions]);

  // Right Panel Largest Spending (Breakdown)
  const largestSpendingBreakdown = useMemo(() => {
    return categories.map(cat => {
      const total = monthTransactions
        .filter(t => t.type === 'expense' && (t.category === cat.id || t.category === cat.name))
        .reduce((sum, t) => sum + t.amount, 0);
      return { ...cat, total };
    })
    .filter(c => c.total > 0)
    .sort((a, b) => b.total - a.total);
  }, [categories, monthTransactions]);

  const maxSpendingVal = largestSpendingBreakdown.length > 0 ? largestSpendingBreakdown[0].total : 1;

  // Formatter helpers
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getWalletIconStyle = (name: string) => {
    const lower = name.toLowerCase();
    if (lower.includes('bca') || lower.includes('mandiri') || lower.includes('bank')) {
      return { bg: '#E8F9EF', text: '#2ECC71', icon: Landmark };
    }
    if (lower.includes('gopay') || lower.includes('ovo') || lower.includes('dana')) {
      return { bg: '#FFF4E0', text: '#FFB400', icon: Wallet };
    }
    return { bg: '#EEE8FF', text: '#7357FF', icon: Wallet };
  };

  return (
    <div className="space-y-6">
      
      {/* 1. TOPBAR / PAGE HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-foreground tracking-tight">Transaksi</h1>
          <p className="text-xs sm:text-sm text-muted-foreground">Riwayat semua aktivitas keuanganmu</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {/* Import CSV */}
          <button
            onClick={() => setShowImportDialog(true)}
            className="flex items-center justify-center gap-2 h-9 py-2 px-3.5 bg-card border border-gray-200 dark:border-zinc-800 rounded-xl font-bold text-xs text-foreground hover:bg-muted/80 shadow-sm transition-all"
          >
            <Upload className="w-3.5 h-3.5 text-muted-foreground" />
            <span>Import CSV</span>
          </button>

          {/* Export CSV */}
          <ExportButton 
            filteredTransactions={filteredTransactions} 
            className="h-9 font-bold text-xs rounded-xl border-gray-200 text-foreground"
          />

          {/* Calendar Display */}
          <div className="py-2 px-3.5 h-9 bg-card border border-gray-100 dark:border-zinc-800 rounded-xl shadow-sm text-xs font-bold text-muted-foreground flex items-center gap-2">
            <span className="w-2.5 h-2.5 bg-[#FFB400] rounded-full animate-pulse" />
            <span className="hidden sm:inline">
              {new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
            </span>
            <span className="sm:hidden">
              {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
            </span>
          </div>
        </div>
      </div>

      {/* 2. SUMMARY ROW */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5">
        {/* Total Income */}
        <div className="bg-card border border-gray-100 dark:border-zinc-800 rounded-2xl sm:rounded-3xl p-4 sm:p-5 shadow-sm flex items-center gap-3 sm:gap-4.5 hover:shadow-md transition-shadow">
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-[#E8F9EF] dark:bg-[#2ECC71]/10 rounded-2xl flex items-center justify-center flex-shrink-0">
            <ArrowDownCircle className="w-5.5 h-5.5 sm:w-6 h-6 text-[#2ECC71]" />
          </div>
          <div className="min-w-0 flex-1">
            <span className="text-[10px] sm:text-[11px] text-muted-foreground font-semibold uppercase tracking-wider block">Total Pemasukan</span>
            <span className="text-base sm:text-lg lg:text-xl font-extrabold text-[#2ECC71] tracking-tight block mt-0.5 truncate">
              {formatCurrency(totalIncome)}
            </span>
            <span className="text-[8px] sm:text-[9px] font-bold text-[#2ECC71] flex items-center gap-1 mt-1">
              <TrendingUp className="w-3 h-3" />
              {incomeChange >= 0 ? '+' : ''}{incomeChange.toFixed(1)}% dari bulan lalu
            </span>
          </div>
        </div>

        {/* Total Expense */}
        <div className="bg-card border border-gray-100 dark:border-zinc-800 rounded-2xl sm:rounded-3xl p-4 sm:p-5 shadow-sm flex items-center gap-3 sm:gap-4.5 hover:shadow-md transition-shadow">
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-[#FFE9E9] dark:bg-[#FF5C5C]/10 rounded-2xl flex items-center justify-center flex-shrink-0">
            <ArrowUpCircle className="w-5.5 h-5.5 sm:w-6 h-6 text-[#FF5C5C]" />
          </div>
          <div className="min-w-0 flex-1">
            <span className="text-[10px] sm:text-[11px] text-muted-foreground font-semibold uppercase tracking-wider block">Total Pengeluaran</span>
            <span className="text-base sm:text-lg lg:text-xl font-extrabold text-[#FF5C5C] tracking-tight block mt-0.5 truncate">
              {formatCurrency(totalExpense)}
            </span>
            <span className="text-[8px] sm:text-[9px] font-bold text-[#FF5C5C] flex items-center gap-1 mt-1">
              <TrendingDown className="w-3 h-3" />
              {expenseChange >= 0 ? '+' : ''}{expenseChange.toFixed(1)}% dari bulan lalu
            </span>
          </div>
        </div>

        {/* Remaining Net Balance */}
        <div className="bg-card border border-gray-100 dark:border-zinc-800 rounded-2xl sm:rounded-3xl p-4 sm:p-5 shadow-sm flex items-center gap-3 sm:gap-4.5 hover:shadow-md transition-shadow">
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-[#FFF4E0] dark:bg-[#FFB400]/10 rounded-2xl flex items-center justify-center flex-shrink-0">
            <Wallet className="w-5.5 h-5.5 sm:w-6 h-6 text-[#FFB400]" />
          </div>
          <div className="min-w-0 flex-1">
            <span className="text-[10px] sm:text-[11px] text-muted-foreground font-semibold uppercase tracking-wider block">Sisa Saldo</span>
            <span className="text-base sm:text-lg lg:text-xl font-extrabold text-foreground tracking-tight block mt-0.5 truncate">
              {formatCurrency(netBalance)}
            </span>
            <span className="text-[8px] sm:text-[9px] text-muted-foreground block mt-1">
              Bulan {selectedMonth.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}
            </span>
          </div>
        </div>
      </div>

      {/* 3. FILTER BAR */}
      <div className="bg-card border border-gray-100 dark:border-zinc-800 rounded-2xl p-4 shadow-sm flex flex-col xl:flex-row items-stretch xl:items-center justify-between gap-4">
        {/* Search */}
        <div className="flex-1 min-w-0 bg-[#F0F2F5] dark:bg-zinc-800/50 rounded-xl px-3.5 py-2 flex items-center gap-2">
          <Search className="w-4 h-4 text-muted-foreground flex-shrink-0" />
          <input 
            type="text" 
            placeholder="Cari transaksi..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-transparent border-0 outline-none text-xs sm:text-sm text-foreground placeholder:text-muted-foreground/60 w-full"
          />
        </div>

        {/* Filters and Controls */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Tipe Selector Buttons */}
          <div className="bg-[#F0F2F5] dark:bg-zinc-800/50 p-1 rounded-xl flex items-center gap-1">
            <button 
              onClick={() => setFilterType('all')}
              className={`py-1.5 px-3 rounded-lg text-xs font-bold transition-all ${
                filterType === 'all' ? 'bg-[#FFB400] text-white shadow-sm' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Semua
            </button>
            <button 
              onClick={() => setFilterType('income')}
              className={`py-1.5 px-3 rounded-lg text-xs font-bold transition-all ${
                filterType === 'income' ? 'bg-[#2ECC71] text-white shadow-sm' : 'text-[#2ECC71]/80 hover:text-[#2ECC71]'
              }`}
            >
              Pemasukan
            </button>
            <button 
              onClick={() => setFilterType('expense')}
              className={`py-1.5 px-3 rounded-lg text-xs font-bold transition-all ${
                filterType === 'expense' ? 'bg-[#FF5C5C] text-white shadow-sm' : 'text-[#FF5C5C]/80 hover:text-[#FF5C5C]'
              }`}
            >
              Pengeluaran
            </button>
          </div>

          {/* Month Selector */}
          <div className="bg-[#F0F2F5] dark:bg-zinc-800/50 p-1 rounded-xl flex items-center gap-2">
            <button onClick={handlePrevMonth} className="p-1.5 hover:bg-muted/70 rounded-lg text-muted-foreground hover:text-foreground transition-all">
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <span className="text-xs font-extrabold text-foreground px-2 whitespace-nowrap min-w-[90px] text-center">
              {selectedMonth.toLocaleDateString('id-ID', { month: 'short', year: 'numeric' })}
            </span>
            <button onClick={handleNextMonth} className="p-1.5 hover:bg-muted/70 rounded-lg text-muted-foreground hover:text-foreground transition-all">
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Add Transaction Button */}
          <button 
            onClick={() => setShowAddDialog(true)}
            className="flex items-center gap-1.5 py-2.5 px-4 bg-primary hover:bg-primary/95 text-white rounded-xl text-xs font-extrabold transition-all shadow-[0_4px_12px_hsl(var(--primary)/0.35)]"
          >
            <Plus className="w-4 h-4 stroke-[3px]" />
            <span>Tambah Transaksi</span>
          </button>
        </div>
      </div>

      {/* 4. MAIN GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* LEFT COLUMN: LIST TRANSAKSI */}
        <div className="lg:col-span-8 bg-card border border-gray-100 dark:border-zinc-800 rounded-3xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm sm:text-base font-extrabold text-foreground">Riwayat Transaksi</h3>
            <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground">
              <span>{filteredTransactions.length} transaksi</span>
              {/* Reset filter shortcut */}
              {(filterWallet !== 'all' || filterCategory !== 'all') && (
                <button 
                  onClick={() => {
                    setFilterWallet('all');
                    setFilterCategory('all');
                  }}
                  className="text-[#7357FF] hover:underline"
                >
                  (Reset Filter)
                </button>
              )}
            </div>
          </div>

          <div className="space-y-5">
            {Object.keys(groupedTransactions).length > 0 ? (
              Object.keys(groupedTransactions).map((dateLabel) => (
                <div key={dateLabel} className="space-y-2">
                  <div className="text-[10px] font-bold text-muted-foreground tracking-wider uppercase pl-1">
                    {dateLabel}
                  </div>
                  <div className="space-y-2">
                    {groupedTransactions[dateLabel].map((transaction) => {
                      const wallet = wallets.find(w => w.id === transaction.wallet);
                      const category = categories.find(c => c.id === transaction.category || c.name === transaction.category);
                      
                      const isWithin24Hours = (() => {
                        if (!transaction.createdAt) return true;
                        const createdTime = new Date(transaction.createdAt).getTime();
                        const now = new Date().getTime();
                        return (now - createdTime) <= 24 * 60 * 60 * 1000;
                      })();

                      return (
                        <div 
                          key={transaction.id}
                          className="flex items-center justify-between p-3.5 bg-muted/30 border border-gray-100/50 dark:border-zinc-800/40 hover:bg-muted/65 rounded-2xl transition-all group"
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
                              <span className="text-[10px] text-muted-foreground mt-0.5 block truncate">
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
                                {new Date(transaction.date).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>

                            {/* Hover Action Buttons */}
                            <div className="flex items-center gap-1.5 ml-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                onClick={() => setEditingTransaction(transaction)}
                                disabled={!isWithin24Hours}
                                title={!isWithin24Hours ? "Tidak dapat diubah setelah 24 jam" : "Edit"}
                                className="text-blue-500 hover:text-blue-600 disabled:opacity-30 p-1.5 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all"
                              >
                                <Edit className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => setDeletingTransaction(transaction)}
                                disabled={!isWithin24Hours}
                                title={!isWithin24Hours ? "Tidak dapat dihapus setelah 24 jam" : "Hapus"}
                                className="text-[#FF5C5C] hover:text-[#FF5C5C]/90 disabled:opacity-30 p-1.5 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12 text-muted-foreground text-xs font-semibold">
                Belum ada catatan transaksi pada bulan ini.
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: FILTERS BREAKDOWN */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* A. FILTER KATEGORI */}
          <div className="bg-card border border-gray-100 dark:border-zinc-800 rounded-3xl p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm sm:text-base font-extrabold text-foreground">Filter Kategori</h3>
              {filterCategory !== 'all' && (
                <button 
                  onClick={() => setFilterCategory('all')}
                  className="text-xs font-bold text-primary hover:underline"
                >
                  Reset
                </button>
              )}
            </div>

            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger className="h-10 rounded-lg border-gray-205 dark:border-zinc-800 focus:ring-primary font-semibold text-xs sm:text-sm bg-muted/20 dark:bg-zinc-900/30">
                <SelectValue placeholder="Semua Kategori" />
              </SelectTrigger>
              <SelectContent className="rounded-lg max-h-60">
                <SelectItem value="all" className="text-xs sm:text-sm font-semibold">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full flex-shrink-0 bg-foreground" />
                    <span>Semua Kategori ({monthTransactions.length})</span>
                  </div>
                </SelectItem>
                {categoryFilterList.map((cat) => (
                  <SelectItem key={cat.id} value={cat.name} className="text-xs sm:text-sm font-semibold">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: cat.color }} />
                      <span>{cat.name} ({cat.count})</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* B. PENGELUARAN TERBESAR */}
          <div className="bg-card border border-gray-100 dark:border-zinc-800 rounded-3xl p-5 shadow-sm space-y-4">
            <h3 className="text-sm sm:text-base font-extrabold text-foreground">Pengeluaran Terbesar</h3>
            
            <div className="space-y-4">
              {largestSpendingBreakdown.length > 0 ? (
                largestSpendingBreakdown.slice(0, 4).map((item) => {
                  const percent = Math.round((item.total / maxSpendingVal) * 100);
                  return (
                    <div key={item.id} className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs font-semibold">
                        <div className="flex items-center gap-2 truncate">
                          <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }} />
                          <span className="text-foreground truncate">{item.name}</span>
                        </div>
                        <span className="text-muted-foreground font-bold">{formatCurrency(item.total)}</span>
                      </div>
                      <div className="w-full bg-muted dark:bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                        <div 
                          className="h-full rounded-full" 
                          style={{ 
                            width: `${percent}%`, 
                            backgroundColor: item.color 
                          }}
                        />
                      </div>
                    </div>
                  );
                })
              ) : (
                <p className="text-[11px] text-muted-foreground text-center py-4">
                  Belum ada pengeluaran di bulan ini.
                </p>
              )}
            </div>
          </div>

          {/* C. SUMBER DANA */}
          <div className="bg-card border border-gray-100 dark:border-zinc-800 rounded-3xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm sm:text-base font-extrabold text-foreground">Sumber Dana</h3>
              <button 
                onClick={() => navigate('/kantong')}
                className="text-xs font-bold text-[#7357FF] hover:underline"
              >
                Kelola
              </button>
            </div>

            <div className="space-y-2">
              {wallets.map((wallet) => {
                const bal = getWalletBalance(wallet.id);
                const ui = getWalletIconStyle(wallet.name);
                const IconComp = ui.icon;

                return (
                  <div 
                    key={wallet.id}
                    onClick={() => setFilterWallet(filterWallet === wallet.id ? 'all' : wallet.id)}
                    className={`p-3 bg-muted/40 hover:bg-muted/80 rounded-2xl cursor-pointer flex items-center justify-between transition-all ${
                      filterWallet === wallet.id ? 'ring-2 ring-[#FFB400]' : ''
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: ui.bg }}
                      >
                        <CategoryIcon icon={wallet.icon || 'wallet'} color={wallet.color || ui.text} className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-xs font-extrabold text-foreground truncate max-w-[120px] sm:max-w-[150px]" title={wallet.name}>{wallet.name}</h4>
                        <span className="text-[9px] text-muted-foreground block mt-0.5 truncate max-w-[110px] sm:max-w-[130px]" title={wallet.actualGroup || 'Dompet'}>{wallet.actualGroup || 'Dompet'}</span>
                      </div>
                    </div>
                    <span className="text-xs font-extrabold text-foreground pl-2">{formatCurrency(bal)}</span>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

      </div>

      {/* dialog handlers */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="w-[95vw] max-w-md mx-auto rounded-3xl">
          <AddTransactionForm onClose={() => setShowAddDialog(false)} />
        </DialogContent>
      </Dialog>

      {editingTransaction && (
        <Dialog
          open={!!editingTransaction}
          onOpenChange={(open) => !open && setEditingTransaction(null)}
        >
          <DialogContent className="w-[95vw] max-w-md mx-auto rounded-3xl">
            <EditTransactionForm
              transaction={editingTransaction}
              open={!!editingTransaction}
              onOpenChange={(open) => !open && setEditingTransaction(null)}
            />
          </DialogContent>
        </Dialog>
      )}

      {/* Delete Transaction Confirm */}
      <ConfirmDialog
        open={!!deletingTransaction}
        onOpenChange={(open) => !open && setDeletingTransaction(null)}
        title="Hapus transaksi ini?"
        description={deletingTransaction ? `"${deletingTransaction.description}" akan dihapus secara permanen.` : undefined}
        confirmLabel="Ya, Hapus"
        cancelLabel="Batal"
        variant="danger"
        onConfirm={async () => {
          if (!deletingTransaction) return;
          try {
            await deleteTransaction(deletingTransaction.id);
            toast.success('Transaksi berhasil dihapus');
          } catch {
            toast.error('Gagal menghapus transaksi');
          } finally {
            setDeletingTransaction(null);
          }
        }}
      />
      <ImportCSVDialog
        open={showImportDialog}
        onOpenChange={setShowImportDialog}
      />

    </div>
  );
};

export default Transactions;

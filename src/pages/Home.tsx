import React, { useState, useEffect } from 'react';
import { useFinance } from '../contexts/FinanceContext';
import { useAuth } from '../contexts/AuthContext';
import { Dialog, DialogContent, DialogTrigger, DialogHeader, DialogTitle } from '../components/ui/dialog';
import AddTransactionForm from '../components/AddTransactionForm';
import BalanceTransferDialog from '../components/BalanceTransferDialog';
import { CategoryIcon } from '../components/CategoryIcon';
import { Badge } from '../components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { formatCompact } from '../lib/utils';
import { 
  Wallet, TrendingUp, TrendingDown, Eye, EyeOff, Bell, Plus, 
  ArrowLeftRight, FileText, PieChart, ArrowDownCircle, ArrowUpCircle, 
  ChevronRight, RefreshCw, LogOut, Settings, BarChart3, List, Trash2, ArrowUp, ArrowDown
} from 'lucide-react';

interface ShortcutItem {
  id: string;
  name: string;
  icon: string;
  color: string;
  actionType: 'add-transaction' | 'transfer' | 'navigate-kantong' | 'navigate-transactions' | 'navigate-analytics' | 'navigate-settings';
}

const iconMap: Record<string, any> = {
  'plus': Plus,
  'arrow-left-right': ArrowLeftRight,
  'file-text': FileText,
  'pie-chart': PieChart,
  'wallet': Wallet,
  'bar-chart': BarChart3,
  'settings': Settings,
  'list': List
};

export default function Home() {
  const { 
    getFinancialSummary, 
    wallets, 
    categories, 
    getWalletBalance, 
    transactions, 
    loading, 
    refreshData 
  } = useFinance();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [isAddTransactionOpen, setIsAddTransactionOpen] = useState(false);
  const [showBalance, setShowBalance] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // 1. Notification States
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadNotifications, setUnreadNotifications] = useState(true);
  const mockNotifications = [
    { id: 1, title: 'Selamat datang di Money Tracker!', description: 'Kelola keuanganmu secara cerdas dengan fitur Kantong, Transaksi, dan Analisis kami.', time: 'Baru saja' },
    { id: 2, title: 'Tips Keuangan Hari Ini', description: 'Atur warna tema utama aplikasi sesuai kepribadianmu di halaman Pengaturan.', time: '2 jam yang lalu' },
    { id: 3, title: 'Sistem Terbaca', description: 'Koneksi dengan Supabase aman dan seluruh riwayat transaksi tersinkronisasi.', time: '1 hari yang lalu' }
  ];

  // 2. Shortcut States (customizable & persisted)
  const [shortcuts, setShortcuts] = useState<ShortcutItem[]>(() => {
    const saved = localStorage.getItem('homeShortcuts');
    if (saved) return JSON.parse(saved);
    return [
      { id: '1', name: 'Tambah Uang', icon: 'plus', color: '#FFB400', actionType: 'add-transaction' },
      { id: '2', name: 'Transfer', icon: 'arrow-left-right', color: '#7357FF', actionType: 'transfer' },
      { id: '3', name: 'Tagihan', icon: 'file-text', color: '#FF5C5C', actionType: 'add-transaction' },
      { id: '4', name: 'Kantong', icon: 'pie-chart', color: '#2ECC71', actionType: 'navigate-kantong' }
    ];
  });

  const [showManageShortcuts, setShowManageShortcuts] = useState(false);
  const [editingShortcut, setEditingShortcut] = useState<ShortcutItem | null>(null);
  
  const [shortcutForm, setShortcutForm] = useState({
    name: '',
    icon: 'plus',
    color: '#FFB400',
    actionType: 'add-transaction' as ShortcutItem['actionType']
  });

  useEffect(() => {
    localStorage.setItem('homeShortcuts', JSON.stringify(shortcuts));
  }, [shortcuts]);

  const handleAddShortcut = (e: React.FormEvent) => {
    e.preventDefault();
    if (!shortcutForm.name) return;
    const newItem: ShortcutItem = {
      id: Date.now().toString(),
      ...shortcutForm
    };
    setShortcuts(prev => [...prev, newItem]);
    setShortcutForm({
      name: '',
      icon: 'plus',
      color: '#FFB400',
      actionType: 'add-transaction'
    });
    toast.success('Shortcut berhasil ditambahkan');
  };

  const handleUpdateShortcut = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingShortcut || !editingShortcut.name) return;
    setShortcuts(prev => prev.map(item => item.id === editingShortcut.id ? editingShortcut : item));
    setEditingShortcut(null);
    toast.success('Shortcut berhasil diubah');
  };

  const handleDeleteShortcut = (id: string) => {
    setShortcuts(prev => prev.filter(item => item.id !== id));
    toast.success('Shortcut berhasil dihapus');
  };

  const moveShortcut = (idx: number, direction: 'up' | 'down') => {
    const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= shortcuts.length) return;
    
    const updated = [...shortcuts];
    const temp = updated[idx];
    updated[idx] = updated[targetIdx];
    updated[targetIdx] = temp;
    setShortcuts(updated);
  };

  const handleShortcutClick = (item: ShortcutItem) => {
    if (item.actionType === 'add-transaction') {
      setIsAddTransactionOpen(true);
    } else if (item.actionType === 'navigate-kantong') {
      navigate('/kantong');
    } else if (item.actionType === 'navigate-transactions') {
      navigate('/transactions');
    } else if (item.actionType === 'navigate-analytics') {
      navigate('/analytics');
    } else if (item.actionType === 'navigate-settings') {
      navigate('/settings');
    }
  };

  const iconOptions = ['plus', 'arrow-left-right', 'file-text', 'pie-chart', 'wallet', 'bar-chart', 'settings', 'list'];
  const colorOptions = ['#FFB400', '#7357FF', '#2ECC71', '#FF5C5C', '#00A3D9'];
  const actionOptions = [
    { label: 'Catat Transaksi', value: 'add-transaction' },
    { label: 'Transfer Saldo', value: 'transfer' },
    { label: 'Buka Halaman Kantong', value: 'navigate-kantong' },
    { label: 'Buka Halaman Transaksi', value: 'navigate-transactions' },
    { label: 'Buka Halaman Analisis', value: 'navigate-analytics' },
    { label: 'Buka Halaman Pengaturan', value: 'navigate-settings' }
  ];

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refreshData();
      toast.success('Data berhasil diperbarui');
    } catch (err) {
      toast.error('Gagal memperbarui data');
    } finally {
      setIsRefreshing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw className="h-8 w-8 animate-spin text-[#FFB400]" />
          <p className="text-muted-foreground text-sm">Memuat data keuangan...</p>
        </div>
      </div>
    );
  }

  const summary = getFinancialSummary();
  const recentTransactions = transactions.slice(0, 5);

  const getGreeting = () => {
    const hours = new Date().getHours();
    if (hours < 11) return 'Selamat pagi';
    if (hours < 15) return 'Selamat siang';
    if (hours < 19) return 'Selamat sore';
    return 'Selamat malam';
  };

  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const currentMonthTransactions = transactions.filter(t => {
    const d = new Date(t.date);
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
  });

  const lastMonthDate = new Date(currentYear, currentMonth - 1, 1);
  const lastMonthTransactions = transactions.filter(t => {
    const d = new Date(t.date);
    return d.getMonth() === lastMonthDate.getMonth() && d.getFullYear() === lastMonthDate.getFullYear();
  });

  const currentMonthTotal = currentMonthTransactions.reduce((sum, t) => sum + (t.type === 'income' ? t.amount : -t.amount), 0);
  const lastMonthTotal = lastMonthTransactions.reduce((sum, t) => sum + (t.type === 'income' ? t.amount : -t.amount), 0);

  let percentChange = 0;
  if (lastMonthTotal !== 0) {
    percentChange = ((currentMonthTotal - lastMonthTotal) / Math.abs(lastMonthTotal)) * 100;
  } else if (currentMonthTotal !== 0) {
    percentChange = 100;
  }

  // Monthly change percentages compared to last month
  const lastMonthIncome = lastMonthTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
  const currentMonthIncome = currentMonthTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
  let incomePercentChange = 0;
  if (lastMonthIncome > 0) {
    incomePercentChange = ((currentMonthIncome - lastMonthIncome) / lastMonthIncome) * 100;
  } else if (currentMonthIncome > 0) {
    incomePercentChange = 100;
  }

  const lastMonthExpense = lastMonthTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
  const currentMonthExpense = currentMonthTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
  let expensePercentChange = 0;
  if (lastMonthExpense > 0) {
    expensePercentChange = ((currentMonthExpense - lastMonthExpense) / lastMonthExpense) * 100;
  } else if (currentMonthExpense > 0) {
    expensePercentChange = 100;
  }

  const lastMonthRemaining = Math.max(0, lastMonthIncome - lastMonthExpense);
  const currentMonthRemaining = Math.max(0, currentMonthIncome - currentMonthExpense);
  let remainingPercentChange = 0;
  if (lastMonthRemaining > 0) {
    remainingPercentChange = ((currentMonthRemaining - lastMonthRemaining) / lastMonthRemaining) * 100;
  } else if (currentMonthRemaining > 0) {
    remainingPercentChange = 100;
  }

  const monthlyTrend = [];
  let maxExpense = 1;
  for (let i = 4; i >= 0; i--) {
    const date = new Date(currentYear, currentMonth - i, 1);
    const monthTransactions = transactions.filter(t => {
      const d = new Date(t.date);
      return d.getMonth() === date.getMonth() && d.getFullYear() === date.getFullYear();
    });

    const expenseSum = monthTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    if (expenseSum > maxExpense) {
      maxExpense = expenseSum;
    }

    monthlyTrend.push({
      label: date.toLocaleDateString('id-ID', { month: 'short' }),
      expense: expenseSum,
      isCurrent: i === 0
    });
  }

  const expenseTransactions = currentMonthTransactions.filter(t => t.type === 'expense');
  const totalExpense = expenseTransactions.reduce((sum, t) => sum + t.amount, 0);

  const categorySums: Record<string, number> = {};
  expenseTransactions.forEach(t => {
    categorySums[t.category] = (categorySums[t.category] || 0) + t.amount;
  });

  const topCategories = Object.entries(categorySums)
    .map(([catId, amount]) => {
      const categoryObj = categories.find(c => c.id === catId || c.name === catId);
      return {
        id: catId,
        name: categoryObj?.name || catId,
        amount,
        color: categoryObj?.color || '#FFB400',
        pct: totalExpense > 0 ? Math.round((amount / totalExpense) * 100) : 0
      };
    })
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 4);

  const income = summary.monthlyIncome;
  const expense = summary.monthlyExpense;
  const remaining = Math.max(0, income - expense);

  let expensePct = 0;
  let remainingPct = 0;

  if (income > 0) {
    expensePct = Math.min(100, Math.round((expense / income) * 100));
    remainingPct = 100 - expensePct;
  } else if (expense > 0) {
    expensePct = 100;
    remainingPct = 0;
  }

  const circumference = 238.76;
  const expenseDash = (circumference * expensePct) / 100;
  const remainingDash = (circumference * remainingPct) / 100;

  const centerLabel = income > 0 ? 'Sisa' : 'Total Keluar';
  const centerAmount = income > 0 ? remaining : expense;

  const myWallets = wallets.map(wallet => {
    const balance = getWalletBalance(wallet.id);
    const target = 10000000; 
    const pct = Math.min(100, Math.round((balance / target) * 100));
    return {
      ...wallet,
      balance,
      target,
      pct
    };
  });

  return (
    <div className="space-y-6 w-full pb-12">
      {/* HEADER SECTION */}
      <div className="flex items-center justify-between bg-card p-4 sm:p-6 rounded-3xl border border-gray-100 dark:border-zinc-800 shadow-sm transition-all duration-300">
        <div className="flex items-center gap-4">
          <div className="relative h-14 w-14 rounded-2xl overflow-hidden bg-gradient-to-br from-primary to-[#7357FF] p-[2px] shadow-md flex items-center justify-center">
            <div className="bg-white dark:bg-zinc-950 w-full h-full rounded-2xl flex items-center justify-center font-bold text-lg text-primary">
              {user?.user_metadata?.full_name?.charAt(0) || user?.email?.charAt(0)?.toUpperCase() || 'A'}
            </div>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h2 className="text-xl font-extrabold text-foreground tracking-tight">
                {getGreeting()}, {user?.user_metadata?.full_name || user?.email?.split('@')?.[0] || 'Andi'} 👋
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">Kelola keuanganmu dengan cerdas</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="w-10 h-10 bg-muted hover:bg-muted/80 rounded-xl flex items-center justify-center transition-colors"
            title="Perbarui Data"
          >
            <RefreshCw className={`w-4 h-4 text-foreground ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>

          {/* NOTIFICATION WITH POPOVER PANEL */}
          <div className="relative">
            <button 
              onClick={() => {
                setShowNotifications(!showNotifications);
                setUnreadNotifications(false);
              }}
              className="w-10 h-10 bg-muted hover:bg-muted/80 rounded-xl flex items-center justify-center relative transition-colors"
              title="Notifikasi"
            >
              <Bell className="w-5 h-5 text-foreground" />
              {unreadNotifications && (
                <div className="w-2.5 h-2.5 bg-[#FF5C5C] rounded-full absolute top-2.5 right-2.5 border-2 border-card" />
              )}
            </button>
            
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-card border border-gray-100 dark:border-zinc-800 rounded-2xl shadow-xl p-4 z-50 animate-fade-in">
                <div className="flex items-center justify-between pb-2.5 border-b border-gray-100 dark:border-zinc-800">
                  <h4 className="font-extrabold text-xs sm:text-sm text-foreground">Notifikasi</h4>
                  <button 
                    onClick={() => setShowNotifications(false)}
                    className="text-[10px] font-bold text-primary hover:underline"
                  >
                    Tutup
                  </button>
                </div>
                <div className="mt-3 space-y-3 max-h-60 overflow-y-auto custom-scrollbar">
                  {mockNotifications.map((notif) => (
                    <div key={notif.id} className="space-y-1 text-left pb-2 border-b border-gray-50 dark:border-zinc-900/40 last:border-none last:pb-0">
                      <p className="text-xs font-bold text-foreground leading-snug">{notif.title}</p>
                      <p className="text-[10px] text-muted-foreground leading-relaxed">{notif.description}</p>
                      <span className="text-[9px] text-muted-foreground/60 block mt-1">{notif.time}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT COLUMN */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* TOTAL BALANCE CARD (Supports proper light/dark theme switching) */}
          <div className="bg-gradient-to-br from-primary to-primary/90 dark:from-[#111112] dark:to-[#1E1E22] dark:border dark:border-zinc-800 rounded-3xl p-6 text-white dark:text-foreground shadow-xl relative overflow-hidden transition-all duration-300">
            {/* Background elements */}
            <div className="absolute w-48 h-48 rounded-full bg-white/10 dark:bg-primary/10 -top-14 -right-12 blur-sm pointer-events-none" />
            <div className="absolute w-32 h-32 rounded-full bg-white/5 dark:bg-[#7357FF]/5 -bottom-8 right-16 blur-sm pointer-events-none" />

            <div className="relative z-10 space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs sm:text-sm text-white/80 dark:text-muted-foreground font-medium">Saldo Total</span>
                  <button 
                    onClick={() => setShowBalance(!showBalance)}
                    className="p-1 rounded-md hover:bg-white/10 dark:hover:bg-muted transition-colors"
                  >
                    {showBalance ? (
                      <Eye className="w-4 h-4 text-white/80 dark:text-muted-foreground" />
                    ) : (
                      <EyeOff className="w-4 h-4 text-white/80 dark:text-muted-foreground" />
                    )}
                  </button>
                </div>
                <Badge className="bg-white/20 dark:bg-[#2ECC71]/10 border border-white/30 dark:border-[#2ECC71]/20 text-white dark:text-[#2ECC71] text-[10px] sm:text-xs flex items-center gap-1 py-1 px-2.5">
                  <TrendingUp className="w-3.5 h-3.5" />
                  {percentChange >= 0 ? '+' : ''}{percentChange.toFixed(1)}%
                </Badge>
              </div>

              <div className="text-3xl sm:text-4xl font-black tracking-tight text-white dark:text-foreground">
                {showBalance ? `Rp ${summary.totalBalance.toLocaleString('id-ID')}` : 'Rp ••••••••'}
              </div>

              <div className="h-[1px] bg-white/20 dark:bg-zinc-800 w-full" />

              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/15 dark:bg-[#2ECC71]/10 rounded-xl flex items-center justify-center">
                    <ArrowDownCircle className="w-5 h-5 text-white dark:text-[#2ECC71]" />
                  </div>
                  <div>
                    <span className="text-[10px] sm:text-xs text-white/70 dark:text-muted-foreground block">Pemasukan</span>
                    <span className="text-xs sm:text-sm font-bold text-white dark:text-[#2ECC71]">
                      Rp {summary.monthlyIncome.toLocaleString('id-ID')}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/15 dark:bg-[#FF5C5C]/10 rounded-xl flex items-center justify-center">
                    <ArrowUpCircle className="w-5 h-5 text-white dark:text-[#FF5C5C]" />
                  </div>
                  <div>
                    <span className="text-[10px] sm:text-xs text-white/70 dark:text-muted-foreground block">Pengeluaran</span>
                    <span className="text-xs sm:text-sm font-bold text-white dark:text-[#FF5C5C]">
                      Rp {summary.monthlyExpense.toLocaleString('id-ID')}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* STAT MINI CARDS */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Total Pemasukan */}
            <div className="bg-card border border-gray-100 dark:border-zinc-800 rounded-2xl sm:rounded-3xl p-4 sm:p-5 shadow-sm flex items-center gap-3 sm:gap-4.5 hover:shadow-md transition-shadow">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-[#E8F9EF] dark:bg-[#2ECC71]/10 rounded-2xl flex items-center justify-center flex-shrink-0">
                <ArrowDownCircle className="w-5.5 h-5.5 sm:w-6 h-6 text-[#2ECC71]" />
              </div>
              <div className="min-w-0 flex-1">
                <span className="text-[10px] sm:text-[11px] text-muted-foreground font-semibold uppercase tracking-wider block">Total Pemasukan</span>
                <span className="text-base sm:text-lg lg:text-xl font-extrabold text-[#2ECC71] tracking-tight block mt-0.5 truncate">
                  Rp {summary.monthlyIncome.toLocaleString('id-ID')}
                </span>
                <span className={`text-[8px] sm:text-[9px] font-bold flex items-center gap-0.5 mt-1 ${
                  incomePercentChange >= 0 ? 'text-[#2ECC71]' : 'text-[#FF5C5C]'
                }`}>
                  <TrendingUp className="w-3 h-3" />
                  {incomePercentChange >= 0 ? '+' : ''}{incomePercentChange.toFixed(1)}% dari bulan lalu
                </span>
              </div>
            </div>

            {/* Total Pengeluaran */}
            <div className="bg-card border border-gray-100 dark:border-zinc-800 rounded-2xl sm:rounded-3xl p-4 sm:p-5 shadow-sm flex items-center gap-3 sm:gap-4.5 hover:shadow-md transition-shadow">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-[#FFE9E9] dark:bg-[#FF5C5C]/10 rounded-2xl flex items-center justify-center flex-shrink-0">
                <ArrowUpCircle className="w-5.5 h-5.5 sm:w-6 h-6 text-[#FF5C5C]" />
              </div>
              <div className="min-w-0 flex-1">
                <span className="text-[10px] sm:text-[11px] text-muted-foreground font-semibold uppercase tracking-wider block">Total Pengeluaran</span>
                <span className="text-base sm:text-lg lg:text-xl font-extrabold text-[#FF5C5C] tracking-tight block mt-0.5 truncate">
                  Rp {summary.monthlyExpense.toLocaleString('id-ID')}
                </span>
                <span className={`text-[8px] sm:text-[9px] font-bold flex items-center gap-0.5 mt-1 ${
                  expensePercentChange <= 0 ? 'text-[#2ECC71]' : 'text-[#FF5C5C]'
                }`}>
                  <TrendingDown className="w-3 h-3" />
                  {expensePercentChange >= 0 ? '+' : ''}{expensePercentChange.toFixed(1)}% dari bulan lalu
                </span>
              </div>
            </div>

            {/* Sisa Saldo */}
            <div className="bg-card border border-gray-100 dark:border-zinc-800 rounded-2xl sm:rounded-3xl p-4 sm:p-5 shadow-sm flex items-center gap-3 sm:gap-4.5 hover:shadow-md transition-shadow">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-[#FFF4E0] dark:bg-[#FFB400]/10 rounded-2xl flex items-center justify-center flex-shrink-0">
                <Wallet className="w-5.5 h-5.5 sm:w-6 h-6 text-[#FFB400]" />
              </div>
              <div className="min-w-0 flex-1">
                <span className="text-[10px] sm:text-[11px] text-muted-foreground font-semibold uppercase tracking-wider block">Sisa Saldo</span>
                <span className="text-base sm:text-lg lg:text-xl font-extrabold text-foreground tracking-tight block mt-0.5 truncate">
                  Rp {remaining.toLocaleString('id-ID')}
                </span>
                <span className={`text-[8px] sm:text-[9px] font-bold flex items-center gap-0.5 mt-1 ${
                  remainingPercentChange >= 0 ? 'text-[#2ECC71]' : 'text-[#FF5C5C]'
                }`}>
                  <TrendingUp className="w-3 h-3" />
                  {remainingPercentChange >= 0 ? '+' : ''}{remainingPercentChange.toFixed(1)}% dari bulan lalu
                </span>
              </div>
            </div>
          </div>

          {/* CUSTOMIZABLE SHORTCUT ACTIONS */}
          <div className="bg-card border border-gray-100 dark:border-zinc-800 rounded-3xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm sm:text-base font-extrabold text-foreground">Shortcut</h3>
              <Dialog open={showManageShortcuts} onOpenChange={setShowManageShortcuts}>
                <DialogTrigger asChild>
                  <button className="text-xs font-bold text-primary hover:underline">
                    Kelola
                  </button>
                </DialogTrigger>
                <DialogContent className="w-[95vw] max-w-md mx-auto rounded-3xl max-h-[85vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle className="text-sm sm:text-base font-extrabold text-foreground">Kelola Shortcut</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-5 pt-2">
                    {/* Shortcut list with reordering/actions */}
                    <div className="space-y-2">
                      <Label className="text-xs font-bold text-muted-foreground">Urutan Shortcut</Label>
                      {shortcuts.map((item, idx) => {
                        const IconComponent = iconMap[item.icon] || Plus;
                        return (
                          <div key={item.id} className="flex items-center justify-between p-2.5 border border-gray-100 dark:border-zinc-800 rounded-xl bg-muted/20">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full flex items-center justify-center text-white" style={{ backgroundColor: item.color }}>
                                <IconComponent className="w-4 h-4" />
                              </div>
                              <span className="text-xs font-extrabold text-foreground">{item.name}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <button 
                                onClick={() => moveShortcut(idx, 'up')}
                                disabled={idx === 0}
                                className="p-1.5 hover:bg-muted rounded-lg disabled:opacity-30"
                              >
                                <ArrowUp className="w-3.5 h-3.5" />
                              </button>
                              <button 
                                onClick={() => moveShortcut(idx, 'down')}
                                disabled={idx === shortcuts.length - 1}
                                className="p-1.5 hover:bg-muted rounded-lg disabled:opacity-30"
                              >
                                <ArrowDown className="w-3.5 h-3.5" />
                              </button>
                              <button 
                                onClick={() => setEditingShortcut(item)}
                                className="p-1.5 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-950/20 rounded-lg text-xs font-bold"
                              >
                                Edit
                              </button>
                              <button 
                                onClick={() => handleDeleteShortcut(item.id)}
                                className="p-1.5 text-[#FF5C5C] hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Edit Shortcut Form (Inline) */}
                    {editingShortcut && (
                      <form onSubmit={handleUpdateShortcut} className="p-4 border border-blue-100 dark:border-blue-900 bg-blue-50/20 dark:bg-blue-950/10 rounded-2xl space-y-3">
                        <h4 className="text-xs font-bold text-blue-500">Edit Shortcut: {editingShortcut.name}</h4>
                        <div className="space-y-1.5">
                          <Label className="text-[11px] font-bold text-muted-foreground">Nama Shortcut</Label>
                          <Input 
                            value={editingShortcut.name}
                            onChange={e => setEditingShortcut(prev => prev ? { ...prev, name: e.target.value } : null)}
                            required
                            className="h-9 rounded-xl text-xs"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div className="space-y-1.5">
                            <Label className="text-[11px] font-bold text-muted-foreground">Ikon</Label>
                            <Select 
                              value={editingShortcut.icon} 
                              onValueChange={val => setEditingShortcut(prev => prev ? { ...prev, icon: val } : null)}
                            >
                              <SelectTrigger className="h-9 rounded-xl text-xs">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {iconOptions.map(icon => (
                                  <SelectItem key={icon} value={icon} className="text-xs">{icon}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-1.5">
                            <Label className="text-[11px] font-bold text-muted-foreground">Warna</Label>
                            <div className="flex gap-1.5 items-center mt-1">
                              {colorOptions.map(color => (
                                <button
                                  key={color}
                                  type="button"
                                  onClick={() => setEditingShortcut(prev => prev ? { ...prev, color } : null)}
                                  className={`w-5 h-5 rounded-full border ${editingShortcut.color === color ? 'border-foreground scale-110' : 'border-transparent'}`}
                                  style={{ backgroundColor: color }}
                                />
                              ))}
                            </div>
                          </div>
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-[11px] font-bold text-muted-foreground">Aksi Target</Label>
                          <Select 
                            value={editingShortcut.actionType} 
                            onValueChange={val => setEditingShortcut(prev => prev ? { ...prev, actionType: val as ShortcutItem['actionType'] } : null)}
                          >
                            <SelectTrigger className="h-9 rounded-xl text-xs">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {actionOptions.map(act => (
                                <SelectItem key={act.value} value={act.value} className="text-xs">{act.label}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="flex gap-2 pt-1">
                          <Button type="submit" className="h-8 rounded-lg text-xs flex-1 bg-primary text-white font-bold">Simpan</Button>
                          <Button type="button" onClick={() => setEditingShortcut(null)} variant="outline" className="h-8 rounded-lg text-xs flex-1">Batal</Button>
                        </div>
                      </form>
                    )}

                    {/* Add Shortcut Form */}
                    {!editingShortcut && (
                      <form onSubmit={handleAddShortcut} className="p-4 border border-gray-100 dark:border-zinc-800 rounded-2xl bg-muted/10 space-y-3">
                        <h4 className="text-xs font-bold text-foreground">Tambah Shortcut Baru</h4>
                        <div className="space-y-1.5">
                          <Label className="text-[11px] font-bold text-muted-foreground">Nama Shortcut</Label>
                          <Input 
                            value={shortcutForm.name}
                            onChange={e => setShortcutForm(prev => ({ ...prev, name: e.target.value }))}
                            placeholder="Contoh: Dompet Utama"
                            required
                            className="h-9 rounded-xl text-xs"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div className="space-y-1.5">
                            <Label className="text-[11px] font-bold text-muted-foreground">Ikon</Label>
                            <Select 
                              value={shortcutForm.icon} 
                              onValueChange={val => setShortcutForm(prev => ({ ...prev, icon: val }))}
                            >
                              <SelectTrigger className="h-9 rounded-xl text-xs">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {iconOptions.map(icon => (
                                  <SelectItem key={icon} value={icon} className="text-xs">{icon}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-1.5">
                            <Label className="text-[11px] font-bold text-muted-foreground">Warna</Label>
                            <div className="flex gap-1.5 items-center mt-1">
                              {colorOptions.map(color => (
                                <button
                                  key={color}
                                  type="button"
                                  onClick={() => setShortcutForm(prev => ({ ...prev, color }))}
                                  className={`w-5 h-5 rounded-full border ${shortcutForm.color === color ? 'border-foreground scale-110' : 'border-transparent'}`}
                                  style={{ backgroundColor: color }}
                                />
                              ))}
                            </div>
                          </div>
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-[11px] font-bold text-muted-foreground">Aksi Target</Label>
                          <Select 
                            value={shortcutForm.actionType} 
                            onValueChange={val => setShortcutForm(prev => ({ ...prev, actionType: val as ShortcutItem['actionType'] }))}
                          >
                            <SelectTrigger className="h-9 rounded-xl text-xs">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {actionOptions.map(act => (
                                <SelectItem key={act.value} value={act.value} className="text-xs">{act.label}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <Button type="submit" className="w-full h-9 rounded-xl text-xs bg-primary text-white font-bold mt-2">Tambah Shortcut</Button>
                      </form>
                    )}
                  </div>
                </DialogContent>
              </Dialog>
            </div>
            <div className="grid grid-cols-4 gap-3">
              {shortcuts.map((item) => {
                const IconComponent = iconMap[item.icon] || Plus;
                
                // 1. Special Handling for Add Transaction shortcut
                if (item.actionType === 'add-transaction') {
                  return (
                    <Dialog key={item.id} open={isAddTransactionOpen} onOpenChange={setIsAddTransactionOpen}>
                      <DialogTrigger asChild>
                        <button className="flex flex-col items-center gap-2 group p-2.5 bg-muted/40 hover:bg-muted/80 rounded-2xl transition-all duration-200 w-full">
                          <div className="w-11 h-11 text-white rounded-full flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform duration-200" style={{ backgroundColor: item.color }}>
                            <IconComponent className="w-5 h-5" />
                          </div>
                          <span className="text-[10px] sm:text-xs font-bold text-foreground text-center truncate w-full">{item.name}</span>
                        </button>
                      </DialogTrigger>
                      <DialogContent className="w-[95vw] max-w-md mx-auto rounded-3xl">
                        <AddTransactionForm onClose={() => setIsAddTransactionOpen(false)} />
                      </DialogContent>
                    </Dialog>
                  );
                }

                // 2. Special Handling for Transfer shortcut
                if (item.actionType === 'transfer') {
                  return (
                    <BalanceTransferDialog 
                      key={item.id}
                      trigger={
                        <button className="flex flex-col items-center gap-2 group p-2.5 bg-muted/40 hover:bg-muted/80 rounded-2xl transition-all duration-200 w-full">
                          <div className="w-11 h-11 text-white rounded-full flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform duration-200" style={{ backgroundColor: item.color }}>
                            <IconComponent className="w-5 h-5" />
                          </div>
                          <span className="text-[10px] sm:text-xs font-bold text-foreground text-center truncate w-full">{item.name}</span>
                        </button>
                      }
                    />
                  );
                }

                // 3. Regular navigation shortcuts
                return (
                  <button 
                    key={item.id}
                    onClick={() => handleShortcutClick(item)}
                    className="flex flex-col items-center gap-2 group p-2.5 bg-muted/40 hover:bg-muted/80 rounded-2xl transition-all duration-200 w-full"
                  >
                    <div className="w-11 h-11 text-white rounded-full flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform duration-200" style={{ backgroundColor: item.color }}>
                      <IconComponent className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] sm:text-xs font-bold text-foreground text-center truncate w-full">{item.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* INSIGHT CHART (Uses compact number formatting rules) */}
          <div className="bg-card border border-gray-100 dark:border-zinc-800 rounded-3xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-sm sm:text-base font-extrabold text-foreground">Insight Bulan Ini</h3>
              <button 
                onClick={() => navigate('/analytics')}
                className="text-xs font-bold text-primary hover:underline"
              >
                Lihat Detail
              </button>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-6 mb-6">
              {/* Custom SVG Donut */}
              <div className="relative w-32 h-32 flex-shrink-0">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="38" fill="none" stroke="currentColor" className="text-muted/30" strokeWidth="12" />
                  {remainingPct > 0 && (
                    <circle 
                      cx="50" 
                      cy="50" 
                      r="38" 
                      fill="none" 
                      stroke="#2ECC71" 
                      strokeWidth="12" 
                      strokeDasharray={`${remainingDash} ${circumference}`}
                      strokeDashoffset="0"
                      strokeLinecap="round"
                      className="transition-all duration-500"
                    />
                  )}
                  {expensePct > 0 && (
                    <circle 
                      cx="50" 
                      cy="50" 
                      r="38" 
                      fill="none" 
                      stroke="#FF5C5C" 
                      strokeWidth="12" 
                      strokeDasharray={`${expenseDash} ${circumference}`}
                      strokeDashoffset={-remainingDash}
                      strokeLinecap="round"
                      className="transition-all duration-500"
                    />
                  )}
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-1">
                  <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">{centerLabel}</span>
                  <span className="text-xs sm:text-sm font-extrabold text-foreground mt-0.5 truncate max-w-[90px]">
                    {formatCompact(centerAmount, 'Rp ')}
                  </span>
                </div>
              </div>

              {/* Legends with compact values */}
              <div className="flex-1 w-full space-y-3">
                <div className="flex justify-between items-center text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-[#2ECC71]" />
                    <span className="text-muted-foreground">Pemasukan</span>
                  </div>
                  <span className="font-bold text-[#2ECC71]">{formatCompact(income, 'Rp ')}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-[#FF5C5C]" />
                    <span className="text-muted-foreground">Pengeluaran</span>
                  </div>
                  <span className="font-bold text-[#FF5C5C]">{formatCompact(expense, 'Rp ')}</span>
                </div>
                <div className="h-[1px] bg-gray-100 dark:bg-zinc-800 w-full" />
                <div className="flex justify-between items-center text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-primary" />
                    <span className="text-muted-foreground">Sisa Saldo</span>
                  </div>
                  <span className="font-bold text-foreground">{formatCompact(remaining, 'Rp ')}</span>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN */}
        <div className="lg:col-span-5 space-y-6">
          {/* KANTONG SAYA (WALLETS) */}
          <div className="bg-card border border-gray-100 dark:border-zinc-800 rounded-3xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm sm:text-base font-extrabold text-foreground">Kantong Saya</h3>
              <button 
                onClick={() => navigate('/kantong')}
                className="text-xs font-bold text-primary hover:underline"
              >
                Kelola
              </button>
            </div>

            <div className="space-y-3.5">
              {myWallets.length > 0 ? (
                myWallets.map(wallet => (
                  <div 
                    key={wallet.id} 
                    onClick={() => navigate(`/wallets/${wallet.id}`)}
                    className="p-3.5 bg-muted/40 hover:bg-muted/80 rounded-2xl cursor-pointer flex items-center justify-between transition-all duration-200 hover:-translate-y-0.5"
                  >
                    <div className="flex items-center gap-3.5 flex-1 min-w-0">
                      <div 
                        className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: wallet.color + '20' }}
                      >
                        <CategoryIcon icon={wallet.icon || 'wallet'} color={wallet.color} className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="text-xs sm:text-sm font-bold text-foreground block truncate">{wallet.name}</span>
                        {/* Target progress bar */}
                        <div className="w-full bg-muted dark:bg-zinc-800 h-1.5 rounded-full mt-2.5 overflow-hidden">
                          <div 
                            className="h-full rounded-full transition-all duration-500" 
                            style={{ 
                              width: `${wallet.pct}%`, 
                              backgroundColor: wallet.color 
                            }}
                          />
                        </div>
                      </div>
                    </div>
                    <div className="text-right pl-4">
                      <span className="text-xs sm:text-sm font-extrabold text-foreground block">
                        Rp {wallet.balance.toLocaleString('id-ID')}
                      </span>
                      <span className="text-[10px] text-muted-foreground mt-0.5 block">{wallet.pct}% dari target</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-6">
                  <p className="text-xs text-muted-foreground">Belum ada dompet / kantong.</p>
                  <button 
                    onClick={() => navigate('/settings')}
                    className="text-xs font-bold text-primary mt-2 hover:underline"
                  >
                    + Buat Dompet Baru
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* KATEGORI PENGELUARAN (SPENDING CATEGORIES) */}
          <div className="bg-card border border-gray-100 dark:border-zinc-800 rounded-3xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm sm:text-base font-extrabold text-foreground">Kategori Pengeluaran</h3>
              <button 
                onClick={() => navigate('/analytics')}
                className="text-xs font-bold text-primary hover:underline"
              >
                Lihat Detail
              </button>
            </div>

            <div className="space-y-4">
              {topCategories.length > 0 ? (
                topCategories.map(cat => (
                  <div key={cat.id} className="space-y-2">
                    <div className="flex items-center justify-between text-xs font-medium">
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-2.5 h-2.5 rounded-full" 
                          style={{ backgroundColor: cat.color }} 
                        />
                        <span className="text-foreground">{cat.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground text-[10px]">{cat.pct}%</span>
                        <span className="font-bold text-foreground">Rp {cat.amount.toLocaleString('id-ID')}</span>
                      </div>
                    </div>
                    <div className="w-full bg-muted dark:bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                      <div 
                        className="h-full rounded-full transition-all duration-500" 
                        style={{ 
                          width: `${cat.pct}%`, 
                          backgroundColor: cat.color 
                        }}
                      />
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-xs text-muted-foreground text-center py-4">Belum ada pengeluaran bulan ini.</p>
              )}
            </div>
          </div>

          {/* TRANSAKSI TERBARU (RECENT TRANSACTIONS) */}
          <div className="bg-card border border-gray-100 dark:border-zinc-800 rounded-3xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm sm:text-base font-extrabold text-foreground">Transaksi Terbaru</h3>
              <button 
                onClick={() => navigate('/transactions')}
                className="text-xs font-bold text-primary hover:underline"
              >
                Lihat Semua
              </button>
            </div>

            <div className="space-y-2.5">
              {recentTransactions.length > 0 ? (
                recentTransactions.map(transaction => {
                  const categoryObj = categories.find(c => c.id === transaction.category || c.name === transaction.category);
                  const walletObj = wallets.find(w => w.id === transaction.wallet);

                  return (
                    <div 
                      key={transaction.id}
                      onClick={() => navigate('/transactions')}
                      className="p-3 bg-muted/40 hover:bg-muted/80 rounded-2xl cursor-pointer flex items-center justify-between transition-all duration-200 hover:-translate-y-0.5"
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div 
                          className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                          style={{ backgroundColor: (categoryObj?.color || '#FFB400') + '20' }}
                        >
                          <CategoryIcon 
                            icon={categoryObj?.icon || 'tag'} 
                            className="w-5 h-5" 
                            color={categoryObj?.color || '#FFB400'} 
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <span className="text-xs sm:text-sm font-bold text-foreground block truncate">{transaction.description}</span>
                          <span className="text-[10px] text-muted-foreground mt-0.5 block">
                            {categoryObj?.name || 'Kategori'} • {walletObj?.name || 'Dompet'}
                          </span>
                        </div>
                      </div>
                      <div className="text-right pl-4 flex items-center gap-1">
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
                        <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-6">
                  <p className="text-xs text-muted-foreground">Belum ada transaksi.</p>
                  <button 
                    onClick={() => setIsAddTransactionOpen(true)}
                    className="text-xs font-bold text-primary mt-2 hover:underline"
                  >
                    + Catat Transaksi Pertama
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

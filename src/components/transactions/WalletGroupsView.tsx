import React, { useState } from 'react';
import { useFinance } from '../../contexts/FinanceContext';
import { Card, CardContent } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import { 
  Wallet, Landmark, Smartphone, CreditCard, Shield, Plane, 
  ArrowDownLeft, Send, List, Settings2, Plus, SlidersHorizontal, Eye,
  TrendingUp, ArrowLeftRight
} from 'lucide-react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import AddTransactionForm from '../AddTransactionForm';
import BalanceTransferForm from '../BalanceTransferForm';
import BalanceTransferDialog from '../BalanceTransferDialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { CategoryIcon } from '../CategoryIcon';

const WalletGroupsView: React.FC = () => {
  const { wallets, getWalletBalance, transactions } = useFinance();
  const navigate = useNavigate();

  const [activeTopUpWalletId, setActiveTopUpWalletId] = useState<string | null>(null);
  const [activeTransferWalletId, setActiveTransferWalletId] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'name' | 'balance-desc' | 'balance-asc'>('name');

  const getSortLabel = (type: string) => {
    switch (type) {
      case 'name': return 'Nama (A-Z)';
      case 'balance-desc': return 'Saldo Terbesar';
      case 'balance-asc': return 'Saldo Terkecil';
      default: return 'Nama';
    }
  };

  // Targets and types mapping dynamically
  const getWalletTarget = (name: string) => {
    const lower = name.toLowerCase();
    if (lower.includes('darurat')) return 30000000;
    if (lower.includes('liburan') || lower.includes('travel') || lower.includes('jalan')) return 15000000;
    if (lower.includes('rumah') || lower.includes('dp')) return 80000000;
    if (lower.includes('gadget') || lower.includes('hp') || lower.includes('phone')) return 10000000;
    if (lower.includes('ovo') || lower.includes('gopay') || lower.includes('dana') || lower.includes('linkaja')) return 2000000;
    return 10000000; // default
  };

  const getWalletIconDetails = (name: string) => {
    const lower = name.toLowerCase();
    if (lower.includes('bca') || lower.includes('mandiri') || lower.includes('bni') || lower.includes('bri') || lower.includes('bank')) {
      return { bg: '#E8F9EF', text: '#2ECC71', icon: Landmark, sub: 'Bank Transfer' };
    }
    if (lower.includes('gopay')) {
      return { bg: '#FFF4E0', text: '#FFB400', icon: Smartphone, sub: 'GoPay E-Wallet' };
    }
    if (lower.includes('ovo') || lower.includes('dana') || lower.includes('linkaja')) {
      return { bg: '#EEE8FF', text: '#7357FF', icon: CreditCard, sub: 'E-Wallet Account' };
    }
    if (lower.includes('darurat')) {
      return { bg: '#FFE9E9', text: '#FF5C5C', icon: Shield, sub: 'Dana Darurat' };
    }
    if (lower.includes('liburan') || lower.includes('travel') || lower.includes('trip')) {
      return { bg: '#E0F4FF', text: '#00A3D9', icon: Plane, sub: 'Liburan Travel' };
    }
    return { bg: '#F1F5F9', text: '#64748B', icon: Wallet, sub: 'Dompet Lainnya' };
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  if (wallets.length === 0) {
    return (
      <div className="text-center py-12 bg-white dark:bg-zinc-900 border dark:border-zinc-800 rounded-3xl">
        <Wallet className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
        <p className="text-muted-foreground font-semibold">Belum ada dompet / kantong.</p>
        <button 
          onClick={() => navigate('/settings')}
          className="text-sm font-bold text-[#FFB400] mt-3 hover:underline"
        >
          + Tambah Dompet Baru
        </button>
      </div>
    );
  }

  // Summary logic
  const totalSaldo = wallets.reduce((sum, w) => sum + getWalletBalance(w.id), 0);
  const totalKantong = wallets.length;
  const totalTarget = wallets.filter(w => w.isSavings).reduce((sum, w) => sum + (w.targetAmount || 0), 0);
  
  // Calculate Growth (Mock or actual 8% for design fidelity)
  const growthVal = totalSaldo * 0.08;

  // Donut chart distribution calculations
  const distribution = wallets.map(w => {
    const bal = getWalletBalance(w.id);
    const pct = totalSaldo > 0 ? (bal / totalSaldo) * 100 : 0;
    return {
      name: w.name,
      balance: bal,
      pct: Math.round(pct),
      details: getWalletIconDetails(w.name)
    };
  }).sort((a, b) => b.balance - a.balance);

  // Generate internal transfer shortcuts
  const getInternalTransferShortcuts = () => {
    if (wallets.length < 2) return [];
    
    const shortcuts = [];
    const first = wallets[0];
    const second = wallets[1];
    
    shortcuts.push({
      source: first,
      destination: second,
      label: `${first.name} ➔ ${second.name}`
    });
    
    shortcuts.push({
      source: second,
      destination: first,
      label: `${second.name} ➔ ${first.name}`
    });
    
    if (wallets.length >= 3) {
      const third = wallets[2];
      shortcuts.push({
        source: third,
        destination: first,
        label: `${third.name} ➔ ${first.name}`
      });
    }
    
    return shortcuts;
  };

  const internalShortcuts = getInternalTransferShortcuts();

  return (
    <div className="space-y-6">
      {/* SUMMARY ROW */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Total Saldo */}
        <div className="bg-card border border-gray-100 dark:border-zinc-800 rounded-3xl p-5 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 bg-[#E8F9EF] dark:bg-[#2ECC71]/10 rounded-xl flex items-center justify-center">
              <Wallet className="w-5 h-5 text-[#2ECC71]" />
            </div>
            <span className="text-[9px] font-bold py-0.5 px-2 bg-[#E8F9EF] text-[#2ECC71] dark:bg-[#2ECC71]/10 rounded-full">
              Aktif
            </span>
          </div>
          <div className="mt-4">
            <span className="text-[10px] sm:text-xs text-muted-foreground font-medium block">Total Saldo</span>
            <span className="text-sm sm:text-lg font-extrabold text-foreground tracking-tight block mt-0.5">
              {formatCurrency(totalSaldo)}
            </span>
            <span className="text-[9px] text-muted-foreground mt-0.5 block">Di semua kantong</span>
          </div>
        </div>

        {/* Total Kantong */}
        <div className="bg-card border border-gray-100 dark:border-zinc-800 rounded-3xl p-5 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 bg-[#EEE8FF] dark:bg-[#7357FF]/10 rounded-xl flex items-center justify-center">
              <List className="w-5 h-5 text-[#7357FF]" />
            </div>
            <span className="text-[11px] font-extrabold text-[#7357FF]">
              {totalKantong}
            </span>
          </div>
          <div className="mt-4">
            <span className="text-[10px] sm:text-xs text-muted-foreground font-medium block">Total Kantong</span>
            <span className="text-sm sm:text-lg font-extrabold text-foreground tracking-tight block mt-0.5">
              {totalKantong} Kantong
            </span>
            <span className="text-[9px] text-muted-foreground mt-0.5 block">Aktif dan menabung</span>
          </div>
        </div>

        {/* Total Target */}
        <div className="bg-card border border-gray-100 dark:border-zinc-800 rounded-3xl p-5 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 bg-[#FFF4E0] dark:bg-[#FFB400]/10 rounded-xl flex items-center justify-center">
              <Plus className="w-5 h-5 text-[#FFB400]" />
            </div>
            <span className="text-[9px] font-bold py-0.5 px-2 bg-[#FFF4E0] text-[#FFB400] dark:bg-[#FFB400]/10 rounded-full">
              Target
            </span>
          </div>
          <div className="mt-4">
            <span className="text-[10px] sm:text-xs text-muted-foreground font-medium block">Total Target</span>
            <span className="text-sm sm:text-lg font-extrabold text-foreground tracking-tight block mt-0.5">
              {formatCurrency(totalTarget)}
            </span>
            <span className="text-[9px] text-muted-foreground mt-0.5 block">Tujuan tabungan</span>
          </div>
        </div>

        {/* Pertumbuhan */}
        <div className="bg-card border border-gray-100 dark:border-zinc-800 rounded-3xl p-5 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 bg-[#FFE9E9] dark:bg-[#FF5C5C]/10 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-[#FF5C5C]" />
            </div>
            <span className="text-[9px] font-bold py-0.5 px-2 bg-[#E8F9EF] text-[#2ECC71] dark:bg-[#2ECC71]/10 rounded-full">
              +8%
            </span>
          </div>
          <div className="mt-4">
            <span className="text-[10px] sm:text-xs text-muted-foreground font-medium block">Pertumbuhan</span>
            <span className="text-sm sm:text-lg font-extrabold text-foreground tracking-tight block mt-0.5">
              {formatCurrency(growthVal)}
            </span>
            <span className="text-[9px] text-muted-foreground mt-0.5 block">Dari bulan lalu</span>
          </div>
        </div>
      </div>

      {/* MAIN GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT COLUMN: KANTONG LIST */}
        <div className="lg:col-span-8 bg-card border border-gray-100 dark:border-zinc-800 rounded-3xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm sm:text-base font-extrabold text-foreground">Semua Kantong</h3>
            <div className="flex items-center gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <div className="flex items-center gap-1.5 py-1.5 px-3 bg-muted hover:bg-muted/80 rounded-xl cursor-pointer text-xs font-bold text-foreground transition-colors select-none">
                    <SlidersHorizontal className="w-3.5 h-3.5" />
                    <span>Urutkan: {getSortLabel(sortBy)}</span>
                  </div>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="rounded-xl">
                  <DropdownMenuItem onClick={() => setSortBy('name')} className="text-xs font-semibold cursor-pointer">Nama (A-Z)</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSortBy('balance-desc')} className="text-xs font-semibold cursor-pointer">Saldo Terbesar</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSortBy('balance-asc')} className="text-xs font-semibold cursor-pointer">Saldo Terkecil</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <button 
                onClick={() => navigate('/settings')}
                className="py-1.5 px-3 bg-[#FFB400] text-white hover:bg-[#e09e00] rounded-xl text-xs font-bold transition-colors"
              >
                + Tambah
              </button>
            </div>
          </div>

          <div className="space-y-4">
            {(() => {
              const sorted = [...wallets].sort((a, b) => {
                if (sortBy === 'name') {
                  return a.name.localeCompare(b.name);
                }
                const balA = getWalletBalance(a.id);
                const balB = getWalletBalance(b.id);
                if (sortBy === 'balance-desc') {
                  return balB - balA;
                }
                if (sortBy === 'balance-asc') {
                  return balA - balB;
                }
                return 0;
              });
              return sorted.map(wallet => {
                const balance = getWalletBalance(wallet.id);
                const target = wallet.targetAmount || 0;
                const pct = target > 0 ? Math.min(100, Math.round((balance / target) * 100)) : 0;
                const ui = getWalletIconDetails(wallet.name);
                const subLabel = wallet.isSavings 
                  ? (wallet.actualGroup || 'Tabungan') 
                  : (wallet.actualGroup && wallet.actualGroup !== 'Lainnya' ? wallet.actualGroup : ui.sub);

                return (
                  <div 
                    key={wallet.id}
                    className="bg-muted/30 border border-gray-100/50 dark:border-zinc-800/40 hover:bg-muted/60 p-4 sm:p-5 rounded-2xl flex flex-col gap-4 transition-all"
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
                          style={{ backgroundColor: ui.bg }}
                        >
                          <CategoryIcon icon={wallet.icon || 'wallet'} color={wallet.color || ui.text} className="w-6 h-6" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-xs sm:text-sm font-extrabold text-foreground truncate max-w-[130px] sm:max-w-[180px]" title={wallet.name}>{wallet.name}</h4>
                          <span className="text-[10px] text-muted-foreground mt-0.5 block truncate max-w-[120px] sm:max-w-[160px]" title={subLabel}>{subLabel}</span>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-sm sm:text-base font-extrabold text-foreground block">
                          {formatCurrency(balance)}
                        </span>
                        <span className="text-[9px] text-muted-foreground mt-0.5 block">Diperbarui baru saja</span>
                      </div>
                    </div>

                    {/* Progress bar (only for savings wallets) */}
                    {wallet.isSavings && (
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between text-[10px] font-semibold text-muted-foreground">
                          <span>{balance >= target ? 'Target terpenuhi' : `Batas target ${formatCurrency(target)}`}</span>
                          <span className="text-foreground">{pct}%</span>
                        </div>
                        <div className="w-full bg-muted dark:bg-zinc-800 h-2 rounded-full overflow-hidden">
                          <div 
                            className="h-full rounded-full transition-all duration-500" 
                            style={{ 
                              width: `${pct}%`, 
                              backgroundColor: ui.text 
                            }}
                          />
                        </div>
                      </div>
                    )}

                    {/* Actions inside wallet item */}
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        onClick={() => setActiveTopUpWalletId(wallet.id)}
                        className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-bold bg-[#E8F9EF] dark:bg-[#2ECC71]/10 text-[#2ECC71] hover:bg-[#2ECC71]/20 transition-colors"
                      >
                        <ArrowDownLeft className="w-3.5 h-3.5 stroke-[2.5px]" />
                        <span>Setor</span>
                      </button>
                      <button
                        onClick={() => setActiveTransferWalletId(wallet.id)}
                        className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-bold bg-[#FFF4E0] dark:bg-[#FFB400]/10 text-[#FFB400] hover:bg-[#FFB400]/20 transition-colors"
                      >
                        <Send className="w-3.5 h-3.5 stroke-[2.5px]" />
                        <span>Transfer</span>
                      </button>
                      <button
                        onClick={() => navigate(`/wallets/${wallet.id}`)}
                        className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-bold bg-[#EEE8FF] dark:bg-[#7357FF]/10 text-[#7357FF] hover:bg-[#7357FF]/20 transition-colors"
                      >
                        <List className="w-3.5 h-3.5 stroke-[2.5px]" />
                        <span>Riwayat</span>
                      </button>
                    </div>
                  </div>
                );
              });
            })()}
          </div>
        </div>

        {/* RIGHT COLUMN: DISTRIBUTION & TARGETS */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* DISTRIBUSI SALDO */}
          <div className="bg-card border border-gray-100 dark:border-zinc-800 rounded-3xl p-5 shadow-sm">
            <h3 className="text-sm sm:text-base font-extrabold text-foreground mb-4">Distribusi Saldo</h3>
            
            <div className="flex flex-col sm:flex-row lg:flex-col items-center gap-6">
              {/* Custom SVG Segments based on real data */}
              <div className="relative w-28 h-28 flex-shrink-0">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="38" fill="none" stroke="currentColor" className="text-muted/30" strokeWidth="12" />
                  {/* Map loops for real SVG segments */}
                  {(() => {
                    let accumulatedPercent = 0;
                    return distribution.map((item, idx) => {
                      if (item.pct <= 0) return null;
                      const segmentDash = (circumference * item.pct) / 100;
                      const offset = -(circumference * accumulatedPercent) / 100;
                      accumulatedPercent += item.pct;
                      
                      return (
                        <circle
                          key={idx}
                          cx="50"
                          cy="50"
                          r="38"
                          fill="none"
                          stroke={item.details.text}
                          strokeWidth="12"
                          strokeDasharray={`${segmentDash} ${circumference}`}
                          strokeDashoffset={offset}
                          strokeLinecap="round"
                        />
                      );
                    });
                  })()}
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <span className="text-[10px] text-muted-foreground font-medium uppercase">Total</span>
                  <span className="text-xs font-bold text-foreground mt-0.5">{totalKantong} Ktg</span>
                </div>
              </div>

              {/* Legends list */}
              <div className="flex-1 w-full space-y-2.5">
                {distribution.slice(0, 5).map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center text-xs font-medium">
                    <div className="flex items-center gap-2 truncate">
                      <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: item.details.text }} />
                      <span className="text-muted-foreground truncate">{item.name}</span>
                    </div>
                    <span className="font-bold text-foreground pl-2">{item.pct}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* TARGET TABUNGAN */}
          <div className="bg-card border border-gray-100 dark:border-zinc-800 rounded-3xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm sm:text-base font-extrabold text-foreground">Target Tabungan</h3>
              <button 
                onClick={() => navigate('/settings')}
                className="text-xs font-bold text-[#7357FF] hover:underline"
              >
                Kelola
              </button>
            </div>

            <div className="space-y-3">
              {wallets.filter(w => w.isSavings).length > 0 ? (
                wallets.filter(w => w.isSavings).slice(0, 3).map((wallet, idx) => {
                  const balance = getWalletBalance(wallet.id);
                  const target = wallet.targetAmount || 0;
                  const pct = target > 0 ? Math.min(100, Math.round((balance / target) * 100)) : 0;
                  const ui = getWalletIconDetails(wallet.name);
                  const IconComp = ui.icon;

                  return (
                    <div 
                      key={wallet.id}
                      onClick={() => navigate(`/wallets/${wallet.id}`)}
                      className="p-3 bg-muted/40 hover:bg-muted/80 rounded-2xl cursor-pointer space-y-2.5 transition-all"
                    >
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                          style={{ backgroundColor: ui.bg }}
                        >
                          <CategoryIcon icon={wallet.icon || 'wallet'} color={wallet.color || ui.text} className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="text-xs font-extrabold text-foreground">{wallet.name}</h4>
                          <span className="text-[9px] text-muted-foreground mt-0.5 block">Target Tabungan</span>
                        </div>
                      </div>

                      <div className="flex justify-between items-baseline text-xs">
                        <span className="font-extrabold text-foreground">{formatCurrency(balance)}</span>
                        <span className="text-[10px] text-muted-foreground">dari {formatCurrency(target)}</span>
                      </div>

                      <div className="w-full bg-muted dark:bg-zinc-800 h-1 rounded-full overflow-hidden">
                        <div 
                          className="h-full rounded-full" 
                          style={{ 
                            width: `${pct}%`, 
                            backgroundColor: ui.text 
                          }}
                        />
                      </div>
                    </div>
                  );
                })
              ) : (
                <p className="text-[11px] text-muted-foreground text-center py-4">
                  Belum ada kantong tipe tabungan.
                </p>
              )}
            </div>
          </div>

          {/* TRANSFER CEPAT INTERNAL (ANTAR KANTONG SAYA) */}
          <div className="bg-card border border-gray-100 dark:border-zinc-800 rounded-3xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm sm:text-base font-extrabold text-foreground">Transfer Cepat (Personal)</h3>
              <button 
                onClick={() => setActiveTransferWallet(true)}
                className="text-xs font-bold text-[#7357FF] hover:underline"
              >
                Transfer Baru
              </button>
            </div>

            <div className="space-y-3.5">
              {internalShortcuts.length > 0 ? (
                internalShortcuts.map((shortcut, idx) => (
                  <BalanceTransferDialog 
                    key={idx}
                    defaultSourceWalletId={shortcut.source.id}
                    defaultDestinationWalletId={shortcut.destination.id}
                    trigger={
                      <div className="p-3 bg-muted/40 hover:bg-muted/80 rounded-2xl cursor-pointer flex items-center justify-between transition-all group">
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          <div className="w-9 h-9 rounded-xl bg-[#FFF4E0] dark:bg-[#FFB400]/10 text-[#FFB400] flex items-center justify-center flex-shrink-0">
                            <ArrowLeftRight className="w-4 h-4" />
                          </div>
                          <div className="truncate flex-1 min-w-0">
                            <h4 className="text-xs font-extrabold text-foreground truncate">{shortcut.source.name}</h4>
                            <span className="text-[9px] text-muted-foreground block mt-0.5 truncate">➔ {shortcut.destination.name}</span>
                          </div>
                        </div>
                        <button className="flex items-center gap-1.5 py-1.5 px-3 rounded-lg text-[10px] font-bold bg-[#FFF4E0] dark:bg-[#FFB400]/10 text-[#FFB400] group-hover:bg-[#FFB400]/20 transition-all flex-shrink-0 ml-3">
                          <Send className="w-3 h-3" />
                          <span>Kirim</span>
                        </button>
                      </div>
                    }
                  />
                ))
              ) : (
                <p className="text-[11px] text-muted-foreground text-center py-4">
                  Tambahkan minimal 2 dompet untuk mengaktifkan transfer antar kantong cepat.
                </p>
              )}
            </div>
          </div>

        </div>

      </div>

      {/* Action Dialogs */}
      <Dialog open={!!activeTopUpWalletId} onOpenChange={(open) => !open && setActiveTopUpWalletId(null)}>
        <DialogContent className="w-[95vw] max-w-md mx-auto rounded-3xl">
          {activeTopUpWalletId && (
            <AddTransactionForm 
              defaultWalletId={activeTopUpWalletId}
              defaultType="income"
              onClose={() => setActiveTopUpWalletId(null)} 
            />
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={!!activeTransferWalletId} onOpenChange={(open) => !open && setActiveTransferWalletId(null)}>
        <DialogContent className="w-[95vw] max-w-md mx-auto rounded-3xl">
          {activeTransferWalletId && (
            <BalanceTransferForm 
              defaultSourceWalletId={activeTransferWalletId}
              onClose={() => setActiveTransferWalletId(null)} 
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

// SVG Circumference constant helper
const circumference = 238.76;

export default WalletGroupsView;

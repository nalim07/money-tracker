import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFinance } from '../contexts/FinanceContext';
import { Plus, Edit, Trash2, Wallet, BarChart3, ChevronRight, Sliders, User, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import EditWalletForm from '../components/EditWalletForm';
import CategoryManager from '../components/settings/CategoryManager';
import { CategoryIcon } from '../components/CategoryIcon';
import { IconSelector } from '../components/IconSelector';
import ConfirmDialog from '../components/ConfirmDialog';
import { Wallet as WalletType } from '../types/finance';
import { toast } from 'sonner';
import { useTheme } from '../hooks/useTheme';
import packageJson from '../../package.json';
import { useAuth } from '../contexts/AuthContext';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import ThemeToggle from '../components/ThemeToggle';

const Settings: React.FC = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { primaryColor, setPrimaryColor } = useTheme();
  const {
    wallets,
    categories,
    addWallet,
    deleteWallet,
    getWalletBalance
  } = useFinance();

  const [showWalletDialog, setShowWalletDialog] = useState(false);
  const [editingWallet, setEditingWallet] = useState<WalletType | null>(null);
  const [deletingWallet, setDeletingWallet] = useState<WalletType | null>(null);

  const [walletForm, setWalletForm] = useState({
    name: '',
    color: primaryColor,
    icon: 'wallet',
    group: 'Bank',
    isCustomGroup: false,
    type: 'regular' as 'regular' | 'savings',
    target: '',
  });

  const colorOptions = [
    '#FFB400', '#7357FF', '#2ECC71', '#FF5C5C',
    '#00A3D9', '#EC4899', '#84CC16', '#F59E0B',
  ];

  const themeColors = [
    { name: 'Jakarta Gold', hex: '#FFB400' },
    { name: 'Amethyst Purple', hex: '#7357FF' },
    { name: 'Emerald Green', hex: '#2ECC71' },
    { name: 'Sunset Crimson', hex: '#FF5C5C' },
    { name: 'Sky Blue', hex: '#00A3D9' },
    { name: 'Charcoal Black', hex: '#1D1D1F' }
  ];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const handleWalletSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!walletForm.name) return;

    if (walletForm.type === 'regular' && walletForm.isCustomGroup) {
      const defaultGroups = ['Bank', 'E-Wallet', 'Tunai', 'Investasi', 'Lainnya'];
      const existingGroups = wallets.filter(w => !w.isSavings).map(w => w.actualGroup || 'Lainnya');
      const allGroups = Array.from(new Set([...defaultGroups, ...existingGroups]));
      
      const trimmedGroup = walletForm.group.trim();
      const duplicateGroup = allGroups.find(g => g.toLowerCase() === trimmedGroup.toLowerCase());
      
      if (duplicateGroup) {
        toast.error(`Grup "${duplicateGroup}" sudah ada di pilihan. Silakan pilih langsung dari dropdown.`);
        return;
      }
    }

    const serializedGroup = JSON.stringify({
      type: walletForm.type,
      name: walletForm.type === 'savings' ? 'Tabungan' : (walletForm.group.trim() || 'Lainnya'),
      target: walletForm.type === 'savings' ? Number(walletForm.target) || 0 : 0
    });

    addWallet({
      name: walletForm.name,
      color: walletForm.color,
      icon: walletForm.icon,
      group: serializedGroup,
    });

    setWalletForm({
      name: '',
      color: primaryColor,
      icon: 'wallet',
      group: 'Bank',
      isCustomGroup: false,
      type: 'regular',
      target: '',
    });
    setShowWalletDialog(false);
  };

  return (
    <div className="space-y-6 w-full px-1">
      {/* Page Header */}
      <div className="flex flex-col gap-1">
        <h1 className="text-xl sm:text-2xl font-extrabold text-foreground tracking-tight">Pengaturan</h1>
        <p className="text-xs sm:text-sm text-muted-foreground">Kelola kantong, kategori, dan warna tema sistem Anda</p>
      </div>

      {/* Account Profile Card */}
      {user && (
        <Card className="bg-card border border-gray-100 dark:border-zinc-800 rounded-3xl p-5 shadow-sm">
          <CardHeader className="p-0 pb-4">
            <CardTitle className="text-sm sm:text-base font-extrabold text-foreground flex items-center gap-2">
              <User className="w-5 h-5 text-primary" />
              Akun Saya
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-2xl border border-gray-100 dark:border-zinc-800/80 bg-muted/20">
              <div className="flex items-center space-x-3.5">
                <Avatar className="h-12 w-12 border border-gray-100 dark:border-zinc-800">
                  <AvatarFallback className="bg-primary text-white font-black text-base shadow-inner">
                    {user.email?.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <h3 className="font-extrabold text-sm sm:text-base text-foreground truncate">
                    {user.user_metadata?.full_name || 'Pengguna'}
                  </h3>
                  <p className="text-xs text-muted-foreground truncate mt-0.5">
                    {user.email}
                  </p>
                </div>
              </div>
              
              <div className="flex flex-wrap items-center gap-3">
                {/* Theme Mode Control */}
                <div className="flex items-center gap-2 py-1 px-3 bg-muted/65 dark:bg-zinc-800/50 rounded-2xl border border-gray-100/80 dark:border-zinc-800/80">
                  <span className="text-xs font-bold text-muted-foreground">Mode</span>
                  <ThemeToggle />
                </div>
                
                {/* Logout Button */}
                <Button
                  onClick={signOut}
                  variant="outline"
                  className="h-10 px-4 rounded-2xl text-xs font-bold border-red-200 dark:border-red-900/30 text-red-500 hover:text-white hover:bg-[#FF5C5C] dark:hover:bg-[#FF5C5C] hover:border-[#FF5C5C] dark:hover:border-[#FF5C5C] transition-all flex items-center gap-2 shadow-sm"
                >
                  <LogOut className="w-4 h-4 stroke-[2.5px]" />
                  Keluar
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Navigation shortcuts for mobile app shell view */}
      <Card className="bg-card border border-gray-100 dark:border-zinc-800 rounded-3xl overflow-hidden shadow-sm lg:hidden">
        <CardContent className="p-0">
          <button 
            onClick={() => navigate('/analytics')}
            className="w-full flex items-center justify-between p-4 hover:bg-muted/50 transition-colors border-b border-border text-left"
          >
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                <BarChart3 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-xs sm:text-sm text-foreground">Analisis Keuangan</h3>
                <p className="text-[10px] text-muted-foreground">Lihat diagram pemasukan & pengeluaran Anda</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </button>
        </CardContent>
      </Card>

      {/* Warna Tema setting */}
      <Card className="bg-card border border-gray-100 dark:border-zinc-800 rounded-3xl p-5 shadow-sm">
        <CardHeader className="p-0 pb-4">
          <CardTitle className="text-sm sm:text-base font-extrabold text-foreground flex items-center gap-2">
            <Sliders className="w-5 h-5 text-primary" />
            Warna Tema Aplikasi
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0 space-y-4">
          <p className="text-xs text-muted-foreground">Pilih warna utama untuk tombol, tautan, dan penanda aktif di seluruh aplikasi</p>
          <div className="flex flex-wrap gap-2.5">
            {themeColors.map((color) => (
              <button
                key={color.hex}
                onClick={() => setPrimaryColor(color.hex)}
                className={`flex items-center gap-2 py-2 px-3.5 rounded-xl border text-xs font-bold transition-all ${
                  primaryColor === color.hex 
                    ? 'border-primary bg-primary/10 text-primary shadow-sm font-extrabold'
                    : 'border-gray-100 dark:border-zinc-800 bg-muted/30 hover:bg-muted text-muted-foreground'
                }`}
              >
                <div className="w-3.5 h-3.5 rounded-full flex-shrink-0" style={{ backgroundColor: color.hex }} />
                <span>{color.name}</span>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Wallets Section */}
      <Card className="bg-card border border-gray-100 dark:border-zinc-800 rounded-3xl p-5 shadow-sm">
        <CardHeader className="p-0 pb-4 flex flex-row items-center justify-between">
          <CardTitle className="text-sm sm:text-base font-extrabold text-foreground flex items-center gap-2">
            <Wallet className="w-5 h-5 text-primary" />
            Kelola Kantong
          </CardTitle>
          <Dialog open={showWalletDialog} onOpenChange={setShowWalletDialog}>
            <DialogTrigger asChild>
              <Button className="bg-primary hover:bg-primary/95 text-white font-bold h-9 rounded-xl text-xs shadow-sm">
                <Plus className="w-4 h-4 mr-1" />
                Tambah Kantong
              </Button>
            </DialogTrigger>
            <DialogContent className="w-[95vw] max-w-md mx-auto rounded-3xl">
              <DialogHeader>
                <DialogTitle className="text-sm sm:text-base font-extrabold text-foreground">Tambah Kantong Baru</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleWalletSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="wallet-name" className="text-xs font-bold">Nama Kantong</Label>
                  <Input
                    id="wallet-name"
                    value={walletForm.name}
                    onChange={(e) => setWalletForm(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Contoh: Rekening BRI"
                    required
                    className="rounded-xl border-gray-200 focus-visible:ring-primary"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-bold">Tipe Kantong</Label>
                  <div className="grid grid-cols-2 gap-2 mt-1">
                    <button
                      type="button"
                      onClick={() => setWalletForm(prev => ({ ...prev, type: 'regular' }))}
                      className={`py-2.5 px-4 rounded-xl border text-xs font-bold transition-all ${
                        walletForm.type === 'regular'
                          ? 'border-primary bg-primary/10 text-primary font-extrabold shadow-sm'
                          : 'border-gray-200 bg-transparent text-muted-foreground hover:bg-muted/40 dark:border-zinc-850'
                      }`}
                    >
                      Kantong Biasa
                    </button>
                    <button
                      type="button"
                      onClick={() => setWalletForm(prev => ({ ...prev, type: 'savings' }))}
                      className={`py-2.5 px-4 rounded-xl border text-xs font-bold transition-all ${
                        walletForm.type === 'savings'
                          ? 'border-primary bg-primary/10 text-primary font-extrabold shadow-sm'
                          : 'border-gray-200 bg-transparent text-muted-foreground hover:bg-muted/40 dark:border-zinc-850'
                      }`}
                    >
                      Tabungan (Target)
                    </button>
                  </div>
                </div>

                {walletForm.type === 'regular' ? (
                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold">Grup Kantong</Label>
                    {!walletForm.isCustomGroup ? (
                      <select
                        value={walletForm.group}
                        onChange={(e) => {
                          const val = e.target.value;
                          if (val === '__custom__') {
                            setWalletForm(prev => ({ ...prev, isCustomGroup: true, group: '' }));
                          } else {
                            setWalletForm(prev => ({ ...prev, group: val }));
                          }
                        }}
                        className="w-full rounded-xl border border-gray-200 bg-background px-3 py-2.5 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary dark:border-zinc-800"
                      >
                        {(() => {
                          const defaults = ['Bank', 'E-Wallet', 'Tunai', 'Investasi', 'Lainnya'];
                          const unique = [...defaults];
                          wallets
                            .filter(w => !w.isSavings)
                            .forEach(w => {
                              const name = (w.actualGroup || 'Lainnya').trim();
                              if (name && !unique.some(g => g.toLowerCase() === name.toLowerCase())) {
                                unique.push(name);
                              }
                            });
                          return unique;
                        })().map(group => (
                          <option key={group} value={group}>{group}</option>
                        ))}
                        <option value="__custom__">+ Input Manual...</option>
                      </select>
                    ) : (
                      <div className="flex gap-2">
                        <Input
                          value={walletForm.group}
                          onChange={(e) => setWalletForm(prev => ({ ...prev, group: e.target.value }))}
                          placeholder="Masukkan grup baru (contoh: Bisnis)"
                          className="rounded-xl border-gray-200 focus-visible:ring-primary dark:border-zinc-800 flex-1"
                          required
                          autoFocus
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          onClick={() => setWalletForm(prev => ({ ...prev, isCustomGroup: false, group: 'Bank' }))}
                          className="text-xs hover:bg-muted rounded-xl"
                        >
                          Pilih grup
                        </Button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    <Label htmlFor="wallet-target" className="text-xs font-bold">Batas Target (IDR)</Label>
                    <Input
                      id="wallet-target"
                      type="text"
                      value={walletForm.target !== '' ? new Intl.NumberFormat('id-ID').format(Number(walletForm.target)) : ''}
                      onChange={(e) => {
                        const clean = e.target.value.replace(/\D/g, '');
                        setWalletForm(prev => ({ ...prev, target: clean }));
                      }}
                      placeholder="Contoh: 15.000.000"
                      required
                      className="rounded-xl border-gray-200 focus-visible:ring-primary dark:border-zinc-800"
                    />
                  </div>
                )}

                <div className="space-y-1.5">
                  <Label className="text-xs font-bold">Logo/Ikon Kantong</Label>
                  <div className="max-h-[200px] overflow-y-auto border border-gray-150 dark:border-zinc-800 rounded-xl p-3 bg-muted/10">
                    <IconSelector
                      selectedIcon={walletForm.icon}
                      onIconSelect={(icon) => setWalletForm(prev => ({ ...prev, icon }))}
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-bold">Warna Tema</Label>
                  <div className="grid grid-cols-4 gap-2 mt-1">
                    {colorOptions.map((color) => (
                      <button
                        key={color}
                        type="button"
                        className={`w-10 h-10 rounded-xl border-2 transition-all ${walletForm.color === color ? 'border-foreground scale-105 shadow-sm' : 'border-transparent'
                          }`}
                        style={{ backgroundColor: color }}
                        onClick={() => setWalletForm(prev => ({ ...prev, color }))}
                      />
                    ))}
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <Button type="submit" className="flex-1 bg-primary hover:bg-primary/95 text-white font-bold h-10 rounded-xl text-xs">
                    Simpan
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowWalletDialog(false)}
                    className="flex-1 h-10 rounded-xl text-xs border-gray-200"
                  >
                    Batal
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent className="p-0">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {wallets.map((wallet) => (
              <div
                key={wallet.id}
                className="p-4 rounded-2xl border border-gray-100 dark:border-zinc-800 bg-muted/30 hover:bg-muted/65 transition-all"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center"
                      style={{ backgroundColor: wallet.color + '20' }}
                    >
                      <CategoryIcon icon={wallet.icon || 'wallet'} color={wallet.color} className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-extrabold text-xs sm:text-sm text-foreground">{wallet.name}</h3>
                      <p className="text-[11px] text-muted-foreground mt-0.5">
                        {formatCurrency(getWalletBalance(wallet.id))}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setEditingWallet(wallet)}
                      className="text-blue-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 h-8 w-8 p-0 rounded-lg"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setDeletingWallet(wallet)}
                      className="text-[#FF5C5C] hover:text-[#FF5C5C]/90 hover:bg-red-50 dark:hover:bg-red-900/20 h-8 w-8 p-0 rounded-lg"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Categories Section - New Unique Component */}
      <CategoryManager />

      {/* App Info */}
      <Card className="bg-card border border-gray-100 dark:border-zinc-800 rounded-3xl p-5 shadow-sm">
        <CardHeader className="p-0 pb-4">
          <CardTitle className="text-sm sm:text-base font-extrabold text-foreground flex items-center gap-2">
            <Sliders className="w-5 h-5 text-primary" />
            Tentang Aplikasi
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="space-y-3">
            <div className="flex justify-between items-center py-2.5 border-b border-gray-100 dark:border-zinc-800 text-xs sm:text-sm font-semibold">
              <span className="text-muted-foreground">Nama Aplikasi</span>
              <span className="font-bold text-foreground">Money Tracker</span>
            </div>
            <div className="flex justify-between items-center py-2.5 border-b border-gray-100 dark:border-zinc-800 text-xs sm:text-sm font-semibold">
              <span className="text-muted-foreground">Versi</span>
              <span className="font-mono text-foreground">{packageJson.version}</span>
            </div>
             <div className="flex justify-between items-center py-2.5 border-b border-gray-100 dark:border-zinc-800 text-xs sm:text-sm font-semibold">
              <span className="text-muted-foreground">Total Kantong</span>
              <span className="font-bold text-foreground">{wallets.length}</span>
            </div>
            <div className="flex justify-between items-center py-2.5 border-b border-gray-100 dark:border-zinc-800 text-xs sm:text-sm font-semibold">
              <span className="text-muted-foreground">Total Kategori</span>
              <span className="font-bold text-foreground">{categories.length}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Edit Wallet Dialog */}
      {editingWallet && (
        <EditWalletForm
          wallet={editingWallet}
          open={!!editingWallet}
          onOpenChange={(open) => !open && setEditingWallet(null)}
        />
      )}

      {/* Delete Wallet Confirm */}
      <ConfirmDialog
        open={!!deletingWallet}
        onOpenChange={(open) => !open && setDeletingWallet(null)}
        title={`Hapus kantong "${deletingWallet?.name}"?`}
        description="Saldo dan semua data kantong ini akan dihapus secara permanen. Tindakan ini tidak dapat dibatalkan."
        confirmLabel="Ya, Hapus"
        cancelLabel="Batal"
        variant="danger"
        onConfirm={() => {
          if (!deletingWallet) return;
          deleteWallet(deletingWallet.id);
          toast.success(`Kantong "${deletingWallet.name}" berhasil dihapus`);
          setDeletingWallet(null);
        }}
      />
    </div>
  );
};

export default Settings;

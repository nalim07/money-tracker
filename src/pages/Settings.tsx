import React, { useState } from 'react';
import { useFinance } from '../contexts/FinanceContext';
import { Plus, Edit, Trash2, Wallet } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import EditWalletForm from '../components/EditWalletForm';
import CategoryManager from '../components/settings/CategoryManager';
import ConfirmDialog from '../components/ConfirmDialog';
import { Wallet as WalletType } from '../types/finance';
import { toast } from 'sonner';
import packageJson from '../../package.json';

const Settings: React.FC = () => {
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
    color: '#10B981',
    icon: 'wallet',
    group: 'Lainnya',
  });

  const colorOptions = [
    '#10B981', '#3B82F6', '#8B5CF6', '#F59E0B',
    '#EF4444', '#EC4899', '#06B6D4', '#84CC16',
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

    addWallet(walletForm);
    setWalletForm({
      name: '',
      color: '#10B981',
      icon: 'wallet',
      group: 'Lainnya',
    });
    setShowWalletDialog(false);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-foreground">Pengaturan</h1>

      {/* Wallets Section */}
      <Card className="bg-card/70 backdrop-blur-sm border-border">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center">
            <Wallet className="w-5 h-5 mr-2" />
            Kelola Dompet
          </CardTitle>
          <Dialog open={showWalletDialog} onOpenChange={setShowWalletDialog}>
            <DialogTrigger asChild>
              <Button className="bg-finance-primary hover:bg-finance-secondary">
                <Plus className="w-4 h-4 mr-2" />
                Tambah Dompet
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Tambah Dompet Baru</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleWalletSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="wallet-name">Nama Dompet</Label>
                  <Input
                    id="wallet-name"
                    value={walletForm.name}
                    onChange={(e) => setWalletForm(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Contoh: Rekening BRI"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="wallet-group">Grup Dompet</Label>
                  <Input
                    id="wallet-group"
                    list="wallet-groups"
                    value={walletForm.group}
                    onChange={(e) => setWalletForm(prev => ({ ...prev, group: e.target.value }))}
                    placeholder="Contoh: Bank, E-Wallet, Bisnis"
                  />
                  <datalist id="wallet-groups">
                    {Array.from(new Set(wallets.map(w => w.group || 'Lainnya'))).map(group => (
                      <option key={group} value={group} />
                    ))}
                  </datalist>
                </div>

                <div>
                  <Label>Warna</Label>
                  <div className="grid grid-cols-4 gap-2 mt-2">
                    {colorOptions.map((color) => (
                      <button
                        key={color}
                        type="button"
                        className={`w-10 h-10 rounded-lg border-2 ${walletForm.color === color ? 'border-foreground' : 'border-border'
                          }`}
                        style={{ backgroundColor: color }}
                        onClick={() => setWalletForm(prev => ({ ...prev, color }))}
                      />
                    ))}
                  </div>
                </div>

                <div className="flex gap-2 pt-4">
                  <Button type="submit" className="flex-1 bg-finance-primary hover:bg-finance-secondary">
                    Simpan
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowWalletDialog(false)}
                    className="flex-1"
                  >
                    Batal
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {wallets.map((wallet) => (
              <div
                key={wallet.id}
                className="p-4 rounded-xl border border-border bg-card/50 hover:bg-card/80 transition-all duration-200"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: wallet.color + '20' }}
                    >
                      <Wallet className="w-5 h-5" style={{ color: wallet.color }} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">{wallet.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {formatCurrency(getWalletBalance(wallet.id))}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setEditingWallet(wallet)}
                      className="text-blue-500 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/30"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setDeletingWallet(wallet)}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/30"
                    >
                      <Trash2 className="w-4 h-4" />
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
      <Card className="bg-card/70 backdrop-blur-sm border-border">
        <CardHeader>
          <CardTitle>Tentang Aplikasi</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between items-center py-2 border-b border-border">
              <span className="text-muted-foreground">Nama Aplikasi</span>
              <span className="font-medium">Money Tracker</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-border">
              <span className="text-muted-foreground">Versi</span>
              <span className="font-medium">{packageJson.version}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-border">
              <span className="text-muted-foreground">Total Dompet</span>
              <span className="font-medium">{wallets.length}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-border">
              <span className="text-muted-foreground">Total Kategori</span>
              <span className="font-medium">{categories.length}</span>
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
        title={`Hapus dompet "${deletingWallet?.name}"?`}
        description="Saldo dan semua data dompet ini akan dihapus secara permanen. Tindakan ini tidak dapat dibatalkan."
        confirmLabel="Ya, Hapus"
        cancelLabel="Batal"
        variant="danger"
        onConfirm={() => {
          if (!deletingWallet) return;
          deleteWallet(deletingWallet.id);
          toast.success(`Dompet "${deletingWallet.name}" berhasil dihapus`);
          setDeletingWallet(null);
        }}
      />
    </div>
  );
};

export default Settings;


import React, { useState } from 'react';
import { useFinance } from '../contexts/FinanceContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Wallet } from '../types/finance';

interface EditWalletFormProps {
  wallet: Wallet;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const EditWalletForm: React.FC<EditWalletFormProps> = ({
  wallet,
  open,
  onOpenChange,
}) => {
  const { updateWallet, getWalletBalance, wallets } = useFinance();

  const [formData, setFormData] = useState({
    name: wallet.name,
    color: wallet.color,
    icon: wallet.icon,
    balance: getWalletBalance(wallet.id),
    group: wallet.group || 'Lainnya',
  });

  const colorOptions = [
    '#10B981', // Green
    '#3B82F6', // Blue
    '#8B5CF6', // Purple
    '#F59E0B', // Yellow
    '#EF4444', // Red
    '#EC4899', // Pink
    '#06B6D4', // Cyan
    '#84CC16', // Lime
  ];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) return;

    updateWallet(wallet.id, formData);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Dompet</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="wallet-name">Nama Dompet</Label>
            <Input
              id="wallet-name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Contoh: Rekening BRI"
              required
            />
          </div>

          <div>
            <Label htmlFor="wallet-group">Grup Dompet</Label>
            <Input
              id="wallet-group"
              list="wallet-groups"
              value={formData.group}
              onChange={(e) => setFormData(prev => ({ ...prev, group: e.target.value }))}
              placeholder="Contoh: Bank, E-Wallet, Bisnis"
            />
            <datalist id="wallet-groups">
              {Array.from(new Set(wallets.map(w => w.group || 'Lainnya'))).map(group => (
                <option key={group} value={group} />
              ))}
            </datalist>
          </div>

          <div>
            <Label htmlFor="wallet-balance">Saldo Dompet</Label>
            <Input
              id="wallet-balance"
              type="number"
              value={formData.balance}
              onChange={(e) => setFormData(prev => ({ ...prev, balance: Number(e.target.value) }))}
              placeholder="0"
            />
            <p className="text-sm text-muted-foreground mt-1">
              Saldo saat ini: {formatCurrency(getWalletBalance(wallet.id))}
            </p>
          </div>

          <div>
            <Label>Warna</Label>
            <div className="grid grid-cols-4 gap-2 mt-2">
              {colorOptions.map((color) => (
                <button
                  key={color}
                  type="button"
                  className={`w-10 h-10 rounded-lg border-2 ${formData.color === color ? 'border-foreground' : 'border-border'
                    }`}
                  style={{ backgroundColor: color }}
                  onClick={() => setFormData(prev => ({ ...prev, color }))}
                />
              ))}
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="submit" className="flex-1 bg-finance-primary hover:bg-finance-secondary">
              Simpan Perubahan
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              Batal
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditWalletForm;

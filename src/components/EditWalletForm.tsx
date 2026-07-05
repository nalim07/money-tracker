
import React, { useState } from 'react';
import { useFinance } from '../contexts/FinanceContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Wallet } from '../types/finance';
import { toast } from 'sonner';
import { IconSelector } from './IconSelector';
import { CategoryIcon } from './CategoryIcon';

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

  const getInitialWalletInfo = () => {
    let type: 'regular' | 'savings' = 'regular';
    let target = '';
    let groupName = 'Lainnya';

    if (wallet.group && wallet.group.startsWith('{')) {
      try {
        const parsed = JSON.parse(wallet.group);
        type = parsed.type === 'savings' ? 'savings' : 'regular';
        target = parsed.type === 'savings' ? String(parsed.target || '') : '';
        groupName = parsed.name || 'Lainnya';
      } catch (e) {
        console.error('Error parsing group JSON in edit form', e);
      }
    } else {
      if (wallet.isSavings) {
        type = 'savings';
        target = String(wallet.targetAmount || '');
        groupName = 'Tabungan';
      } else {
        type = 'regular';
        target = '';
        groupName = wallet.group || 'Lainnya';
      }
    }

    return { type, target, groupName };
  };

  const initialInfo = getInitialWalletInfo();

  const defaultGroups = ['Bank', 'E-Wallet', 'Tunai', 'Investasi', 'Lainnya'];
  const allGroups = Array.from(new Set([...defaultGroups, ...wallets.filter(w => !w.isSavings).map(w => w.actualGroup || 'Lainnya')]));
  const isCustomGroupInitial = initialInfo.type === 'regular' && !allGroups.includes(initialInfo.groupName);

  const [formData, setFormData] = useState({
    name: wallet.name,
    color: wallet.color,
    icon: wallet.icon,
    balance: getWalletBalance(wallet.id),
    groupName: initialInfo.groupName,
    isCustomGroup: isCustomGroupInitial,
    type: initialInfo.type,
    target: initialInfo.target,
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

    if (formData.type === 'regular' && formData.isCustomGroup) {
      const defaultGroups = ['Bank', 'E-Wallet', 'Tunai', 'Investasi', 'Lainnya'];
      const existingGroups = wallets.filter(w => !w.isSavings && w.id !== wallet.id).map(w => w.actualGroup || 'Lainnya');
      const allGroups = Array.from(new Set([...defaultGroups, ...existingGroups]));
      
      const trimmedGroup = formData.groupName.trim();
      const duplicateGroup = allGroups.find(g => g.toLowerCase() === trimmedGroup.toLowerCase());
      
      if (duplicateGroup) {
        toast.error(`Grup "${duplicateGroup}" sudah ada di pilihan. Silakan pilih langsung dari dropdown.`);
        return;
      }
    }

    const serializedGroup = JSON.stringify({
      type: formData.type,
      name: formData.type === 'savings' ? 'Tabungan' : (formData.groupName.trim() || 'Lainnya'),
      target: formData.type === 'savings' ? Number(formData.target) || 0 : 0
    });

    updateWallet(wallet.id, {
      name: formData.name,
      color: formData.color,
      icon: formData.icon,
      balance: formData.balance,
      group: serializedGroup,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-w-md mx-auto rounded-3xl">
        <DialogHeader>
          <DialogTitle className="text-sm sm:text-base font-extrabold text-foreground">Edit Kantong</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="wallet-name" className="text-xs font-bold">Nama Kantong</Label>
            <Input
              id="wallet-name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Contoh: Rekening BRI"
              required
              className="rounded-xl border-gray-200 focus-visible:ring-primary dark:border-zinc-800"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-bold">Tipe Kantong</Label>
            <div className="grid grid-cols-2 gap-2 mt-1">
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, type: 'regular' }))}
                className={`py-2.5 px-4 rounded-xl border text-xs font-bold transition-all ${
                  formData.type === 'regular'
                    ? 'border-primary bg-primary/10 text-primary font-extrabold shadow-sm'
                    : 'border-gray-200 bg-transparent text-muted-foreground hover:bg-muted/40 dark:border-zinc-850'
                }`}
              >
                Kantong Biasa
              </button>
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, type: 'savings' }))}
                className={`py-2.5 px-4 rounded-xl border text-xs font-bold transition-all ${
                  formData.type === 'savings'
                    ? 'border-primary bg-primary/10 text-primary font-extrabold shadow-sm'
                    : 'border-gray-200 bg-transparent text-muted-foreground hover:bg-muted/40 dark:border-zinc-850'
                }`}
              >
                Tabungan (Target)
              </button>
            </div>
          </div>

          {formData.type === 'regular' ? (
            <div className="space-y-1.5">
              <Label className="text-xs font-bold">Grup Kantong</Label>
              {!formData.isCustomGroup ? (
                <select
                  value={formData.groupName}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === '__custom__') {
                      setFormData(prev => ({ ...prev, isCustomGroup: true, groupName: '' }));
                    } else {
                      setFormData(prev => ({ ...prev, groupName: val }));
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
                    value={formData.groupName}
                    onChange={(e) => setFormData(prev => ({ ...prev, groupName: e.target.value }))}
                    placeholder="Masukkan grup baru (contoh: Bisnis)"
                    className="rounded-xl border-gray-200 focus-visible:ring-primary dark:border-zinc-800 flex-1"
                    required
                    autoFocus
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setFormData(prev => ({ ...prev, isCustomGroup: false, groupName: 'Bank' }))}
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
                value={formData.target !== '' ? new Intl.NumberFormat('id-ID').format(Number(formData.target)) : ''}
                onChange={(e) => {
                  const clean = e.target.value.replace(/\D/g, '');
                  setFormData(prev => ({ ...prev, target: clean }));
                }}
                placeholder="Contoh: 15.000.000"
                required
                className="rounded-xl border-gray-200 focus-visible:ring-primary dark:border-zinc-800"
              />
            </div>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="wallet-balance" className="text-xs font-bold">Saldo Kantong</Label>
            <Input
              id="wallet-balance"
              type="text"
              value={formData.balance !== undefined && formData.balance !== null && formData.balance !== '' ? new Intl.NumberFormat('id-ID').format(Number(formData.balance)) : ''}
              onChange={(e) => {
                const clean = e.target.value.replace(/\D/g, '');
                setFormData(prev => ({ ...prev, balance: clean ? Number(clean) : 0 }));
              }}
              placeholder="0"
              className="rounded-xl border-gray-200 focus-visible:ring-primary dark:border-zinc-800"
            />
            <p className="text-[11px] text-muted-foreground mt-0.5">
              Saldo saat ini: {formatCurrency(getWalletBalance(wallet.id))}
            </p>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-bold">Logo/Ikon Kantong</Label>
            <div className="max-h-[180px] overflow-y-auto border border-gray-150 dark:border-zinc-800 rounded-xl p-3 bg-muted/10">
              <IconSelector
                selectedIcon={formData.icon}
                onIconSelect={(icon) => setFormData(prev => ({ ...prev, icon }))}
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
                  className={`w-10 h-10 rounded-xl border-2 transition-all ${formData.color === color ? 'border-foreground scale-105 shadow-sm' : 'border-transparent'}`}
                  style={{ backgroundColor: color }}
                  onClick={() => setFormData(prev => ({ ...prev, color }))}
                />
              ))}
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <Button type="submit" className="flex-1 bg-primary hover:bg-primary/95 text-white font-bold h-10 rounded-xl text-xs">
              Simpan Perubahan
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1 h-10 rounded-xl text-xs border-gray-200"
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

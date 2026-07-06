import React, { useState } from 'react';
import { useFinance } from '../contexts/FinanceContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Transaction } from '../types/finance';

interface EditTransactionFormProps {
  transaction: Transaction;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const EditTransactionForm: React.FC<EditTransactionFormProps> = ({
  transaction,
  open,
  onOpenChange,
}) => {
  const { updateTransaction, wallets, categories } = useFinance();
  
  const [formData, setFormData] = useState({
    type: transaction.type,
    amount: transaction.amount.toString(),
    description: transaction.description,
    category: transaction.category,
    wallet: transaction.wallet,
    date: (() => { const d = new Date(transaction.date); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; })(),
  });

  const availableCategories = categories.filter(cat => 
    cat.type === formData.type || cat.type === 'both'
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.amount || !formData.description || !formData.category || !formData.wallet) {
      return;
    }

    updateTransaction(transaction.id, {
      type: formData.type,
      amount: parseFloat(formData.amount),
      description: formData.description,
      category: formData.category,
      wallet: formData.wallet,
      date: (() => {
        // Pertahankan jam asli dari transaksi, hanya ubah tanggalnya
        const original = new Date(transaction.date);
        const updated = new Date(formData.date + 'T00:00:00');
        updated.setHours(original.getHours(), original.getMinutes(), original.getSeconds());
        return updated;
      })(),
    });

    onOpenChange(false);
  };

  return (
    <div className="flex flex-col max-h-[80vh] sm:max-h-[85vh] -my-2 -mx-1">
      {/* Fixed Header */}
      <DialogHeader className="pb-3 px-3.5 border-b border-gray-100 dark:border-zinc-800/60 flex-shrink-0">
        <DialogTitle className="text-sm sm:text-base font-extrabold text-foreground text-left">
          Edit Transaksi
        </DialogTitle>
      </DialogHeader>

      <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
        {/* Scrollable Body with horizontal padding to prevent active focus ring clipping */}
        <div className="flex-1 overflow-y-auto py-3.5 px-3.5 space-y-3.5 min-h-0 custom-scrollbar">
          {/* Tipe Transaksi */}
          <div className="space-y-1.5">
            <Label htmlFor="type" className="text-xs font-bold text-muted-foreground">Tipe Transaksi</Label>
            <Select 
              value={formData.type} 
              onValueChange={(value: 'income' | 'expense') => 
                setFormData(prev => ({ ...prev, type: value, category: '' }))
              }
            >
              <SelectTrigger className="h-10 rounded-sm border-gray-200 focus:ring-primary font-semibold text-xs sm:text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="rounded-sm">
                <SelectItem value="income" className="text-xs sm:text-sm font-semibold text-[#2ECC71]">Pemasukan</SelectItem>
                <SelectItem value="expense" className="text-xs sm:text-sm font-semibold text-[#FF5C5C]">Pengeluaran</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Jumlah */}
          <div className="space-y-1.5">
            <Label htmlFor="amount" className="text-xs font-bold text-muted-foreground">Jumlah (IDR)</Label>
            <Input
              id="amount"
              type="text"
              value={formData.amount !== '' ? new Intl.NumberFormat('id-ID').format(Number(formData.amount)) : ''}
              onChange={(e) => {
                const clean = e.target.value.replace(/\D/g, '');
                setFormData(prev => ({ ...prev, amount: clean }));
              }}
              placeholder="0"
              required
              className="h-10 rounded-sm border-gray-200 focus-visible:ring-primary"
            />
          </div>

          {/* Deskripsi */}
          <div className="space-y-1.5">
            <Label htmlFor="description" className="text-xs font-bold text-muted-foreground">Deskripsi</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Masukkan deskripsi transaksi"
              required
              className="rounded-sm border-gray-200 focus-visible:ring-primary min-h-[80px]"
            />
          </div>

          {/* Kategori */}
          <div className="space-y-1.5">
            <Label htmlFor="category" className="text-xs font-bold text-muted-foreground">Kategori</Label>
            <Select 
              value={formData.category} 
              onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
            >
              <SelectTrigger className="h-10 rounded-sm border-gray-200 focus:ring-primary font-semibold text-xs sm:text-sm">
                <SelectValue placeholder="Pilih kategori" />
              </SelectTrigger>
              <SelectContent className="rounded-sm">
                {availableCategories.map(category => (
                  <SelectItem key={category.id} value={category.id} className="text-xs sm:text-sm font-semibold">
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Dompet */}
          <div className="space-y-1.5">
            <Label htmlFor="wallet" className="text-xs font-bold text-muted-foreground">Dompet</Label>
            <Select 
              value={formData.wallet} 
              onValueChange={(value) => setFormData(prev => ({ ...prev, wallet: value }))}
            >
              <SelectTrigger className="h-10 rounded-sm border-gray-200 focus:ring-primary font-semibold text-xs sm:text-sm">
                <SelectValue placeholder="Pilih dompet" />
              </SelectTrigger>
              <SelectContent className="rounded-sm">
                {wallets.map(wallet => (
                  <SelectItem key={wallet.id} value={wallet.id} className="text-xs sm:text-sm font-semibold">
                    {wallet.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Tanggal */}
          <div className="space-y-1.5">
            <Label htmlFor="date" className="text-xs font-bold text-muted-foreground">Tanggal</Label>
            <Input
              id="date"
              type="date"
              value={formData.date}
              onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
              required
              className="h-10 rounded-sm border-gray-200 focus-visible:ring-primary"
            />
          </div>
        </div>

        {/* Fixed Footer */}
        <div className="pt-3 px-3.5 border-t border-gray-100 dark:border-zinc-800/60 flex-shrink-0 mt-2 flex flex-col-reverse sm:flex-row sm:justify-end gap-2.5">
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => onOpenChange(false)}
            className="w-full sm:w-auto rounded-sm font-bold h-10 border-gray-200 text-xs sm:text-sm"
          >
            Batal
          </Button>
          <Button 
            type="submit" 
            className="w-full sm:w-auto bg-primary hover:bg-primary/95 text-white font-bold h-10 rounded-sm text-xs sm:text-sm shadow-sm"
          >
            Simpan Perubahan
          </Button>
        </div>
      </form>
    </div>
  );
};

export default EditTransactionForm;

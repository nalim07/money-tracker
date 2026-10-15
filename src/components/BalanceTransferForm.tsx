import React, { useState } from 'react';
import { useFinance } from '../contexts/FinanceContext';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { ArrowRight } from 'lucide-react';

interface BalanceTransferFormProps {
  onClose?: () => void;
  defaultSourceWalletId?: string;
  defaultDestinationWalletId?: string;
}

export default function BalanceTransferForm({
  onClose,
  defaultSourceWalletId,
  defaultDestinationWalletId,
}: BalanceTransferFormProps) {
  const { wallets, categories, addTransaction } = useFinance();
  const [sourceWallet, setSourceWallet] = useState(defaultSourceWalletId || '');
  const [destinationWallet, setDestinationWallet] = useState(defaultDestinationWalletId || '');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!sourceWallet || !destinationWallet || !amount || !date) return;

    if (sourceWallet === destinationWallet) {
      alert('Dompet asal dan tujuan harus berbeda');
      return;
    }

    const transferAmount = Number(amount);
    if (!Number.isSafeInteger(transferAmount) || transferAmount <= 0) {
      alert('Jumlah transfer harus lebih dari Rp 0');
      return;
    }

    setIsSubmitting(true);

    try {
      const transferDescription = description.trim() || 'Transfer antar dompet';
      const transferDate = new Date(`${date}T12:00:00`);
      const transferCategory = categories.find((category) =>
        category.name.toLowerCase() === 'transfer' || category.name.toLowerCase() === 'saldo',
      );
      const categoryId = transferCategory ? transferCategory.id : 'Transfer';

      await addTransaction({
        type: 'expense',
        amount: transferAmount,
        description: `${transferDescription} (keluar)`,
        category: categoryId,
        wallet: sourceWallet,
        date: transferDate,
      });

      await addTransaction({
        type: 'income',
        amount: transferAmount,
        description: `${transferDescription} (masuk)`,
        category: categoryId,
        wallet: destinationWallet,
        date: transferDate,
      });

      setSourceWallet('');
      setDestinationWallet('');
      setAmount('');
      setDescription('');
      setDate(new Date().toISOString().slice(0, 10));
      onClose?.();
    } catch (error) {
      console.error('Error creating transfer:', error);
      alert('Gagal melakukan transfer');
    } finally {
      setIsSubmitting(false);
    }
  };

  const sourceWalletData = wallets.find((wallet) => wallet.id === sourceWallet);
  const destinationWalletData = wallets.find((wallet) => wallet.id === destinationWallet);

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="sourceWallet">Dompet Asal</Label>
        <Select value={sourceWallet} onValueChange={setSourceWallet}>
          <SelectTrigger id="sourceWallet">
            <SelectValue placeholder="Pilih dompet asal" />
          </SelectTrigger>
          <SelectContent>
            {wallets.map((wallet) => (
              <SelectItem key={wallet.id} value={wallet.id}>
                <div className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded-full" style={{ backgroundColor: wallet.color }} />
                  <span>{wallet.name}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex justify-center" aria-hidden="true">
        <ArrowRight className="h-5 w-5 text-muted-foreground" />
      </div>

      <div className="space-y-2">
        <Label htmlFor="destinationWallet">Dompet Tujuan</Label>
        <Select value={destinationWallet} onValueChange={setDestinationWallet}>
          <SelectTrigger id="destinationWallet">
            <SelectValue placeholder="Pilih dompet tujuan" />
          </SelectTrigger>
          <SelectContent>
            {wallets.filter((wallet) => wallet.id !== sourceWallet).map((wallet) => (
              <SelectItem key={wallet.id} value={wallet.id}>
                <div className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded-full" style={{ backgroundColor: wallet.color }} />
                  <span>{wallet.name}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="amount">Jumlah Transfer</Label>
        <Input
          id="amount"
          inputMode="numeric"
          type="text"
          value={amount ? new Intl.NumberFormat('id-ID').format(Number(amount)) : ''}
          onChange={(event) => setAmount(event.target.value.replace(/\D/g, ''))}
          placeholder="0"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="transfer-date">Tanggal Transfer</Label>
        <Input
          id="transfer-date"
          type="date"
          value={date}
          onChange={(event) => setDate(event.target.value)}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Keterangan (Opsional)</Label>
        <Input
          id="description"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          placeholder="Transfer saldo"
        />
      </div>

      {sourceWalletData && destinationWalletData && amount && (
        <div className="rounded-md bg-muted p-3 text-sm">
          <div className="mb-1 flex items-center justify-between">
            <span>Dari: {sourceWalletData.name}</span>
            <span className="text-red-600">-Rp {Number(amount).toLocaleString('id-ID')}</span>
          </div>
          <div className="flex items-center justify-between">
            <span>Ke: {destinationWalletData.name}</span>
            <span className="text-green-600">+Rp {Number(amount).toLocaleString('id-ID')}</span>
          </div>
        </div>
      )}

      <div className="flex gap-2 pt-1">
        {onClose && (
          <Button type="button" variant="outline" onClick={onClose} className="flex-1">
            Batal
          </Button>
        )}
        <Button
          type="submit"
          className="flex-1"
          disabled={isSubmitting || !sourceWallet || !destinationWallet || !amount || !date}
        >
          {isSubmitting ? 'Memproses...' : 'Transfer'}
        </Button>
      </div>
    </form>
  );
}

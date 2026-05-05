
import React, { useState } from 'react';
import { useFinance } from '../contexts/FinanceContext';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { ArrowRight } from 'lucide-react';

interface BalanceTransferFormProps {
  onClose?: () => void;
}

export default function BalanceTransferForm({ onClose }: BalanceTransferFormProps) {
  const { wallets, addTransaction } = useFinance();
  const [sourceWallet, setSourceWallet] = useState('');
  const [destinationWallet, setDestinationWallet] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!sourceWallet || !destinationWallet || !amount) {
      return;
    }

    if (sourceWallet === destinationWallet) {
      alert('Source and destination wallets must be different');
      return;
    }

    const transferAmount = parseFloat(amount);
    if (transferAmount <= 0) {
      alert('Transfer amount must be greater than 0');
      return;
    }

    setIsSubmitting(true);

    try {
      const transferDescription = description || 'Transfer antar dompet';

      // Create expense transaction from source wallet
      await addTransaction({
        type: 'expense',
        amount: transferAmount,
        description: `${transferDescription} (keluar)`,
        category: 'Transfer',
        wallet: sourceWallet,
        date: new Date(),
      });

      // Create income transaction to destination wallet
      await addTransaction({
        type: 'income',
        amount: transferAmount,
        description: `${transferDescription} (masuk)`,
        category: 'Transfer',
        wallet: destinationWallet,
        date: new Date(),
      });

      // Reset form
      setSourceWallet('');
      setDestinationWallet('');
      setAmount('');
      setDescription('');

      if (onClose) {
        onClose();
      }
    } catch (error) {
      console.error('Error creating transfer:', error);
      alert('Gagal melakukan transfer');
    } finally {
      setIsSubmitting(false);
    }
  };

  const sourceWalletData = wallets.find(w => w.id === sourceWallet);
  const destinationWalletData = wallets.find(w => w.id === destinationWallet);

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Transfer Saldo</CardTitle>
        <CardDescription>
          Transfer saldo antar dompet Anda
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="sourceWallet">Dompet Asal</Label>
            <Select value={sourceWallet} onValueChange={setSourceWallet}>
              <SelectTrigger>
                <SelectValue placeholder="Pilih dompet asal" />
              </SelectTrigger>
              <SelectContent>
                {wallets.map((wallet) => (
                  <SelectItem key={wallet.id} value={wallet.id}>
                    <div className="flex items-center space-x-2">
                      <span 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: wallet.color }}
                      />
                      <span>{wallet.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-center">
            <ArrowRight className="w-5 h-5 text-muted-foreground" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="destinationWallet">Dompet Tujuan</Label>
            <Select value={destinationWallet} onValueChange={setDestinationWallet}>
              <SelectTrigger>
                <SelectValue placeholder="Pilih dompet tujuan" />
              </SelectTrigger>
              <SelectContent>
                {wallets
                  .filter(wallet => wallet.id !== sourceWallet)
                  .map((wallet) => (
                    <SelectItem key={wallet.id} value={wallet.id}>
                      <div className="flex items-center space-x-2">
                        <span 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: wallet.color }}
                        />
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
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0"
              min="0"
              step="0.01"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Keterangan (Opsional)</Label>
            <Input
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Transfer saldo"
            />
          </div>

          {sourceWalletData && destinationWalletData && amount && (
            <div className="p-3 bg-muted rounded-md text-sm">
              <div className="flex justify-between items-center mb-1">
                <span>Dari: {sourceWalletData.name}</span>
                <span className="text-red-600">-Rp {parseFloat(amount).toLocaleString('id-ID')}</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Ke: {destinationWalletData.name}</span>
                <span className="text-green-600">+Rp {parseFloat(amount).toLocaleString('id-ID')}</span>
              </div>
            </div>
          )}

          <div className="flex space-x-2">
            {onClose && (
              <Button type="button" variant="outline" onClick={onClose} className="flex-1">
                Batal
              </Button>
            )}
            <Button 
              type="submit" 
              className="flex-1"
              disabled={isSubmitting || !sourceWallet || !destinationWallet || !amount}
            >
              {isSubmitting ? 'Memproses...' : 'Transfer'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

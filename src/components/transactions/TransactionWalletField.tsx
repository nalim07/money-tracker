
import React from 'react';
import { Control, useWatch } from 'react-hook-form';
import { 
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage 
} from '../ui/form';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '../ui/select';
import { Wallet } from '../../types/finance';
import { TransactionFormInput } from './TransactionFormTypes';
import { useFinance } from '../../contexts/FinanceContext';

interface TransactionWalletFieldProps {
  control: Control<TransactionFormInput>;
  wallets: Wallet[];
}

export default function TransactionWalletField({ control, wallets }: TransactionWalletFieldProps) {
  const { getWalletBalance } = useFinance();
  const selectedWallet = useWatch({ control, name: 'wallet' });
  const transactionType = useWatch({ control, name: 'type' });
  const transactionAmount = useWatch({ control, name: 'amount' });

  const amount = parseFloat(transactionAmount || '0');
  const selectedWalletBalance = selectedWallet ? getWalletBalance(selectedWallet) : 0;
  const hasInsufficientBalance = transactionType === 'expense' && selectedWallet && amount > selectedWalletBalance;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <FormField
      control={control}
      name="wallet"
      rules={{
        validate: (value) => {
          if (transactionType === 'expense' && value) {
            const walletBalance = getWalletBalance(value);
            const transactionAmount = parseFloat(control._formValues.amount || '0');
            if (transactionAmount > walletBalance) {
              return 'Saldo dompet tidak mencukupi. Silakan top up atau pilih dompet lain.';
            }
          }
          return true;
        }
      }}
      render={({ field }) => (
        <FormItem>
          <FormLabel>Dompet</FormLabel>
          <Select onValueChange={field.onChange} value={field.value}>
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder="Pilih dompet" />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              {wallets.map((wallet) => {
                const balance = getWalletBalance(wallet.id);
                return (
                  <SelectItem key={wallet.id} value={wallet.id}>
                    <div className="flex items-center justify-between w-full">
                      <div className="flex items-center space-x-2">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: wallet.color }}
                        />
                        <span>{wallet.name}</span>
                      </div>
                      <span className="ml-2 text-sm text-gray-500">
                        {formatCurrency(balance)}
                      </span>
                    </div>
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
          {hasInsufficientBalance && (
            <div className="text-sm text-red-600 mt-1">
              ⚠️ Saldo dompet tidak mencukupi. Silakan top up atau pilih dompet lain.
            </div>
          )}
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

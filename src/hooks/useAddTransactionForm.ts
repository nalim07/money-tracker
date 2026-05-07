
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useFinance } from '../contexts/FinanceContext';
import {
  transactionSchema,
  TransactionFormInput,
  TransactionFormData
} from '../components/transactions/TransactionFormTypes';

export interface UseAddTransactionFormProps {
  onClose?: () => void;
}

export function useAddTransactionForm({ onClose }: UseAddTransactionFormProps) {
  const { addTransaction, wallets, categories, getWalletBalance } = useFinance();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<TransactionFormInput>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      amount: '',
      description: '',
      category: '',
      wallet: '',
      type: 'expense',
      date: `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}-${String(new Date().getDate()).padStart(2, '0')}`,
    },
  });

  const processSubmit = async (data: TransactionFormInput, addAnother: boolean) => {
    try {
      setIsLoading(true);
      
      // Additional validation for expense transactions
      if (data.type === 'expense' && data.wallet) {
        const walletBalance = getWalletBalance(data.wallet);
        const transactionAmount = parseFloat(data.amount);
        
        if (transactionAmount > walletBalance) {
          form.setError('wallet', {
            type: 'manual',
            message: 'Saldo dompet tidak mencukupi. Silakan top up atau pilih dompet lain.'
          });
          return;
        }
      }
      
      const transformedData = form.getValues() as unknown as TransactionFormData;
      
      await addTransaction({
        type: transformedData.type,
        amount: transformedData.amount,
        description: transformedData.description,
        category: transformedData.category,
        wallet: transformedData.wallet,
        date: new Date(transformedData.date),
      });

      import('sonner').then(({ toast }) => {
        toast.success('Transaksi berhasil disimpan!');
      });

      if (addAnother) {
        // Keep the date and type, reset the rest to allow rapid entry
        form.reset({
          ...form.getValues(),
          amount: '',
          description: '',
          category: '',
          wallet: '',
        });
      } else {
        form.reset();
        onClose?.();
      }
    } catch (error) {
      console.error('Error adding transaction:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = form.handleSubmit((data) => processSubmit(data, false));
  const onSaveAndAddAnother = form.handleSubmit((data) => processSubmit(data, true));

  const selectedType = form.watch('type');
  const availableCategories = categories.filter(
    cat => cat.type === selectedType || cat.type === 'both'
  );

  // Reset category when type changes to keep form synchronized
  useEffect(() => {
    const currentCategory = form.getValues('category');
    if (currentCategory) {
      const isStillAvailable = availableCategories.some(cat => cat.id === currentCategory);
      if (!isStillAvailable) {
        form.setValue('category', '');
      }
    }
  }, [selectedType, availableCategories, form]);

  return {
    form,
    onSubmit,
    onSaveAndAddAnother,
    isLoading,
    wallets,
    availableCategories,
  };
}

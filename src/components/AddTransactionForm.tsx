import React from 'react';
import { DialogHeader, DialogTitle } from './ui/dialog';
import { Form } from './ui/form';
import TransactionTypeField from './transactions/TransactionTypeField';
import TransactionAmountField from './transactions/TransactionAmountField';
import TransactionDescriptionField from './transactions/TransactionDescriptionField';
import TransactionCategoryField from './transactions/TransactionCategoryField';
import TransactionWalletField from './transactions/TransactionWalletField';
import TransactionDateField from './transactions/TransactionDateField';
import TransactionFormActions from './transactions/TransactionFormActions';
import { useAddTransactionForm } from '../hooks/useAddTransactionForm';

interface AddTransactionFormProps {
  onClose?: () => void;
  defaultWalletId?: string;
  defaultType?: 'income' | 'expense';
}

export default function AddTransactionForm({ onClose, defaultWalletId, defaultType }: AddTransactionFormProps) {
  const { form, onSubmit, onSaveAndAddAnother, isLoading, wallets, availableCategories } = useAddTransactionForm({ 
    onClose, 
    defaultWalletId,
    defaultType
  });

  return (
    <div className="space-y-4">
      <DialogHeader>
        <DialogTitle className="text-sm sm:text-base font-extrabold text-foreground">
          Tambah Transaksi
        </DialogTitle>
      </DialogHeader>

      <Form {...form}>
        <form onSubmit={onSubmit} className="space-y-4">
          <TransactionTypeField control={form.control} />
          <TransactionAmountField control={form.control} />
          <TransactionDescriptionField control={form.control} />
          <TransactionCategoryField 
            control={form.control} 
            categories={availableCategories} 
          />
          <TransactionWalletField 
            control={form.control} 
            wallets={wallets} 
          />
          <TransactionDateField control={form.control} />
          
          <div className="pt-2">
            <TransactionFormActions 
              onClose={onClose} 
              onSaveAndAddAnother={onSaveAndAddAnother}
              isLoading={isLoading} 
            />
          </div>
        </form>
      </Form>
    </div>
  );
}


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
}

export default function AddTransactionForm({ onClose }: AddTransactionFormProps) {
  const { form, onSubmit, onSaveAndAddAnother, isLoading, wallets, availableCategories } = useAddTransactionForm({ onClose });

  return (
    <div className="space-y-4">
      <DialogHeader>
        <DialogTitle>Tambah Transaksi</DialogTitle>
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
          <TransactionFormActions 
            onClose={onClose} 
            onSaveAndAddAnother={onSaveAndAddAnother}
            isLoading={isLoading} 
          />
        </form>
      </Form>
    </div>
  );
}

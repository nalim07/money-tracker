
import React from 'react';
import { Control } from 'react-hook-form';
import { 
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage 
} from '../ui/form';
import { Input } from '../ui/input';
import { TransactionFormInput } from './TransactionFormTypes';

interface TransactionAmountFieldProps {
  control: Control<TransactionFormInput>;
}

export default function TransactionAmountField({ control }: TransactionAmountFieldProps) {
  return (
    <FormField
      control={control}
      name="amount"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Jumlah</FormLabel>
          <FormControl>
            <Input
              type="text"
              placeholder="0"
              value={field.value !== undefined && field.value !== null && field.value !== '' ? new Intl.NumberFormat('id-ID').format(Number(field.value)) : ''}
              onChange={(e) => {
                const clean = e.target.value.replace(/\D/g, '');
                field.onChange(clean);
              }}
              className="rounded-xl border-gray-200 focus-visible:ring-primary dark:border-zinc-800"
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}


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
              type="number"
              placeholder="0"
              step="0.01"
              min="0"
              {...field}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

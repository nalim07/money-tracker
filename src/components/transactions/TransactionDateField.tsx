
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

interface TransactionDateFieldProps {
  control: Control<TransactionFormInput>;
}

export default function TransactionDateField({ control }: TransactionDateFieldProps) {
  return (
    <FormField
      control={control}
      name="date"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Tanggal</FormLabel>
          <FormControl>
            <Input type="date" {...field} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

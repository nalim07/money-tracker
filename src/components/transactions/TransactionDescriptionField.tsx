
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

interface TransactionDescriptionFieldProps {
  control: Control<TransactionFormInput>;
}

export default function TransactionDescriptionField({ control }: TransactionDescriptionFieldProps) {
  return (
    <FormField
      control={control}
      name="description"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Deskripsi</FormLabel>
          <FormControl>
            <Input placeholder="Masukkan deskripsi transaksi" {...field} className="rounded-xl border-gray-200 focus-visible:ring-primary dark:border-zinc-800" />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}


import React from 'react';
import { Control } from 'react-hook-form';
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
import { Category } from '../../types/finance';
import { TransactionFormInput } from './TransactionFormTypes';
import { CategoryIcon } from '../CategoryIcon';

interface TransactionCategoryFieldProps {
  control: Control<TransactionFormInput>;
  categories: Category[];
}

export default function TransactionCategoryField({ control, categories }: TransactionCategoryFieldProps) {
  return (
    <FormField
      control={control}
      name="category"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Kategori</FormLabel>
          <Select onValueChange={field.onChange} value={field.value}>
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder="Pilih kategori" />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  <div className="flex items-center space-x-2">
                    <CategoryIcon icon={category.icon} className="w-4 h-4" />
                    <span>{category.name}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

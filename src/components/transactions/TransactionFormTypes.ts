
import { z } from 'zod';

export const transactionSchema = z.object({
  amount: z.string().min(1, 'Amount is required').transform((val) => parseFloat(val)),
  description: z.string().min(1, 'Description is required'),
  category: z.string().min(1, 'Category is required'),
  wallet: z.string().min(1, 'Wallet is required'),
  type: z.enum(['income', 'expense']),
  date: z.string().min(1, 'Date is required'),
});

// Form input type (before transformation)
export type TransactionFormInput = {
  amount: string;
  description: string;
  category: string;
  wallet: string;
  type: 'income' | 'expense';
  date: string;
};

// Final data type (after transformation)
export type TransactionFormData = z.infer<typeof transactionSchema>;

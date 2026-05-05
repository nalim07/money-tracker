
import { Transaction, Wallet, Category, FinancialSummary } from '../types/finance';

export const transformTransactionData = (data: any): Transaction => ({
  id: data.id,
  type: data.type as 'income' | 'expense',
  amount: data.amount,
  description: data.description,
  category: data.category,
  wallet: data.wallet,
  date: new Date(data.date),
  createdAt: new Date(data.created_at)
});

export const transformWalletData = (data: any): Wallet => ({
  id: data.id,
  name: data.name,
  color: data.color,
  icon: data.icon,
  group: data.group || 'Lainnya',
  balance: 0 // Will be calculated from transactions
});

export const transformCategoryData = (data: any): Category => ({
  id: data.id,
  name: data.name,
  type: data.type as 'income' | 'expense' | 'both',
  color: data.color,
  icon: data.icon
});

export const calculateWalletBalance = (transactions: Transaction[], walletId: string): number => {
  return transactions
    .filter(t => t.wallet === walletId)
    .reduce((sum, t) => sum + (t.type === 'income' ? t.amount : -t.amount), 0);
};

export const calculateFinancialSummary = (transactions: Transaction[]): FinancialSummary => {
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const currentMonthTransactions = transactions.filter(t => {
    const transactionDate = new Date(t.date);
    return transactionDate.getMonth() === currentMonth &&
      transactionDate.getFullYear() === currentYear;
  });

  const monthlyIncome = currentMonthTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const monthlyExpense = currentMonthTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalBalance = transactions.reduce(
    (sum, t) => sum + (t.type === 'income' ? t.amount : -t.amount),
    0
  );

  return {
    totalBalance,
    monthlyIncome,
    monthlyExpense,
    monthlyNet: monthlyIncome - monthlyExpense,
  };
};


import { Transaction, Wallet, Category, FinancialSummary } from '../types/finance';

export const transformTransactionData = (data: any): Transaction => ({
  id: data.id,
  type: data.type as 'income' | 'expense',
  amount: data.amount,
  description: data.description,
  category: data.category,
  wallet: data.wallet,
  date: new Date(data.date + 'T00:00:00'),
  createdAt: new Date(data.created_at)
});

export const transformWalletData = (data: any): Wallet => {
  let isSavings = false;
  let targetAmount = 0;
  let actualGroup = data.group || 'Lainnya';

  if (data.group && data.group.startsWith('{')) {
    try {
      const parsed = JSON.parse(data.group);
      if (parsed.type === 'savings') {
        isSavings = true;
        targetAmount = Number(parsed.target) || 0;
        actualGroup = parsed.name || 'Tabungan';
      } else {
        isSavings = false;
        targetAmount = 0;
        actualGroup = parsed.name || 'Lainnya';
      }
    } catch (e) {
      console.error('Error parsing wallet group JSON', e);
    }
  } else {
    const nameLower = (data.name || '').toLowerCase();
    if (nameLower.includes('darurat') || nameLower.includes('liburan') || nameLower.includes('travel') || nameLower.includes('trip') || nameLower.includes('rumah') || nameLower.includes('dp') || nameLower.includes('gadget') || nameLower.includes('hp')) {
      isSavings = true;
      if (nameLower.includes('darurat')) targetAmount = 30000000;
      else if (nameLower.includes('liburan') || nameLower.includes('travel') || nameLower.includes('jalan')) targetAmount = 15000000;
      else if (nameLower.includes('rumah') || nameLower.includes('dp')) targetAmount = 80000000;
      else if (nameLower.includes('gadget') || nameLower.includes('hp') || nameLower.includes('phone')) targetAmount = 10000000;
      else targetAmount = 10000000;
    }
  }

  return {
    id: data.id,
    name: data.name,
    color: data.color,
    icon: data.icon,
    group: data.group || 'Lainnya',
    balance: 0,
    isSavings,
    targetAmount,
    actualGroup
  };
};

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


export interface Transaction {
  id: string;
  type: 'income' | 'expense';
  amount: number;
  description: string;
  category: string;
  wallet: string;
  date: Date;
  createdAt: Date;
}

export interface Wallet {
  id: string;
  name: string;
  color: string;
  icon: string;
  balance: number;
  group?: string;
}

export interface Category {
  id: string;
  name: string;
  type: 'income' | 'expense' | 'both';
  color: string;
  icon: string;
}

export interface FinancialSummary {
  totalBalance: number;
  monthlyIncome: number;
  monthlyExpense: number;
  monthlyNet: number;
}

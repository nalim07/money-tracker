
import React, { createContext, useContext, useState, useEffect } from 'react';
import { Transaction, Wallet, Category, FinancialSummary } from '../types/finance';
import { useAuth } from './AuthContext';
import { useFinanceToast } from '../hooks/useFinanceToast';
import { useTransactionOperations } from '../hooks/useTransactionOperations';
import { useWalletOperations } from '../hooks/useWalletOperations';
import { useCategoryOperations } from '../hooks/useCategoryOperations';
import { useFinancialCalculations } from '../hooks/useFinancialCalculations';

interface FinanceContextType {
  transactions: Transaction[];
  wallets: Wallet[];
  categories: Category[];
  loading: boolean;
  addTransaction: (transaction: Omit<Transaction, 'id' | 'createdAt'>) => Promise<void>;
  updateTransaction: (id: string, transaction: Partial<Transaction>) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  addWallet: (wallet: Omit<Wallet, 'id' | 'balance'>) => Promise<void>;
  updateWallet: (id: string, wallet: Partial<Wallet>) => Promise<void>;
  deleteWallet: (id: string) => Promise<void>;
  addCategory: (category: Omit<Category, 'id'>) => Promise<void>;
  updateCategory: (id: string, category: Partial<Category>) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
  getFinancialSummary: () => FinancialSummary;
  getWalletBalance: (walletId: string) => number;
  refreshData: () => Promise<void>;
}

const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

export function FinanceProvider({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const toast = useFinanceToast();

  // Initialize operation hooks
  const transactionOps = useTransactionOperations();
  const walletOps = useWalletOperations(transactionOps.transactions, transactionOps.addTransaction);
  const categoryOps = useCategoryOperations();
  const calculations = useFinancialCalculations(transactionOps.transactions);

  // Load data from Supabase on mount and when user changes
  useEffect(() => {
    if (user) {
      console.log('User authenticated, loading data for user:', user.id);
      refreshData();
    } else {
      console.log('User not authenticated, clearing all data');
      // Clear all user data when user logs out
      transactionOps.setTransactions([]);
      walletOps.setWallets([]);
      categoryOps.setCategories([]);
      setLoading(false);
    }
  }, [user]);




  const refreshData = async () => {
    if (!user) {
      console.log('No authenticated user, skipping data refresh');
      return;
    }

    try {
      setLoading(true);
      
      console.log('Loading data for user:', user.id);
      
      // Clear existing data first to prevent cross-user contamination
      transactionOps.setTransactions([]);
      walletOps.setWallets([]);
      categoryOps.setCategories([]);
      
      // Fetch all data in parallel
      await Promise.all([
        transactionOps.loadTransactions(),
        walletOps.loadWallets(),
        categoryOps.loadCategories()
      ]);

      console.log('Data loaded successfully for user:', user.id, {
        transactions: transactionOps.transactions.length,
        wallets: walletOps.wallets.length,
        categories: categoryOps.categories.length
      });
    } catch (error) {
      console.error('Error loading data for user:', user?.id, error);
      toast.showDataLoadError();
      
      // Clear data on error to prevent stale data
      transactionOps.setTransactions([]);
      walletOps.setWallets([]);
      categoryOps.setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <FinanceContext.Provider value={{
      transactions: transactionOps.transactions,
      wallets: walletOps.wallets,
      categories: categoryOps.categories,
      loading,
      addTransaction: transactionOps.addTransaction,
      updateTransaction: transactionOps.updateTransaction,
      deleteTransaction: transactionOps.deleteTransaction,
      addWallet: walletOps.addWallet,
      updateWallet: walletOps.updateWallet,
      deleteWallet: walletOps.deleteWallet,
      addCategory: categoryOps.addCategory,
      updateCategory: categoryOps.updateCategory,
      deleteCategory: categoryOps.deleteCategory,
      getFinancialSummary: calculations.getFinancialSummary,
      getWalletBalance: walletOps.getWalletBalance,
      refreshData,
    }}>
      {children}
    </FinanceContext.Provider>
  );
}

export function useFinance() {
  const context = useContext(FinanceContext);
  if (context === undefined) {
    throw new Error('useFinance must be used within a FinanceProvider');
  }
  return context;
}

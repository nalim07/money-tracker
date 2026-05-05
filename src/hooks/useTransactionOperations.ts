
import { useState } from 'react';
import { Transaction } from '../types/finance';
import { transactionService } from '../services/transactionService';
import { useFinanceToast } from './useFinanceToast';
import { transformTransactionData } from '../utils/financeUtils';

export const useTransactionOperations = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const toast = useFinanceToast();

  const addTransaction = async (transaction: Omit<Transaction, 'id' | 'createdAt'>) => {
    try {
      const data = await transactionService.create(transaction);
      const newTransaction = transformTransactionData(data);
      setTransactions(prev => [newTransaction, ...prev]);
      toast.showTransactionAdded();
    } catch (error) {
      console.error('Error adding transaction:', error);
      toast.showTransactionError();
    }
  };

  const updateTransaction = async (id: string, updates: Partial<Transaction>) => {
    try {
      await transactionService.update(id, updates);
      setTransactions(prev => prev.map(t => 
        t.id === id ? { ...t, ...updates } : t
      ));
      toast.showTransactionUpdated();
    } catch (error) {
      console.error('Error updating transaction:', error);
      toast.showTransactionUpdateError();
    }
  };

  const deleteTransaction = async (id: string) => {
    try {
      await transactionService.delete(id);
      setTransactions(prev => prev.filter(t => t.id !== id));
      toast.showTransactionDeleted();
    } catch (error) {
      console.error('Error deleting transaction:', error);
      toast.showTransactionDeleteError();
    }
  };

  const loadTransactions = async () => {
    try {
      const transactionsResult = await transactionService.fetchAll();
      setTransactions(transactionsResult.map(transformTransactionData));
    } catch (error) {
      console.error('Error loading transactions:', error);
      throw error;
    }
  };

  return {
    transactions,
    setTransactions,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    loadTransactions,
  };
};

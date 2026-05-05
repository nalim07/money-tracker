
import { useState } from 'react';
import { Wallet, Transaction } from '../types/finance';
import { walletService } from '../services/walletService';
import { transactionService } from '../services/transactionService';
import { useFinanceToast } from './useFinanceToast';
import { transformWalletData, transformTransactionData } from '../utils/financeUtils';

export const useWalletOperations = (
  transactions: Transaction[],
  addTransactionCallback: (transaction: Omit<Transaction, 'id' | 'createdAt'>) => Promise<void>
) => {
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const toast = useFinanceToast();

  const addWallet = async (wallet: Omit<Wallet, 'id' | 'balance'>) => {
    try {
      const data = await walletService.create(wallet);
      const newWallet = transformWalletData(data);
      setWallets(prev => [...prev, newWallet]);
      toast.showWalletAdded();
    } catch (error) {
      console.error('Error adding wallet:', error);
      toast.showWalletError();
    }
  };

  const updateWallet = async (id: string, updates: Partial<Wallet>) => {
    try {
      await walletService.update(id, updates);
      
      // If balance is being updated, create a balancing transaction
      if (updates.balance !== undefined) {
        const currentBalance = getWalletBalance(id);
        const balanceDifference = updates.balance - currentBalance;
        
        if (balanceDifference !== 0) {
          // Create a balancing transaction
          const balanceTransaction = {
            type: balanceDifference > 0 ? 'income' : 'expense' as 'income' | 'expense',
            amount: Math.abs(balanceDifference),
            description: 'Penyesuaian Saldo Manual',
            category: 'Penyesuaian',
            wallet: id,
            date: new Date(),
          };
          
          await addTransactionCallback(balanceTransaction);
        }
      }
      
      setWallets(prev => prev.map(w => 
        w.id === id ? { ...w, ...updates } : w
      ));
      toast.showWalletUpdated();
    } catch (error) {
      console.error('Error updating wallet:', error);
      toast.showWalletUpdateError();
    }
  };

  const deleteWallet = async (id: string) => {
    try {
      await walletService.delete(id);
      setWallets(prev => prev.filter(w => w.id !== id));
      toast.showWalletDeleted();
    } catch (error) {
      console.error('Error deleting wallet:', error);
      toast.showWalletDeleteError();
    }
  };

  const getWalletBalance = (walletId: string) => {
    return transactions
      .filter(t => t.wallet === walletId)
      .reduce((sum, t) => sum + (t.type === 'income' ? t.amount : -t.amount), 0);
  };

  const loadWallets = async () => {
    try {
      const walletsResult = await walletService.fetchAll();
      setWallets(walletsResult.map(transformWalletData));
    } catch (error) {
      console.error('Error loading wallets:', error);
      throw error;
    }
  };

  return {
    wallets,
    setWallets,
    addWallet,
    updateWallet,
    deleteWallet,
    getWalletBalance,
    loadWallets,
  };
};

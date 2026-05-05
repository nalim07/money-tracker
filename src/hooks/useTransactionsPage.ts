
import { useState } from 'react';
import { useFinance } from '../contexts/FinanceContext';
import { Transaction } from '../types/finance';

export function useTransactionsPage() {
  const { transactions, deleteTransaction, wallets, categories } = useFinance();
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterWallet, setFilterWallet] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const filteredTransactions = transactions.filter(transaction => {
    const matchesSearch = transaction.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         transaction.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesWallet = filterWallet === 'all' || transaction.wallet === filterWallet;
    const matchesCategory = filterCategory === 'all' || transaction.category === filterCategory;
    const matchesType = filterType === 'all' || transaction.type === filterType;
    
    let matchesDateRange = true;
    const transactionDate = new Date(transaction.date);
    if (dateFrom) {
      matchesDateRange = matchesDateRange && transactionDate >= new Date(dateFrom);
    }
    if (dateTo) {
      matchesDateRange = matchesDateRange && transactionDate <= new Date(dateTo);
    }
    
    return matchesSearch && matchesWallet && matchesCategory && matchesType && matchesDateRange;
  });

  const clearFilters = () => {
    setSearchTerm('');
    setFilterWallet('all');
    setFilterCategory('all');
    setFilterType('all');
    setDateFrom('');
    setDateTo('');
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return {
    transactions,
    filteredTransactions,
    showAddDialog,
    setShowAddDialog,
    editingTransaction,
    setEditingTransaction,
    searchTerm,
    setSearchTerm,
    filterWallet,
    setFilterWallet,
    filterCategory,
    setFilterCategory,
    filterType,
    setFilterType,
    dateFrom,
    setDateFrom,
    dateTo,
    setDateTo,
    clearFilters,
    deleteTransaction,
    formatCurrency,
    wallets,
    categories
  };
}

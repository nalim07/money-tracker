
import { Transaction, FinancialSummary } from '../types/finance';
import { calculateFinancialSummary } from '../utils/financeUtils';

export const useFinancialCalculations = (transactions: Transaction[]) => {
  const getFinancialSummary = (): FinancialSummary => {
    return calculateFinancialSummary(transactions);
  };

  return {
    getFinancialSummary,
  };
};

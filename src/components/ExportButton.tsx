
import React from 'react';
import { Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useFinance } from '../contexts/FinanceContext';
import { exportTransactionsToCSV } from '../utils/csvExport';
import { useToast } from '@/hooks/use-toast';

interface ExportButtonProps {
  filteredTransactions?: any[];
}

const ExportButton: React.FC<ExportButtonProps> = ({ filteredTransactions }) => {
  const { transactions, wallets, categories } = useFinance();
  const { toast } = useToast();

  const handleExport = () => {
    const transactionsToExport = filteredTransactions || transactions;
    
    if (transactionsToExport.length === 0) {
      toast({
        title: "Tidak ada data",
        description: "Tidak ada transaksi untuk diekspor",
        variant: "destructive",
      });
      return;
    }

    exportTransactionsToCSV(transactionsToExport, wallets, categories);
    
    toast({
      title: "Berhasil",
      description: `${transactionsToExport.length} transaksi berhasil diekspor`,
    });
  };

  return (
    <Button
      variant="outline"
      onClick={handleExport}
      className="flex items-center gap-2"
    >
      <Download className="w-4 h-4" />
      Export CSV
    </Button>
  );
};

export default ExportButton;

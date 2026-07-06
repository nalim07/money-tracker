import React, { useState } from 'react';
import { Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useFinance } from '../contexts/FinanceContext';
import { exportTransactionsToCSV } from '../utils/csvExport';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Category } from '../types/finance';

interface ExportButtonProps {
  filteredTransactions?: any[];
  className?: string;
}

const ExportButton: React.FC<ExportButtonProps> = ({ filteredTransactions, className }) => {
  const { transactions, wallets, categories } = useFinance();
  const { toast } = useToast();
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    const transactionsToExport = filteredTransactions || transactions;

    if (transactionsToExport.length === 0) {
      toast({
        title: "Tidak ada data",
        description: "Tidak ada transaksi untuk diekspor",
        variant: "destructive",
      });
      return;
    }

    setIsExporting(true);
    try {
      // Kumpulkan semua UUID kategori yang ada di transaksi
      const categoryIds = [
        ...new Set(
          transactionsToExport
            .map((t: any) => t.category)
            .filter((c: string) => c && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(c.trim()))
        )
      ];

      // Jika ada UUID yang belum ada di categories context, fetch langsung dari Supabase
      const missingIds = categoryIds.filter(
        (id: string) => !categories.find((c: Category) => c.id === id)
      );

      let allCategories = [...categories];

      if (missingIds.length > 0) {
        // Fetch kategori yang hilang (termasuk legacy tanpa user_id)
        const { data: extraCategories, error } = await supabase
          .from('categories')
          .select('*')
          .in('id', missingIds);

        if (!error && extraCategories) {
          const mapped: Category[] = extraCategories.map((c: any) => ({
            id: c.id,
            name: c.name,
            type: c.type as 'income' | 'expense' | 'both',
            color: c.color,
            icon: c.icon,
          }));
          allCategories = [...allCategories, ...mapped];
        }
      }

      exportTransactionsToCSV(transactionsToExport, wallets, allCategories);

      toast({
        title: "Berhasil",
        description: `${transactionsToExport.length} transaksi berhasil diekspor`,
      });
    } catch (err) {
      console.error('Export error:', err);
      toast({
        title: "Gagal export",
        description: "Terjadi kesalahan saat mengekspor data",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Button
      variant="outline"
      onClick={handleExport}
      disabled={isExporting}
      className={`flex items-center justify-center gap-1 sm:gap-2 px-2 sm:px-4 ${className || ''}`}
    >
      <Download className="w-4 h-4 flex-shrink-0" />
      <span className="hidden sm:inline">{isExporting ? 'Mengekspor...' : 'Export CSV'}</span>
      <span className="sm:hidden text-sm">{isExporting ? '...' : 'Export'}</span>
    </Button>
  );
};

export default ExportButton;

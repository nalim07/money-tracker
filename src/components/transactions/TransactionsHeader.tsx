
import React, { useState } from 'react';
import { Plus, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import ExportButton from '../ExportButton';
import AddTransactionForm from '../AddTransactionForm';
import ImportCSVDialog from '../ImportCSVDialog';

interface TransactionsHeaderProps {
  filteredTransactions: any[];
  showAddDialog: boolean;
  setShowAddDialog: (value: boolean) => void;
}

export default function TransactionsHeader({
  filteredTransactions,
  showAddDialog,
  setShowAddDialog
}: TransactionsHeaderProps) {
  const [showImportDialog, setShowImportDialog] = useState(false);

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
      <h1 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-white">Transaksi</h1>
      <div className="flex gap-2">
        <Button
          variant="outline"
          onClick={() => setShowImportDialog(true)}
          className="flex items-center gap-2"
        >
          <Upload className="w-4 h-4" />
          <span className="hidden sm:inline">Import CSV</span>
          <span className="sm:hidden">Import</span>
        </Button>
        <ExportButton filteredTransactions={filteredTransactions} />
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogTrigger asChild>
            <Button className="bg-finance-primary hover:bg-finance-secondary text-sm sm:text-base">
              <Plus className="w-4 h-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Tambah Transaksi</span>
              <span className="sm:hidden">Tambah</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="w-[95vw] max-w-md mx-auto">
            <AddTransactionForm onClose={() => setShowAddDialog(false)} />
          </DialogContent>
        </Dialog>

        <ImportCSVDialog 
          open={showImportDialog} 
          onOpenChange={setShowImportDialog} 
        />
      </div>
    </div>
  );
}

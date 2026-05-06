
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
      <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2 w-full sm:w-auto">
        <Button
          variant="outline"
          onClick={() => setShowImportDialog(true)}
          className="flex items-center justify-center gap-1 sm:gap-2 px-2 sm:px-4 col-span-1"
        >
          <Upload className="w-4 h-4 flex-shrink-0" />
          <span className="hidden sm:inline">Import CSV</span>
          <span className="sm:hidden text-sm">Import</span>
        </Button>
        <ExportButton filteredTransactions={filteredTransactions} className="col-span-1" />
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogTrigger asChild>
            <Button className="col-span-2 sm:col-span-1 bg-finance-primary hover:bg-finance-secondary text-sm sm:text-base px-3 sm:px-4 flex items-center justify-center gap-2">
              <Plus className="w-4 h-4 flex-shrink-0" />
              <span>Tambah Transaksi</span>
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

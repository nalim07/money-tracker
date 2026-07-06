import React, { useState } from 'react';
import { Plus, Upload, Download } from 'lucide-react';
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
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      {/* Title */}
      <div className="flex flex-col gap-0.5">
        <h1 className="text-xl sm:text-2xl font-extrabold text-foreground tracking-tight">Transaksi</h1>
        <p className="text-xs text-muted-foreground">Kelola dan pantau seluruh catatan transaksi Anda</p>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2 w-full sm:w-auto">
        {/* Import CSV */}
        <Button
          variant="outline"
          onClick={() => setShowImportDialog(true)}
          className="flex items-center justify-center gap-2 h-10 rounded-xl font-bold text-xs border-gray-200 text-foreground hover:bg-muted col-span-1"
        >
          <Upload className="w-4 h-4 flex-shrink-0 text-muted-foreground" />
          <span>Import CSV</span>
        </Button>

        {/* Export Button */}
        <ExportButton filteredTransactions={filteredTransactions} className="col-span-1" />

        {/* Tambah Transaksi */}
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-primary/95 text-white font-bold h-10 rounded-xl text-xs flex items-center justify-center gap-2 col-span-2 sm:col-span-1 shadow-[0_4px_12px_hsl(var(--primary)/0.2)]">
              <Plus className="w-4 h-4 flex-shrink-0" />
              <span>Tambah Transaksi</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="w-[95vw] max-w-md mx-auto rounded-sm">
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

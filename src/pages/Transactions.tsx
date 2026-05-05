import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import EditTransactionForm from '../components/EditTransactionForm';
import TransactionsHeader from '../components/transactions/TransactionsHeader';
import TransactionsFilters from '../components/transactions/TransactionsFilters';
import TransactionsList from '../components/transactions/TransactionsList';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useTransactionsPage } from '../hooks/useTransactionsPage';
import WalletGroupsView from '../components/transactions/WalletGroupsView';
import ConfirmDialog from '../components/ConfirmDialog';
import { Transaction } from '../types/finance';
import { toast } from 'sonner';

const Transactions: React.FC = () => {
  const {
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
  } = useTransactionsPage();

  const [deletingTransaction, setDeletingTransaction] = useState<Transaction | null>(null);

  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const tabParam = queryParams.get('tab') || 'transactions';

  const [activeTab, setActiveTab] = useState(tabParam);

  useEffect(() => {
    setActiveTab(tabParam);
  }, [tabParam]);

  return (
    <div className="space-y-4 px-2 sm:px-4 lg:px-0">
      {/* Header */}
      <TransactionsHeader 
        filteredTransactions={filteredTransactions}
        showAddDialog={showAddDialog}
        setShowAddDialog={setShowAddDialog}
      />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="transactions">Riwayat Transaksi</TabsTrigger>
          <TabsTrigger value="wallet-groups">Grup Dompet</TabsTrigger>
        </TabsList>

        <TabsContent value="transactions" className="space-y-4">
          {/* Filters */}
          <TransactionsFilters 
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            filterType={filterType}
            setFilterType={setFilterType}
            filterWallet={filterWallet}
            setFilterWallet={setFilterWallet}
            filterCategory={filterCategory}
            setFilterCategory={setFilterCategory}
            dateFrom={dateFrom}
            setDateFrom={setDateFrom}
            dateTo={dateTo}
            setDateTo={setDateTo}
            clearFilters={clearFilters}
            wallets={wallets}
            categories={categories}
          />

          {/* Transactions List */}
          <TransactionsList 
            filteredTransactions={filteredTransactions}
            wallets={wallets}
            categories={categories}
            formatCurrency={formatCurrency}
            onEdit={setEditingTransaction}
            onDelete={(id) => {
              const trx = filteredTransactions.find(t => t.id === id);
              if (trx) setDeletingTransaction(trx);
            }}
            onAddTransaction={() => setShowAddDialog(true)}
          />
        </TabsContent>

        <TabsContent value="wallet-groups">
          <WalletGroupsView />
        </TabsContent>
      </Tabs>

      {/* Edit Transaction Dialog */}
      {editingTransaction && (
        <Dialog
          open={!!editingTransaction}
          onOpenChange={(open) => !open && setEditingTransaction(null)}
        >
          <DialogContent className="w-[95vw] max-w-md mx-auto">
            <EditTransactionForm
              transaction={editingTransaction}
              open={!!editingTransaction}
              onOpenChange={(open) => !open && setEditingTransaction(null)}
            />
          </DialogContent>
        </Dialog>
      )}

      {/* Delete Transaction Confirm */}
      <ConfirmDialog
        open={!!deletingTransaction}
        onOpenChange={(open) => !open && setDeletingTransaction(null)}
        title="Hapus transaksi ini?"
        description={deletingTransaction ? `"${deletingTransaction.description}" akan dihapus secara permanen.` : undefined}
        confirmLabel="Ya, Hapus"
        cancelLabel="Batal"
        variant="danger"
        onConfirm={async () => {
          if (!deletingTransaction) return;
          try {
            await deleteTransaction(deletingTransaction.id);
            toast.success('Transaksi berhasil dihapus');
          } catch {
            toast.error('Gagal menghapus transaksi');
          } finally {
            setDeletingTransaction(null);
          }
        }}
      />
    </div>
  );
};

export default Transactions;

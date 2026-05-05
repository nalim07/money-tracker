
import { useToast } from '@/hooks/use-toast';

export const useFinanceToast = () => {
  const { toast } = useToast();

  const showSuccess = (message: string) => {
    toast({
      title: "Berhasil",
      description: message,
    });
  };

  const showError = (message: string = "Terjadi kesalahan") => {
    toast({
      title: "Error",
      description: message,
      variant: "destructive",
    });
  };

  return {
    showTransactionAdded: () => showSuccess("Transaksi berhasil ditambahkan"),
    showTransactionUpdated: () => showSuccess("Transaksi berhasil diperbarui"),
    showTransactionDeleted: () => showSuccess("Transaksi berhasil dihapus"),
    showWalletAdded: () => showSuccess("Dompet berhasil ditambahkan"),
    showWalletUpdated: () => showSuccess("Dompet berhasil diperbarui"),
    showWalletDeleted: () => showSuccess("Dompet dan semua transaksinya berhasil dihapus"),
    showCategoryAdded: () => showSuccess("Kategori berhasil ditambahkan"),
    showCategoryUpdated: () => showSuccess("Kategori berhasil diperbarui"),
    showCategoryDeleted: () => showSuccess("Kategori berhasil dihapus"),
    showError: (message?: string) => showError(message),
    showDataLoadError: () => showError("Failed to load data from database"),
    showTransactionError: () => showError("Failed to add transaction"),
    showTransactionUpdateError: () => showError("Failed to update transaction"),
    showTransactionDeleteError: () => showError("Failed to delete transaction"),
    showWalletError: () => showError("Failed to add wallet"),
    showWalletUpdateError: () => showError("Failed to update wallet"),
    showWalletDeleteError: () => showError("Failed to delete wallet"),
    showCategoryError: () => showError("Failed to add category"),
    showCategoryUpdateError: () => showError("Failed to update category"),
    showCategoryDeleteError: () => showError("Failed to delete category"),
  };
};

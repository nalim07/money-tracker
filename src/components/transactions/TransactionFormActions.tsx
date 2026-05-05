
import React from 'react';
import { Button } from '../ui/button';

interface TransactionFormActionsProps {
  onClose?: () => void;
  onSaveAndAddAnother?: () => void;
  isLoading: boolean;
}

export default function TransactionFormActions({ onClose, onSaveAndAddAnother, isLoading }: TransactionFormActionsProps) {
  return (
    <div className="flex justify-end space-x-2">
      <Button
        type="button"
        variant="outline"
        onClick={onClose}
        disabled={isLoading}
      >
        Batal
      </Button>
      {onSaveAndAddAnother && (
        <Button
          type="button"
          variant="secondary"
          onClick={onSaveAndAddAnother}
          disabled={isLoading}
        >
          {isLoading ? 'Menyimpan...' : 'Simpan & Tambah Lagi'}
        </Button>
      )}
      <Button type="submit" disabled={isLoading}>
        {isLoading ? 'Menyimpan...' : 'Simpan'}
      </Button>
    </div>
  );
}

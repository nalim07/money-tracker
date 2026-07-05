import React from 'react';
import { Button } from '../ui/button';

interface TransactionFormActionsProps {
  onClose?: () => void;
  onSaveAndAddAnother?: () => void;
  isLoading: boolean;
}

export default function TransactionFormActions({ onClose, onSaveAndAddAnother, isLoading }: TransactionFormActionsProps) {
  return (
    <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2.5">
      <Button
        type="button"
        variant="outline"
        onClick={onClose}
        disabled={isLoading}
        className="w-full sm:w-auto rounded-xl font-bold h-10 border-gray-200 text-xs sm:text-sm"
      >
        Batal
      </Button>
      {onSaveAndAddAnother && (
        <Button
          type="button"
          variant="secondary"
          onClick={onSaveAndAddAnother}
          disabled={isLoading}
          className="w-full sm:w-auto rounded-xl font-bold h-10 text-xs sm:text-sm"
        >
          {isLoading ? 'Menyimpan...' : 'Simpan & Tambah Lagi'}
        </Button>
      )}
      <Button 
        type="submit" 
        disabled={isLoading}
        className="w-full sm:w-auto bg-primary hover:bg-primary/95 text-white font-bold h-10 rounded-xl text-xs sm:text-sm shadow-sm"
      >
        {isLoading ? 'Menyimpan...' : 'Simpan'}
      </Button>
    </div>
  );
}

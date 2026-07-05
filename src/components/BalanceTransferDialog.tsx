
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogTrigger } from './ui/dialog';
import { Button } from './ui/button';
import { ArrowLeftRight } from 'lucide-react';
import BalanceTransferForm from './BalanceTransferForm';

interface BalanceTransferDialogProps {
  trigger?: React.ReactNode;
  defaultSourceWalletId?: string;
  defaultDestinationWalletId?: string;
}

export default function BalanceTransferDialog({ 
  trigger,
  defaultSourceWalletId,
  defaultDestinationWalletId
}: BalanceTransferDialogProps) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm">
            <ArrowLeftRight className="w-4 h-4 mr-2" />
            Transfer
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] rounded-3xl">
        <BalanceTransferForm 
          onClose={() => setOpen(false)} 
          defaultSourceWalletId={defaultSourceWalletId}
          defaultDestinationWalletId={defaultDestinationWalletId}
        />
      </DialogContent>
    </Dialog>
  );
}

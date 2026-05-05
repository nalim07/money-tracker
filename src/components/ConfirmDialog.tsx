import React from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { AlertTriangle, Trash2, Info, ShieldAlert } from 'lucide-react';
import { cn } from '@/lib/utils';

type ConfirmVariant = 'danger' | 'warning' | 'info';

interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: ConfirmVariant;
  onConfirm: () => void;
}

const variantConfig: Record<
  ConfirmVariant,
  { icon: React.ReactNode; iconBg: string; confirmClass: string }
> = {
  danger: {
    icon: <Trash2 className="w-6 h-6 text-red-500" />,
    iconBg: 'bg-red-100 dark:bg-red-900/30',
    confirmClass:
      'bg-red-600 hover:bg-red-700 text-white border-transparent focus:ring-red-500',
  },
  warning: {
    icon: <AlertTriangle className="w-6 h-6 text-amber-500" />,
    iconBg: 'bg-amber-100 dark:bg-amber-900/30',
    confirmClass:
      'bg-amber-500 hover:bg-amber-600 text-white border-transparent focus:ring-amber-500',
  },
  info: {
    icon: <Info className="w-6 h-6 text-blue-500" />,
    iconBg: 'bg-blue-100 dark:bg-blue-900/30',
    confirmClass:
      'bg-blue-600 hover:bg-blue-700 text-white border-transparent focus:ring-blue-500',
  },
};

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = 'Ya, Hapus',
  cancelLabel = 'Batal',
  variant = 'danger',
  onConfirm,
}) => {
  const config = variantConfig[variant];

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="sm:max-w-[400px] p-0 overflow-hidden">
        {/* Top accent bar */}
        <div
          className={cn(
            'h-1 w-full',
            variant === 'danger' && 'bg-red-500',
            variant === 'warning' && 'bg-amber-500',
            variant === 'info' && 'bg-blue-500'
          )}
        />

        <div className="p-6">
          <AlertDialogHeader>
            <div className="flex items-start gap-4">
              {/* Icon */}
              <div
                className={cn(
                  'flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center',
                  config.iconBg
                )}
              >
                {config.icon}
              </div>

              <div className="flex-1 min-w-0">
                <AlertDialogTitle className="text-base font-semibold text-foreground leading-snug">
                  {title}
                </AlertDialogTitle>
                {description && (
                  <AlertDialogDescription className="mt-1 text-sm text-muted-foreground">
                    {description}
                  </AlertDialogDescription>
                )}
              </div>
            </div>
          </AlertDialogHeader>

          <AlertDialogFooter className="mt-6 flex flex-row justify-end gap-2">
            <AlertDialogCancel className="mt-0 h-9 px-4 text-sm">
              {cancelLabel}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={onConfirm}
              className={cn('h-9 px-4 text-sm', config.confirmClass)}
            >
              {confirmLabel}
            </AlertDialogAction>
          </AlertDialogFooter>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default ConfirmDialog;

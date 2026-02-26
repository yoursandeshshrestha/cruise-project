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
} from '../../../../components/admin/ui/alert-dialog';
import { Spinner } from '../../../../components/admin/ui/spinner';

interface DeletePricingDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  pricingName: string | undefined;
  submitting: boolean;
}

export const DeletePricingDialog: React.FC<DeletePricingDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  pricingName,
  submitting,
}) => {
  return (
    <AlertDialog open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Pricing Rule?</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to permanently delete <strong>{pricingName}</strong>?
            This action cannot be undone and will remove this pricing rule from the system.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onClose} className="cursor-pointer">
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={submitting}
            className="cursor-pointer bg-destructive hover:bg-destructive/90"
          >
            {submitting ? (
              <>
                <Spinner className="w-4 h-4 mr-2" />
                Deleting...
              </>
            ) : (
              'Delete Permanently'
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

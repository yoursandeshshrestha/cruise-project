import React from 'react';
import { Spinner } from '../../../../components/admin/ui/spinner';
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

interface DeleteTerminalDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  terminalName: string | undefined;
  submitting: boolean;
}

export const DeleteTerminalDialog: React.FC<DeleteTerminalDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  terminalName,
  submitting,
}) => {
  return (
    <AlertDialog open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Terminal?</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to permanently delete <strong>{terminalName}</strong>?
            This action cannot be undone and will remove all associated data.
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

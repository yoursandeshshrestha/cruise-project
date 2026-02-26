import { useState } from 'react';
import { toast } from 'sonner';
import { Terminal, TerminalFormData } from '../types';

interface UseTerminalActionsProps {
  createTerminal: (data: Omit<Terminal, 'id' | 'is_active' | 'created_at' | 'updated_at'>) => Promise<void>;
  updateTerminal: (id: string, data: Partial<Terminal>) => Promise<void>;
  deleteTerminal: (id: string) => Promise<void>;
  toggleTerminalStatus: (id: string, currentStatus: boolean) => Promise<void>;
}

export const useTerminalActions = ({
  createTerminal,
  updateTerminal,
  deleteTerminal,
  toggleTerminalStatus,
}: UseTerminalActionsProps) => {
  const [submitting, setSubmitting] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedTerminal, setSelectedTerminal] = useState<Terminal | null>(null);

  const handleSubmit = async (formData: TerminalFormData, onSuccess: () => void) => {
    setSubmitting(true);

    try {
      // Validate
      if (!formData.name.trim()) {
        toast.error('Please enter a terminal name');
        setSubmitting(false);
        return;
      }

      if (formData.id) {
        // Update
        await updateTerminal(formData.id, {
          name: formData.name.trim(),
          location: formData.location.trim(),
          description: formData.description.trim(),
        });
        toast.success('Terminal updated successfully');
      } else {
        // Create
        await createTerminal({
          name: formData.name.trim(),
          location: formData.location.trim(),
          description: formData.description.trim(),
        });
        toast.success('Terminal created successfully');
      }

      onSuccess();
    } catch (error) {
      console.error('Submit error:', error);
      let errorMessage = 'An error occurred';

      if (error instanceof Error) {
        errorMessage = error.message;

        // Handle specific error types
        if (errorMessage.includes('row-level security')) {
          errorMessage = 'Permission denied. Please check your admin access.';
        } else if (errorMessage.includes('duplicate') || errorMessage.includes('unique')) {
          errorMessage = 'A terminal with this name already exists.';
        } else if (errorMessage.includes('network') || errorMessage.includes('fetch')) {
          errorMessage = 'Network error. Please check your connection.';
        }
      }

      toast.error(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    try {
      await toggleTerminalStatus(id, currentStatus);
      toast.success(`Terminal ${!currentStatus ? 'activated' : 'deactivated'} successfully`);
    } catch (error) {
      console.error('Toggle active error:', error);
      toast.error('Failed to update status');
    }
  };

  const handleOpenDeleteDialog = (terminal: Terminal) => {
    setSelectedTerminal(terminal);
    setIsDeleteDialogOpen(true);
  };

  const handleCloseDeleteDialog = () => {
    setIsDeleteDialogOpen(false);
    setSelectedTerminal(null);
  };

  const handleDelete = async () => {
    if (!selectedTerminal?.id) return;

    setSubmitting(true);
    try {
      await deleteTerminal(selectedTerminal.id);
      toast.success('Terminal deleted successfully');
      handleCloseDeleteDialog();
    } catch (error) {
      console.error('Delete error:', error);
      let errorMessage = 'An error occurred while deleting';

      if (error instanceof Error) {
        errorMessage = error.message;

        // Handle specific error types
        if (errorMessage.includes('row-level security')) {
          errorMessage = 'Permission denied. Please check your admin access.';
        } else if (errorMessage.includes('foreign key') || errorMessage.includes('constraint')) {
          errorMessage = 'Cannot delete. This terminal is being used.';
        } else if (errorMessage.includes('network') || errorMessage.includes('fetch')) {
          errorMessage = 'Network error. Please check your connection.';
        }
      }

      toast.error(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  return {
    submitting,
    isDeleteDialogOpen,
    selectedTerminal,
    handleSubmit,
    handleToggleActive,
    handleOpenDeleteDialog,
    handleCloseDeleteDialog,
    handleDelete,
  };
};

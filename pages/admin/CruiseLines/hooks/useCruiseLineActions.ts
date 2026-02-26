import { useState } from 'react';
import { toast } from 'sonner';
import { CruiseLineFormData, CruiseLine } from '../types';

interface UseCruiseLineActionsProps {
  createCruiseLine: (name: string, ships: string[]) => Promise<void>;
  updateCruiseLine: (id: string, data: Record<string, unknown>) => Promise<void>;
  deleteCruiseLine: (id: string) => Promise<void>;
}

export const useCruiseLineActions = ({
  createCruiseLine,
  updateCruiseLine,
  deleteCruiseLine,
}: UseCruiseLineActionsProps) => {
  const [submitting, setSubmitting] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedCruiseLine, setSelectedCruiseLine] = useState<CruiseLineFormData | null>(null);

  const validateForm = (formData: CruiseLineFormData): string | null => {
    if (!formData.name.trim()) {
      return 'Please enter a cruise line name';
    }

    const validShips = formData.ships.filter(s => s.trim() !== '');
    if (validShips.length === 0) {
      return 'Please add at least one ship';
    }

    return null;
  };

  const handleSubmit = async (formData: CruiseLineFormData, onSuccess: () => void) => {
    setSubmitting(true);

    try {
      const validationError = validateForm(formData);
      if (validationError) {
        toast.error(validationError);
        setSubmitting(false);
        return;
      }

      const validShips = formData.ships.filter(s => s.trim() !== '');

      if (formData.id) {
        await updateCruiseLine(formData.id, {
          name: formData.name.trim(),
          ships: validShips,
        });
        toast.success('Cruise line updated successfully');
      } else {
        await createCruiseLine(formData.name.trim(), validShips);
        toast.success('Cruise line created successfully');
      }

      onSuccess();
    } catch (error) {
      console.error('Submit error:', error);
      let errorMessage = 'An error occurred';

      if (error instanceof Error) {
        errorMessage = error.message;

        if (errorMessage.includes('row-level security')) {
          errorMessage = 'Permission denied. Please check your admin access.';
        } else if (errorMessage.includes('duplicate') || errorMessage.includes('unique')) {
          errorMessage = 'A cruise line with this name already exists.';
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
      await updateCruiseLine(id, { is_active: !currentStatus });
      toast.success(`Cruise line ${!currentStatus ? 'activated' : 'deactivated'} successfully`);
    } catch (error) {
      console.error('Toggle active error:', error);
      toast.error('Failed to update status');
    }
  };

  const handleOpenDeleteDialog = (cruiseLine: CruiseLine) => {
    setSelectedCruiseLine({
      id: cruiseLine.id,
      name: cruiseLine.name,
      ships: cruiseLine.ships,
    });
    setIsDeleteDialogOpen(true);
  };

  const handleCloseDeleteDialog = () => {
    setIsDeleteDialogOpen(false);
    setSelectedCruiseLine(null);
  };

  const handleDelete = async () => {
    if (!selectedCruiseLine?.id) return;

    setSubmitting(true);
    try {
      await deleteCruiseLine(selectedCruiseLine.id);
      toast.success('Cruise line deleted successfully');
      handleCloseDeleteDialog();
    } catch (error) {
      console.error('Delete error:', error);
      let errorMessage = 'An error occurred while deleting';

      if (error instanceof Error) {
        errorMessage = error.message;

        if (errorMessage.includes('row-level security')) {
          errorMessage = 'Permission denied. Please check your admin access.';
        } else if (errorMessage.includes('foreign key') || errorMessage.includes('constraint')) {
          errorMessage = 'Cannot delete. This cruise line is being used.';
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
    selectedCruiseLine,
    handleSubmit,
    handleToggleActive,
    handleOpenDeleteDialog,
    handleCloseDeleteDialog,
    handleDelete,
  };
};

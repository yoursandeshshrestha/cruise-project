import { useState } from 'react';
import { toast } from 'sonner';
import { AddOnFormData, AddOn } from '../types';

interface UseAddOnActionsProps {
  createAddOn: (data: Record<string, unknown>) => Promise<void>;
  updateAddOn: (id: string, data: Record<string, unknown>) => Promise<void>;
  deleteAddOn: (id: string) => Promise<void>;
  addOnsCount: number;
}

export const useAddOnActions = ({
  createAddOn,
  updateAddOn,
  deleteAddOn,
  addOnsCount,
}: UseAddOnActionsProps) => {
  const [submitting, setSubmitting] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedAddOn, setSelectedAddOn] = useState<AddOnFormData | null>(null);

  const validateForm = (formData: AddOnFormData): string | null => {
    if (!formData.name.trim()) return 'Please enter an add-on name';
    if (!formData.slug.trim()) return 'Please enter a slug';
    if (!formData.price || parseFloat(formData.price) < 0) return 'Please enter a valid price';
    return null;
  };

  const handleSubmit = async (formData: AddOnFormData, onSuccess: () => void) => {
    setSubmitting(true);

    try {
      const validationError = validateForm(formData);
      if (validationError) {
        toast.error(validationError);
        setSubmitting(false);
        return;
      }

      if (formData.id) {
        await updateAddOn(formData.id, {
          slug: formData.slug.trim(),
          name: formData.name.trim(),
          description: formData.description.trim(),
          price: parseFloat(formData.price),
        });
        toast.success('Add-on updated successfully');
      } else {
        await createAddOn({
          slug: formData.slug.trim(),
          name: formData.name.trim(),
          description: formData.description.trim(),
          price: parseFloat(formData.price),
          icon: null,
          is_active: true,
          display_order: addOnsCount + 1,
        });
        toast.success('Add-on created successfully');
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
          errorMessage = 'An add-on with this slug already exists.';
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
      await updateAddOn(id, { is_active: !currentStatus });
      toast.success(`Add-on ${!currentStatus ? 'activated' : 'deactivated'} successfully`);
    } catch (error) {
      console.error('Toggle active error:', error);
      toast.error('Failed to update status');
    }
  };

  const handleOpenDeleteDialog = (addOn: AddOn) => {
    setSelectedAddOn({
      id: addOn.id,
      slug: addOn.slug,
      name: addOn.name,
      description: addOn.description || '',
      price: addOn.price.toString(),
    });
    setIsDeleteDialogOpen(true);
  };

  const handleCloseDeleteDialog = () => {
    setIsDeleteDialogOpen(false);
    setSelectedAddOn(null);
  };

  const handleDelete = async () => {
    if (!selectedAddOn?.id) return;

    setSubmitting(true);
    try {
      await deleteAddOn(selectedAddOn.id);
      toast.success('Add-on deleted successfully');
      handleCloseDeleteDialog();
    } catch (error) {
      console.error('Delete error:', error);
      let errorMessage = 'An error occurred while deleting';

      if (error instanceof Error) {
        errorMessage = error.message;

        if (errorMessage.includes('row-level security')) {
          errorMessage = 'Permission denied. Please check your admin access.';
        } else if (errorMessage.includes('foreign key') || errorMessage.includes('constraint')) {
          errorMessage = 'Cannot delete. This add-on is being used.';
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
    selectedAddOn,
    handleSubmit,
    handleToggleActive,
    handleOpenDeleteDialog,
    handleCloseDeleteDialog,
    handleDelete,
  };
};

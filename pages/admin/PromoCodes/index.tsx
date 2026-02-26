import React, { useEffect } from 'react';
import { Plus } from 'lucide-react';
import { AdminLayout } from '../../../components/admin/AdminLayout';
import { usePromoCodesStore } from '../../../stores/promoCodesStore';
import { Button } from '../../../components/admin/ui/button';
import { Spinner } from '../../../components/admin/ui/spinner';

// Components
import { PromoCodesTable } from './components/PromoCodesTable';
import { PromoCodeForm } from './components/PromoCodeForm';
import { DeletePromoCodeDialog } from './components/DeletePromoCodeDialog';

// Hooks
import { usePromoCodeForm } from './hooks/usePromoCodeForm';
import { usePromoCodeActions } from './hooks/usePromoCodeActions';

export const PromoCodes: React.FC = () => {
  const {
    promoCodes,
    initialized,
    fetchPromoCodes,
    createPromoCode,
    updatePromoCode,
    deletePromoCode,
  } = usePromoCodesStore();

  // Custom hooks
  const {
    isDialogOpen,
    formData,
    setFormData,
    handleOpenDialog,
    handleCloseDialog,
  } = usePromoCodeForm();

  const {
    submitting,
    isDeleteDialogOpen,
    selectedPromoCode,
    handleSubmit,
    handleToggleActive,
    handleOpenDeleteDialog,
    handleCloseDeleteDialog,
    handleDelete,
  } = usePromoCodeActions({
    createPromoCode,
    updatePromoCode,
    deletePromoCode,
  });

  // Fetch promo codes on mount
  useEffect(() => {
    if (!initialized) {
      fetchPromoCodes();
    }
  }, [initialized, fetchPromoCodes]);

  // Handle form submission
  const onFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSubmit(formData, handleCloseDialog);
  };

  // Loading state
  if (!initialized) {
    return (
      <AdminLayout showSidebar showHeader breadcrumbs={[{ label: 'Configuration' }, { label: 'Promo Codes' }]}>
        <div className="flex items-center justify-center h-full p-8">
          <div className="text-center">
            <Spinner className="h-8 w-8 mx-auto mb-4" />
            <p className="text-muted-foreground">Loading promo codes...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout showSidebar showHeader breadcrumbs={[{ label: 'Configuration' }, { label: 'Promo Codes' }]}>
      <div className="p-6 space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold mb-2">Promo Codes</h1>
            <p className="text-muted-foreground">
              Manage promotional discount codes
            </p>
          </div>
          <Button onClick={() => handleOpenDialog()} className="cursor-pointer">
            <Plus className="w-4 h-4 mr-2" />
            Add Promo Code
          </Button>
        </div>

        {/* Table */}
        <PromoCodesTable
          promoCodes={promoCodes}
          onEdit={handleOpenDialog}
          onDelete={handleOpenDeleteDialog}
          onToggleActive={handleToggleActive}
        />

        {/* Add/Edit Dialog */}
        <PromoCodeForm
          isOpen={isDialogOpen}
          onClose={handleCloseDialog}
          formData={formData}
          setFormData={setFormData}
          onSubmit={onFormSubmit}
          submitting={submitting}
        />

        {/* Delete Confirmation Dialog */}
        <DeletePromoCodeDialog
          isOpen={isDeleteDialogOpen}
          onClose={handleCloseDeleteDialog}
          onConfirm={handleDelete}
          promoCode={selectedPromoCode?.code}
          submitting={submitting}
        />
      </div>
    </AdminLayout>
  );
};

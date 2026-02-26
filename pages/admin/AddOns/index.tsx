import React, { useEffect } from 'react';
import { Plus } from 'lucide-react';
import { AdminLayout } from '../../../components/admin/AdminLayout';
import { useSettingsStore } from '../../../stores/settingsStore';
import { Button } from '../../../components/admin/ui/button';
import { Spinner } from '../../../components/admin/ui/spinner';

// Components
import { AddOnsTable } from './components/AddOnsTable';
import { AddOnForm } from './components/AddOnForm';
import { DeleteAddOnDialog } from './components/DeleteAddOnDialog';

// Hooks
import { useAddOnForm } from './hooks/useAddOnForm';
import { useAddOnActions } from './hooks/useAddOnActions';

export const AddOns: React.FC = () => {
  const {
    addOns,
    initialized,
    fetchAddOns,
    createAddOn,
    updateAddOn,
    deleteAddOn,
  } = useSettingsStore();

  // Custom hooks
  const {
    isDialogOpen,
    formData,
    setFormData,
    handleOpenDialog,
    handleCloseDialog,
  } = useAddOnForm();

  const {
    submitting,
    isDeleteDialogOpen,
    selectedAddOn,
    handleSubmit,
    handleToggleActive,
    handleOpenDeleteDialog,
    handleCloseDeleteDialog,
    handleDelete,
  } = useAddOnActions({
    createAddOn,
    updateAddOn,
    deleteAddOn,
    addOnsCount: addOns.length,
  });

  // Fetch add-ons on mount
  useEffect(() => {
    if (!initialized) {
      fetchAddOns();
    }
  }, [initialized, fetchAddOns]);

  // Handle form submission
  const onFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSubmit(formData, handleCloseDialog);
  };

  const breadcrumbs = [
    { label: 'Configuration' },
    { label: 'Add-ons' }
  ];

  // Loading state
  if (!initialized) {
    return (
      <AdminLayout showSidebar showHeader breadcrumbs={breadcrumbs}>
        <div className="flex items-center justify-center h-full p-8">
          <div className="text-center">
            <Spinner className="h-8 w-8 mx-auto mb-4" />
            <p className="text-muted-foreground">Loading add-ons...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout showSidebar showHeader breadcrumbs={breadcrumbs}>
      <div className="p-6 space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold mb-2">Parking Add-ons</h1>
            <p className="text-muted-foreground">Manage additional services and their pricing</p>
          </div>
          <Button onClick={() => handleOpenDialog()} className="cursor-pointer">
            <Plus className="w-4 h-4 mr-2" />
            Add Add-on
          </Button>
        </div>

        {/* Table */}
        <AddOnsTable
          addOns={addOns}
          onEdit={handleOpenDialog}
          onDelete={handleOpenDeleteDialog}
          onToggleActive={handleToggleActive}
        />

        {/* Create/Edit Dialog */}
        <AddOnForm
          isOpen={isDialogOpen}
          onClose={handleCloseDialog}
          formData={formData}
          setFormData={setFormData}
          onSubmit={onFormSubmit}
          submitting={submitting}
        />

        {/* Delete Confirmation Dialog */}
        <DeleteAddOnDialog
          isOpen={isDeleteDialogOpen}
          onClose={handleCloseDeleteDialog}
          onConfirm={handleDelete}
          addOnName={selectedAddOn?.name}
          submitting={submitting}
        />
      </div>
    </AdminLayout>
  );
};

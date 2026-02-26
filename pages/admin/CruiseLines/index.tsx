import React, { useEffect } from 'react';
import { Plus } from 'lucide-react';
import { AdminLayout } from '../../../components/admin/AdminLayout';
import { useCruiseLinesStore } from '../../../stores/cruiseLinesStore';
import { Button } from '../../../components/admin/ui/button';
import { Spinner } from '../../../components/admin/ui/spinner';

// Components
import { CruiseLinesTable } from './components/CruiseLinesTable';
import { CruiseLineForm } from './components/CruiseLineForm';
import { DeleteCruiseLineDialog } from './components/DeleteCruiseLineDialog';

// Hooks
import { useCruiseLineForm } from './hooks/useCruiseLineForm';
import { useCruiseLineActions } from './hooks/useCruiseLineActions';

export const CruiseLines: React.FC = () => {
  const {
    cruiseLines,
    initialized,
    fetchCruiseLines,
    createCruiseLine,
    updateCruiseLine,
    deleteCruiseLine,
  } = useCruiseLinesStore();

  // Custom hooks
  const {
    isDialogOpen,
    formData,
    setFormData,
    handleOpenDialog,
    handleCloseDialog,
    handleAddShip,
    handleRemoveShip,
    handleShipChange,
  } = useCruiseLineForm();

  const {
    submitting,
    isDeleteDialogOpen,
    selectedCruiseLine,
    handleSubmit,
    handleToggleActive,
    handleOpenDeleteDialog,
    handleCloseDeleteDialog,
    handleDelete,
  } = useCruiseLineActions({
    createCruiseLine,
    updateCruiseLine,
    deleteCruiseLine,
  });

  // Fetch cruise lines on mount
  useEffect(() => {
    if (!initialized) {
      fetchCruiseLines();
    }
  }, [initialized, fetchCruiseLines]);

  // Handle form submission
  const onFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSubmit(formData, handleCloseDialog);
  };

  // Loading state
  if (!initialized) {
    return (
      <AdminLayout showSidebar showHeader breadcrumbs={[{ label: 'Configuration' }, { label: 'Cruise Lines' }]}>
        <div className="flex items-center justify-center h-full p-8">
          <div className="text-center">
            <Spinner className="h-8 w-8 mx-auto mb-4" />
            <p className="text-muted-foreground">Loading cruise lines...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout showSidebar showHeader breadcrumbs={[{ label: 'Configuration' }, { label: 'Cruise Lines' }]}>
      <div className="p-6 space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold mb-2">Cruise Lines</h1>
            <p className="text-muted-foreground">
              Manage cruise lines and their ships
            </p>
          </div>
          <Button onClick={() => handleOpenDialog()} className="cursor-pointer">
            <Plus className="w-4 h-4 mr-2" />
            Add Cruise Line
          </Button>
        </div>

        {/* Table */}
        <CruiseLinesTable
          cruiseLines={cruiseLines}
          onEdit={handleOpenDialog}
          onDelete={handleOpenDeleteDialog}
          onToggleActive={handleToggleActive}
        />

        {/* Add/Edit Dialog */}
        <CruiseLineForm
          isOpen={isDialogOpen}
          onClose={handleCloseDialog}
          formData={formData}
          setFormData={setFormData}
          onSubmit={onFormSubmit}
          submitting={submitting}
          onAddShip={handleAddShip}
          onRemoveShip={handleRemoveShip}
          onShipChange={handleShipChange}
        />

        {/* Delete Confirmation Dialog */}
        <DeleteCruiseLineDialog
          isOpen={isDeleteDialogOpen}
          onClose={handleCloseDeleteDialog}
          onConfirm={handleDelete}
          cruiseLineName={selectedCruiseLine?.name}
          submitting={submitting}
        />
      </div>
    </AdminLayout>
  );
};

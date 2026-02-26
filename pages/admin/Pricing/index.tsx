import React, { useEffect } from 'react';
import { Plus } from 'lucide-react';
import { AdminLayout } from '../../../components/admin/AdminLayout';
import { usePricingStore } from '../../../stores/pricingStore';
import { Button } from '../../../components/admin/ui/button';
import { Spinner } from '../../../components/admin/ui/spinner';

// Components
import { PricingTable } from './components/PricingTable';
import { PricingForm } from './components/PricingForm';
import { DeletePricingDialog } from './components/DeletePricingDialog';

// Hooks
import { usePricingForm } from './hooks/usePricingForm';
import { usePricingActions } from './hooks/usePricingActions';

export const Pricing: React.FC = () => {
  const {
    pricingRules,
    initialized,
    fetchPricingRules,
    createPricingRule,
    updatePricingRule,
    deletePricingRule,
  } = usePricingStore();

  // Custom hooks
  const {
    isDialogOpen,
    formData,
    setFormData,
    handleOpenDialog,
    handleCloseDialog,
  } = usePricingForm();

  const {
    submitting,
    isDeleteDialogOpen,
    selectedPricing,
    handleSubmit,
    handleToggleActive,
    handleOpenDeleteDialog,
    handleCloseDeleteDialog,
    handleDelete,
  } = usePricingActions({
    createPricingRule,
    updatePricingRule,
    deletePricingRule,
    pricingRulesCount: pricingRules.length,
  });

  // Fetch pricing rules on mount
  useEffect(() => {
    if (!initialized) {
      fetchPricingRules();
    }
  }, [initialized, fetchPricingRules]);

  // Handle form submission
  const onFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSubmit(formData, handleCloseDialog);
  };

  const breadcrumbs = [
    { label: 'Configuration' },
    { label: 'Pricing Rules' }
  ];

  // Loading state
  if (!initialized) {
    return (
      <AdminLayout showSidebar showHeader breadcrumbs={breadcrumbs}>
        <div className="flex items-center justify-center h-full p-8">
          <Spinner className="h-8 w-8" />
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
            <h1 className="text-2xl font-semibold mb-2">Pricing Rules</h1>
            <p className="text-muted-foreground">
              Manage parking rates including seasonal pricing and date-based rules
            </p>
          </div>
          <Button onClick={() => handleOpenDialog()} className="cursor-pointer">
            <Plus className="w-4 h-4 mr-2" />
            Add Pricing Rule
          </Button>
        </div>

        {/* Table */}
        <PricingTable
          pricingRules={pricingRules}
          onEdit={handleOpenDialog}
          onDelete={handleOpenDeleteDialog}
          onToggleActive={handleToggleActive}
        />

        {/* Create/Edit Dialog */}
        <PricingForm
          isOpen={isDialogOpen}
          onClose={handleCloseDialog}
          formData={formData}
          setFormData={setFormData}
          onSubmit={onFormSubmit}
          submitting={submitting}
        />

        {/* Delete Confirmation Dialog */}
        <DeletePricingDialog
          isOpen={isDeleteDialogOpen}
          onClose={handleCloseDeleteDialog}
          onConfirm={handleDelete}
          pricingName={selectedPricing?.name}
          submitting={submitting}
        />
      </div>
    </AdminLayout>
  );
};

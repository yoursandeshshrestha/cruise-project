import React, { useEffect } from 'react';
import { Plus } from 'lucide-react';
import { AdminLayout } from '../../../components/admin/AdminLayout';
import { useTerminalsStore } from '../../../stores/terminalsStore';
import { Button } from '../../../components/admin/ui/button';
import { Spinner } from '../../../components/admin/ui/spinner';

// Components
import { TerminalsTable } from './components/TerminalsTable';
import { TerminalForm } from './components/TerminalForm';
import { DeleteTerminalDialog } from './components/DeleteTerminalDialog';

// Hooks
import { useTerminalForm } from './hooks/useTerminalForm';
import { useTerminalActions } from './hooks/useTerminalActions';

export const Terminals: React.FC = () => {
  const {
    terminals,
    initialized,
    fetchTerminals,
    createTerminal,
    updateTerminal,
    deleteTerminal,
    toggleTerminalStatus,
  } = useTerminalsStore();

  // Custom hooks
  const {
    isDialogOpen,
    formData,
    setFormData,
    handleOpenDialog,
    handleCloseDialog,
  } = useTerminalForm();

  const {
    submitting,
    isDeleteDialogOpen,
    selectedTerminal,
    handleSubmit,
    handleToggleActive,
    handleOpenDeleteDialog,
    handleCloseDeleteDialog,
    handleDelete,
  } = useTerminalActions({
    createTerminal,
    updateTerminal,
    deleteTerminal,
    toggleTerminalStatus,
  });

  // Fetch terminals on mount
  useEffect(() => {
    if (!initialized) {
      fetchTerminals();
    }
  }, [initialized, fetchTerminals]);

  // Handle form submission
  const onFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSubmit(formData, handleCloseDialog);
  };

  const breadcrumbs = [
    { label: 'Configuration' },
    { label: 'Terminals' }
  ];

  // Loading state
  if (!initialized) {
    return (
      <AdminLayout showSidebar showHeader breadcrumbs={breadcrumbs}>
        <div className="flex items-center justify-center h-full p-8">
          <div className="text-center">
            <Spinner className="h-8 w-8 mx-auto mb-4" />
            <p className="text-muted-foreground">Loading terminals...</p>
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
            <h1 className="text-2xl font-semibold mb-2">Cruise Terminals</h1>
            <p className="text-muted-foreground">
              Manage cruise terminal locations
            </p>
          </div>
          <Button onClick={() => handleOpenDialog()} className="cursor-pointer">
            <Plus className="w-4 h-4 mr-2" />
            Add Terminal
          </Button>
        </div>

        {/* Table */}
        <TerminalsTable
          terminals={terminals}
          onEdit={handleOpenDialog}
          onDelete={handleOpenDeleteDialog}
          onToggleActive={handleToggleActive}
        />

        {/* Create/Edit Dialog */}
        <TerminalForm
          isOpen={isDialogOpen}
          onClose={handleCloseDialog}
          formData={formData}
          setFormData={setFormData}
          onSubmit={onFormSubmit}
          submitting={submitting}
        />

        {/* Delete Confirmation Dialog */}
        <DeleteTerminalDialog
          isOpen={isDeleteDialogOpen}
          onClose={handleCloseDeleteDialog}
          onConfirm={handleDelete}
          terminalName={selectedTerminal?.name}
          submitting={submitting}
        />
      </div>
    </AdminLayout>
  );
};

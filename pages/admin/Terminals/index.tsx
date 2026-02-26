import React, { useEffect, useState } from 'react';
import { AdminLayout } from '../../../components/admin/AdminLayout';
import { useTerminalsStore } from '../../../stores/terminalsStore';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../../components/admin/ui/table';
import { Button } from '../../../components/admin/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../../components/admin/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../../../components/admin/ui/alert-dialog';
import { Input } from '../../../components/admin/ui/input';
import { Label } from '../../../components/admin/ui/label';
import { Switch } from '../../../components/admin/ui/switch';
import { Spinner } from '../../../components/admin/ui/spinner';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';

interface TerminalFormData {
  id?: string;
  name: string;
  location: string;
  description: string;
}

export const Terminals: React.FC = () => {
  const { terminals, loading, initialized, fetchTerminals, createTerminal, updateTerminal, deleteTerminal, toggleTerminalStatus } = useTerminalsStore();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedTerminal, setSelectedTerminal] = useState<TerminalFormData | null>(null);
  const [formData, setFormData] = useState<TerminalFormData>({
    name: '',
    location: 'Southampton',
    description: '',
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!initialized) {
      fetchTerminals();
    }
  }, [initialized, fetchTerminals]);

  const handleOpenDialog = (terminal?: typeof terminals[0]) => {
    if (terminal) {
      setFormData({
        id: terminal.id,
        name: terminal.name,
        location: terminal.location || 'Southampton',
        description: terminal.description || '',
      });
    } else {
      setFormData({
        name: '',
        location: 'Southampton',
        description: '',
      });
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setFormData({ name: '', location: 'Southampton', description: '' });
  };

  const handleOpenDeleteDialog = (terminal: typeof terminals[0]) => {
    setSelectedTerminal({
      id: terminal.id,
      name: terminal.name,
      location: terminal.location || '',
      description: terminal.description || '',
    });
    setIsDeleteDialogOpen(true);
  };

  const handleCloseDeleteDialog = () => {
    setIsDeleteDialogOpen(false);
    setSelectedTerminal(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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

      handleCloseDialog();
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

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    try {
      await toggleTerminalStatus(id, currentStatus);
      toast.success(`Terminal ${!currentStatus ? 'activated' : 'deactivated'} successfully`);
    } catch (error) {
      console.error('Toggle active error:', error);
      toast.error('Failed to update status');
    }
  };

  const breadcrumbs = [
    { label: 'Configuration' },
    { label: 'Terminals' }
  ];

  // Only show full loading screen on initial load
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
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Terminal Name</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="w-[140px]">Status</TableHead>
                <TableHead className="text-right w-[180px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {terminals.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                    No terminals found. Click "Add Terminal" to create one.
                  </TableCell>
                </TableRow>
              ) : (
                terminals.map((terminal) => (
                  <TableRow key={terminal.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <img src="/icons/location.svg" alt="Terminal" className="w-4 h-4 text-slate-500" />
                        {terminal.name}
                      </div>
                    </TableCell>
                    <TableCell>{terminal.location || '-'}</TableCell>
                    <TableCell className="max-w-xs truncate">
                      {terminal.description || '-'}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Switch
                          checked={terminal.is_active}
                          onCheckedChange={() => handleToggleActive(terminal.id, terminal.is_active)}
                          className="cursor-pointer"
                        />
                        <span className="text-sm text-slate-600 w-16">
                          {terminal.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleOpenDialog(terminal)}
                          className="cursor-pointer"
                        >
                          <img src="/icons/edit.svg" alt="Edit" className="w-4 h-4" />
                          Edit
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleOpenDeleteDialog(terminal)}
                          className="cursor-pointer text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <img
                            src="/icons/delete.svg"
                            alt="Delete"
                            className="w-4 h-4"
                            style={{ filter: 'brightness(0) saturate(100%) invert(17%) sepia(100%) saturate(7426%) hue-rotate(356deg) brightness(91%) contrast(115%)' }}
                          />
                          Delete
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={(open) => { if (!open) handleCloseDialog(); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{formData.id ? 'Edit Terminal' : 'Add Terminal'}</DialogTitle>
            <DialogDescription>
              {formData.id
                ? 'Update the terminal details.'
                : 'Add a new terminal location.'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Terminal Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., Ocean Terminal"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                  placeholder="e.g., Southampton"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Optional notes about this terminal"
                />
              </div>
            </div>
            <DialogFooter className="gap-2 mt-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleCloseDialog}
                disabled={submitting}
                className="cursor-pointer"
              >
                Cancel
              </Button>
              <Button type="submit" disabled={submitting} className="cursor-pointer">
                {submitting ? (
                  <>
                    <Spinner className="w-4 h-4 mr-2" />
                    {formData.id ? 'Updating...' : 'Creating...'}
                  </>
                ) : (
                  <>{formData.id ? 'Update' : 'Create'}</>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={(open) => { if (!open) handleCloseDeleteDialog(); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Terminal?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to permanently delete <strong>{selectedTerminal?.name}</strong>?
              This action cannot be undone and will remove all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleCloseDeleteDialog} className="cursor-pointer">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
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
    </AdminLayout>
  );
};

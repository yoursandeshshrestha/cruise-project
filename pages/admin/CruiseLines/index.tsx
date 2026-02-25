import React, { useEffect, useState } from 'react';
import { AdminLayout } from '../../../components/admin/AdminLayout';
import { useCruiseLinesStore } from '../../../stores/cruiseLinesStore';
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
import { Badge } from '../../../components/admin/ui/badge';
import { Switch } from '../../../components/admin/ui/switch';
import { Spinner } from '../../../components/admin/ui/spinner';
import { Plus, X } from 'lucide-react';
import { toast } from 'sonner';

interface CruiseLineFormData {
  id?: string;
  name: string;
  ships: string[];
}

export const CruiseLines: React.FC = () => {
  const { cruiseLines, loading, initialized, fetchCruiseLines, createCruiseLine, updateCruiseLine, deleteCruiseLine } = useCruiseLinesStore();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedCruiseLine, setSelectedCruiseLine] = useState<CruiseLineFormData | null>(null);
  const [formData, setFormData] = useState<CruiseLineFormData>({
    name: '',
    ships: [''],
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!initialized) {
      fetchCruiseLines();
    }
  }, [initialized, fetchCruiseLines]);

  const handleOpenDialog = (cruiseLine?: typeof cruiseLines[0]) => {
    if (cruiseLine) {
      setFormData({
        id: cruiseLine.id,
        name: cruiseLine.name,
        ships: cruiseLine.ships.length > 0 ? cruiseLine.ships : [''],
      });
    } else {
      setFormData({
        name: '',
        ships: [''],
      });
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setFormData({ name: '', ships: [''] });
  };

  const handleOpenDeleteDialog = (cruiseLine: typeof cruiseLines[0]) => {
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

  const handleAddShip = () => {
    setFormData(prev => ({
      ...prev,
      ships: [...prev.ships, ''],
    }));
  };

  const handleRemoveShip = (index: number) => {
    setFormData(prev => ({
      ...prev,
      ships: prev.ships.filter((_, i) => i !== index),
    }));
  };

  const handleShipChange = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      ships: prev.ships.map((ship, i) => (i === index ? value : ship)),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      // Validate
      if (!formData.name.trim()) {
        toast.error('Please enter a cruise line name');
        setSubmitting(false);
        return;
      }

      const validShips = formData.ships.filter(s => s.trim() !== '');
      if (validShips.length === 0) {
        toast.error('Please add at least one ship');
        setSubmitting(false);
        return;
      }

      if (formData.id) {
        // Update
        await updateCruiseLine(formData.id, {
          name: formData.name.trim(),
          ships: validShips,
        });
        toast.success('Cruise line updated successfully');
      } else {
        // Create
        await createCruiseLine(formData.name.trim(), validShips);
        toast.success('Cruise line created successfully');
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

        // Handle specific error types
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

  if (!initialized || loading) {
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
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Cruise Line</TableHead>
                <TableHead>Ships</TableHead>
                <TableHead className="w-[140px]">Status</TableHead>
                <TableHead className="text-right w-[180px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {cruiseLines.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                    No cruise lines found. Click "Add Cruise Line" to create one.
                  </TableCell>
                </TableRow>
              ) : (
                cruiseLines.map(cruiseLine => (
                  <TableRow key={cruiseLine.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <img src="/icons/ship.svg" alt="Ship" className="w-4 h-4 text-slate-500" />
                        {cruiseLine.name}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {Array.isArray(cruiseLine.ships) && cruiseLine.ships.length > 0 ? (
                          <>
                            {cruiseLine.ships.slice(0, 3).map((ship, idx) => (
                              <Badge key={idx} variant="secondary" className="text-xs">
                                {ship}
                              </Badge>
                            ))}
                            {cruiseLine.ships.length > 3 && (
                              <Badge variant="outline" className="text-xs">
                                +{cruiseLine.ships.length - 3} more
                              </Badge>
                            )}
                          </>
                        ) : (
                          <span className="text-muted-foreground text-sm">No ships</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Switch
                          checked={cruiseLine.is_active}
                          onCheckedChange={() => handleToggleActive(cruiseLine.id, cruiseLine.is_active)}
                          className="cursor-pointer"
                        />
                        <span className="text-sm text-slate-600 w-16">
                          {cruiseLine.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleOpenDialog(cruiseLine)}
                          className="cursor-pointer"
                        >
                          <img src="/icons/edit.svg" alt="Edit" className="w-4 h-4" />
                          Edit
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleOpenDeleteDialog(cruiseLine)}
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
        <DialogContent className="sm:max-w-[600px] max-h-[85vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>{formData.id ? 'Edit Cruise Line' : 'Add Cruise Line'}</DialogTitle>
            <DialogDescription>
              {formData.id
                ? 'Update the cruise line name and ships.'
                : 'Add a new cruise line with its ships.'}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
            <div className="space-y-4 py-4 px-1 overflow-y-auto flex-1">
              {/* Cruise Line Name */}
              <div className="space-y-2">
                <Label htmlFor="name">Cruise Line Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., P&O Cruises"
                  required
                />
              </div>

              {/* Ships */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <img src="/icons/ship.svg" alt="Ship" className="w-4 h-4 text-slate-500" />
                    <Label>Ships</Label>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleAddShip}
                    className="cursor-pointer"
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Add Ship
                  </Button>
                </div>
                <div className="space-y-2">
                  {formData.ships.map((ship, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <Input
                        value={ship}
                        onChange={e => handleShipChange(index, e.target.value)}
                        placeholder="e.g., Iona"
                      />
                      {formData.ships.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveShip(index)}
                          className="cursor-pointer shrink-0"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
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
            <AlertDialogTitle>Delete Cruise Line?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to permanently delete <strong>{selectedCruiseLine?.name}</strong>?
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

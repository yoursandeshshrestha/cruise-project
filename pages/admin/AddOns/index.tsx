import React, { useEffect, useState } from 'react';
import { AdminLayout } from '../../../components/admin/AdminLayout';
import { useSettingsStore } from '../../../stores/settingsStore';
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

interface AddOnFormData {
  id?: string;
  slug: string;
  name: string;
  description: string;
  price: string;
}

export const AddOns: React.FC = () => {
  const { addOns, loading, initialized, fetchAddOns, createAddOn, updateAddOn, deleteAddOn } = useSettingsStore();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedAddOn, setSelectedAddOn] = useState<AddOnFormData | null>(null);
  const [formData, setFormData] = useState<AddOnFormData>({
    slug: '',
    name: '',
    description: '',
    price: '',
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!initialized) {
      fetchAddOns();
    }
  }, [initialized, fetchAddOns]);

  const handleOpenDialog = (addOn?: typeof addOns[0]) => {
    if (addOn) {
      setFormData({
        id: addOn.id,
        slug: addOn.slug,
        name: addOn.name,
        description: addOn.description || '',
        price: addOn.price.toString(),
      });
    } else {
      setFormData({
        slug: '',
        name: '',
        description: '',
        price: '',
      });
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setFormData({ slug: '', name: '', description: '', price: '' });
  };

  const handleOpenDeleteDialog = (addOn: typeof addOns[0]) => {
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      // Validate
      if (!formData.name.trim()) {
        toast.error('Please enter an add-on name');
        setSubmitting(false);
        return;
      }

      if (!formData.slug.trim()) {
        toast.error('Please enter a slug');
        setSubmitting(false);
        return;
      }

      if (!formData.price || parseFloat(formData.price) < 0) {
        toast.error('Please enter a valid price');
        setSubmitting(false);
        return;
      }

      if (formData.id) {
        // Update
        await updateAddOn(formData.id, {
          slug: formData.slug.trim(),
          name: formData.name.trim(),
          description: formData.description.trim(),
          price: parseFloat(formData.price),
        });
        toast.success('Add-on updated successfully');
      } else {
        // Create
        await createAddOn({
          slug: formData.slug.trim(),
          name: formData.name.trim(),
          description: formData.description.trim(),
          price: parseFloat(formData.price),
          is_active: true,
          display_order: addOns.length + 1,
        });
        toast.success('Add-on created successfully');
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

        // Handle specific error types
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

  // Only show full loading screen on initial load
  if (!initialized) {
    return (
      <AdminLayout showSidebar showHeader breadcrumbs={[{ label: 'Configuration' }, { label: 'Add-ons' }]}>
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
    <AdminLayout showSidebar showHeader breadcrumbs={[{ label: 'Configuration' }, { label: 'Add-ons' }]}>
      <div className="p-6 space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold mb-2">Parking Add-ons</h1>
            <p className="text-muted-foreground">
              Manage additional services and their pricing
            </p>
          </div>
          <Button onClick={() => handleOpenDialog()} className="cursor-pointer">
            <Plus className="w-4 h-4 mr-2" />
            Add Add-on
          </Button>
        </div>

        {/* Table */}
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Add-on Name</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Price</TableHead>
                <TableHead className="w-[140px]">Status</TableHead>
                <TableHead className="text-right w-[180px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {addOns.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                    No add-ons found. Click "Add Add-on" to create one.
                  </TableCell>
                </TableRow>
              ) : (
                addOns.map((addOn) => (
                  <TableRow key={addOn.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <img src="/icons/add-ons.svg" alt="Add-on" className="w-4 h-4 text-slate-500" />
                        {addOn.name}
                      </div>
                    </TableCell>
                    <TableCell className="max-w-xs truncate">
                      {addOn.description || '-'}
                    </TableCell>
                    <TableCell>£{addOn.price.toFixed(2)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Switch
                          checked={addOn.is_active}
                          onCheckedChange={() => handleToggleActive(addOn.id, addOn.is_active)}
                          className="cursor-pointer"
                        />
                        <span className="text-sm text-slate-600 w-16">
                          {addOn.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleOpenDialog(addOn)}
                          className="cursor-pointer"
                        >
                          <img src="/icons/edit.svg" alt="Edit" className="w-4 h-4" />
                          Edit
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleOpenDeleteDialog(addOn)}
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
            <DialogTitle>{formData.id ? 'Edit Add-on' : 'Add Add-on'}</DialogTitle>
            <DialogDescription>
              {formData.id
                ? 'Update the add-on details.'
                : 'Add a new parking add-on service.'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Add-on Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., EV Charging"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="slug">Slug</Label>
                <Input
                  id="slug"
                  value={formData.slug}
                  onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') }))}
                  placeholder="e.g., ev-charging"
                  required
                />
                <p className="text-xs text-muted-foreground">Unique identifier (lowercase, no spaces)</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Brief description of the service"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="price">Price (£)</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.price}
                  onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                  placeholder="0.00"
                  required
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
            <AlertDialogTitle>Delete Add-on?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to permanently delete <strong>{selectedAddOn?.name}</strong>?
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

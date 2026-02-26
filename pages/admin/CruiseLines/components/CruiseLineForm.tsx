import React from 'react';
import { Plus, X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../../../components/admin/ui/dialog';
import { Button } from '../../../../components/admin/ui/button';
import { Input } from '../../../../components/admin/ui/input';
import { Label } from '../../../../components/admin/ui/label';
import { Spinner } from '../../../../components/admin/ui/spinner';
import { CruiseLineFormData } from '../types';

interface CruiseLineFormProps {
  isOpen: boolean;
  onClose: () => void;
  formData: CruiseLineFormData;
  setFormData: React.Dispatch<React.SetStateAction<CruiseLineFormData>>;
  onSubmit: (e: React.FormEvent) => void;
  submitting: boolean;
  onAddShip: () => void;
  onRemoveShip: (index: number) => void;
  onShipChange: (index: number, value: string) => void;
}

export const CruiseLineForm: React.FC<CruiseLineFormProps> = ({
  isOpen,
  onClose,
  formData,
  setFormData,
  onSubmit,
  submitting,
  onAddShip,
  onRemoveShip,
  onShipChange,
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="sm:max-w-[600px] max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>{formData.id ? 'Edit Cruise Line' : 'Add Cruise Line'}</DialogTitle>
          <DialogDescription>
            {formData.id
              ? 'Update the cruise line name and ships.'
              : 'Add a new cruise line with its ships.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={onSubmit} className="flex flex-col flex-1 min-h-0">
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
                  onClick={onAddShip}
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
                      onChange={e => onShipChange(index, e.target.value)}
                      placeholder="e.g., Iona"
                    />
                    {formData.ships.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => onRemoveShip(index)}
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
              onClick={onClose}
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
  );
};

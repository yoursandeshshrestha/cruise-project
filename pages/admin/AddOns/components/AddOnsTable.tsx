import React from 'react';
import { Button } from '../../../../components/admin/ui/button';
import { Switch } from '../../../../components/admin/ui/switch';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../../../components/admin/ui/table';
import { AddOn } from '../types';

interface AddOnsTableProps {
  addOns: AddOn[];
  onEdit: (addOn: AddOn) => void;
  onDelete: (addOn: AddOn) => void;
  onToggleActive: (id: string, currentStatus: boolean) => void;
}

export const AddOnsTable: React.FC<AddOnsTableProps> = ({
  addOns,
  onEdit,
  onDelete,
  onToggleActive,
}) => {
  return (
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
                <TableCell className="max-w-xs truncate">{addOn.description || '-'}</TableCell>
                <TableCell>£{addOn.price.toFixed(2)}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Switch
                      checked={addOn.is_active}
                      onCheckedChange={() => onToggleActive(addOn.id, addOn.is_active)}
                      className="cursor-pointer"
                    />
                    <span className="text-sm text-slate-600 w-16">
                      {addOn.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Button variant="ghost" size="sm" onClick={() => onEdit(addOn)} className="cursor-pointer">
                      <img src="/icons/edit.svg" alt="Edit" className="w-4 h-4" />
                      Edit
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDelete(addOn)}
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
  );
};

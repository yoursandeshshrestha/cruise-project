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
import { Terminal } from '../types';

interface TerminalsTableProps {
  terminals: Terminal[];
  onEdit: (terminal: Terminal) => void;
  onDelete: (terminal: Terminal) => void;
  onToggleActive: (id: string, currentStatus: boolean) => void;
}

export const TerminalsTable: React.FC<TerminalsTableProps> = ({
  terminals,
  onEdit,
  onDelete,
  onToggleActive,
}) => {
  return (
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
                      onCheckedChange={() => onToggleActive(terminal.id, terminal.is_active)}
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
                      onClick={() => onEdit(terminal)}
                      className="cursor-pointer"
                    >
                      <img src="/icons/edit.svg" alt="Edit" className="w-4 h-4" />
                      Edit
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDelete(terminal)}
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

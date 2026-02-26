import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../../../components/admin/ui/table';
import { Button } from '../../../../components/admin/ui/button';
import { Badge } from '../../../../components/admin/ui/badge';
import { Switch } from '../../../../components/admin/ui/switch';
import { CruiseLine } from '../types';

interface CruiseLinesTableProps {
  cruiseLines: CruiseLine[];
  onEdit: (cruiseLine: CruiseLine) => void;
  onDelete: (cruiseLine: CruiseLine) => void;
  onToggleActive: (id: string, currentStatus: boolean) => void;
}

export const CruiseLinesTable: React.FC<CruiseLinesTableProps> = ({
  cruiseLines,
  onEdit,
  onDelete,
  onToggleActive,
}) => {
  return (
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
                      onCheckedChange={() => onToggleActive(cruiseLine.id, cruiseLine.is_active)}
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
                      onClick={() => onEdit(cruiseLine)}
                      className="cursor-pointer"
                    >
                      <img src="/icons/edit.svg" alt="Edit" className="w-4 h-4" />
                      Edit
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDelete(cruiseLine)}
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

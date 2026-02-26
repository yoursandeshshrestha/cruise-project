import React from 'react';
import { Tag, Percent, PoundSterling } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../../../components/admin/ui/table';
import { Button } from '../../../../components/admin/ui/button';
import { Switch } from '../../../../components/admin/ui/switch';
import { PromoCode } from '../types';
import { formatDiscount, formatDate, isExpired } from '../utils';

interface PromoCodesTableProps {
  promoCodes: PromoCode[];
  onEdit: (promoCode: PromoCode) => void;
  onDelete: (promoCode: PromoCode) => void;
  onToggleActive: (id: string, currentStatus: boolean) => void;
}

export const PromoCodesTable: React.FC<PromoCodesTableProps> = ({
  promoCodes,
  onEdit,
  onDelete,
  onToggleActive,
}) => {
  return (
    <div className="border rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Code</TableHead>
            <TableHead>Discount</TableHead>
            <TableHead>Usage</TableHead>
            <TableHead>Valid Period</TableHead>
            <TableHead className="w-[140px]">Status</TableHead>
            <TableHead className="text-right w-[180px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {promoCodes.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                No promo codes found. Click "Add Promo Code" to create one.
              </TableCell>
            </TableRow>
          ) : (
            promoCodes.map((promoCode) => (
              <TableRow key={promoCode.id}>
                <TableCell className="font-medium">
                  <div className="flex items-center gap-2">
                    <Tag className="w-4 h-4 text-slate-500" />
                    <div>
                      <div className="font-mono font-semibold">{promoCode.code}</div>
                      {promoCode.description && (
                        <div className="text-xs text-muted-foreground max-w-xs truncate">
                          {promoCode.description}
                        </div>
                      )}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    {promoCode.discount_type === 'percentage' ? (
                      <Percent className="w-3 h-3 text-muted-foreground" />
                    ) : (
                      <PoundSterling className="w-3 h-3 text-muted-foreground" />
                    )}
                    <span className="font-semibold">
                      {formatDiscount(promoCode.discount_type, promoCode.discount_value)}
                    </span>
                  </div>
                  {promoCode.minimum_spend && (
                    <div className="text-xs text-muted-foreground">
                      Min: £{(promoCode.minimum_spend / 100).toFixed(2)}
                    </div>
                  )}
                </TableCell>
                <TableCell>
                  <div className="text-sm">
                    {promoCode.current_uses}
                    {promoCode.max_uses ? ` / ${promoCode.max_uses}` : ' / ∞'}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="text-sm">
                    <div>{formatDate(promoCode.valid_from)}</div>
                    <div className="text-muted-foreground">
                      to {formatDate(promoCode.valid_until)}
                    </div>
                    {isExpired(promoCode.valid_until) && (
                      <div className="text-xs text-red-600 font-medium mt-1">Expired</div>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Switch
                      checked={promoCode.is_active}
                      onCheckedChange={() => onToggleActive(promoCode.id, promoCode.is_active)}
                      className="cursor-pointer"
                    />
                    <span className="text-sm text-slate-600 w-16">
                      {promoCode.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onEdit(promoCode)}
                      className="cursor-pointer"
                    >
                      <img src="/icons/edit.svg" alt="Edit" className="w-4 h-4" />
                      Edit
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDelete(promoCode)}
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

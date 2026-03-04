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
import { Switch } from '../../../../components/admin/ui/switch';
import { PricingRule } from '../types';
import { formatDate } from '../../../../lib/dateUtils';

interface PricingTableProps {
  pricingRules: PricingRule[];
  onEdit: (rule: PricingRule) => void;
  onDelete: (rule: PricingRule) => void;
  onToggleActive: (id: string, currentStatus: boolean) => void;
}

export const PricingTable: React.FC<PricingTableProps> = ({
  pricingRules,
  onEdit,
  onDelete,
  onToggleActive,
}) => {
  return (
    <div className="border rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Priority</TableHead>
            <TableHead>Daily Rate</TableHead>
            <TableHead>Van Multiplier</TableHead>
            <TableHead>VAT Rate</TableHead>
            <TableHead>Start Date</TableHead>
            <TableHead>End Date</TableHead>
            <TableHead>Reason</TableHead>
            <TableHead className="w-[140px]">Status</TableHead>
            <TableHead className="text-right w-[180px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {pricingRules.length === 0 ? (
            <TableRow>
              <TableCell colSpan={10} className="text-center text-muted-foreground py-8">
                No pricing rules found. Add your first pricing rule to get started.
              </TableCell>
            </TableRow>
          ) : (
            pricingRules.map((rule) => {
              const isStandardPricing = rule.name === 'Standard Pricing' || rule.priority === 2;

              return (
                <TableRow key={rule.id}>
                  <TableCell className="font-medium">
                    {rule.name}
                    {isStandardPricing && (
                      <span className="ml-2 text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full">
                        Base
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 text-xs font-medium rounded ${
                      rule.priority === 1
                        ? 'bg-purple-100 text-purple-700'
                        : 'bg-slate-100 text-slate-700'
                    }`}>
                      {rule.priority || 2}
                    </span>
                  </TableCell>
                  <TableCell className="font-medium">£{(rule.price_per_day ?? 0).toFixed(2)}/day</TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {(rule.van_multiplier ?? 0).toFixed(1)}× car price
                  </TableCell>
                  <TableCell>{((rule.vat_rate ?? 0) * 100).toFixed(0)}%</TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {rule.start_date ? formatDate(rule.start_date) : (isStandardPricing ? 'All year' : '—')}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {rule.end_date ? formatDate(rule.end_date) : (isStandardPricing ? 'All year' : '—')}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground max-w-[200px] truncate">
                    {rule.reason ? (
                      <span title={rule.reason}>{rule.reason}</span>
                    ) : (
                      <span className="text-gray-400">—</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {!isStandardPricing ? (
                      <div className="flex items-center gap-3">
                        <Switch
                          checked={rule.is_active}
                          onCheckedChange={() => onToggleActive(rule.id, rule.is_active)}
                          className="cursor-pointer"
                        />
                        <span className="text-sm text-slate-600 w-16">
                          {rule.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-sm text-green-700 font-medium">
                          Always Active
                        </span>
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onEdit(rule)}
                        className="cursor-pointer"
                      >
                        <img src="/icons/edit.svg" alt="Edit" className="w-4 h-4" />
                        Edit
                      </Button>
                      {!isStandardPricing && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onDelete(rule)}
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
                      )}
                      {isStandardPricing && (
                        <div className="w-[76px] text-xs text-slate-400 text-center">
                          Cannot delete
                        </div>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </div>
  );
};

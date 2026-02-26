import React from 'react';
import { Badge } from '../../../../components/admin/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../../components/admin/ui/select';

interface StatusCardProps {
  status: string;
  onStatusChange: (newStatus: string) => void;
  getStatusColor: (status: string) => string;
}

export const StatusCard: React.FC<StatusCardProps> = ({ status, onStatusChange, getStatusColor }) => {
  return (
    <div className="bg-admin-card-bg border border-border rounded-lg p-6">
      <h2 className="text-lg font-semibold mb-4">Booking Status</h2>
      <div className="space-y-3">
        <div>
          <label className="block text-sm text-muted-foreground mb-2">Current Status</label>
          <Badge className={getStatusColor(status)}>
            {status.replace('_', ' ').toUpperCase()}
          </Badge>
        </div>
        <div>
          <label className="block text-sm text-muted-foreground mb-2">Change Status</label>
          <Select value={status} onValueChange={onStatusChange}>
            <SelectTrigger className="cursor-pointer">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pending" className="cursor-pointer">Pending</SelectItem>
              <SelectItem value="confirmed" className="cursor-pointer">Confirmed</SelectItem>
              <SelectItem value="checked_in" className="cursor-pointer">Checked In</SelectItem>
              <SelectItem value="completed" className="cursor-pointer">Completed</SelectItem>
              <SelectItem value="cancelled" className="cursor-pointer">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
};

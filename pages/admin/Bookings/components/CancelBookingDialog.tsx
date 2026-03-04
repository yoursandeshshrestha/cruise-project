import React, { useState } from 'react';
import { X, AlertTriangle, Loader2 } from 'lucide-react';
import { Button } from '../../../../components/admin/ui/button';
import { Input } from '../../../../components/admin/ui/input';

interface CancelBookingDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => Promise<void>;
  bookingReference: string;
}

export const CancelBookingDialog: React.FC<CancelBookingDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  bookingReference,
}) => {
  const [reason, setReason] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleConfirm = async () => {
    if (!reason.trim() || isLoading) {
      return;
    }

    setIsLoading(true);
    try {
      await onConfirm(reason);
      setReason('');
      setIsLoading(false);
    } catch (error) {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (isLoading) return; // Prevent closing while loading
    setReason('');
    setIsLoading(false);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4"
      onClick={isLoading ? undefined : handleClose}
    >
      <div
        className="bg-white rounded-lg shadow-lg max-w-md w-full p-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Cancel Booking</h3>
              <p className="text-sm text-gray-600">{bookingReference}</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            disabled={isLoading}
            className="text-gray-400 hover:text-gray-600 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">Cancellation Reason *</label>
          <Input
            type="text"
            placeholder="Enter reason for cancellation"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && reason.trim() && !isLoading) {
                handleConfirm();
              }
            }}
            disabled={isLoading}
            className="w-full"
          />
          <p className="text-xs text-gray-500 mt-1">
            This will cancel the booking, process a refund (if payment was completed), and send a confirmation email to the customer.
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isLoading}
            className="flex-1 cursor-pointer"
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleConfirm}
            disabled={!reason.trim() || isLoading}
            className="flex-1 cursor-pointer"
          >
            {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {isLoading ? 'Cancelling...' : 'Confirm Cancellation'}
          </Button>
        </div>
      </div>
    </div>
  );
};

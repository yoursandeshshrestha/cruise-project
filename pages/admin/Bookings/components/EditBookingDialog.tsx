import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../../../components/admin/ui/dialog';
import { Button } from '../../../../components/admin/ui/button';
import { Input } from '../../../../components/admin/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../../components/admin/ui/select';
import { DatePicker } from '../../../../components/admin/ui/date-picker';

interface EditFormData {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  vehicle_registration: string;
  vehicle_make: string;
  cruise_line: string;
  ship_name: string;
  terminal: string | null;
  drop_off_datetime: Date | undefined;
  return_datetime: Date | undefined;
  number_of_passengers: string;
  status: string;
  internal_notes: string | null;
}

interface CruiseLine {
  id: string;
  name: string;
  ships: string[];
}

interface Terminal {
  id: string;
  name: string;
}

interface EditBookingDialogProps {
  isOpen: boolean;
  onClose: () => void;
  bookingReference: string;
  editForm: EditFormData;
  setEditForm: React.Dispatch<React.SetStateAction<EditFormData>>;
  cruiseLines: CruiseLine[];
  terminals: Terminal[];
  onSubmit: () => void;
}

export const EditBookingDialog: React.FC<EditBookingDialogProps> = ({
  isOpen,
  onClose,
  bookingReference,
  editForm,
  setEditForm,
  cruiseLines,
  terminals,
  onSubmit,
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] flex flex-col p-0">
        <DialogHeader className="px-6 py-4 border-b border-slate-200 shrink-0">
          <DialogTitle>Edit Booking - {bookingReference}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 overflow-y-auto px-6 py-4 flex-1">
          {/* Customer Information */}
          <div>
            <h3 className="font-semibold text-sm mb-3 text-slate-700">Customer Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  First Name
                </label>
                <Input
                  value={editForm.first_name}
                  onChange={e => setEditForm({ ...editForm, first_name: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Last Name
                </label>
                <Input
                  value={editForm.last_name}
                  onChange={e => setEditForm({ ...editForm, last_name: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Email
                </label>
                <Input
                  type="email"
                  value={editForm.email}
                  onChange={e => setEditForm({ ...editForm, email: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Phone
                </label>
                <Input
                  value={editForm.phone}
                  onChange={e => setEditForm({ ...editForm, phone: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Passengers
                </label>
                <Input
                  type="number"
                  value={editForm.number_of_passengers}
                  onChange={e => setEditForm({ ...editForm, number_of_passengers: e.target.value })}
                  min="1"
                />
              </div>
            </div>
          </div>

          {/* Trip Details */}
          <div>
            <h3 className="font-semibold text-sm mb-3 text-slate-700">Trip Details</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Cruise Line
                </label>
                <Select
                  value={editForm.cruise_line}
                  onValueChange={value => {
                    setEditForm({ ...editForm, cruise_line: value, ship_name: '' });
                  }}
                >
                  <SelectTrigger className="cursor-pointer">
                    <SelectValue placeholder="Select cruise line" />
                  </SelectTrigger>
                  <SelectContent>
                    {cruiseLines.map(cl => (
                      <SelectItem key={cl.id} value={cl.name} className="cursor-pointer">
                        {cl.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Ship Name
                </label>
                <Select
                  value={editForm.ship_name}
                  onValueChange={value => setEditForm({ ...editForm, ship_name: value })}
                  disabled={!editForm.cruise_line}
                >
                  <SelectTrigger className="cursor-pointer">
                    <SelectValue placeholder="Select ship" />
                  </SelectTrigger>
                  <SelectContent>
                    {cruiseLines
                      .find(cl => cl.name === editForm.cruise_line)
                      ?.ships.map((ship, idx) => (
                        <SelectItem key={idx} value={ship} className="cursor-pointer">
                          {ship}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Terminal
                </label>
                <Select
                  value={editForm.terminal || ''}
                  onValueChange={value => setEditForm({ ...editForm, terminal: value })}
                >
                  <SelectTrigger className="cursor-pointer">
                    <SelectValue placeholder="Select terminal" />
                  </SelectTrigger>
                  <SelectContent>
                    {terminals.map(t => (
                      <SelectItem key={t.id} value={t.name} className="cursor-pointer">
                        {t.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Drop-off Date & Time
                </label>
                <DatePicker
                  date={editForm.drop_off_datetime}
                  onSelect={date => setEditForm({ ...editForm, drop_off_datetime: date })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Return Date & Time
                </label>
                <DatePicker
                  date={editForm.return_datetime}
                  onSelect={date => setEditForm({ ...editForm, return_datetime: date })}
                />
              </div>
            </div>
          </div>

          {/* Vehicle Information */}
          <div>
            <h3 className="font-semibold text-sm mb-3 text-slate-700">Vehicle Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Registration
                </label>
                <Input
                  value={editForm.vehicle_registration}
                  onChange={e => setEditForm({ ...editForm, vehicle_registration: e.target.value.toUpperCase() })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Make/Model
                </label>
                <Input
                  value={editForm.vehicle_make}
                  onChange={e => setEditForm({ ...editForm, vehicle_make: e.target.value })}
                />
              </div>
            </div>
          </div>

          {/* Internal Notes */}
          <div>
            <h3 className="font-semibold text-sm mb-3 text-slate-700">Internal Notes</h3>
            <textarea
              className="w-full min-h-[100px] rounded-md border border-slate-300 bg-white px-3 py-2 text-sm placeholder:text-slate-400 focus:outline-none focus:border-[#00A9FE] focus:ring-1 focus:ring-[#00A9FE] transition-colors"
              value={editForm.internal_notes || ''}
              onChange={e => setEditForm({ ...editForm, internal_notes: e.target.value })}
              placeholder="Add internal notes..."
            />
          </div>
        </div>

        {/* Fixed Footer */}
        <div className="px-6 py-4 border-t border-slate-200 shrink-0 bg-white rounded-b-lg">
          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={onClose}
              className="cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              onClick={onSubmit}
              className="cursor-pointer"
            >
              Save Changes
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

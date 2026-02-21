import React, { useState } from 'react';
import { Layout } from '../../../components/client/Layout';
import { Button } from '../../../components/client/Button';
import { Input } from '../../../components/client/Input';
import { Select } from '../../../components/client/Select';
import { AlertCircle, Calendar, Car, Ship, CreditCard, Download, Edit, XCircle, CheckCircle, MapPin, History, FileText, X, Save, AlertTriangle, Loader2, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { jsPDF } from 'jspdf';
import { useBookingsStore } from '../../../stores/bookingsStore';
import { useSettingsStore } from '../../../stores/settingsStore';
import type { Database } from '../../../lib/supabase';

type Booking = Database['public']['Tables']['bookings']['Row'];

export const ManageBooking: React.FC = () => {
  const [email, setEmail] = useState('');
  const [reference, setReference] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'dashboard' | 'error'>('idle');
  const [booking, setBooking] = useState<Booking | null>(null);
  const [previousBookings, setPreviousBookings] = useState<Booking[]>([]);
  const [errorMessage, setErrorMessage] = useState('');

  // Fetch stores
  const { fetchBookingByReference, fetchBookingsByEmail, updateBooking, cancelBooking: cancelBookingInStore } = useBookingsStore();
  const { addOns, fetchAddOns } = useSettingsStore();

  // Fetch add-ons on mount
  React.useEffect(() => {
    fetchAddOns();
  }, [fetchAddOns]);

  // Amend Modal State
  const [isAmendOpen, setIsAmendOpen] = useState(false);
  const [isSavingAmend, setIsSavingAmend] = useState(false);
  const [amendForm, setAmendForm] = useState({
      dropOffDateTime: '',
      returnDateTime: '',
      vehicleReg: '',
      vehicleMake: ''
  });

  // Cancel Modal State
  const [isCancelOpen, setIsCancelOpen] = useState(false);

  // Receipt State
  const [isDownloading, setIsDownloading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    setErrorMessage('');

    try {
      // Fetch booking by reference
      const foundBooking = await fetchBookingByReference(reference.toUpperCase().trim());

      if (!foundBooking) {
        setStatus('error');
        setErrorMessage('Booking not found. Please check your reference number.');
        return;
      }

      // Verify email matches
      if (foundBooking.email.toLowerCase() !== email.toLowerCase().trim()) {
        setStatus('error');
        setErrorMessage('Email address does not match this booking.');
        return;
      }

      // Set the booking
      setBooking(foundBooking);

      // Fetch all previous bookings for this email
      const allBookings = await fetchBookingsByEmail(email.toLowerCase().trim());
      // Filter out current booking and only show completed ones
      const previous = allBookings.filter(b =>
        b.id !== foundBooking.id &&
        (b.status === 'completed' || b.status === 'cancelled')
      );
      setPreviousBookings(previous);

      setStatus('dashboard');
    } catch (error) {
      console.error('Error fetching booking:', error);
      setStatus('error');
      setErrorMessage('An error occurred while fetching your booking. Please try again.');
    }
  };

  const handleLogout = () => {
    setStatus('idle');
    setBooking(null);
    setEmail('');
    setReference('');
  };

  const handleOpenAmend = () => {
      if (!booking) return;
      // Extract date and time from ISO datetime
      const dropOffDate = booking.drop_off_datetime.split('T')[0];
      const returnDate = booking.return_datetime.split('T')[0];

      setAmendForm({
          dropOffDateTime: booking.drop_off_datetime,
          returnDateTime: booking.return_datetime,
          vehicleReg: booking.vehicle_registration,
          vehicleMake: booking.vehicle_make
      });
      setIsAmendOpen(true);
  };

  const handleAmendSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!booking) return;

      setIsSavingAmend(true);
      try {
        // Update booking in database
        await updateBooking(booking.id, {
          drop_off_datetime: amendForm.dropOffDateTime,
          return_datetime: amendForm.returnDateTime,
          vehicle_registration: amendForm.vehicleReg,
          vehicle_make: amendForm.vehicleMake
        });

        // Refresh booking data
        const updatedBooking = await fetchBookingByReference(booking.booking_reference);
        if (updatedBooking) {
          setBooking(updatedBooking);
        }

        setIsAmendOpen(false);
      } catch (error) {
        console.error('Error updating booking:', error);
        alert('Failed to update booking. Please try again.');
      } finally {
        setIsSavingAmend(false);
      }
  };

  const handleDownloadReceipt = () => {
    if (!booking) return;
    setIsDownloading(true);

    // Simulate generation delay
    setTimeout(() => {
        try {
            const doc = new jsPDF();
            const pageWidth = doc.internal.pageSize.getWidth();
            const totalInPounds = booking.total / 100;

            // Header Background
            doc.setFillColor(0, 169, 254); // Primary Blue
            doc.rect(0, 0, pageWidth, 40, 'F');

            // Header Text
            doc.setTextColor(255, 255, 255);
            doc.setFontSize(22);
            doc.text("SIMPLE CRUISE PARKING", 20, 25);
            doc.setFontSize(12);
            doc.text("Booking Receipt", 20, 35);

            // Reset Text Color
            doc.setTextColor(0, 24, 72); // Brand Dark

            // Booking Details
            doc.setFontSize(10);
            doc.text(`Reference: ${booking.booking_reference}`, 20, 55);
            doc.text(`Date Issued: ${new Date().toLocaleDateString()}`, 20, 60);
            doc.text(`Status: ${booking.status}`, 20, 65);

            // Customer
            doc.setFontSize(14);
            doc.setFont(undefined, 'bold');
            doc.text("Customer Details", 20, 80);
            doc.line(20, 82, 190, 82);

            doc.setFont(undefined, 'normal');
            doc.setFontSize(10);
            doc.text(`Name: ${booking.first_name} ${booking.last_name}`, 20, 90);
            doc.text(`Email: ${booking.email}`, 20, 96);
            doc.text(`Mobile: ${booking.phone}`, 20, 102);

            // Trip
            doc.setFontSize(14);
            doc.setFont(undefined, 'bold');
            doc.text("Itinerary", 20, 115);
            doc.line(20, 117, 190, 117);

            doc.setFont(undefined, 'normal');
            doc.setFontSize(10);
            doc.text(`Drop Off:`, 20, 125);
            doc.text(`${new Date(booking.drop_off_datetime).toLocaleDateString()} at ${new Date(booking.drop_off_datetime).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}`, 50, 125);

            doc.text(`Return:`, 20, 131);
            doc.text(`${new Date(booking.return_datetime).toLocaleDateString()} at ${new Date(booking.return_datetime).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}`, 50, 131);

            doc.text(`Ship:`, 20, 137);
            doc.text(`${booking.ship_name}`, 50, 137);

            if (booking.terminal) {
              doc.text(`Terminal:`, 20, 143);
              doc.text(`${booking.terminal}`, 50, 143);
            }

            // Vehicle
            doc.setFontSize(14);
            doc.setFont(undefined, 'bold');
            doc.text("Vehicle", 20, 158);
            doc.line(20, 160, 190, 160);

            doc.setFont(undefined, 'normal');
            doc.setFontSize(10);
            doc.text(`Vehicle: ${booking.vehicle_make}`, 20, 168);
            doc.text(`Reg: ${booking.vehicle_registration}`, 20, 174);

            // Payment Summary
            doc.setFontSize(14);
            doc.setFont(undefined, 'bold');
            doc.text("Payment Summary", 20, 190);
            doc.line(20, 192, 190, 192);

            doc.setFont(undefined, 'normal');
            doc.setFontSize(10);

            let y = 200;

            doc.text("Parking & Services", 20, y);
            y += 6;

            if (booking.add_ons && booking.add_ons.length > 0) {
              booking.add_ons.forEach(slug => {
                  const addon = addOns.find(a => a.slug === slug);
                  if (addon) {
                    doc.text(addon.name, 20, y);
                    y += 6;
                  }
              });
            }

            y += 4;
            doc.line(130, y, 190, y);
            y += 6;

            doc.setFontSize(12);
            doc.setFont(undefined, 'bold');
            doc.text("Total Paid", 130, y);
            doc.text(`£${totalInPounds.toFixed(2)}`, 190, y, { align: 'right' });

            // Footer
            doc.setFontSize(8);
            doc.setFont(undefined, 'normal');
            doc.setTextColor(150);
            doc.text("Thank you for choosing Simple Cruise Parking.", 105, 280, { align: "center" });

            doc.save(`Receipt-${booking.booking_reference}.pdf`);
        } catch (e) {
            console.error("PDF generation failed:", e);
            alert("Sorry, we couldn't generate your receipt at this time.");
        }
        setIsDownloading(false);
    }, 1500);
  };

  const handleCancelConfirm = async () => {
      if (!booking) return;

      try {
        await cancelBookingInStore(booking.id, 'Cancelled by customer via manage booking page');

        // Refresh booking data
        const updatedBooking = await fetchBookingByReference(booking.booking_reference);
        if (updatedBooking) {
          setBooking(updatedBooking);
        }

        setIsCancelOpen(false);
      } catch (error) {
        console.error('Error cancelling booking:', error);
        alert('Failed to cancel booking. Please try again or contact support.');
      }
  };

  if (status === 'dashboard' && booking) {
    const isCancelled = booking.status === 'cancelled';

    // Helper to format datetime
    const formatDate = (dateTimeStr: string) => {
      return new Date(dateTimeStr).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
    };

    const formatTime = (dateTimeStr: string) => {
      return new Date(dateTimeStr).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
    };

    // Calculate total in pounds
    const totalInPounds = booking.total / 100;
    const subtotalInPounds = booking.subtotal / 100;
    const vatInPounds = booking.vat / 100;
    const discountInPounds = booking.discount / 100;

    return (
        <Layout>
            <div className="bg-neutral-light min-h-screen pb-20 relative">
                {/* Header Strip */}
                <div className="bg-white border-b border-gray-200 sticky top-20 z-30">
                    <div className="max-w-7xl mx-auto px-4 py-5">
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                            <div>
                                <p className="text-gray-500 text-xs uppercase tracking-wide font-medium mb-1">Booking Reference</p>
                                <h1 className="text-2xl sm:text-3xl font-bold text-brand-dark">{booking.booking_reference}</h1>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className={`px-3 py-1.5 rounded-lg text-xs font-semibold uppercase flex items-center gap-1.5 ${
                                    isCancelled ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-green-50 text-green-700 border border-green-200'
                                }`}>
                                    {isCancelled ? <XCircle size={14} /> : <CheckCircle size={14} />} {booking.status}
                                </span>
                                <button
                                    onClick={handleLogout}
                                    className="px-4 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                                >
                                    Look Up Another
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="max-w-7xl mx-auto px-4 py-8">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12">
                        {/* Left Column: Trip Details */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Trip Info Card */}
                            <div className={`bg-white rounded-lg border ${isCancelled ? 'border-gray-200 opacity-75 grayscale' : 'border-gray-200'} p-6 md:p-8`}>
                                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-200">
                                    <Calendar className="text-primary" size={20} />
                                    <h2 className="text-lg font-semibold text-brand-dark">Trip Itinerary</h2>
                                </div>
                                
                                <div className="flex flex-col md:flex-row gap-8 relative">
                                    {/* Line connecting dots on mobile */}
                                    <div className="absolute left-[11px] top-8 bottom-8 w-0.5 bg-gray-200 md:hidden"></div>

                                    <div className="flex-1 relative pl-8 md:pl-0">
                                         <div className="absolute left-0 top-1 w-6 h-6 bg-blue-50 text-primary rounded-full flex items-center justify-center md:hidden border-2 border-white z-10">
                                            <div className="w-2 h-2 bg-primary rounded-full"></div>
                                        </div>
                                        <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1">Drop Off</p>
                                        <p className="text-lg font-bold text-brand-dark">{formatDate(booking.drop_off_datetime)}</p>
                                        <p className="text-gray-600 mb-2">Approx {formatTime(booking.drop_off_datetime)}</p>
                                        <div className="bg-gray-50 p-3 rounded text-sm text-gray-600 flex items-start gap-2">
                                            <MapPin size={16} className="text-gray-400 mt-0.5 shrink-0" />
                                            <span>Unit 5, West Quay Industrial Estate, Southampton, SO15 1GZ</span>
                                        </div>
                                    </div>

                                    <div className="hidden md:flex items-center justify-center">
                                        <div className="h-12 w-px bg-gray-200"></div>
                                    </div>

                                    <div className="flex-1 relative pl-8 md:pl-0">
                                        <div className="absolute left-0 top-1 w-6 h-6 bg-blue-50 text-primary rounded-full flex items-center justify-center md:hidden border-2 border-white z-10">
                                            <div className="w-2 h-2 bg-primary rounded-full"></div>
                                        </div>
                                        <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1">Return</p>
                                        <p className="text-lg font-bold text-brand-dark">{formatDate(booking.return_datetime)}</p>
                                        <p className="text-gray-600 mb-2">Approx {formatTime(booking.return_datetime)}</p>
                                        <div className="bg-gray-50 p-3 rounded text-sm text-gray-600 flex items-start gap-2">
                                            <Ship size={16} className="text-gray-400 mt-0.5 shrink-0" />
                                            <span>Arriving on <strong>{booking.ship_name}</strong>{booking.terminal && ` at ${booking.terminal}`}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Vehicle & Passenger Card */}
                            <div className={`bg-white rounded-lg border ${isCancelled ? 'border-gray-200 opacity-75 grayscale' : 'border-gray-200'} p-6 md:p-8`}>
                                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-200">
                                    <Car className="text-primary" size={20} />
                                    <h2 className="text-lg font-semibold text-brand-dark">Vehicle & Details</h2>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    <div>
                                        <p className="text-xs text-gray-500 mb-2">Vehicle Registration</p>
                                        <p className="font-mono bg-yellow-100 px-3 py-1.5 rounded border border-yellow-300 w-fit font-semibold text-brand-dark">{booking.vehicle_registration}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500 mb-2">Make / Model</p>
                                        <p className="font-medium text-brand-dark">{booking.vehicle_make}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500 mb-2">Lead Passenger</p>
                                        <p className="font-medium text-brand-dark">{booking.first_name} {booking.last_name}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500 mb-2">Contact Number</p>
                                        <p className="font-medium text-brand-dark">{booking.phone}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right Column: Actions & Payment */}
                        <div className="lg:col-span-1 space-y-6">

                            {/* Action Buttons */}
                            <div className="bg-white rounded-lg border border-gray-200 p-6">
                                <h3 className="font-semibold text-brand-dark mb-4">Quick Actions</h3>
                                <div className="space-y-2">
                                    <button
                                        onClick={handleOpenAmend}
                                        disabled={isCancelled}
                                        className="w-full py-2 px-4 rounded-lg text-sm font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-colors cursor-pointer"
                                    >
                                        <Edit size={16} /> Amend Booking
                                    </button>
                                    <button
                                        onClick={handleDownloadReceipt}
                                        disabled={isDownloading}
                                        className="w-full py-2 px-4 rounded-lg text-sm font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-colors cursor-pointer"
                                    >
                                        {isDownloading ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
                                        {isDownloading ? 'Downloading...' : 'Download Receipt'}
                                    </button>
                                    {!isCancelled && (
                                        <button
                                            onClick={() => setIsCancelOpen(true)}
                                            className="w-full py-2 px-4 rounded-lg text-sm font-medium border border-red-300 text-red-600 hover:bg-red-50 flex items-center justify-center gap-2 transition-colors cursor-pointer"
                                        >
                                            <XCircle size={16} /> Cancel Booking
                                        </button>
                                    )}
                                </div>
                                {!isCancelled && (
                                    <p className="text-xs text-gray-400 mt-4 text-center">
                                        Free cancellation available until {new Date(new Date(booking.drop_off_datetime).setDate(new Date(booking.drop_off_datetime).getDate() - 2)).toLocaleDateString('en-GB')}
                                    </p>
                                )}
                            </div>

                            {/* Payment Summary */}
                            <div className="bg-white rounded-lg border border-gray-200 p-6">
                                <div className="flex items-center gap-3 mb-4 pb-4 border-b border-gray-200">
                                    <CreditCard size={18} className="text-primary" />
                                    <h3 className="font-semibold text-brand-dark">Payment Summary</h3>
                                </div>
                                <div className="space-y-3 text-sm">
                                    {booking.add_ons && booking.add_ons.length > 0 && (
                                      <div className="pb-2 border-b border-gray-100">
                                        <p className="text-xs text-gray-500 mb-2">Add-ons:</p>
                                        {booking.add_ons.map((slug, index) => {
                                          const addon = addOns.find(a => a.slug === slug);
                                          return addon ? (
                                            <div key={index} className="flex justify-between mb-1">
                                              <span className="text-gray-600 text-xs">{addon.name}</span>
                                              <span className="font-medium text-xs">£{addon.price.toFixed(2)}</span>
                                            </div>
                                          ) : null;
                                        })}
                                      </div>
                                    )}
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Subtotal</span>
                                        <span className="font-medium">£{subtotalInPounds.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">VAT</span>
                                        <span className="font-medium">£{vatInPounds.toFixed(2)}</span>
                                    </div>
                                    {discountInPounds > 0 && (
                                      <div className="flex justify-between text-green-600">
                                        <span>Discount{booking.promo_code && ` (${booking.promo_code})`}</span>
                                        <span className="font-medium">-£{discountInPounds.toFixed(2)}</span>
                                      </div>
                                    )}
                                    <div className="border-t border-gray-100 pt-3 flex justify-between items-center">
                                        <span className="font-bold text-brand-dark text-base">Total Paid</span>
                                        <span className="font-bold text-brand-dark text-xl">£{totalInPounds.toFixed(2)}</span>
                                    </div>
                                </div>
                                {booking.payment_status === 'completed' && (
                                  <div className="mt-4 bg-green-50 text-green-700 text-xs px-3 py-2 rounded flex items-center gap-2">
                                      <CheckCircle size={14} /> Payment Completed
                                  </div>
                                )}
                            </div>
                            
                            {/* Need Help */}
                             <div className="bg-gray-50 rounded-lg border border-gray-200 p-6 text-center">
                                <h3 className="font-semibold text-brand-dark mb-2">Need Help?</h3>
                                <p className="text-sm text-gray-600 mb-4">Our support team is available 24/7 to assist with your booking.</p>
                                <Link to="/contact" className="inline-block bg-primary text-white hover:bg-primary-dark font-medium text-sm px-4 py-2 rounded-lg transition-colors cursor-pointer">
                                    Contact Support
                                </Link>
                             </div>

                        </div>
                    </div>

                    {/* Previous Bookings Section */}
                    {previousBookings.length > 0 && (
                      <div>
                          <div className="flex items-center gap-3 mb-4">
                              <History className="text-primary" size={20} />
                              <h2 className="text-xl font-semibold text-brand-dark">Previous Bookings</h2>
                          </div>
                          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                              <div className="overflow-x-auto">
                                  <table className="w-full text-left text-sm">
                                      <thead className="bg-gray-50 text-gray-500 font-medium border-b border-gray-100">
                                          <tr>
                                              <th className="p-4">Reference</th>
                                              <th className="p-4">Dates</th>
                                              <th className="p-4">Ship</th>
                                              <th className="p-4">Total</th>
                                              <th className="p-4">Status</th>
                                          </tr>
                                      </thead>
                                      <tbody className="divide-y divide-gray-100">
                                          {previousBookings.map(prev => (
                                              <tr key={prev.id} className="hover:bg-gray-50">
                                                  <td className="p-4 font-medium text-brand-dark">{prev.booking_reference}</td>
                                                  <td className="p-4 text-gray-600">
                                                    {new Date(prev.drop_off_datetime).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })} - {new Date(prev.return_datetime).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                                                  </td>
                                                  <td className="p-4 text-gray-600">{prev.ship_name}</td>
                                                  <td className="p-4 font-bold text-gray-800">£{(prev.total / 100).toFixed(2)}</td>
                                                  <td className="p-4">
                                                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-bold uppercase ${
                                                        prev.status === 'completed' ? 'bg-gray-100 text-gray-700' : 'bg-red-100 text-red-700'
                                                      }`}>
                                                          {prev.status === 'completed' ? <CheckCircle size={10} /> : <XCircle size={10} />} {prev.status}
                                                      </span>
                                                  </td>
                                              </tr>
                                          ))}
                                      </tbody>
                                  </table>
                              </div>
                          </div>
                      </div>
                    )}
                </div>

                {/* Amend Booking Modal */}
                {isAmendOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <div className="absolute inset-0 bg-brand-dark/50 backdrop-blur-sm" onClick={() => setIsAmendOpen(false)}></div>
                        <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg relative z-10 animate-in zoom-in-95 duration-200">
                            <div className="flex justify-between items-center p-6 border-b border-gray-100">
                                <h2 className="text-xl font-bold text-brand-dark">Amend Booking</h2>
                                <button onClick={() => setIsAmendOpen(false)} className="text-gray-400 hover:text-gray-600">
                                    <X size={24} />
                                </button>
                            </div>
                            
                            <form onSubmit={handleAmendSubmit}>
                                <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                                    <div className="bg-blue-50 p-4 rounded-lg flex items-start gap-3 mb-4">
                                        <AlertCircle size={20} className="text-primary shrink-0 mt-0.5" />
                                        <p className="text-sm text-blue-800">
                                            Changing your dates may affect the total price. If the new price is higher, we will contact you to collect the difference.
                                        </p>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <Input
                                            label="Drop Off Date & Time"
                                            type="datetime-local"
                                            value={amendForm.dropOffDateTime.slice(0, 16)}
                                            onChange={(e) => setAmendForm({...amendForm, dropOffDateTime: e.target.value + ':00.000Z'})}
                                        />
                                        <Input
                                            label="Return Date & Time"
                                            type="datetime-local"
                                            value={amendForm.returnDateTime.slice(0, 16)}
                                            onChange={(e) => setAmendForm({...amendForm, returnDateTime: e.target.value + ':00.000Z'})}
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <Input
                                            label="Vehicle Reg"
                                            value={amendForm.vehicleReg}
                                            onChange={(e) => setAmendForm({...amendForm, vehicleReg: e.target.value})}
                                        />
                                        <Input
                                            label="Make / Model"
                                            value={amendForm.vehicleMake}
                                            onChange={(e) => setAmendForm({...amendForm, vehicleMake: e.target.value})}
                                        />
                                    </div>
                                </div>

                                <div className="p-6 border-t border-gray-100 flex justify-end gap-3 bg-gray-50 rounded-b-xl">
                                    <button
                                        type="button"
                                        onClick={() => setIsAmendOpen(false)}
                                        disabled={isSavingAmend}
                                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isSavingAmend}
                                        className="px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-primary-dark rounded-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-colors cursor-pointer"
                                    >
                                        {isSavingAmend ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                                        {isSavingAmend ? 'Saving...' : 'Save Changes'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Cancel Confirmation Modal */}
                {isCancelOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <div className="absolute inset-0 bg-brand-dark/50 backdrop-blur-sm" onClick={() => setIsCancelOpen(false)}></div>
                        <div className="bg-white rounded-xl shadow-2xl w-full max-w-md relative z-10 animate-in zoom-in-95 duration-200 overflow-hidden">
                            <div className="p-6 text-center">
                                <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <AlertTriangle size={32} />
                                </div>
                                <h2 className="text-xl font-bold text-brand-dark mb-2">Cancel Booking?</h2>
                                <p className="text-gray-600 mb-6">
                                    Are you sure you want to cancel booking <span className="font-bold">{booking?.booking_reference}</span>? This action cannot be undone.
                                </p>
                                
                                <div className="bg-red-50 border border-red-100 rounded-lg p-4 mb-6 text-left flex gap-3">
                                    <AlertCircle size={20} className="text-red-600 shrink-0 mt-0.5" />
                                    <p className="text-sm text-red-800 font-medium">
                                        Warning: Bookings cancelled within 48 hours of arrival are non-refundable according to our terms of service.
                                    </p>
                                </div>

                                <div className="flex flex-col gap-2">
                                    <button
                                        onClick={handleCancelConfirm}
                                        className="w-full py-2 px-4 rounded-lg text-sm font-medium text-white bg-red-600 hover:bg-red-700 transition-colors cursor-pointer"
                                    >
                                        Yes, Cancel Booking
                                    </button>
                                    <button
                                        onClick={() => setIsCancelOpen(false)}
                                        className="w-full py-2 px-4 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer"
                                    >
                                        No, Keep Booking
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

            </div>
        </Layout>
    );
  }

  // Login UI (Fallback for idle/loading/error states)
  return (
    <Layout>
      <div className="bg-neutral-light min-h-screen py-20 flex items-center justify-center px-4">
        <div className="bg-white p-8 md:p-10 rounded-lg border border-gray-200 w-full max-w-lg">
            <div className="text-center mb-8">
                <div className="w-16 h-16 bg-primary rounded-lg flex items-center justify-center mx-auto mb-4 text-white">
                    <FileText size={28} />
                </div>
                <h1 className="text-2xl font-bold text-brand-dark mb-2">Manage Booking</h1>
                <p className="text-gray-600 text-sm">Enter your booking reference and email to view, amend, or cancel your booking.</p>
            </div>

            {status === 'error' && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 flex items-start gap-3">
                    <AlertCircle size={20} className="shrink-0 mt-0.5" />
                    <div>
                        <p className="font-semibold text-sm">Booking not found</p>
                        <p className="text-xs mt-1">{errorMessage || 'Please check your reference number and email address and try again.'}</p>
                    </div>
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                    <Input
                        label="Booking Reference"
                        placeholder="e.g. SCP-1234"
                        value={reference}
                        onChange={(e) => setReference(e.target.value)}
                        required
                    />
                    <p className="text-xs text-gray-500 mt-1.5">Your reference was emailed to you after booking</p>
                </div>
                <Input
                    label="Email Address"
                    type="email"
                    placeholder="e.g. name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />

                <button
                    type="submit"
                    disabled={status === 'loading'}
                    className="w-full py-2.5 px-4 rounded-lg text-sm font-medium text-white bg-primary hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                    {status === 'loading' ? (
                        <>
                            <Loader2 size={18} className="animate-spin" /> Finding your booking...
                        </>
                    ) : (
                        <>Find My Booking <ArrowRight size={18} /></>
                    )}
                </button>
            </form>

            <div className="mt-8 pt-6 border-t border-gray-200">
                <div className="text-center">
                    <p className="text-sm text-gray-600 mb-2">Can't find your booking reference?</p>
                    <Link to="/contact" className="text-primary font-medium text-sm hover:text-brand-dark transition-colors cursor-pointer">
                        Contact Support
                    </Link>
                </div>
            </div>
        </div>
      </div>
    </Layout>
  );
};
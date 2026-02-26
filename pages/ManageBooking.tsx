import React, { useState, useEffect } from 'react';
import { Layout } from '../components/client/Layout';
import { Button } from '../components/Button';
import { Input } from '../components/client/Input';
import { Select } from '../components/client/Select';
import { AlertCircle, Calendar, Car, Ship, CreditCard, Download, Edit, XCircle, CheckCircle, MapPin, History, FileText, X, Save, AlertTriangle, Loader2, ArrowRight } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import { jsPDF } from 'jspdf';
import { useBookingsStore } from '../stores/bookingsStore';

// Mock Data Types
interface MockBooking {
  reference: string;
  status: 'Confirmed' | 'Cancelled' | 'Completed';
  customer: {
    firstName: string;
    lastName: string;
    email: string;
    mobile: string;
  };
  trip: {
    dropOffDate: string;
    dropOffTime: string;
    returnDate: string;
    returnTime: string;
    ship: string;
    terminal: string;
  };
  vehicle: {
    reg: string;
    make: string;
  };
  addons: string[];
  price: number;
}

interface PreviousBooking {
    id: string;
    dateRange: string;
    ship: string;
    price: number;
    status: string;
}

const PREVIOUS_BOOKINGS: PreviousBooking[] = [
    { id: 'SCP-8921', dateRange: '10 Aug 2023 - 17 Aug 2023', ship: 'Arvia', price: 92.50, status: 'Completed' },
    { id: 'SCP-4429', dateRange: '02 May 2023 - 09 May 2023', ship: 'Iona', price: 85.00, status: 'Completed' },
    { id: 'SCP-1102', dateRange: '14 Dec 2022 - 21 Dec 2022', ship: 'Queen Mary 2', price: 110.00, status: 'Completed' },
];

export const ManageBooking: React.FC = () => {
  const [searchParams] = useSearchParams();
  const { fetchBookingByReference } = useBookingsStore();

  const [email, setEmail] = useState('');
  const [reference, setReference] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'dashboard' | 'error'>('idle');
  const [booking, setBooking] = useState<MockBooking | null>(null);

  // Auto-load booking from URL parameter
  useEffect(() => {
    const refParam = searchParams.get('ref');
    if (refParam) {
      setReference(refParam);
      // Auto-submit to load the booking
      loadBookingByReference(refParam);
    }
  }, [searchParams]);

  const loadBookingByReference = async (ref: string) => {
    setStatus('loading');

    try {
      const bookingData = await fetchBookingByReference(ref);

      if (bookingData) {
        // Convert real booking data to mock format for display
        setBooking({
          reference: bookingData.booking_reference,
          status: bookingData.status === 'confirmed' ? 'Confirmed' : bookingData.status === 'cancelled' ? 'Cancelled' : 'Confirmed',
          customer: {
            firstName: bookingData.first_name,
            lastName: bookingData.last_name,
            email: bookingData.email,
            mobile: bookingData.phone
          },
          trip: {
            dropOffDate: bookingData.drop_off_datetime.split('T')[0],
            dropOffTime: new Date(bookingData.drop_off_datetime).toTimeString().slice(0, 5),
            returnDate: bookingData.return_datetime.split('T')[0],
            returnTime: new Date(bookingData.return_datetime).toTimeString().slice(0, 5),
            ship: bookingData.ship_name,
            terminal: bookingData.terminal || 'Ocean Cruise Terminal'
          },
          vehicle: {
            reg: bookingData.vehicle_registration,
            make: bookingData.vehicle_make
          },
          addons: bookingData.add_ons || [],
          price: bookingData.total / 100 // Convert from pence to pounds
        });
        setStatus('dashboard');
      } else {
        setStatus('error');
      }
    } catch (error) {
      console.error('Error loading booking:', error);
      setStatus('error');
    }
  };

  // Amend Modal State
  const [isAmendOpen, setIsAmendOpen] = useState(false);
  const [amendForm, setAmendForm] = useState({
      dropOffDate: '',
      dropOffTime: '',
      returnDate: '',
      returnTime: '',
      vehicleReg: '',
      vehicleMake: ''
  });

  // Cancel Modal State
  const [isCancelOpen, setIsCancelOpen] = useState(false);

  // Receipt State
  const [isDownloading, setIsDownloading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await loadBookingByReference(reference);
  };

  const handleLogout = () => {
    setStatus('idle');
    setBooking(null);
    setEmail('');
    setReference('');
  };

  const handleOpenAmend = () => {
      if (!booking) return;
      setAmendForm({
          dropOffDate: booking.trip.dropOffDate,
          dropOffTime: booking.trip.dropOffTime,
          returnDate: booking.trip.returnDate,
          returnTime: booking.trip.returnTime,
          vehicleReg: booking.vehicle.reg,
          vehicleMake: booking.vehicle.make
      });
      setIsAmendOpen(true);
  };

  const handleAmendSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (!booking) return;
      
      // Update local state to reflect changes
      setBooking({
          ...booking,
          trip: {
              ...booking.trip,
              dropOffDate: amendForm.dropOffDate,
              dropOffTime: amendForm.dropOffTime,
              returnDate: amendForm.returnDate,
              returnTime: amendForm.returnTime
          },
          vehicle: {
              reg: amendForm.vehicleReg,
              make: amendForm.vehicleMake
          }
      });
      setIsAmendOpen(false);
  };

  const handleDownloadReceipt = () => {
    if (!booking) return;
    setIsDownloading(true);
    
    // Simulate generation delay
    setTimeout(() => {
        try {
            const doc = new jsPDF();
            const pageWidth = doc.internal.pageSize.getWidth();
            
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
            doc.text(`Reference: ${booking.reference}`, 20, 55);
            doc.text(`Date Issued: ${new Date().toLocaleDateString()}`, 20, 60);
            doc.text(`Status: ${booking.status}`, 20, 65);

            // Customer
            doc.setFontSize(14);
            doc.setFont(undefined, 'bold');
            doc.text("Customer Details", 20, 80);
            doc.line(20, 82, 190, 82);
            
            doc.setFont(undefined, 'normal');
            doc.setFontSize(10);
            doc.text(`Name: ${booking.customer.firstName} ${booking.customer.lastName}`, 20, 90);
            doc.text(`Email: ${booking.customer.email}`, 20, 96);
            doc.text(`Mobile: ${booking.customer.mobile}`, 20, 102);

            // Trip
            doc.setFontSize(14);
            doc.setFont(undefined, 'bold');
            doc.text("Itinerary", 20, 115);
            doc.line(20, 117, 190, 117);

            doc.setFont(undefined, 'normal');
            doc.setFontSize(10);
            doc.text(`Drop Off:`, 20, 125);
            doc.text(`${new Date(booking.trip.dropOffDate).toLocaleDateString()} at ${booking.trip.dropOffTime}`, 50, 125);
            
            doc.text(`Return:`, 20, 131);
            doc.text(`${new Date(booking.trip.returnDate).toLocaleDateString()} at ${booking.trip.returnTime}`, 50, 131);
            
            doc.text(`Ship:`, 20, 137);
            doc.text(`${booking.trip.ship}`, 50, 137);
            
            doc.text(`Terminal:`, 20, 143);
            doc.text(`${booking.trip.terminal}`, 50, 143);

            // Vehicle
            doc.setFontSize(14);
            doc.setFont(undefined, 'bold');
            doc.text("Vehicle", 20, 158);
            doc.line(20, 160, 190, 160);

            doc.setFont(undefined, 'normal');
            doc.setFontSize(10);
            doc.text(`Vehicle: ${booking.vehicle.make}`, 20, 168);
            doc.text(`Reg: ${booking.vehicle.reg}`, 20, 174);

            // Payment Summary
            doc.setFontSize(14);
            doc.setFont(undefined, 'bold');
            doc.text("Payment Summary", 20, 190);
            doc.line(20, 192, 190, 192);

            doc.setFont(undefined, 'normal');
            doc.setFontSize(10);
            
            let y = 200;
            
            doc.text("Standard Parking Package", 20, y);
            y += 6;

            booking.addons.forEach(addon => {
                doc.text(addon, 20, y);
                y += 6;
            });

            y += 4;
            doc.line(130, y, 190, y);
            y += 6;
            
            doc.setFontSize(12);
            doc.setFont(undefined, 'bold');
            doc.text("Total Paid", 130, y);
            doc.text(`£${booking.price.toFixed(2)}`, 190, y, { align: 'right' });

            // Footer
            doc.setFontSize(8);
            doc.setFont(undefined, 'normal');
            doc.setTextColor(150);
            doc.text("Thank you for choosing Simple Cruise Parking.", 105, 280, { align: "center" });
            
            doc.save(`Receipt-${booking.reference}.pdf`);
        } catch (e) {
            console.error("PDF generation failed:", e);
            alert("Sorry, we couldn't generate your receipt at this time.");
        }
        setIsDownloading(false);
    }, 1500);
  };

  const handleCancelConfirm = () => {
      // Simulate API call
      setTimeout(() => {
          if (booking) {
            setBooking({ ...booking, status: 'Cancelled' });
          }
          setIsCancelOpen(false);
      }, 500);
  };

  if (status === 'dashboard' && booking) {
    const isCancelled = booking.status === 'Cancelled';

    return (
        <Layout>
            <div className="bg-neutral-light min-h-screen pb-20 relative">
                {/* Header Strip */}
                <div className="bg-white border-b border-gray-200 sticky top-20 z-30 shadow-sm">
                    <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center gap-2 sm:gap-4">
                        <div className="flex items-center gap-2 sm:gap-4">
                            <h1 className="text-lg sm:text-xl font-bold text-brand-dark">
                                <span className="hidden sm:inline">Booking </span><span className="text-primary">{booking.reference}</span>
                            </h1>
                            <span className={`px-2 sm:px-3 py-1 rounded-full text-[10px] sm:text-xs font-bold uppercase tracking-wide flex items-center gap-1 ${
                                isCancelled ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                            }`}>
                                {isCancelled ? <XCircle size={10} className="sm:w-3 sm:h-3" /> : <CheckCircle size={10} className="sm:w-3 sm:h-3" />} {booking.status}
                            </span>
                        </div>
                        <Button variant="secondary" onClick={handleLogout} className="text-xs sm:text-sm pt-1.5 pb-2 px-3 sm:px-4 shrink-0">Sign Out</Button>
                    </div>
                </div>

                <div className="max-w-7xl mx-auto px-4 py-8">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
                        {/* Left Column: Trip Details */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Trip Info Card */}
                            <div className={`bg-white rounded-xl shadow-light border border-gray-100 p-6 md:p-8 ${isCancelled ? 'opacity-75 grayscale' : ''}`}>
                                <h2 className="text-lg font-bold text-brand-dark mb-6 flex items-center gap-2">
                                    <Calendar className="text-primary" /> Trip Itinerary
                                </h2>
                                
                                <div className="flex flex-col md:flex-row gap-8 relative">
                                    {/* Line connecting dots on mobile */}
                                    <div className="absolute left-[11px] top-8 bottom-8 w-0.5 bg-gray-200 md:hidden"></div>

                                    <div className="flex-1 relative pl-8 md:pl-0">
                                         <div className="absolute left-0 top-1 w-6 h-6 bg-blue-50 text-primary rounded-full flex items-center justify-center md:hidden border-2 border-white z-10">
                                            <div className="w-2 h-2 bg-primary rounded-full"></div>
                                        </div>
                                        <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1">Drop Off</p>
                                        <p className="text-lg font-bold text-brand-dark">{new Date(booking.trip.dropOffDate).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p>
                                        <p className="text-gray-600 mb-2">Approx {booking.trip.dropOffTime}</p>
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
                                        <p className="text-lg font-bold text-brand-dark">{new Date(booking.trip.returnDate).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p>
                                        <p className="text-gray-600 mb-2">Approx {booking.trip.returnTime}</p>
                                        <div className="bg-gray-50 p-3 rounded text-sm text-gray-600 flex items-start gap-2">
                                            <Ship size={16} className="text-gray-400 mt-0.5 shrink-0" />
                                            <span>Arriving on <strong>{booking.trip.ship}</strong> at {booking.trip.terminal}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Vehicle & Passenger Card */}
                            <div className={`bg-white rounded-xl shadow-light border border-gray-100 p-6 md:p-8 ${isCancelled ? 'opacity-75 grayscale' : ''}`}>
                                <h2 className="text-lg font-bold text-brand-dark mb-6 flex items-center gap-2">
                                    <Car className="text-primary" /> Vehicle & Details
                                </h2>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    <div>
                                        <p className="text-xs text-gray-500 mb-1">Vehicle Registration</p>
                                        <p className="font-mono bg-yellow-300 px-2 py-1 rounded w-fit font-bold text-black border border-yellow-400">{booking.vehicle.reg}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500 mb-1">Make / Model</p>
                                        <p className="font-medium text-brand-dark">{booking.vehicle.make}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500 mb-1">Lead Passenger</p>
                                        <p className="font-medium text-brand-dark">{booking.customer.firstName} {booking.customer.lastName}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500 mb-1">Contact Number</p>
                                        <p className="font-medium text-brand-dark">{booking.customer.mobile}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right Column: Actions & Payment */}
                        <div className="lg:col-span-1 space-y-6">
                            
                            {/* Action Buttons */}
                            <div className="bg-white rounded-xl shadow-light border border-gray-100 p-6">
                                <h3 className="font-bold text-brand-dark mb-4">Quick Actions</h3>
                                <div className="space-y-3">
                                    <Button 
                                        fullWidth 
                                        variant="secondary" 
                                        onClick={handleOpenAmend} 
                                        disabled={isCancelled}
                                        className="flex items-center justify-center gap-2"
                                    >
                                        <Edit size={18} /> Amend Booking
                                    </Button>
                                    <Button 
                                        fullWidth 
                                        variant="secondary" 
                                        className="flex items-center justify-center gap-2"
                                        onClick={handleDownloadReceipt}
                                        disabled={isDownloading}
                                    >
                                        {isDownloading ? <Loader2 size={18} className="animate-spin" /> : <Download size={18} />}
                                        {isDownloading ? 'Downloading...' : 'Download Receipt'}
                                    </Button>
                                    {!isCancelled && (
                                        <button 
                                            onClick={() => setIsCancelOpen(true)}
                                            className="w-full py-3 px-4 rounded-lg font-medium text-sm border-2 border-red-100 text-red-600 hover:bg-red-50 flex items-center justify-center gap-2 transition-colors"
                                        >
                                            <XCircle size={18} /> Cancel Booking
                                        </button>
                                    )}
                                </div>
                                {!isCancelled && (
                                    <p className="text-xs text-gray-400 mt-4 text-center">
                                        Free cancellation available until {new Date(new Date(booking.trip.dropOffDate).setDate(new Date(booking.trip.dropOffDate).getDate() - 2)).toLocaleDateString('en-GB')}
                                    </p>
                                )}
                            </div>

                            {/* Payment Summary */}
                            <div className="bg-white rounded-xl shadow-light border border-gray-100 p-6">
                                <h3 className="font-bold text-brand-dark mb-4 flex items-center gap-2">
                                    <CreditCard size={18} className="text-primary" /> Payment Summary
                                </h3>
                                <div className="space-y-3 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Parking (7 days)</span>
                                        <span className="font-medium">£87.50</span>
                                    </div>
                                    {booking.addons.map((addon, index) => (
                                         <div key={index} className="flex justify-between">
                                            <span className="text-gray-600">{addon}</span>
                                            <span className="font-medium">£{addon === 'EV Charging' ? '35.00' : '15.00'}</span>
                                        </div>
                                    ))}
                                    <div className="border-t border-gray-100 pt-3 flex justify-between items-center">
                                        <span className="font-bold text-brand-dark text-base">Total Paid</span>
                                        <span className="font-bold text-brand-dark text-xl">£{booking.price.toFixed(2)}</span>
                                    </div>
                                </div>
                                <div className="mt-4 bg-green-50 text-green-700 text-xs px-3 py-2 rounded flex items-center gap-2">
                                    <CheckCircle size={14} /> Paid via Visa ending 4242
                                </div>
                            </div>
                            
                            {/* Need Help */}
                             <div className="bg-brand-dark rounded-xl shadow-light p-6 text-white text-center">
                                <h3 className="font-bold mb-2">Need Help?</h3>
                                <p className="text-sm text-gray-300 mb-4">Our support team is available 24/7 to assist with your booking.</p>
                                <Link to="/contact" className="text-primary hover:text-white font-medium text-sm underline">Contact Support</Link>
                             </div>

                        </div>
                    </div>

                    {/* Previous Bookings Section */}
                    <div>
                        <h2 className="text-2xl font-bold text-brand-dark mb-6 flex items-center gap-2">
                            <History className="text-primary" /> Previous Bookings
                        </h2>
                        <div className="bg-white rounded-xl shadow-light border border-gray-100 overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm">
                                    <thead className="bg-gray-50 text-gray-500 font-medium border-b border-gray-100">
                                        <tr>
                                            <th className="p-4">Reference</th>
                                            <th className="p-4">Dates</th>
                                            <th className="p-4">Ship</th>
                                            <th className="p-4">Total</th>
                                            <th className="p-4">Status</th>
                                            <th className="p-4">Receipt</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {PREVIOUS_BOOKINGS.map(prev => (
                                            <tr key={prev.id} className="hover:bg-gray-50">
                                                <td className="p-4 font-medium text-brand-dark">{prev.id}</td>
                                                <td className="p-4 text-gray-600">{prev.dateRange}</td>
                                                <td className="p-4 text-gray-600">{prev.ship}</td>
                                                <td className="p-4 font-bold text-gray-800">£{prev.price.toFixed(2)}</td>
                                                <td className="p-4">
                                                    <span className="inline-flex items-center gap-1 bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs font-bold uppercase">
                                                        <CheckCircle size={10} /> {prev.status}
                                                    </span>
                                                </td>
                                                <td className="p-4">
                                                    <button className="text-primary hover:text-brand-dark transition-colors flex items-center justify-center gap-1 text-xs font-bold uppercase">
                                                        <FileText size={14} /> View
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
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
                                            label="Drop Off Date" 
                                            type="date" 
                                            value={amendForm.dropOffDate}
                                            onChange={(e) => setAmendForm({...amendForm, dropOffDate: e.target.value})}
                                        />
                                        <Select 
                                            label="Drop Off Time" 
                                            value={amendForm.dropOffTime}
                                            onChange={(e) => setAmendForm({...amendForm, dropOffTime: e.target.value})}
                                            options={['08:00','09:00','10:00','11:00','12:00','13:00','14:00','15:00'].map(t => ({ value: t, label: t }))}
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <Input 
                                            label="Return Date" 
                                            type="date" 
                                            value={amendForm.returnDate}
                                            onChange={(e) => setAmendForm({...amendForm, returnDate: e.target.value})}
                                        />
                                        <Select 
                                            label="Return Time" 
                                            value={amendForm.returnTime}
                                            onChange={(e) => setAmendForm({...amendForm, returnTime: e.target.value})}
                                            options={['06:00','07:00','08:00','09:00','10:00','11:00'].map(t => ({ value: t, label: t }))}
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
                                    <Button type="button" variant="secondary" onClick={() => setIsAmendOpen(false)}>Cancel</Button>
                                    <Button type="submit" className="flex items-center gap-2">
                                        <Save size={18} /> Save Changes
                                    </Button>
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
                                    Are you sure you want to cancel booking <span className="font-bold">{booking?.reference}</span>? This action cannot be undone.
                                </p>
                                
                                <div className="bg-red-50 border border-red-100 rounded-lg p-4 mb-6 text-left flex gap-3">
                                    <AlertCircle size={20} className="text-red-600 shrink-0 mt-0.5" />
                                    <p className="text-sm text-red-800 font-medium">
                                        Warning: Bookings cancelled within 48 hours of arrival are non-refundable according to our terms of service.
                                    </p>
                                </div>

                                <div className="flex flex-col gap-3">
                                    <button 
                                        onClick={handleCancelConfirm}
                                        className="w-full py-3 px-4 rounded-lg font-bold text-white bg-red-600 hover:bg-red-700 transition-colors"
                                    >
                                        Yes, Cancel Booking
                                    </button>
                                    <button 
                                        onClick={() => setIsCancelOpen(false)}
                                        className="w-full py-3 px-4 rounded-lg font-medium text-gray-700 hover:bg-gray-100 transition-colors"
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
        <div className="bg-white p-8 rounded-xl shadow-medium border border-gray-100 w-full max-w-md">
            <div className="text-center mb-8">
                <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4 text-primary">
                    <FileText size={32} />
                </div>
                <h1 className="text-2xl font-bold text-brand-dark">Manage Booking</h1>
                <p className="text-gray-600 mt-2 text-sm">Enter your booking reference and email to view, amend, or cancel your booking.</p>
            </div>

            {status === 'error' && (
                <div className="bg-red-50 border border-red-100 text-red-700 px-4 py-3 rounded-lg mb-6 flex items-start gap-3">
                    <AlertCircle size={20} className="shrink-0 mt-0.5" />
                    <div>
                        <p className="font-bold text-sm">Booking not found</p>
                        <p className="text-xs mt-1">Please check your reference number and try again. It should start with 'SCP'.</p>
                    </div>
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
                <Input 
                    label="Booking Reference" 
                    placeholder="e.g. SCP-1234" 
                    value={reference}
                    onChange={(e) => setReference(e.target.value)}
                    required
                />
                <Input 
                    label="Email Address" 
                    type="email" 
                    placeholder="e.g. name@example.com" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />
                
                <Button 
                    type="submit" 
                    fullWidth 
                    disabled={status === 'loading'}
                    className="flex items-center justify-center gap-2"
                >
                    {status === 'loading' ? (
                        <>
                            <Loader2 size={20} className="animate-spin" /> Finding...
                        </>
                    ) : (
                        <>Find Booking <ArrowRight size={20} /></>
                    )}
                </Button>
            </form>

            <div className="mt-8 pt-6 border-t border-gray-100 text-center">
                <p className="text-xs text-gray-500 mb-2">Can't find your reference?</p>
                <Link to="/contact" className="text-primary font-bold text-sm hover:underline">Contact Support</Link>
            </div>
        </div>
      </div>
    </Layout>
  );
};
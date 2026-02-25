import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Select } from '../components/Select';
import { BookingState, BookingStep, ParkingType } from '../types';
import { CRUISE_LINES, ADD_ONS, calculateParkingPrice } from '../constants';
import { Check, ChevronRight, AlertCircle, Calendar, CreditCard, Lock } from 'lucide-react';

const INITIAL_STATE: BookingState = {
  dropOffDate: '',
  dropOffTime: '11:00',
  returnDate: '',
  returnTime: '09:00',
  passengers: 2,
  cruiseLine: '',
  shipName: '',
  selectedAddOns: [],
  vehicleType: 'car',
  vehicleReg: '',
  vehicleMake: '',
  firstName: '',
  lastName: '',
  email: '',
  mobile: '',
  promoCode: '',
  totalPrice: 0,
};

export const BookingFlow: React.FC = () => {
  const location = useLocation();
  const [step, setStep] = useState<BookingStep>(1);
  const [booking, setBooking] = useState<BookingState>(INITIAL_STATE);
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'google' | 'apple'>('card');

  // Get today's date in YYYY-MM-DD format for min date attributes
  const today = new Date().toISOString().split('T')[0];

  // Parse query params on load
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('dropOffDate')) {
      setBooking(prev => ({
        ...prev,
        dropOffDate: params.get('dropOffDate') || '',
        returnDate: params.get('returnDate') || '',
        cruiseLine: params.get('cruiseLine') || '',
      }));
    }
  }, [location.search]);

  // Calculate Price
  const calculateTotal = () => {
    if (!booking.dropOffDate || !booking.returnDate) return 0;
    const start = new Date(booking.dropOffDate);
    const end = new Date(booking.returnDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
    
    let parkingCost = calculateParkingPrice(diffDays, booking.vehicleType);
    
    const addOnsCost = booking.selectedAddOns.reduce((acc, id) => {
      const addon = ADD_ONS.find(a => a.id === id);
      return acc + (addon ? addon.price : 0);
    }, 0);

    return parkingCost + addOnsCost;
  };

  useEffect(() => {
    setBooking(prev => ({ ...prev, totalPrice: calculateTotal() }));
  }, [booking.dropOffDate, booking.returnDate, booking.selectedAddOns]);

  const updateBooking = (field: keyof BookingState, value: any) => {
    setBooking(prev => ({ ...prev, [field]: value }));
  };

  const toggleAddOn = (id: string) => {
    setBooking(prev => {
      const current = prev.selectedAddOns;
      if (current.includes(id)) {
        return { ...prev, selectedAddOns: current.filter(item => item !== id) };
      }
      return { ...prev, selectedAddOns: [...current, id] };
    });
  };

  const nextStep = () => setStep(prev => Math.min(prev + 1, 5) as BookingStep);
  const prevStep = () => setStep(prev => Math.max(prev - 1, 1) as BookingStep);

  const renderStep1 = () => (
    <div className="space-y-6 animate-in slide-in-from-right duration-300">
      <h2 className="text-2xl font-bold text-brand-dark">Trip Details</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Input 
          label="Drop Off Date" 
          type="date" 
          min={today}
          value={booking.dropOffDate} 
          onChange={e => updateBooking('dropOffDate', e.target.value)}
        />
        <Select 
          label="Drop Off Time (approx)" 
          options={['08:00','09:00','10:00','11:00','12:00','13:00','14:00','15:00'].map(t => ({ value: t, label: t }))}
          value={booking.dropOffTime}
          onChange={e => updateBooking('dropOffTime', e.target.value)}
        />
        <Input 
          label="Return Date" 
          type="date" 
          min={booking.dropOffDate || today}
          value={booking.returnDate} 
          onChange={e => updateBooking('returnDate', e.target.value)}
        />
        <Select 
          label="Return Time (approx)" 
          options={['06:00','07:00','08:00','09:00','10:00','11:00'].map(t => ({ value: t, label: t }))}
          value={booking.returnTime}
          onChange={e => updateBooking('returnTime', e.target.value)}
        />
        <Select 
          label="Cruise Line"
          options={CRUISE_LINES.map(c => ({ value: c.name, label: c.name }))}
          value={booking.cruiseLine}
          onChange={e => updateBooking('cruiseLine', e.target.value)}
        />
        <Select 
          label="Ship Name"
          options={
            booking.cruiseLine 
              ? (CRUISE_LINES.find(c => c.name === booking.cruiseLine)?.ships.map(s => ({ value: s, label: s })) || [])
              : []
          }
          value={booking.shipName}
          onChange={e => updateBooking('shipName', e.target.value)}
          disabled={!booking.cruiseLine}
        />
        <Select 
          label="Passengers"
          options={[1,2,3,4,5,6,7,8].map(n => ({ value: n.toString(), label: n.toString() }))}
          value={booking.passengers.toString()}
          onChange={e => updateBooking('passengers', parseInt(e.target.value))}
        />
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-8 animate-in slide-in-from-right duration-300">
      <div>
        <h2 className="text-2xl font-bold text-brand-dark mb-4">Select Parking Option</h2>
        <div className="border-2 border-primary bg-blue-50 rounded-lg p-6 relative">
          <div className="absolute top-4 right-4 bg-primary text-white text-xs font-bold px-2 py-1 rounded">
            RECOMMENDED
          </div>
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-lg font-bold">{ParkingType.PARK_AND_RIDE}</h3>
            <span className="text-xl font-bold text-primary">Included</span>
          </div>
          <p className="text-sm text-gray-600 mb-4">Secure parking at our monitored facility with free shuttle transfer to/from the terminal.</p>
          <ul className="text-sm space-y-2 text-gray-700">
            <li className="flex items-center gap-2"><Check size={16} className="text-green-600" /> 10 minute transfer time</li>
            <li className="flex items-center gap-2"><Check size={16} className="text-green-600" /> CCTV & Gated Security</li>
            <li className="flex items-center gap-2"><Check size={16} className="text-green-600" /> Keep your keys (optional)</li>
          </ul>
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-bold text-brand-dark mb-4">Add Extras (Optional)</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {ADD_ONS.map(addon => (
            <div 
              key={addon.id}
              className={`border rounded-lg p-4 cursor-pointer transition-all ${
                booking.selectedAddOns.includes(addon.id) 
                  ? 'border-primary bg-blue-50 ring-1 ring-primary' 
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => toggleAddOn(addon.id)}
            >
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-bold text-brand-dark">{addon.name}</h4>
                  <p className="text-xs text-gray-500 mt-1">{addon.description}</p>
                </div>
                <span className="font-bold text-primary">+£{addon.price.toFixed(2)}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6 animate-in slide-in-from-right duration-300">
      <h2 className="text-2xl font-bold text-brand-dark">Your Details</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Input 
          label="Vehicle Registration" 
          value={booking.vehicleReg} 
          onChange={e => updateBooking('vehicleReg', e.target.value.toUpperCase())}
          placeholder="AB12 CDE"
        />
        <Input 
          label="Vehicle Make/Model" 
          value={booking.vehicleMake} 
          onChange={e => updateBooking('vehicleMake', e.target.value)}
          placeholder="e.g. Ford Focus"
        />
        <Input 
          label="First Name" 
          value={booking.firstName} 
          onChange={e => updateBooking('firstName', e.target.value)}
        />
        <Input 
          label="Last Name" 
          value={booking.lastName} 
          onChange={e => updateBooking('lastName', e.target.value)}
        />
        <Input 
          label="Email Address" 
          type="email"
          value={booking.email} 
          onChange={e => updateBooking('email', e.target.value)}
        />
        <Input 
          label="Mobile Number" 
          type="tel"
          value={booking.mobile} 
          onChange={e => updateBooking('mobile', e.target.value)}
          helperText="For shuttle updates on the day."
        />
        <Input 
          label="Promo Code (Optional)" 
          value={booking.promoCode} 
          onChange={e => updateBooking('promoCode', e.target.value)}
          placeholder="e.g. SAVE10"
        />
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div className="space-y-6 animate-in slide-in-from-right duration-300">
      <h2 className="text-2xl font-bold text-brand-dark">Secure Payment</h2>
      
      <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
        <h3 className="font-bold text-lg mb-4">Payment Method</h3>
        <div className="grid grid-cols-3 gap-3 mb-6">
          <button 
            type="button"
            onClick={() => setPaymentMethod('card')}
            className={`py-3 px-2 border rounded flex items-center justify-center gap-2 transition-colors ${
              paymentMethod === 'card' 
                ? 'border-primary bg-blue-50 text-primary ring-1 ring-primary' 
                : 'border-gray-300 bg-white hover:bg-gray-50'
            }`}
          >
            <CreditCard size={20} className="shrink-0" />
            <span className="font-medium text-sm sm:text-base hidden sm:inline">Card</span>
            <span className="font-medium text-sm sm:text-base sm:hidden">Card</span>
          </button>
          
           <button 
            type="button"
            onClick={() => setPaymentMethod('google')}
            className={`py-3 px-2 border rounded flex items-center justify-center gap-2 transition-colors ${
              paymentMethod === 'google' 
                ? 'border-primary bg-blue-50 text-primary ring-1 ring-primary' 
                : 'border-gray-300 bg-white hover:bg-gray-50'
            }`}
          >
            <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.84z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
            <span className="font-medium text-sm sm:text-base hidden sm:inline">Google Pay</span>
             <span className="font-medium text-sm sm:text-base sm:hidden">Google</span>
          </button>

          <button 
            type="button"
            onClick={() => setPaymentMethod('apple')}
            className={`py-3 px-2 border rounded flex items-center justify-center gap-2 transition-colors ${
              paymentMethod === 'apple' 
                ? 'border-primary bg-blue-50 text-primary ring-1 ring-primary' 
                : 'border-gray-300 bg-white hover:bg-gray-50'
            }`}
          >
             <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="currentColor"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.79-1.31.02-2.3-1.23-3.14-2.47-1.71-2.49-2.97-6.95-1.18-9.98 0.88-1.5 2.47-2.45 4.18-2.48 1.3 0 2.5 0.88 3.29 0.88 0.78 0 2.24-1.08 3.77-0.92 0.64 0.03 2.44 0.26 3.6 1.95-3.13 1.5-2.6 5.92 1.09 7.55zM15.5 5.55c.67-.82 1.13-1.96.96-3.1-1.02.04-2.27.68-3 1.54-.64.75-1.19 1.97-.94 3.14 1.13.09 2.3-0.77 2.98-1.58z"/></svg>
            <span className="font-medium text-sm sm:text-base hidden sm:inline">Apple Pay</span>
            <span className="font-medium text-sm sm:text-base sm:hidden">Apple</span>
          </button>
        </div>
        
        {paymentMethod === 'card' && (
          <div className="space-y-4 animate-in fade-in">
              <Input label="Card Number" placeholder="0000 0000 0000 0000" />
              <div className="grid grid-cols-2 gap-4">
                  <Input label="Expiry" placeholder="MM/YY" />
                  <Input label="CVC" placeholder="123" />
              </div>
          </div>
        )}

        {paymentMethod === 'google' && (
           <div className="text-center py-6 animate-in fade-in">
               <p className="text-gray-600 mb-4">You will be redirected to Google Pay to complete your purchase securely.</p>
           </div>
        )}

         {paymentMethod === 'apple' && (
           <div className="text-center py-6 animate-in fade-in">
               <p className="text-gray-600 mb-4">You will be redirected to Apple Pay to complete your purchase securely.</p>
           </div>
        )}
      </div>

      <div className="flex items-start gap-3 mt-4">
        <input type="checkbox" id="terms" className="mt-1" />
        <label htmlFor="terms" className="text-sm text-gray-600">
          I accept the <a href="#" className="text-primary underline">Terms and Conditions</a> and <a href="#" className="text-primary underline">Privacy Policy</a>.
        </label>
      </div>
    </div>
  );

  const renderStep5 = () => (
    <div className="text-center py-12 animate-in zoom-in duration-300">
      <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
        <Check size={48} strokeWidth={3} />
      </div>
      <h2 className="text-3xl font-bold text-brand-dark mb-4">Booking Confirmed!</h2>
      <p className="text-gray-600 mb-8">
        Thank you {booking.firstName}. Your booking reference is <span className="font-bold text-brand-dark">SCP-{Math.floor(Math.random() * 10000)}</span>.
      </p>
      <div className="max-w-md mx-auto bg-gray-50 p-6 rounded-lg text-left mb-8">
        <p className="text-sm text-gray-600 mb-2">We have sent a confirmation email to <span className="font-bold">{booking.email}</span> with directions and arrival instructions.</p>
      </div>
      <Link to="/">
        <Button>Return to Home</Button>
      </Link>
    </div>
  );

  return (
    <Layout hideFooter>
      <div className="min-h-screen bg-neutral-light pb-20">
        
        {/* Progress Header */}
        <div className="bg-white border-b border-gray-200 sticky top-20 z-40">
          <div className="max-w-3xl mx-auto px-4 py-4">
            <div className="flex justify-between items-center text-sm font-medium text-gray-400">
              <span className={step >= 1 ? 'text-primary' : ''}>Trip</span>
              <ChevronRight size={16} />
              <span className={step >= 2 ? 'text-primary' : ''}>Options</span>
              <ChevronRight size={16} />
              <span className={step >= 3 ? 'text-primary' : ''}>Details</span>
              <ChevronRight size={16} />
              <span className={step >= 4 ? 'text-primary' : ''}>Payment</span>
            </div>
            <div className="w-full bg-gray-100 h-2 rounded-full mt-2">
              <div 
                className="bg-primary h-2 rounded-full transition-all duration-300"
                style={{ width: `${(step / 4) * 100}%` }}
              ></div>
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Form Area */}
          <div className="lg:col-span-2">
            <div className="bg-white p-6 md:p-8 rounded-xl shadow-light">
              {step === 1 && renderStep1()}
              {step === 2 && renderStep2()}
              {step === 3 && renderStep3()}
              {step === 4 && renderStep4()}
              {step === 5 && renderStep5()}
              
              {/* Navigation Buttons */}
              {step < 5 && (
                <div className="flex justify-between mt-8 pt-8 border-t border-gray-100">
                    {step > 1 ? (
                        <Button variant="secondary" onClick={prevStep}>Back</Button>
                    ) : (
                        <div></div>
                    )}
                    <Button onClick={nextStep}>
                        {step === 4 ? 'Pay Securely' : 'Next Step'}
                    </Button>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar Summary */}
          {step < 5 && (
            <div className="lg:col-span-1">
              <div className="bg-white p-6 rounded-xl shadow-light sticky top-40">
                <h3 className="text-xl font-bold text-brand-dark mb-4 border-b pb-4">Booking Summary</h3>
                
                <div className="space-y-4 text-sm">
                  {booking.dropOffDate && (
                    <div>
                      <p className="text-gray-500 text-xs">Drop Off</p>
                      <p className="font-semibold">{booking.dropOffDate} at {booking.dropOffTime}</p>
                    </div>
                  )}
                  {booking.returnDate && (
                    <div>
                      <p className="text-gray-500 text-xs">Return</p>
                      <p className="font-semibold">{booking.returnDate} at {booking.returnTime}</p>
                    </div>
                  )}
                  {booking.shipName && (
                    <div>
                      <p className="text-gray-500 text-xs">Ship</p>
                      <p className="font-semibold">{booking.shipName}</p>
                    </div>
                  )}
                  
                  {booking.selectedAddOns.length > 0 && (
                     <div className="border-t pt-4">
                        <p className="text-gray-500 text-xs mb-2">Add Ons</p>
                        {booking.selectedAddOns.map(id => {
                            const addon = ADD_ONS.find(a => a.id === id);
                            return (
                                <div key={id} className="flex justify-between mb-1">
                                    <span>{addon?.name}</span>
                                    <span>£{addon?.price.toFixed(2)}</span>
                                </div>
                            )
                        })}
                     </div>
                  )}

                  <div className="border-t border-gray-200 pt-4 mt-4">
                    <div className="flex justify-between items-center text-lg font-bold text-brand-dark">
                      <span>Total</span>
                      <span>£{booking.totalPrice.toFixed(2)}</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">All prices are final totals</p>
                  </div>
                </div>

                <div className="mt-6 bg-blue-50 p-3 rounded flex gap-2 text-xs text-blue-800">
                    <Lock size={14} className="shrink-0 mt-0.5" />
                    <p>Free cancellation up to 48 hours before arrival.</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};
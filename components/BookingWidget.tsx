import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Ship } from 'lucide-react';
import { Button } from './Button';
import { CRUISE_LINES } from '../constants';

export const BookingWidget: React.FC = () => {
  const navigate = useNavigate();
  const [dropOffDate, setDropOffDate] = useState('');
  const [returnDate, setReturnDate] = useState('');
  const [cruiseLine, setCruiseLine] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, we would pass these via context or query params
    const params = new URLSearchParams({
      dropOffDate,
      returnDate,
      cruiseLine
    });
    navigate(`/book?${params.toString()}`);
  };

  return (
    <div className="bg-white p-6 md:p-8 rounded-xl shadow-medium max-w-4xl mx-auto -mt-16 md:-mt-10 relative z-10 border border-gray-100">
      <form onSubmit={handleSearch} className="flex flex-col gap-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Drop Off */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-bold text-brand-dark flex items-center gap-2">
              <Calendar size={16} className="text-primary" />
              Drop off Date
            </label>
            <input 
              type="date" 
              required
              className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-all"
              value={dropOffDate}
              onChange={(e) => setDropOffDate(e.target.value)}
            />
          </div>

          {/* Return */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-bold text-brand-dark flex items-center gap-2">
              <Calendar size={16} className="text-primary" />
              Return Date
            </label>
            <input 
              type="date" 
              required
              className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-all"
              value={returnDate}
              onChange={(e) => setReturnDate(e.target.value)}
            />
          </div>

          {/* Cruise Line */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-bold text-brand-dark flex items-center gap-2">
              <Ship size={16} className="text-primary" />
              Cruise Line
            </label>
            <div className="relative">
              <select 
                className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary appearance-none bg-white transition-all"
                value={cruiseLine}
                onChange={(e) => setCruiseLine(e.target.value)}
              >
                <option value="">Select Line...</option>
                {CRUISE_LINES.map(line => (
                  <option key={line.id} value={line.name}>{line.name}</option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-gray-500">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"/></svg>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <Button type="submit" variant="primary" className="w-full md:w-auto px-12">
            Get My Quote
          </Button>
        </div>
      </form>
    </div>
  );
};
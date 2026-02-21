import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Ship } from 'lucide-react';
import { Button } from '../Button';
import { SearchableSelect } from '../SearchableSelect';
import { DatePicker } from '../DatePicker';
import { useCruiseLinesStore } from '../../../stores/cruiseLinesStore';

export const BookingWidget: React.FC = () => {
  const navigate = useNavigate();
  const [dropOffDate, setDropOffDate] = useState<Date | undefined>(undefined);
  const [returnDate, setReturnDate] = useState<Date | undefined>(undefined);
  const [cruiseLine, setCruiseLine] = useState('');

  // Fetch cruise lines from store
  const { cruiseLines, fetchActiveCruiseLines } = useCruiseLinesStore();

  // Fetch active cruise lines on mount (public view)
  useEffect(() => {
    fetchActiveCruiseLines();
  }, [fetchActiveCruiseLines]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();

    // Helper to format Date object to YYYY-MM-DD string (local time)
    const formatLocalDate = (date: Date): string => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };

    // In a real app, we would pass these via context or query params
    const params = new URLSearchParams();
    if (dropOffDate) {
      params.append('dropOffDate', formatLocalDate(dropOffDate));
    }
    if (returnDate) {
      params.append('returnDate', formatLocalDate(returnDate));
    }
    if (cruiseLine) {
      params.append('cruiseLine', cruiseLine);
    }
    navigate(`/book?${params.toString()}`);
  };

  return (
    <div className="bg-white p-6 md:p-8 rounded-xl shadow-medium max-w-6xl mx-auto -mt-16 md:-mt-10 relative z-10 border border-gray-100">
      <form onSubmit={handleSearch} className="flex flex-col gap-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

          {/* Drop Off Date */}
          <DatePicker
            label="Drop Off Date"
            placeholder="Select date..."
            value={dropOffDate}
            onChange={setDropOffDate}
            minDate={new Date()}
          />

          {/* Return Date */}
          <DatePicker
            label="Return Date"
            placeholder="Select date..."
            value={returnDate}
            onChange={setReturnDate}
            minDate={dropOffDate || new Date()}
          />

          {/* Cruise Line */}
          <SearchableSelect
            label="Cruise Line"
            placeholder="Select Line..."
            icon={<Ship size={16} className="text-primary" />}
            options={cruiseLines.map(line => ({ value: line.name, label: line.name }))}
            value={cruiseLine}
            onChange={(value) => setCruiseLine(value)}
          />
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
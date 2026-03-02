export interface DailyBookingCount {
  date: string; // YYYY-MM-DD format
  count: number; // Total active bookings on this date
  arrivals: number; // Bookings arriving (drop-off) on this date
  departures: number; // Bookings departing (return) on this date
}

export interface CalendarStats {
  totalBookings: number;
  averageUtilization: number; // Percentage (0-100+)
  peakDate: string | null; // Date with highest booking count
  peakCount: number;
}

export interface CapacityLevel {
  level: 'available' | 'moderate' | 'high' | 'over';
  color: string;
  bgColor: string;
  borderColor: string;
  label: string;
}

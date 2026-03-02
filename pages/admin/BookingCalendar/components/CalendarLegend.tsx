import React from 'react';
import { CalendarStats } from '../types';
import { format } from 'date-fns';

interface CalendarLegendProps {
  stats: CalendarStats;
  dailyCapacity: number;
  currentMonth: Date;
}

export const CalendarLegend: React.FC<CalendarLegendProps> = ({
  stats,
  dailyCapacity,
  currentMonth,
}) => {
  return (
    <div className="space-y-4">
      {/* Monthly Stats */}
      <div className="border rounded-lg p-4 bg-white">
        <h3 className="text-sm font-semibold mb-4">
          {format(currentMonth, 'MMMM yyyy')}
        </h3>
        <div className="space-y-3">
          <div>
            <div className="text-xs text-muted-foreground">Daily Capacity</div>
            <div className="text-2xl font-bold">{dailyCapacity}</div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground">Total Activity</div>
            <div className="text-2xl font-bold">{stats.totalBookings}</div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground">Avg Utilization</div>
            <div className="text-2xl font-bold">
              {stats.averageUtilization.toFixed(0)}%
            </div>
          </div>
          {stats.peakDate && (
            <div>
              <div className="text-xs text-muted-foreground">Peak Day</div>
              <div className="text-lg font-semibold">
                {format(new Date(stats.peakDate), 'MMM d')}
              </div>
              <div className="text-xs text-muted-foreground">
                {stats.peakCount} bookings
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Capacity Legend */}
      <div className="border rounded-lg p-4 bg-white">
        <h3 className="text-sm font-semibold mb-3">Capacity</h3>
        <div className="space-y-2 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-green-600"></div>
            <span>0-70%</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-yellow-600"></div>
            <span>70-90%</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-orange-600"></div>
            <span>90-100%</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-red-600"></div>
            <span>Over 100%</span>
          </div>
        </div>
      </div>
    </div>
  );
};

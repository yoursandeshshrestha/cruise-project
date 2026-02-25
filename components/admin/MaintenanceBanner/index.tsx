import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const MaintenanceBanner: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="bg-orange-600 text-white">
      <div className="px-4 py-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 flex-shrink-0" />
            <div className="flex flex-col sm:flex-row sm:items-center sm:gap-2">
              <span className="font-semibold">Maintenance Mode Active</span>
              <span className="text-sm text-orange-100">
                Site is currently in maintenance mode. Regular users cannot access the site.
              </span>
            </div>
          </div>
          <button
            onClick={() => navigate('/admin/configuration')}
            className="text-sm font-medium underline hover:no-underline cursor-pointer whitespace-nowrap"
          >
            Manage Settings
          </button>
        </div>
      </div>
    </div>
  );
};

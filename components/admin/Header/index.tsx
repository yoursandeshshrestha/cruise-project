import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../../stores/authStore';
import { useBookingsStore } from '../../../stores/bookingsStore';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../ui/alert-dialog';
import { ChevronRight, CheckCircle } from 'lucide-react';
import { formatDistanceToNow, startOfDay, endOfDay } from 'date-fns';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface HeaderProps {
  onMenuClick?: () => void;
  breadcrumbs?: BreadcrumbItem[];
}

export const Header: React.FC<HeaderProps> = ({ onMenuClick, breadcrumbs = [{ label: 'Dashboard' } as BreadcrumbItem] }) => {
  const { adminUser, signOut } = useAuthStore();
  const { bookings } = useBookingsStore();
  const navigate = useNavigate();
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [signOutDialogOpen, setSignOutDialogOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate('/admin/login');
  };

  // Calculate notifications
  const notifications = useMemo(() => {
    const now = new Date();
    const todayStart = startOfDay(now);
    const todayEnd = endOfDay(now);

    // Today's arrivals
    const todaysArrivals = bookings.filter((booking) => {
      const dropOffDate = new Date(booking.drop_off_datetime);
      const isToday = dropOffDate >= todayStart && dropOffDate <= todayEnd;
      const isActive = ['confirmed', 'checked_in'].includes(booking.status);
      return isToday && isActive;
    });

    // Pending check-ins
    const pendingCheckIns = todaysArrivals.filter(b => b.status === 'confirmed');

    // Recent bookings (last 24 hours)
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const recentBookings = bookings.filter(
      b => new Date(b.created_at) >= oneDayAgo
    ).slice(0, 5);

    return {
      todaysArrivals: todaysArrivals.length,
      pendingCheckIns: pendingCheckIns.length,
      recentBookings,
      unreadCount: pendingCheckIns.length + recentBookings.length,
    };
  }, [bookings]);

  return (
    <header className="flex h-14 items-center justify-between px-4 border-b">
      {/* Left Section: Sidebar Toggle + Breadcrumbs */}
      <div className="flex items-center gap-3">
        {/* Sidebar Toggle */}
        <Button
          variant="ghost"
          size="icon"
          onClick={onMenuClick}
          className="cursor-pointer shrink-0"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M3 11C3 7.22876 3 5.34315 4.17157 4.17157C5.34315 3 7.22876 3 11 3H13C16.7712 3 18.6569 3 19.8284 4.17157C21 5.34315 21 7.22876 21 11V13C21 16.7712 21 18.6569 19.8284 19.8284C18.6569 21 16.7712 21 13 21H11C7.22876 21 5.34315 21 4.17157 19.8284C3 18.6569 3 16.7712 3 13V11Z" />
            <path d="M15 3V21" />
            <path d="M10 9L8.89181 9.87868C7.6306 10.8787 7 11.3787 7 12C7 12.6213 7.6306 13.1213 8.89181 14.1213L10 15" />
          </svg>
        </Button>

        {/* Breadcrumbs */}
        <nav aria-label="breadcrumb">
          <ol className="flex items-center gap-1.5">
            {breadcrumbs.map((item, index) => (
              <li key={index} className="inline-flex items-center gap-1.5">
                {index > 0 && (
                  <ChevronRight className="size-3.5 text-muted-foreground/40" />
                )}
                {item.href && index < breadcrumbs.length - 1 ? (
                  <Link
                    to={item.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                  >
                    {item.label}
                  </Link>
                ) : (
                  <span className="text-sm font-medium text-foreground">
                    {item.label}
                  </span>
                )}
              </li>
            ))}
          </ol>
        </nav>
      </div>

      {/* Right Section: Notifications + User Menu */}
      <div className="flex items-center gap-2">
        {/* Notifications */}
        <DropdownMenu open={notificationsOpen} onOpenChange={setNotificationsOpen}>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="cursor-pointer relative"
            >
              <img src="/icons/bell.svg" alt="Notifications" className="size-5" />
              {notifications.unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-semibold text-white">
                  {notifications.unreadCount > 9 ? '9+' : notifications.unreadCount}
                </span>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <DropdownMenuLabel className="flex items-center justify-between">
              <span>Notifications</span>
              {notifications.unreadCount > 0 && (
                <Badge variant="secondary" className="ml-auto">
                  {notifications.unreadCount} new
                </Badge>
              )}
            </DropdownMenuLabel>
            <DropdownMenuSeparator />

            {/* Today's Arrivals */}
            {notifications.todaysArrivals > 0 && (
              <>
                <DropdownMenuItem
                  className="cursor-pointer flex-col items-start gap-1 p-3"
                  onClick={() => {
                    navigate('/admin/arrivals');
                    setNotificationsOpen(false);
                  }}
                >
                  <div className="flex items-center gap-2 w-full">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-100 border border-blue-200">
                      <CheckCircle className="size-4 text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">Today's Arrivals</p>
                      <p className="text-xs text-muted-foreground">
                        {notifications.todaysArrivals} vehicle{notifications.todaysArrivals !== 1 ? 's' : ''} arriving today
                      </p>
                    </div>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
              </>
            )}

            {/* Pending Check-ins */}
            {notifications.pendingCheckIns > 0 && (
              <>
                <DropdownMenuItem
                  className="cursor-pointer flex-col items-start gap-1 p-3"
                  onClick={() => {
                    navigate('/admin/arrivals');
                    setNotificationsOpen(false);
                  }}
                >
                  <div className="flex items-center gap-2 w-full">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-orange-100 border border-orange-200">
                      <img src="/icons/bell.svg" alt="Pending" className="size-4 text-orange-600" style={{ filter: 'invert(38%) sepia(96%) saturate(1824%) hue-rotate(360deg) brightness(95%) contrast(101%)' }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">Pending Check-ins</p>
                      <p className="text-xs text-muted-foreground">
                        {notifications.pendingCheckIns} vehicle{notifications.pendingCheckIns !== 1 ? 's' : ''} waiting to check in
                      </p>
                    </div>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
              </>
            )}

            {/* Recent Bookings */}
            {notifications.recentBookings.length > 0 && (
              <>
                <div className="px-2 py-1.5">
                  <p className="text-xs font-semibold text-muted-foreground">Recent Bookings</p>
                </div>
                {notifications.recentBookings.map((booking) => (
                  <DropdownMenuItem
                    key={booking.id}
                    className="cursor-pointer flex-col items-start gap-1 p-3"
                    onClick={() => {
                      navigate(`/admin/bookings/${booking.id}`);
                      setNotificationsOpen(false);
                    }}
                  >
                    <div className="flex items-center gap-2 w-full">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-green-100 border border-green-200">
                        <span className="text-xs font-semibold text-green-600">
                          {booking.first_name[0]}{booking.last_name[0]}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {booking.first_name} {booking.last_name}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {booking.cruise_line} - £{(booking.total / 100).toFixed(2)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(booking.created_at), { addSuffix: true })}
                        </p>
                      </div>
                    </div>
                  </DropdownMenuItem>
                ))}
              </>
            )}

            {notifications.unreadCount === 0 && (
              <div className="py-8 text-center">
                <img src="/icons/bell.svg" alt="Bell" className="mx-auto size-8 mb-2 opacity-50" />
                <p className="text-sm text-muted-foreground">No new notifications</p>
              </div>
            )}

            {notifications.unreadCount > 0 && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="cursor-pointer justify-center text-sm font-medium text-primary"
                  onClick={() => {
                    navigate('/admin/bookings');
                    setNotificationsOpen(false);
                  }}
                >
                  View all bookings
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="cursor-pointer"
            >
              <img src="/icons/profile.svg" alt="Profile" className="size-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-72">
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col gap-1">
                <p className="text-sm font-semibold leading-tight break-all">
                  {adminUser?.email || 'admin@example.com'}
                </p>
                <Badge variant="secondary" className="mt-1 w-fit text-xs">
                  {adminUser?.role || 'Administrator'}
                </Badge>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="cursor-pointer"
              onClick={() => navigate('/admin/configuration')}
            >
              <img src="/icons/platform-configration.svg" alt="Settings" className="mr-2 size-4" />
              <span>Platform Settings</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              className="cursor-pointer"
              onClick={() => navigate('/admin/account')}
            >
              <img src="/icons/profile.svg" alt="Account" className="mr-2 size-4" />
              <span>Account</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="cursor-pointer text-red-600 focus:text-red-600 hover:bg-red-50"
              onClick={() => setSignOutDialogOpen(true)}
            >
              <img src="/icons/logout.svg" alt="Logout" className="mr-2 size-4" style={{ filter: 'invert(28%) sepia(90%) saturate(4584%) hue-rotate(353deg) brightness(94%) contrast(101%)' }} />
              <span>Sign out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Sign Out Confirmation Dialog */}
        <AlertDialog open={signOutDialogOpen} onOpenChange={setSignOutDialogOpen}>
          <AlertDialogContent data-admin-page="">
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure you want to sign out?</AlertDialogTitle>
              <AlertDialogDescription>
                You will be redirected to the login page and will need to sign in again to access the admin panel.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setSignOutDialogOpen(false)}>
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                variant="destructive"
                onClick={handleSignOut}
                className="cursor-pointer"
              >
                Sign out
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </header>
  );
};

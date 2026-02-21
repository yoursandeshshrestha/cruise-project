import React, { useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { cn } from '../../../lib/utils';
import { useAdminSidebar } from '../../../contexts/AdminSidebarContext';
import { useAuthStore } from '../../../stores/authStore';
import { useNotificationsStore } from '../../../stores/notificationsStore';

interface NavItem {
  title: string;
  href: string;
  icon?: React.ElementType;
  iconSrc?: string;
  badge?: string;
}

interface NavGroup {
  label: string;
  items: NavItem[];
}

const navGroups: NavGroup[] = [
  {
    label: 'Overview',
    items: [
      {
        title: 'Dashboard',
        href: '/admin/dashboard',
        iconSrc: '/icons/dashboard.svg',
      },
      {
        title: 'Analytics',
        href: '/admin/analytics',
        iconSrc: '/icons/analytics.svg',
      },
    ],
  },
  {
    label: 'Operations',
    items: [
      {
        title: 'Bookings',
        href: '/admin/bookings',
        iconSrc: '/icons/booking.svg',
      },
      {
        title: 'Arrivals Today',
        href: '/admin/arrivals',
        iconSrc: '/icons/time.svg',
      },
    ],
  },
  {
    label: 'Support',
    items: [
      {
        title: 'Contact Submissions',
        href: '/admin/contact-submissions',
        iconSrc: '/icons/contact.svg',
      },
    ],
  },
  {
    label: 'Configuration',
    items: [
      {
        title: 'Cruise Lines',
        href: '/admin/cruise-lines',
        iconSrc: '/icons/ship.svg',
      },
      {
        title: 'Terminals',
        href: '/admin/terminals',
        iconSrc: '/icons/location.svg',
      },
      {
        title: 'Add-ons',
        href: '/admin/add-ons',
        iconSrc: '/icons/add-ons.svg',
      },
      {
        title: 'Promo Codes',
        href: '/admin/promo-codes',
        iconSrc: '/icons/promo.svg',
      },
      {
        title: 'Pricing',
        href: '/admin/pricing',
        iconSrc: '/icons/money.svg',
      },
    ],
  },
  {
    label: 'System',
    items: [
      {
        title: 'Admin Users',
        href: '/admin/users',
        iconSrc: '/icons/admin-users.svg',
      },
      {
        title: 'Settings',
        href: '/admin/configuration',
        iconSrc: '/icons/platform-configration.svg',
      },
    ],
  },
];

export const Sidebar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isCollapsed } = useAdminSidebar();
  const { signOut } = useAuthStore();
  const { arrivalsCount, newContactSubmissionsCount, initialize, cleanup } = useNotificationsStore();

  useEffect(() => {
    initialize();
    return () => {
      cleanup();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSignOut = async () => {
    await signOut();
    navigate('/admin/login');
  };

  // Add badge counts to nav items
  const getNavItemBadge = (href: string): string | undefined => {
    if (href === '/admin/arrivals' && arrivalsCount > 0) {
      return arrivalsCount.toString();
    }
    if (href === '/admin/contact-submissions' && newContactSubmissionsCount > 0) {
      return newContactSubmissionsCount.toString();
    }
    return undefined;
  };

  return (
    <div className="flex h-full flex-col bg-sidebar text-sidebar-foreground border-r border-sidebar-border">
      {/* Logo/Header */}
      <div className="flex flex-col gap-2 p-2 pb-0">
        <div className={`flex w-full items-center rounded-lg px-2 ${isCollapsed ? 'justify-center h-12' : 'gap-3 h-14'}`}>
          {/* Logo Icon */}
          <div className="shrink-0">
            <svg
              className={isCollapsed ? "w-10 h-10" : "w-14 h-14"}
              viewBox="0 0 120 80"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-label="SimpleCruise Logo"
            >
              {/* Superstructure Stripes */}
              <path
                d="M35 25 C 50 15, 75 12, 95 22"
                stroke="currentColor"
                strokeWidth="5"
                strokeLinecap="round"
                className="text-sidebar-foreground"
              />
              <path
                d="M30 35 C 45 25, 70 22, 90 32"
                stroke="currentColor"
                strokeWidth="5"
                strokeLinecap="round"
                className="text-sidebar-foreground"
              />

              {/* Hull */}
              <path
                d="M15 50 C 35 42, 70 35, 110 30 L 100 55 C 75 62, 45 62, 20 55 Z"
                fill="currentColor"
                className="text-sidebar-foreground"
              />

              {/* Waves */}
              <path
                d="M20 65 C 40 70, 70 65, 95 60"
                stroke="#00A9FE"
                strokeWidth="4"
                strokeLinecap="round"
              />
              <path
                d="M30 74 C 50 79, 80 74, 90 70"
                stroke="#00A9FE"
                strokeWidth="4"
                strokeLinecap="round"
              />
            </svg>
          </div>

          {/* Brand Name */}
          {!isCollapsed && (
            <div className="flex min-w-0 flex-1 flex-col">
              <span className="truncate text-[13px] font-semibold leading-tight text-sidebar-foreground">
                SimpleCruise
              </span>
              <span className="truncate text-[11px] leading-tight text-sidebar-foreground/60">
                Parking Admin
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 px-1">
        <div className="flex flex-col gap-2">
          {navGroups.map((group, groupIndex) => (
            <div key={groupIndex}>
              {!isCollapsed && (
                <div className="px-3 py-1.5">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-sidebar-foreground/50">
                    {group.label}
                  </span>
                </div>
              )}
              <div className="space-y-0.5 px-2">
                {group.items.map((item) => {
                  const isActive = location.pathname === item.href;
                  const badge = getNavItemBadge(item.href) || item.badge;
                  return (
                    <Link
                      key={item.href}
                      to={item.href}
                      className={cn(
                        'group flex w-full items-center gap-2 overflow-hidden rounded-md p-1.5 text-left transition-colors h-8 text-[13px] font-[450] cursor-pointer',
                        isActive
                          ? 'bg-sidebar-accent text-sidebar-accent-foreground font-medium'
                          : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground',
                        isCollapsed ? 'justify-center px-2' : 'pl-2'
                      )}
                    >
                      <div className="shrink-0 relative">
                        {item.iconSrc ? (
                          <img src={item.iconSrc} alt={item.title} className="size-4" />
                        ) : item.icon ? (
                          <item.icon className="size-4" />
                        ) : null}
                        {isCollapsed && badge && (
                          <span className="absolute -top-1 -right-1 inline-flex items-center justify-center rounded-full bg-red-500 text-white w-4 h-4 text-[10px] font-bold">
                            {badge}
                          </span>
                        )}
                      </div>
                      {!isCollapsed && (
                        <>
                          <span className="flex-1 truncate transition-[letter-spacing] duration-150 group-hover:tracking-wide">
                            {item.title}
                          </span>
                          {badge && (
                            <span className="inline-flex items-center justify-center rounded-full bg-red-500 text-white px-2 py-0.5 text-xs font-medium min-w-[20px]">
                              {badge}
                            </span>
                          )}
                        </>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer - Actions */}
      {!isCollapsed && (
        <div className="mt-auto p-2">
          <div className="flex flex-col gap-1">
            <Link
              to="/"
              className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors cursor-pointer"
            >
              <img src="/icons/home.svg" alt="Home" className="size-4" />
              <span>Home</span>
            </Link>
            <button
              onClick={handleSignOut}
              className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors cursor-pointer w-full text-left"
            >
              <img src="/icons/logout.svg" alt="Logout" className="size-4" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

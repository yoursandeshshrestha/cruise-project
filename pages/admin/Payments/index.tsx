import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AdminLayout } from '../../../components/admin/AdminLayout';
import { KPICard } from '../../../components/admin/KPICard';
import { supabase, type Payment } from '../../../lib/supabase';
import { Search, Download, X, ExternalLink } from 'lucide-react';
import { format } from 'date-fns';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../../components/admin/ui/table';
import { Button } from '../../../components/admin/ui/button';
import { Badge } from '../../../components/admin/ui/badge';
import { Input } from '../../../components/admin/ui/input';
import { Spinner } from '../../../components/admin/ui/spinner';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/admin/ui/select';

interface PaymentStats {
  totalRevenue: number;
  totalTransactions: number;
  averageTransaction: number;
  revenueThisMonth: number;
}

export const Payments: React.FC = () => {
  const navigate = useNavigate();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [displayCount, setDisplayCount] = useState(50);
  const [stats, setStats] = useState<PaymentStats>({
    totalRevenue: 0,
    totalTransactions: 0,
    averageTransaction: 0,
    revenueThisMonth: 0,
  });

  // Fetch payments
  const fetchPayments = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('payments')
        .select(`
          *,
          bookings (
            booking_reference,
            first_name,
            last_name,
            email
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPayments((data || []) as Payment[]);

      // Calculate stats
      const completedPayments = ((data || []) as Payment[]).filter((p: Payment) => p.status === 'completed');
      const totalRevenue = completedPayments.reduce((sum: number, p: Payment) => sum + p.amount, 0);
      const totalTransactions = completedPayments.length;
      const averageTransaction = totalTransactions > 0 ? totalRevenue / totalTransactions : 0;

      const now = new Date();
      const currentMonth = now.getMonth();
      const currentYear = now.getFullYear();
      const revenueThisMonth = completedPayments
        .filter((p: Payment) => {
          const paymentDate = new Date(p.created_at);
          return paymentDate.getMonth() === currentMonth && paymentDate.getFullYear() === currentYear;
        })
        .reduce((sum: number, p: Payment) => sum + p.amount, 0);

      setStats({
        totalRevenue,
        totalTransactions,
        averageTransaction,
        revenueThisMonth,
      });
    } catch (error) {
      console.error('Error fetching payments:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  // Filter payments
  const filteredPayments = React.useMemo(() => {
    let filtered = [...payments];

    if (statusFilter !== 'all') {
      filtered = filtered.filter(p => p.status === statusFilter);
    }

    if (typeFilter !== 'all') {
      filtered = filtered.filter(p => p.payment_type === typeFilter);
    }

    if (searchQuery) {
      const term = searchQuery.toLowerCase();
      filtered = filtered.filter(p =>
        p.bookings?.booking_reference?.toLowerCase().includes(term) ||
        p.bookings?.email?.toLowerCase().includes(term) ||
        `${p.bookings?.first_name} ${p.bookings?.last_name}`.toLowerCase().includes(term) ||
        p.stripe_payment_intent_id?.toLowerCase().includes(term)
      );
    }

    return filtered;
  }, [payments, statusFilter, typeFilter, searchQuery]);

  const displayedPayments = filteredPayments.slice(0, displayCount);
  const hasMore = displayedPayments.length < filteredPayments.length;

  const handleLoadMore = () => {
    setDisplayCount(prev => prev + 50);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 border border-green-200 hover:bg-green-100';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border border-yellow-200 hover:bg-yellow-100';
      case 'failed':
        return 'bg-red-100 text-red-800 border border-red-200 hover:bg-red-100';
      case 'refunded':
        return 'bg-purple-100 text-purple-800 border border-purple-200 hover:bg-purple-100';
      case 'cancelled':
        return 'bg-slate-100 text-slate-800 border border-slate-200 hover:bg-slate-100';
      default:
        return 'bg-slate-100 text-slate-800 border border-slate-200 hover:bg-slate-100';
    }
  };

  const getPaymentTypeBadge = (type: string) => {
    return type === 'new_booking'
      ? <Badge className="bg-blue-100 text-blue-800 border border-blue-200 hover:bg-blue-100">New Booking</Badge>
      : <Badge className="bg-purple-100 text-purple-800 border border-purple-200 hover:bg-purple-100">Amendment</Badge>;
  };

  const formatDateTime = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMM dd, yyyy HH:mm');
    } catch {
      return dateString;
    }
  };

  const exportToCSV = () => {
    const headers = ['Date', 'Type', 'Booking Ref', 'Customer', 'Email', 'Amount', 'Subtotal', 'VAT', 'Status', 'Payment ID'];
    const rows = filteredPayments.map(p => [
      format(new Date(p.created_at), 'yyyy-MM-dd HH:mm'),
      p.payment_type === 'new_booking' ? 'New Booking' : 'Amendment',
      p.bookings?.booking_reference || '',
      `${p.bookings?.first_name || ''} ${p.bookings?.last_name || ''}`,
      p.bookings?.email || '',
      `£${(p.amount / 100).toFixed(2)}`,
      `£${(p.subtotal / 100).toFixed(2)}`,
      `£${(p.vat / 100).toFixed(2)}`,
      p.status,
      p.stripe_payment_intent_id || '',
    ]);

    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `payments-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const breadcrumbs = [
    { label: 'Dashboard', href: '/admin/dashboard' },
    { label: 'Payments' }
  ];

  if (loading && payments.length === 0) {
    return (
      <AdminLayout showSidebar showHeader breadcrumbs={breadcrumbs}>
        <div className="flex items-center justify-center h-full p-8">
          <div className="text-center">
            <Spinner className="h-8 w-8 mx-auto mb-4" />
            <p className="text-muted-foreground">Loading payments...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout showSidebar showHeader breadcrumbs={breadcrumbs}>
      <div className="p-6 space-y-6">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <KPICard
            title="Total Revenue"
            value={`£${(stats.totalRevenue / 100).toFixed(2)}`}
            change={null}
          />
          <KPICard
            title="Transactions"
            value={stats.totalTransactions.toString()}
            change={null}
          />
          <KPICard
            title="Average Transaction"
            value={`£${(stats.averageTransaction / 100).toFixed(2)}`}
            change={null}
          />
          <KPICard
            title="This Month"
            value={`£${(stats.revenueThisMonth / 100).toFixed(2)}`}
            change={null}
          />
        </div>

        {/* Filters and Actions */}
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
          <div className="flex flex-col md:flex-row gap-4 flex-1 w-full">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search by booking ref, customer, email, or payment ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Type Filter */}
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Payment Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="new_booking">New Booking</SelectItem>
                <SelectItem value="amendment">Amendment</SelectItem>
              </SelectContent>
            </Select>

            {/* Status Filter */}
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
                <SelectItem value="refunded">Refunded</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>

            {/* Clear Filters */}
            {(searchQuery || statusFilter !== 'all' || typeFilter !== 'all') && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSearchQuery('');
                  setStatusFilter('all');
                  setTypeFilter('all');
                }}
                className="cursor-pointer"
              >
                <X className="h-4 w-4 mr-2" />
                Clear
              </Button>
            )}
          </div>

          {/* Export Button */}
          <Button onClick={exportToCSV} className="cursor-pointer">
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        </div>

        {/* Results Count */}
        <div className="text-sm text-muted-foreground">
          Showing {displayedPayments.length} of {filteredPayments.length} payments
        </div>

        {/* Table */}
        <div className="border rounded-lg bg-admin-card-bg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Booking Ref</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Payment ID</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {displayedPayments.map((payment) => (
                <TableRow key={payment.id} className="cursor-pointer hover:bg-muted/50">
                  <TableCell className="font-medium">
                    {formatDateTime(payment.created_at)}
                  </TableCell>
                  <TableCell>
                    {getPaymentTypeBadge(payment.payment_type)}
                  </TableCell>
                  <TableCell>
                    <button
                      onClick={() => navigate(`/admin/bookings/${payment.booking_id}`)}
                      className="text-primary hover:underline font-medium cursor-pointer"
                    >
                      {payment.bookings?.booking_reference || '—'}
                    </button>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="font-medium">
                        {payment.bookings?.first_name} {payment.bookings?.last_name}
                      </div>
                      <div className="text-xs text-muted-foreground">{payment.bookings?.email}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="font-semibold">£{(payment.amount / 100).toFixed(2)}</div>
                      <div className="text-xs text-muted-foreground">
                        {payment.vat > 0 ? (
                          <>Sub: £{(payment.subtotal / 100).toFixed(2)} + VAT: £{(payment.vat / 100).toFixed(2)}</>
                        ) : (
                          <>Subtotal: £{(payment.subtotal / 100).toFixed(2)}</>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(payment.status)}>
                      {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {payment.stripe_payment_intent_id ? (
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono text-muted-foreground">
                          {payment.stripe_payment_intent_id.slice(-12)}
                        </span>
                        <a
                          href={`https://dashboard.stripe.com/payments/${payment.stripe_payment_intent_id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:text-primary-dark cursor-pointer"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      </div>
                    ) : (
                      <span className="text-xs text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => navigate(`/admin/bookings/${payment.booking_id}`)}
                      className="cursor-pointer"
                    >
                      View Booking
                    </Button>
                  </TableCell>
                </TableRow>
              ))}

              {displayedPayments.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-12">
                    <div className="text-muted-foreground">
                      {searchQuery || statusFilter !== 'all' || typeFilter !== 'all'
                        ? 'No payments found matching your filters'
                        : 'No payments recorded yet'}
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Load More */}
        {hasMore && (
          <div className="flex justify-center">
            <Button
              variant="outline"
              onClick={handleLoadMore}
              disabled={loading}
              className="cursor-pointer"
            >
              {loading ? <Spinner className="h-4 w-4 mr-2" /> : null}
              Load More
            </Button>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

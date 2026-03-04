import React, { useEffect, useState } from 'react';
import { AdminLayout } from '../../../components/admin/AdminLayout';
import { useContactStore } from '../../../stores/contactStore';
import { formatDateShort, formatDateTime } from '../../../lib/dateUtils';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../../components/admin/ui/table';
import { Button } from '../../../components/admin/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../../components/admin/ui/dialog';
import { Label } from '../../../components/admin/ui/label';
import { Textarea } from '../../../components/admin/ui/textarea';
import { Spinner } from '../../../components/admin/ui/spinner';
import { Badge } from '../../../components/admin/ui/badge';
import { KPICard } from '../../../components/admin/KPICard';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/admin/ui/select';
import { Eye, Mail, Phone, Calendar } from 'lucide-react';
import { toast } from 'sonner';
import type { Database } from '../../../lib/supabase';

type ContactSubmission = Database['public']['Tables']['contact_submissions']['Row'];

export const ContactSubmissions: React.FC = () => {
  const { submissions, isLoading, fetchSubmissions, updateSubmission } = useContactStore();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState<ContactSubmission | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [adminNotes, setAdminNotes] = useState('');
  const [newStatus, setNewStatus] = useState('');
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchSubmissions();
  }, [fetchSubmissions]);

  const handleOpenDialog = (submission: ContactSubmission) => {
    setSelectedSubmission(submission);
    setAdminNotes(submission.admin_notes || '');
    setNewStatus(submission.status);
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setSelectedSubmission(null);
    setAdminNotes('');
    setNewStatus('');
  };

  const handleUpdateSubmission = async () => {
    if (!selectedSubmission) return;

    setUpdating(true);
    try {
      await updateSubmission(selectedSubmission.id, {
        status: newStatus,
        admin_notes: adminNotes || null,
      });

      toast.success('Submission updated successfully');
      handleCloseDialog();
    } catch (error) {
      toast.error('Failed to update submission');
    } finally {
      setUpdating(false);
    }
  };

  const filteredSubmissions = submissions.filter((sub) =>
    statusFilter === 'all' ? true : sub.status === statusFilter
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'new':
        return (
          <Badge className="bg-orange-100 text-orange-800 border border-orange-200 hover:bg-orange-100 cursor-pointer">
            New
          </Badge>
        );
      case 'in_progress':
        return (
          <Badge className="bg-blue-100 text-blue-800 border border-blue-200 hover:bg-blue-100 cursor-pointer">
            In Progress
          </Badge>
        );
      case 'resolved':
        return (
          <Badge className="bg-green-100 text-green-800 border border-green-200 hover:bg-green-100 cursor-pointer">
            Resolved
          </Badge>
        );
      default:
        return <Badge className="cursor-pointer">{status}</Badge>;
    }
  };

  const breadcrumbs = [
    { label: 'Dashboard', href: '/admin/dashboard' },
    { label: 'Contact Submissions' }
  ];

  return (
    <AdminLayout showSidebar showHeader breadcrumbs={breadcrumbs}>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold mb-2">Contact Submissions</h1>
            <p className="text-muted-foreground">
              View and manage customer contact requests
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <KPICard
            title="Total Submissions"
            value={submissions.length}
            loading={isLoading}
          />
          <KPICard
            title="New"
            value={submissions.filter(s => s.status === 'new').length}
            loading={isLoading}
          />
          <KPICard
            title="In Progress"
            value={submissions.filter(s => s.status === 'in_progress').length}
            loading={isLoading}
          />
          <KPICard
            title="Resolved"
            value={submissions.filter(s => s.status === 'resolved').length}
            loading={isLoading}
          />
        </div>

        {/* Filters */}
        <div className="flex gap-4">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px] cursor-pointer">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all" className="cursor-pointer">All Status</SelectItem>
              <SelectItem value="new" className="cursor-pointer">New</SelectItem>
              <SelectItem value="in_progress" className="cursor-pointer">In Progress</SelectItem>
              <SelectItem value="resolved" className="cursor-pointer">Resolved</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Table */}
        <div className="border rounded-lg">
          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <Spinner className="h-8 w-8" />
            </div>
          ) : filteredSubmissions.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              No contact submissions found
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead>Booking Ref</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSubmissions.map((submission) => (
                  <TableRow key={submission.id}>
                    <TableCell>
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar size={14} className="text-muted-foreground" />
                        {formatDateShort(submission.created_at)}
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">{submission.name}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 text-sm">
                        <Mail size={14} className="text-muted-foreground" />
                        {submission.email}
                      </div>
                    </TableCell>
                    <TableCell className="max-w-xs truncate">
                      {submission.subject || '-'}
                    </TableCell>
                    <TableCell>
                      {submission.booking_reference || '-'}
                    </TableCell>
                    <TableCell>{getStatusBadge(submission.status)}</TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleOpenDialog(submission)}
                        className="cursor-pointer"
                      >
                        <Eye size={16} />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>

        {/* View/Edit Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={(open) => { if (!open) handleCloseDialog(); }}>
          <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-hidden flex flex-col">
            <DialogHeader>
              <DialogTitle>Contact Submission Details</DialogTitle>
              <DialogDescription>
                View and update this contact submission
              </DialogDescription>
            </DialogHeader>

            {selectedSubmission && (
              <>
                <div className="space-y-4 py-4 overflow-y-auto flex-1">
                  {/* Contact Info */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground">Name</Label>
                      <p className="text-sm font-medium">{selectedSubmission.name}</p>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground">Email</Label>
                      <p className="text-sm font-medium">{selectedSubmission.email}</p>
                    </div>
                    {selectedSubmission.phone && (
                      <div className="space-y-1">
                        <Label className="text-xs text-muted-foreground">Phone</Label>
                        <p className="text-sm font-medium">{selectedSubmission.phone}</p>
                      </div>
                    )}
                    {selectedSubmission.booking_reference && (
                      <div className="space-y-1">
                        <Label className="text-xs text-muted-foreground">Booking Reference</Label>
                        <p className="text-sm font-medium">{selectedSubmission.booking_reference}</p>
                      </div>
                    )}
                  </div>

                  {/* Subject */}
                  {selectedSubmission.subject && (
                    <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground">Subject</Label>
                      <p className="text-sm font-medium">{selectedSubmission.subject}</p>
                    </div>
                  )}

                  {/* Message */}
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground">Message</Label>
                    <div className="bg-muted p-3 rounded-md text-sm whitespace-pre-wrap">
                      {selectedSubmission.message}
                    </div>
                  </div>

                  {/* Status */}
                  <div className="space-y-2">
                    <Label htmlFor="status">Status</Label>
                    <Select value={newStatus} onValueChange={setNewStatus}>
                      <SelectTrigger id="status" className="cursor-pointer">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="new" className="cursor-pointer">New</SelectItem>
                        <SelectItem value="in_progress" className="cursor-pointer">In Progress</SelectItem>
                        <SelectItem value="resolved" className="cursor-pointer">Resolved</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Admin Notes */}
                  <div className="space-y-2">
                    <Label htmlFor="admin-notes">Admin Notes</Label>
                    <Textarea
                      id="admin-notes"
                      value={adminNotes}
                      onChange={(e) => setAdminNotes(e.target.value)}
                      rows={4}
                      placeholder="Add internal notes..."
                    />
                  </div>

                  {/* Timestamps */}
                  <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-300">
                    <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground">Submitted</Label>
                      <p className="text-xs">{formatDateTime(selectedSubmission.created_at)}</p>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground">Last Updated</Label>
                      <p className="text-xs">{formatDateTime(selectedSubmission.updated_at)}</p>
                    </div>
                  </div>
                </div>

                <DialogFooter className="gap-2">
                  <Button
                    variant="outline"
                    onClick={handleCloseDialog}
                    disabled={updating}
                    className="cursor-pointer"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleUpdateSubmission}
                    disabled={updating}
                    className="cursor-pointer"
                  >
                    {updating ? (
                      <>
                        <Spinner className="w-4 h-4 mr-2" />
                        Updating...
                      </>
                    ) : (
                      'Update'
                    )}
                  </Button>
                </DialogFooter>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
};

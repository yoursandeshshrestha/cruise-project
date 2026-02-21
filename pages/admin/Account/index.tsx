import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../../stores/authStore';
import { AdminLayout } from '../../../components/admin/AdminLayout';
import { Button } from '../../../components/admin/ui/button';
import { Badge } from '../../../components/admin/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../../../components/admin/ui/alert-dialog';
import { format } from 'date-fns';
import { supabase } from '../../../lib/supabase';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export const Account: React.FC = () => {
  const { adminUser, user, signOut } = useAuthStore();
  const navigate = useNavigate();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteAccount = async () => {
    if (!user?.id) {
      toast.error('No user session found');
      return;
    }

    setIsDeleting(true);
    try {
      // Call RPC function to delete both admin_users record and auth user
      // Migration: supabase/migrations/010_delete_user_function.sql
      const { error: rpcError } = await supabase.rpc('delete_current_user');

      if (rpcError) {
        console.error('RPC Error:', rpcError);

        // If function doesn't exist, show helpful error message
        if (rpcError.message.includes('function') || rpcError.message.includes('does not exist')) {
          throw new Error('Database migration required. Please run: supabase db push');
        }

        throw new Error(rpcError.message);
      }

      // Sign out and redirect
      await signOut();
      navigate('/admin/login');
    } catch (error) {
      console.error('Error deleting account:', error);
      toast.error(`Failed to delete account: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setIsDeleting(false);
      setDeleteDialogOpen(false);
    }
  };

  return (
    <AdminLayout
      showSidebar
      showHeader
      breadcrumbs={[
        { label: 'Dashboard', href: '/admin/dashboard' },
        { label: 'Account' }
      ]}
    >
      <div className="p-6 max-w-4xl">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Account Settings</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage your account information and preferences
          </p>
        </div>

        {/* Account Information */}
        <div className="bg-card rounded-lg border p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Account Information</h2>

          <div className="space-y-4">
            {/* Email */}
            <div className="flex items-center justify-between py-3 border-b">
              <div>
                <p className="text-sm font-medium">Email Address</p>
                <p className="text-sm text-muted-foreground mt-0.5">
                  {adminUser?.email || 'Not available'}
                </p>
              </div>
              <Badge variant="secondary">{adminUser?.role || 'Admin'}</Badge>
            </div>

            {/* Account Created */}
            <div className="flex items-center justify-between py-3 border-b">
              <div>
                <p className="text-sm font-medium">Account Created</p>
                <p className="text-sm text-muted-foreground mt-0.5">
                  {user?.created_at
                    ? format(new Date(user.created_at), 'MMMM dd, yyyy')
                    : 'Not available'}
                </p>
              </div>
            </div>

            {/* Last Login */}
            <div className="flex items-center justify-between py-3">
              <div>
                <p className="text-sm font-medium">Last Login</p>
                <p className="text-sm text-muted-foreground mt-0.5">
                  {adminUser?.last_login
                    ? format(new Date(adminUser.last_login), 'MMMM dd, yyyy h:mm a')
                    : 'Not available'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Password Change */}
        <div className="bg-card rounded-lg border p-6 mb-6">
          <h2 className="text-lg font-semibold mb-2">Password</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Change your password to keep your account secure
          </p>

          <Button disabled className="cursor-not-allowed opacity-50">
            Change Password
          </Button>
          <p className="text-xs text-muted-foreground mt-2">
            Password change feature will be available after Mailgun integration
          </p>
        </div>

        {/* Delete Account */}
        <div className="bg-card rounded-lg border border-red-200 p-6">
          <h2 className="text-lg font-semibold text-red-600 mb-2">Danger Zone</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Once you delete your account, there is no going back. Please be certain.
          </p>

          <Button
            variant="destructive"
            onClick={() => setDeleteDialogOpen(true)}
            className="cursor-pointer"
          >
            Delete Account
          </Button>
        </div>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent data-admin-page="">
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete your account
                and remove all your data from our servers.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setDeleteDialogOpen(false)}>
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                variant="destructive"
                onClick={handleDeleteAccount}
                disabled={isDeleting}
                className="cursor-pointer"
              >
                {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isDeleting ? 'Deleting...' : 'Delete Account'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </AdminLayout>
  );
};

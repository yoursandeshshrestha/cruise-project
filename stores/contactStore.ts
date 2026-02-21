import { create } from 'zustand';
import { supabase, type Database } from '../lib/supabase';

type ContactSubmission = Database['public']['Tables']['contact_submissions']['Row'];
type ContactSubmissionInsert = Database['public']['Tables']['contact_submissions']['Insert'];
type ContactSubmissionUpdate = Database['public']['Tables']['contact_submissions']['Update'];

interface ContactStore {
  submissions: ContactSubmission[];
  isLoading: boolean;
  error: string | null;
  fetchSubmissions: () => Promise<void>;
  submitContactForm: (data: ContactSubmissionInsert) => Promise<void>;
  updateSubmission: (id: string, data: ContactSubmissionUpdate) => Promise<void>;
  getSubmissionById: (id: string) => Promise<ContactSubmission | null>;
}

export const useContactStore = create<ContactStore>((set, get) => ({
  submissions: [],
  isLoading: false,
  error: null,

  fetchSubmissions: async () => {
    set({ isLoading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('contact_submissions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      set({ submissions: data || [], isLoading: false });
    } catch (error) {
      console.error('Error fetching contact submissions:', error);
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  submitContactForm: async (data: ContactSubmissionInsert) => {
    set({ isLoading: true, error: null });
    try {
      const { error } = await supabase
        .from('contact_submissions')
        .insert(data);

      if (error) throw error;

      set({ isLoading: false });
    } catch (error) {
      console.error('Error submitting contact form:', error);
      set({ error: (error as Error).message, isLoading: false });
      throw error;
    }
  },

  updateSubmission: async (id: string, data: ContactSubmissionUpdate) => {
    set({ isLoading: true, error: null });
    try {
      const { error } = await supabase
        .from('contact_submissions')
        .update(data)
        .eq('id', id);

      if (error) throw error;

      // Refresh the list
      await get().fetchSubmissions();
      set({ isLoading: false });
    } catch (error) {
      console.error('Error updating contact submission:', error);
      set({ error: (error as Error).message, isLoading: false });
      throw error;
    }
  },

  getSubmissionById: async (id: string) => {
    try {
      const { data, error } = await supabase
        .from('contact_submissions')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;

      return data;
    } catch (error) {
      console.error('Error fetching contact submission:', error);
      return null;
    }
  },
}));

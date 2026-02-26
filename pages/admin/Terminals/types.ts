export interface Terminal {
  id: string;
  name: string;
  location: string | null;
  description: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface TerminalFormData {
  id?: string;
  name: string;
  location: string;
  description: string;
}

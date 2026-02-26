export interface CruiseLineFormData {
  id?: string;
  name: string;
  ships: string[];
}

export interface CruiseLine {
  id: string;
  name: string;
  ships: string[];
  is_active: boolean;
  created_at: string;
}

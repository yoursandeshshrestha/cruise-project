export interface AddOnFormData {
  id?: string;
  slug: string;
  name: string;
  description: string;
  price: string;
}

export interface AddOn {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  price: number;
  icon: string | null;
  is_active: boolean;
  display_order: number;
}

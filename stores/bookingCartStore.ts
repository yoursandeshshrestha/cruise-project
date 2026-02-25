import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface BookingCartState {
  selectedAddOnSlugs: string[];

  // Actions
  addAddOn: (addOnSlug: string) => void;
  removeAddOn: (addOnSlug: string) => void;
  clearCart: () => void;
  hasAddOn: (addOnSlug: string) => boolean;
  getAddOns: () => string[];
}

export const useBookingCartStore = create<BookingCartState>()(
  persist(
    (set, get) => ({
      selectedAddOnSlugs: [],

      addAddOn: (addOnSlug: string) => {
        const current = get().selectedAddOnSlugs;
        if (!current.includes(addOnSlug)) {
          set({ selectedAddOnSlugs: [...current, addOnSlug] });
          console.log('[BookingCartStore] Added add-on:', addOnSlug);
        }
      },

      removeAddOn: (addOnSlug: string) => {
        set({
          selectedAddOnSlugs: get().selectedAddOnSlugs.filter(slug => slug !== addOnSlug)
        });
        console.log('[BookingCartStore] Removed add-on:', addOnSlug);
      },

      clearCart: () => {
        set({ selectedAddOnSlugs: [] });
        console.log('[BookingCartStore] Cart cleared');
      },

      hasAddOn: (addOnSlug: string) => {
        return get().selectedAddOnSlugs.includes(addOnSlug);
      },

      getAddOns: () => {
        return get().selectedAddOnSlugs;
      },
    }),
    {
      name: 'booking-cart-storage',
    }
  )
);

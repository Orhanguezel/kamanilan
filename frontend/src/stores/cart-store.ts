import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Listing } from "@/modules/listing/listing.types";

interface CartItem {
  id: string;
  listing: Listing;
  quantity: number;
}

interface CartState {
  items: CartItem[];
  addItem: (listing: Listing) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: () => number;
  setItems: (items: CartItem[]) => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (listing) => {
        const { items } = get();
        const existing = items.find((i) => i.id === listing.id);

        if (existing) {
          set({
            items: items.map((i) =>
              i.id === listing.id ? { ...i, quantity: i.quantity + 1 } : i
            ),
          });
        } else {
          set({ items: [...items, { id: listing.id, listing, quantity: 1 }] });
        }
      },
      removeItem: (id) => {
        set({ items: get().items.filter((i) => i.id !== id) });
      },
      updateQuantity: (id, quantity) => {
        set({
          items: get().items.map((i) =>
            i.id === id ? { ...i, quantity: Math.max(1, quantity) } : i
          ),
        });
      },
      clearCart: () => set({ items: [] }),
      totalItems: () =>
        get().items.filter((i) => i.listing).reduce((acc, i) => acc + i.quantity, 0),
      setItems: (items) => set({ items }),
    }),
    {
      name: "cart-storage",
      version: 2,
      migrate: (persisted: unknown, version) => {
        if (!persisted || typeof persisted !== "object") return { items: [] };
        if (version < 2) {
          // v1 → v2: purge items that lost their listing payload after schema changes
          const state = persisted as { items?: CartItem[] };
          return { items: (state.items ?? []).filter((i) => i && i.listing) };
        }
        return persisted as CartState;
      },
    }
  )
);

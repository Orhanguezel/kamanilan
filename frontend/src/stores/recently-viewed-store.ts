import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface RecentlyViewedItem {
  slug: string;
  title: string;
  image?: string;
  price?: number;
  currency?: string;
  category?: string;
}

interface RecentlyViewedState {
  items: RecentlyViewedItem[];
  addItem: (item: RecentlyViewedItem) => void;
  removeItem: (slug: string) => void;
  clearAll: () => void;
}

const MAX_ITEMS = 20;

export const useRecentlyViewedStore = create<RecentlyViewedState>()(
  persist(
    (set) => ({
      items: [],
      addItem: (item) =>
        set((state) => {
          const filtered = state.items.filter((i) => i.slug !== item.slug);
          return { items: [item, ...filtered].slice(0, MAX_ITEMS) };
        }),
      removeItem: (slug) =>
        set((state) => ({
          items: state.items.filter((i) => i.slug !== slug),
        })),
      clearAll: () => set({ items: [] }),
    }),
    { name: "recently-viewed" }
  )
);

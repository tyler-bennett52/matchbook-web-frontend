import { create } from 'zustand';

interface VisibleListingsStore {
  visibleListingIds: string[] | null;
  setVisibleListingIds: (ids: string[]) => void;
}

export const useVisibleListingsStore = create<VisibleListingsStore>((set: (partial: Partial<VisibleListingsStore>) => void) => ({
  visibleListingIds: null,
  setVisibleListingIds: (ids: string[]) => set({ visibleListingIds: ids })
}));
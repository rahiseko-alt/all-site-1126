import { create } from 'zustand';

export const useUIStore = create((set) => ({
  isStoryBibleOpen: false,
  toggleStoryBible: () => set((state) => ({ isStoryBibleOpen: !state.isStoryBibleOpen })),
  setStoryBibleOpen: (isOpen) => set({ isStoryBibleOpen: isOpen }),
  
  rightPanelTab: 'history', // 'history' | 'chat'
  setRightPanelTab: (tab) => set({ rightPanelTab: tab }),
}));

import { create } from 'zustand';
import { ResumeVersion, ResumeContent, MasterProfile } from '@/types/resume';

interface ResumeState {
  // --- Data & History ---
  history: ResumeVersion[];
  currentIndex: number;
  present: ResumeVersion | null;
  masterProfile: ResumeContent | null;
  targetJobTitle: string;
  targetJobDescription: string;
  
  // --- UI State ---
  zoomLevel: number;
  pageSize: 'A4' | 'LETTER';
  isSidebarHidden: boolean;
  status: 'idle' | 'loading' | 'success' | 'error';
  isProfileLoading: boolean;
  showAllSkills: boolean;
  
  // --- Actions ---
  // Data Lifecycle
  initializeWithHistory: (items: ResumeVersion[]) => void;
  setResume: (data: ResumeVersion) => void;
  setMasterProfile: (data: ResumeContent) => void;
  setJobDetails: (title: string, description: string) => void;
  undo: () => void;
  redo: () => void;
  jumpTo: (index: number) => void;
  
  // UI Controls
  setZoom: (level: number) => void;
  setPageSize: (size: 'A4' | 'LETTER') => void;
  setSidebarHidden: (hidden: boolean) => void;
  setStatus: (status: ResumeState['status']) => void;
  setIsProfileLoading: (loading: boolean) => void;
  setShowAllSkills: (show: boolean) => void;
  
  // Helpers
  canUndo: () => boolean;
  canRedo: () => boolean;
}

export const useResumeStore = create<ResumeState>((set, get) => ({
  // --- Initial State ---
  history: [],
  currentIndex: -1,
  present: null,
  masterProfile: null,
  targetJobTitle: '',
  targetJobDescription: '',
  zoomLevel: 0.8,
  pageSize: 'A4',
  isSidebarHidden: false,
  status: 'idle',
  isProfileLoading: true,
  showAllSkills: false,

  // --- Actions ---
  initializeWithHistory: (items) => {
    const sortedItems = [...items].sort((a, b) => (a.id || 0) - (b.id || 0));
    set({
      history: sortedItems,
      currentIndex: sortedItems.length - 1,
      present: sortedItems[sortedItems.length - 1] || null
    });
  },

  setResume: (newData) => {
    const { history, currentIndex } = get();
    const existingIndex = history.findIndex(item => item.version_number === newData.version_number);
    
    if (existingIndex !== -1) {
      set({ currentIndex: existingIndex, present: history[existingIndex] });
      return;
    }

    const newHistory = history.slice(0, currentIndex + 1);
    const updated = [...newHistory, newData];
    set({
      history: updated,
      currentIndex: updated.length - 1,
      present: newData
    });
  },

  setMasterProfile: (data) => set({ masterProfile: data }),
  setJobDetails: (title: string, description: string) => set({ targetJobTitle: title, targetJobDescription: description }),

  undo: () => {
    const { currentIndex, history } = get();
    if (currentIndex > 0) {
      const newIndex = currentIndex - 1;
      set({ 
        currentIndex: newIndex, 
        present: history[newIndex] 
      });
    }
  },

  redo: () => {
    const { currentIndex, history } = get();
    if (currentIndex < history.length - 1) {
      const newIndex = currentIndex + 1;
      set({ 
        currentIndex: newIndex, 
        present: history[newIndex] 
      });
    }
  },

  jumpTo: (index) => {
    const { history } = get();
    if (index >= 0 && index < history.length) {
      set({ 
        currentIndex: index, 
        present: history[index] 
      });
    }
  },

  // UI Control Actions
  setZoom: (level) => set({ zoomLevel: Math.max(0.4, Math.min(1.5, level)) }),
  setPageSize: (size) => set({ pageSize: size }),
  setSidebarHidden: (hidden) => set({ isSidebarHidden: hidden }),
  setStatus: (status) => set({ status }),
  setIsProfileLoading: (loading) => set({ isProfileLoading: loading }),
  setShowAllSkills: (show) => set({ showAllSkills: show }),

  // Helpers
  canUndo: () => get().currentIndex > 0,
  canRedo: () => get().currentIndex < get().history.length - 1,
}));

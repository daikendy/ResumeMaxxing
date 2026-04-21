import { useState, useCallback } from 'react';

/**
 * VERSION-CENTRIC HISTORY ENGINE
 * Specialized for ResumeMaxxing to switch between complete AI generations.
 * Replaces generic undo/redo with a linear "Version Timeline".
 */
export function useResumeStack<T extends { id?: number; version_number?: number }>(initialState: T | null) {
  const [history, setHistory] = useState<T[]>(initialState ? [initialState] : []);
  const [currentIndex, setCurrentIndex] = useState(initialState ? 0 : -1);

  /**
   * Set a new Version. 
   * Only adds to history if it's a NEW version (determined by version_number).
   */
  const set = useCallback((newData: T) => {
    setHistory(prev => {
      // 1. Check if this version already exists in the history
      const existingIndex = prev.findIndex(item => item.version_number === newData.version_number);
      
      if (existingIndex !== -1) {
        // Version exists, just move the pointer to it (no duplicates)
        setCurrentIndex(existingIndex);
        return prev;
      }

      // 2. It's a brand new version. 
      // We clear any "future" history (if user was in the past and generated something new)
      const newHistory = prev.slice(0, currentIndex + 1);
      const updated = [...newHistory, newData];
      setCurrentIndex(updated.length - 1);
      return updated;
    });
  }, [currentIndex]);

  /**
   * Undo: Jump to the previous unique version
   */
  const undo = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  }, [currentIndex]);

  /**
   * Redo: Jump to the next unique version
   */
  const redo = useCallback(() => {
    if (currentIndex < history.length - 1) {
      setCurrentIndex(prev => prev + 1);
    }
  }, [currentIndex]);

  /**
   * Hard Reset (on initial load)
   */
  const initialize = useCallback((data: T) => {
    setHistory([data]);
    setCurrentIndex(0);
  }, []);

  /**
   * Bulk Load History (for persistence across page reloads)
   */
  const initializeWithHistory = useCallback((items: T[]) => {
    setHistory(items);
    setCurrentIndex(items.length - 1); // Default to most recent
  }, []);

  /**
   * Programmatic Navigation (jump to specific version index)
   */
  const jumpTo = useCallback((index: number) => {
    if (index >= 0 && index < history.length) {
      setCurrentIndex(index);
    }
  }, [history.length]);

  return {
    present: history[currentIndex] || null,
    set,
    undo,
    redo,
    initialize,
    initializeWithHistory,
    jumpTo,
    canUndo: currentIndex > 0,
    canRedo: currentIndex < history.length - 1,
    totalDepth: history.length,
    currentIndex: currentIndex + 1,
    history // Expose full array for timeline rendering
  };
}

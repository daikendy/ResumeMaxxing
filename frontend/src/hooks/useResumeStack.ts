import { useState, useCallback } from 'react';

/**
 * useResumeStack Hook
 * Strict two-stack data structure (Past/Future) for robust Undo/Redo state management.
 * Designed for managing JSON objects representing the user's resume content.
 */
export function useResumeStack<T>(initialState: T | null) {
  const [past, setPast] = useState<T[]>([]);
  const [present, setPresent] = useState<T | null>(initialState);
  const [future, setFuture] = useState<T[]>([]);

  /**
   * Set a new state.
   * Pushes current present to past, updates present, and clears future.
   */
  const set = useCallback((newState: T) => {
    setPresent(currentPresent => {
      if (currentPresent !== null) {
        setPast(prev => [...prev, currentPresent]);
      }
      return newState;
    });
    setFuture([]);
  }, []);

  /**
   * Undo last action.
   * If past is not empty, pop last item. Push current present to future.
   */
  const undo = useCallback(() => {
    if (past.length === 0) return;

    setPast(prevPast => {
      const newPast = [...prevPast];
      const previous = newPast.pop();
      
      if (previous !== undefined) {
        setPresent(currentPresent => {
          if (currentPresent !== null) {
            setFuture(prevFuture => [currentPresent, ...prevFuture]);
          }
          return previous;
        });
      }
      return newPast;
    });
  }, [past.length]);

  /**
   * Redo last undone action.
   * If future is not empty, pop first item. Push current present to past.
   */
  const redo = useCallback(() => {
    if (future.length === 0) return;

    setFuture(prevFuture => {
      const newFuture = [...prevFuture];
      const next = newFuture.shift();
      
      if (next !== undefined) {
        setPresent(currentPresent => {
          if (currentPresent !== null) {
            setPast(prevPast => [...prevPast, currentPresent]);
          }
          return next;
        });
      }
      return newFuture;
    });
  }, [future.length]);

  /**
   * Initialize or replace the entire state without pushing to history.
   * Useful for initial loads or reset hooks.
   */
  const initialize = useCallback((state: T) => {
    setPresent(state);
    setPast([]);
    setFuture([]);
  }, []);

  return {
    present,
    set,
    undo,
    redo,
    initialize,
    canUndo: past.length > 0,
    canRedo: future.length > 0,
    past,
    future
  };
}

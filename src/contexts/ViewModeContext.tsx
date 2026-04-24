import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type ViewMode = 'immersive' | 'gallery';

interface ViewModeContextValue {
  mode: ViewMode;
  setMode: (mode: ViewMode) => void;
  toggleMode: () => void;
}

const ViewModeContext = createContext<ViewModeContextValue | undefined>(undefined);

const STORAGE_KEY = 'lingua-view-mode';

export function ViewModeProvider({ children }: { children: ReactNode }) {
  const [mode, setModeState] = useState<ViewMode>(() => {
    if (typeof window !== 'undefined') {
      // Prioritize URL hash for deep linking
      const [anchor] = window.location.hash.split('?');
      if (anchor === '#archive') {
        return 'gallery';
      }
      if (anchor === '#gallery' || anchor === '#immersive') {
        return 'immersive';
      }
      // Fallback to localStorage
      const saved = localStorage.getItem(STORAGE_KEY);
      return (saved === 'gallery' || saved === 'immersive') ? saved : 'gallery';
    }
    return 'gallery';
  });

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      const [anchor] = hash.split('?');
      
      // Strict check: if anchor is exactly #archive, it's a mode switch.
      // #gallery is used for the immersive view's anchor and should NOT trigger gallery/archive mode.
      if (anchor === '#archive') {
        setModeState('gallery');
        localStorage.setItem(STORAGE_KEY, 'gallery');
      } else if (anchor === '#immersive' || anchor === '#gallery') {
        setModeState('immersive');
        localStorage.setItem(STORAGE_KEY, 'immersive');
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const setMode = (newMode: ViewMode) => {
    setModeState(newMode);
    localStorage.setItem(STORAGE_KEY, newMode);
    
    // Update URL without hash scrolling if possible, or just pushState
    if (newMode === 'gallery') {
      window.history.pushState(null, '', '#archive');
    } else {
      // Clear hash when returning to immersive
      window.history.pushState(null, '', window.location.pathname + window.location.search);
    }
  };

  const toggleMode = () => {
    setMode(mode === 'immersive' ? 'gallery' : 'immersive');
  };

  return (
    <ViewModeContext.Provider value={{ mode, setMode, toggleMode }}>
      {children}
    </ViewModeContext.Provider>
  );
}

export function useViewMode(): ViewModeContextValue {
  const context = useContext(ViewModeContext);
  if (!context) {
    throw new Error('useViewMode must be used within ViewModeProvider');
  }
  return context;
}

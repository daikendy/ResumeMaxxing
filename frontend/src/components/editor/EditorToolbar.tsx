'use client';

import React from 'react';
import { 
  LucideTerminal, 
  LucideUndo2, 
  LucideRedo2, 
  LucideZoomIn, 
  LucideZoomOut, 
  LucideDownload 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useResumeStore } from '@/store/useResumeStore';
import { Haptics, ImpactStyle } from '@capacitor/haptics';

interface EditorToolbarProps {
  onPrint: () => void;
}

export function EditorToolbar({ onPrint }: EditorToolbarProps) {
  const store = useResumeStore();
  
  const playHaptic = async () => {
    try { await Haptics.impact({ style: ImpactStyle.Medium }); } catch (e) {}
  };

  return (
    <div className="no-print h-[64px] bg-zinc-950/60 backdrop-blur-md border-b border-zinc-900 flex items-center justify-between px-6 z-50">
      <div className="flex items-center gap-4">
        <button 
          onClick={() => { store.setSidebarHidden(!store.isSidebarHidden); playHaptic(); }} 
          className="p-2.5 bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-cyan-accent premium-touch"
          title="Toggle Master Data"
        >
          <LucideTerminal className="w-4 h-4" />
        </button>
        
        <div className="flex items-center gap-2 min-w-0 shrink-0">
          <span className="text-[10px] font-black uppercase tracking-widest text-white shrink-0">
            <span className="hidden sm:inline">Version </span>V{store.present?.version_number || 1}
          </span>
        </div>
      </div>
      
      <div className="flex items-center gap-2 sm:gap-4 scale-90 sm:scale-100 origin-right">
        {/* Size Toggle */}
        <div className="flex items-center bg-zinc-900 border border-zinc-800 rounded-sm overflow-hidden">
          <button 
            onClick={() => { store.setPageSize('A4'); playHaptic(); }} 
            className={`px-2 sm:px-3 h-8 text-[8px] sm:text-[9px] font-mono tracking-tighter uppercase transition-colors ${store.pageSize === 'A4' ? 'bg-cyan-accent text-black font-bold' : 'text-zinc-500 hover:text-white'}`}
          >
            A4
          </button>
          <button 
            onClick={() => { store.setPageSize('LETTER'); playHaptic(); }} 
            className={`px-2 sm:px-3 h-8 text-[8px] sm:text-[9px] font-mono tracking-tighter uppercase transition-colors ${store.pageSize === 'LETTER' ? 'bg-cyan-accent text-black font-bold' : 'text-zinc-500 hover:text-white'}`}
          >
            LTR
          </button>
        </div>

        {/* Undo/Redo */}
        <div className="flex items-center gap-0.5 bg-zinc-900 border border-zinc-800 rounded-sm mr-2 shrink-0">
          <button 
            onClick={() => { store.undo(); playHaptic(); }} 
            disabled={!store.canUndo()}
            className="p-2 text-zinc-500 hover:text-white disabled:opacity-20 premium-touch"
            title="Undo"
          >
            <LucideUndo2 className="w-4 h-4" />
          </button>
          <div className="w-[1px] h-4 bg-zinc-800" />
          <button 
            onClick={() => { store.redo(); playHaptic(); }} 
            disabled={!store.canRedo()}
            className="p-2 text-zinc-500 hover:text-white disabled:opacity-20 premium-touch"
            title="Redo"
          >
            <LucideRedo2 className="w-4 h-4" />
          </button>
        </div>

        {/* Zoom Controls */}
        <div className="flex items-center gap-0.5 bg-zinc-900 border border-zinc-800 rounded-sm">
          <button onClick={() => { store.setZoom(store.zoomLevel - 0.1); playHaptic(); }} className="p-2 text-zinc-500 hover:text-white"><LucideZoomOut className="w-4 h-4" /></button>
          <span className="text-[10px] font-mono w-10 text-center">{Math.round(store.zoomLevel * 100)}%</span>
          <button onClick={() => { store.setZoom(store.zoomLevel + 0.1); playHaptic(); }} className="p-2 text-zinc-500 hover:text-white"><LucideZoomIn className="w-4 h-4" /></button>
        </div>

        {store.status === 'success' && (
          <Button className="bg-emerald-600 hover:bg-emerald-500 text-white font-black uppercase tracking-widest h-10 px-4 sm:px-6 premium-touch" onClick={onPrint}>
            <LucideDownload className="w-4 h-4 sm:mr-2" />
            <span className="hidden sm:block">Export</span>
          </Button>
        )}
      </div>
    </div>
  );
}

'use client';

import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Skeleton } from '@/components/ui/skeleton';
import ResumePreview from '@/components/ResumePreview';
import { useResumeStore } from '@/store/useResumeStore';
import { calculateMatchScore } from '@/lib/utils/keywordMatcher';
import { formatBullet } from '@/lib/utils/formatters';

export function EditorWorkspace() {
  const store = useResumeStore();
  const resumeData = store.present;
  
  // Memoized Scores for performance
  const matchScore = useMemo(() => {
    const content = resumeData?.resume_content;
    if (!content || !store.targetJobDescription) return 0;
    return calculateMatchScore(store.targetJobDescription, content);
  }, [resumeData, store.targetJobDescription]);

  const originalScore = useMemo(() => {
    if (!store.masterProfile || !store.targetJobDescription) return 0;
    return calculateMatchScore(store.targetJobDescription, store.masterProfile);
  }, [store.masterProfile, store.targetJobDescription]);

  return (
    <div className="flex-grow flex flex-col items-center p-4 md:p-8 overflow-y-auto custom-scrollbar relative bg-[#0a0a0a]">
      {/* HUD Scanline specific to the preview area */}
      <div className="absolute inset-0 pointer-events-none opacity-30 hud-scanline z-0 no-print" />
      
      <div className="max-w-5xl w-full flex flex-col items-center relative z-10">
        
        {/* Match Score HUD Overlay */}
        {store.status === 'success' && matchScore > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }} 
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-[850px] mb-8 hud-border p-8 flex items-center justify-between relative overflow-hidden no-print"
          >
            <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-cyan-accent/20" />
            <div className="relative z-10">
              <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-cyan-accent mb-1 hud-text-glow">Alignment_Rating</h3>
              <div className="text-6xl font-heading font-black text-white tracking-tighter hud-text-glow">
                {matchScore}<span className="text-2xl text-cyan-accent/40">%</span>
              </div>
            </div>
            
            <div className="text-right relative z-10">
              <div className={`text-[11px] font-mono font-bold uppercase tracking-widest ${matchScore > originalScore ? 'text-emerald-400' : 'text-white/20'}`}>
                {matchScore > originalScore ? `AI_BOOST: +${matchScore - originalScore}%` : 'SCORE_NOMINAL'}
              </div>
              <div className="text-[8px] text-white/20 font-mono mt-1 uppercase tracking-widest leading-none">Stream_Sync: 100%</div>
            </div>
          </motion.div>
        )}

        {/* The Paper Component (GPU Scaled) */}
        <div
          className="relative flex-shrink-0 origin-top print:!transform-none print:!m-0 group"
          style={{ 
            transform: `scale(${store.zoomLevel})`, 
            marginBottom: `-${(1 - store.zoomLevel) * 1100}px`, 
            willChange: 'transform' 
          }}
        >
          {/* Digital Projection Underglow */}
          <div className="absolute -inset-10 bg-cyan-accent/10 blur-[80px] opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
          
          <div 
            id="printable-resume-mount" 
            className={`bg-white shadow-[0_0_50px_rgba(0,0,0,0.5)] p-[10mm] relative transition-all duration-300 ${store.pageSize === 'LETTER' ? 'size-letter' : 'size-a4'} border-4 border-black`}
            style={{ 
              width: store.pageSize === 'A4' ? '794px' : '816px', 
              minHeight: store.pageSize === 'A4' ? '1123px' : '1056px' 
            }}
          >
            <AnimatePresence mode="wait">
              {store.status === 'idle' && (
                <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} exit={{ opacity: 0 }} className="flex-grow flex items-center justify-center h-full min-h-[600px]">
                  <span className="text-zinc-400 font-heading italic text-2xl uppercase tracking-widest">System Idle</span>
                </motion.div>
              )}
              
              {store.status === 'loading' && (
                <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-8 pt-10">
                  <Skeleton className="h-12 w-2/3" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                </motion.div>
              )}
              
              {store.status === 'success' && resumeData && (
                <ResumePreview key="success" resumeData={resumeData} formatBullet={formatBullet} />
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}

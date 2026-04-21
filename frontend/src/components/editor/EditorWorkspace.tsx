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
    if (!resumeData?.resume_content || !store.targetJobDescription) return 0;
    return calculateMatchScore(store.targetJobDescription, resumeData.resume_content);
  }, [resumeData?.resume_content, store.targetJobDescription]);

  const originalScore = useMemo(() => {
    if (!store.masterProfile || !store.targetJobDescription) return 0;
    return calculateMatchScore(store.targetJobDescription, store.masterProfile);
  }, [store.masterProfile, store.targetJobDescription]);

  return (
    <div className="flex-grow flex flex-col items-center p-4 md:p-8 overflow-y-auto custom-scrollbar relative">
      <div className="max-w-5xl w-full flex flex-col items-center">
        
        {/* Match Score Overlay */}
        {store.status === 'success' && matchScore > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }} 
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-[850px] mb-8 glass-panel border-cyan-800/30 p-8 flex items-center justify-between relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 to-transparent pointer-events-none" />
            <div className="relative z-10">
              <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-cyan-400 mb-1">Alignment Rating</h3>
              <div className="text-6xl font-heading font-black text-white tracking-tighter">
                {matchScore}<span className="text-2xl text-cyan-800">%</span>
              </div>
            </div>
            
            <div className="text-right">
              <div className={`text-[10px] font-bold uppercase tracking-widest ${matchScore > originalScore ? 'text-emerald-400' : 'text-zinc-500'}`}>
                AI Boost: +{Math.max(0, matchScore - originalScore)}%
              </div>
            </div>
          </motion.div>
        )}

        {/* The Paper Component (GPU Scaled) */}
        <div
          className="relative flex-shrink-0 origin-top print:!transform-none print:!m-0"
          style={{ 
            transform: `scale(${store.zoomLevel})`, 
            marginBottom: `-${(1 - store.zoomLevel) * 1100}px`, 
            willChange: 'transform' 
          }}
        >
          <div 
            id="printable-resume-mount" 
            className={`bg-white shadow-2xl p-[10mm] relative transition-all duration-300 ${store.pageSize === 'LETTER' ? 'size-letter' : 'size-a4'}`}
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

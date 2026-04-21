'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@clerk/clerk-react';
import { resumeService } from '@/lib/api/services/resumeService';
import { ResumeResponse } from '@/lib/api/types/resume';
import { generatePrintStyles } from '@/lib/utils/print';
import { calculateMatchScore } from '@/lib/utils/keywordMatcher';
import { AuthGuard } from '@/components/AuthGuard';
import { useResumeStack } from '@/hooks/useResumeStack';
import { PremiumModal } from '@/components/PremiumModal';
import {
  LucideTerminal,
  LucideCheck,
  LucideZap,
  LucideChevronLeft,
  LucideDatabase,
  LucideLayers3,
  LucideCpu,
  LucideCircleDashed,
  LucideBriefcase,
  LucideGraduationCap,
  LucideFolderGit2,
  LucideChevronDown,
  LucideChevronUp,
  LucideDownload,
  LucideUndo2,
  LucideRedo2,
  LucideZoomIn,
  LucideZoomOut,
  LucideMaximize2
} from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import ResumePreview from '@/components/ResumePreview';

type EditorState = 'idle' | 'loading' | 'success' | 'error';

export default function EditorClient({ jobId }: { jobId: string }) {
  const { getToken, isLoaded } = useAuth();
  const [targetJobTitle, setTargetJobTitle] = useState('');
  const [targetJobDescription, setTargetJobDescription] = useState('');
  const [status, setStatus] = useState<EditorState>('idle');

  // [Fresh Start] Simplified Version Engine
  const stack = useResumeStack<any>(null);
  const resumeData = stack.present;

  const [matchScore, setMatchScore] = useState<number | null>(null);
  const [originalScore, setOriginalScore] = useState<number | null>(null);
  const [masterProfile, setMasterProfile] = useState<any | null>(null);
  const [isProfileLoading, setIsProfileLoading] = useState(true);
  const [showAllSkills, setShowAllSkills] = useState(false);
  const [isSidebarHidden, setIsSidebarHidden] = useState(false);
  const [pageSize, setPageSize] = useState<'A4' | 'LETTER'>('A4');
  const [isPremiumModalOpen, setIsPremiumModalOpen] = useState(false);
  const [errorDetails, setErrorDetails] = useState<{ title: string, message: string, code?: string } | null>(null);
  const [zoomLevel, setZoomLevel] = useState(1.0);

  const playHaptic = async (style = ImpactStyle.Light) => {
    try {
      await Haptics.impact({ style });
    } catch (e) {}
  };

  // Fetch real master profile on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = await getToken();
        if (!token) return;

        // Fetch Profile
        const profile = await resumeService.getMasterResume(token);
        if (profile && profile.resume_data) {
          setMasterProfile(profile.resume_data);
        } else {
          setMasterProfile(null);
        }

        // Fetch Job Details
        if (jobId && jobId !== '1') {
          const job = await resumeService.getTrackedJob(jobId, token);
          if (job) {
            setTargetJobTitle(job.job_title);
            setTargetJobDescription(job.job_description || '');
            console.log("📍 JOB DATA SYNCED:", job.job_title);

            // [Persistence Engine] Restore Full Version Timeline
            if (job.resume_versions && job.resume_versions.length > 0) {
              const sortedVersions = [...job.resume_versions].sort((a: any, b: any) => a.id - b.id);
              stack.initializeWithHistory(sortedVersions);
              const activeIndex = sortedVersions.findIndex((v: any) => v.is_active);
              if (activeIndex !== -1) {
                stack.jumpTo(activeIndex);
              }
              setStatus('success');
            }
          }
        }
      } catch (err) {
        console.error("Failed to fetch editor data:", err);
      } finally {
        setIsProfileLoading(false);
      }
    };

    if (isLoaded) {
      fetchData();
    }
  }, [jobId, isLoaded]);

  // [Print Architecture] Sync Dynamic @page Size
  useEffect(() => {
    const styleId = 'dynamic-page-size';
    let style = document.getElementById(styleId);
    if (!style) {
      style = document.createElement('style');
      style.id = styleId;
      document.head.appendChild(style);
    }
    style.innerHTML = generatePrintStyles(pageSize);
  }, [pageSize]);

  // Auto-fit Zoom on window resize or initial load
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        Haptics.impact({ style: ImpactStyle.Light }).catch(() => {});
      }
      if (window.innerWidth < 1024) {
        const screenWidth = window.innerWidth;
        const availableWidth = screenWidth - 40;
        const baseWidth = 850;
        const fitZoom = Math.min(1, Math.max(0.4, availableWidth / baseWidth));
        setZoomLevel(fitZoom);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isSidebarHidden]);

  const handleGenerate = async () => {
    if (!targetJobTitle || !targetJobDescription) return;
    setStatus('loading');
    try {
      const token = await getToken();
      if (!token) throw new Error("No session found");
      const response = await resumeService.generateTailoredResume({
        tracked_job_id: parseInt(jobId) || 1,
        raw_resume_data: masterProfile || {}
      }, token);
      stack.set(response);
      toast.success("OPTIMIZATION COMPLETE");
      setStatus('success');
      setIsSidebarHidden(true);
    } catch (error: any) {
      const apiError = error.response?.data;
      if (apiError && (apiError.code === 'QUOTA_EXCEEDED' || apiError.code === 'LIMIT_REACHED')) {
        setErrorDetails({ title: apiError.code, message: apiError.message, code: apiError.code });
        setIsPremiumModalOpen(true);
        setStatus('idle');
      } else {
        setStatus('error');
      }
    }
  };

  useEffect(() => {
    if (resumeData?.resume_content && targetJobDescription) {
      const optimizedScore = calculateMatchScore(targetJobDescription, resumeData.resume_content);
      setMatchScore(optimizedScore);
      if (masterProfile) {
        setOriginalScore(calculateMatchScore(targetJobDescription, masterProfile));
      }
    }
  }, [resumeData, targetJobDescription, masterProfile]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'z') { e.preventDefault(); stack.undo(); }
      if ((e.ctrlKey || e.metaKey) && e.key === 'y') { e.preventDefault(); stack.redo(); }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [stack]);

  const handlePrint = () => {
    const originalTitle = document.title;
    document.title = "ResumeMaxxing";
    window.print();
    setTimeout(() => { document.title = originalTitle; }, 1000);
  };

  return (
    <AuthGuard>
      <div className="print-path flex flex-col md:flex-row h-[calc(100vh-64px)] w-full bg-black industrial-grid selection:bg-cyan-accent selection:text-black font-sans relative overflow-x-hidden">
        
        {!isSidebarHidden && (
          <aside className="print:hidden w-full md:w-[40%] lg:w-[32%] xl:w-[28%] h-full bg-zinc-950 text-zinc-50 flex flex-col pt-6 pb-8 px-6 md:px-10 overflow-y-auto border-r border-zinc-900 shadow-2xl relative z-20">
            <div className="flex flex-col gap-6 mb-10">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-1.5 bg-zinc-800 rounded-sm">
                    <LucideLayers3 className="w-4 h-4 text-zinc-400" />
                  </div>
                  <h1 className="text-xl font-heading font-bold tracking-[0.1em] uppercase text-white">Editor Studio</h1>
                </div>
                <p className="text-zinc-500 text-[10px] font-mono leading-relaxed uppercase tracking-wider">System: V2.2 // Premium</p>
              </div>
            </div>

            <div className="flex flex-col space-y-8 flex-grow">
              <div className="p-4 bg-zinc-900/50 border border-zinc-800 rounded-sm space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
                  <div className="flex items-center gap-2">
                    <LucideDatabase className="w-3 h-3 text-cyan-accent" />
                    <span className="text-[10px] uppercase tracking-widest font-bold text-zinc-400">Master Data</span>
                  </div>
                </div>
                {isProfileLoading ? (
                  <div className="flex items-center gap-3 py-2 text-zinc-600 animate-pulse">
                    <LucideCircleDashed className="w-4 h-4 animate-spin" />
                    <span className="text-[10px] uppercase font-mono tracking-tighter">Syncing Engine...</span>
                  </div>
                ) : masterProfile ? (
                  <div className="space-y-4">
                    {/* Metrics Grid */}
                    <div className="grid grid-cols-3 gap-2">
                      <div className="p-2 bg-zinc-950 border border-zinc-800/50 rounded-sm">
                        <div className="flex items-center gap-1.5 mb-1.5 opacity-40">
                          <LucideBriefcase className="w-2.5 h-2.5" />
                          <span className="text-[7px] uppercase font-bold tracking-tighter">Exp.</span>
                        </div>
                        <div className="text-xs font-heading text-white">{masterProfile.experience?.length || 0}</div>
                      </div>
                      <div className="p-2 bg-zinc-950 border border-zinc-800/50 rounded-sm">
                        <div className="flex items-center gap-1.5 mb-1.5 opacity-40">
                          <LucideGraduationCap className="w-2.5 h-2.5" />
                          <span className="text-[7px] uppercase font-bold tracking-tighter">Edu.</span>
                        </div>
                        <div className="text-xs font-heading text-white">{masterProfile.education?.length || 0}</div>
                      </div>
                      <div className="p-2 bg-zinc-950 border border-zinc-800/50 rounded-sm">
                        <div className="flex items-center gap-1.5 mb-1.5 opacity-40">
                          <LucideFolderGit2 className="w-2.5 h-2.5" />
                          <span className="text-[7px] uppercase font-bold tracking-tighter">Proj.</span>
                        </div>
                        <div className="text-xs font-heading text-white">{masterProfile.projects?.length || 0}</div>
                      </div>
                    </div>

                    {/* Skill Tags */}
                    <div className="space-y-2">
                      <div className="flex flex-wrap gap-1">
                        {(showAllSkills ? masterProfile.skills : masterProfile.skills?.slice(0, 6))?.map((s: string, i: number) => (
                          <span key={i} className="px-1.5 py-0.5 bg-zinc-800/50 text-[8px] text-zinc-400 uppercase tracking-tighter border border-zinc-800 font-mono">
                            {s}
                          </span>
                        ))}
                      </div>
                      
                      {masterProfile.skills?.length > 6 && (
                        <button 
                          onClick={() => { setShowAllSkills(!showAllSkills); playHaptic(); }}
                          className="text-[8px] uppercase tracking-widest font-black text-cyan-accent hover:opacity-80 transition-opacity flex items-center gap-1 mt-1"
                        >
                          {showAllSkills ? 'Minimize Data' : `+${masterProfile.skills.length - 6} More Tags`}
                          {showAllSkills ? <LucideChevronUp className="w-2 h-2" /> : <LucideChevronDown className="w-2 h-2" />}
                        </button>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="py-4 text-center">
                    <span className="text-[10px] text-zinc-600 uppercase font-mono tracking-tighter">No Profile Data Linked</span>
                  </div>
                )}
              </div>

              <div className="space-y-3">
                <label className="text-[10px] uppercase tracking-widest font-bold text-zinc-500">Target Title</label>
                <Input
                  className="bg-zinc-900 border-zinc-800 text-zinc-100"
                  value={targetJobTitle}
                  onChange={(e) => setTargetJobTitle(e.target.value)}
                />
              </div>

              <div className="space-y-3 flex-grow flex flex-col">
                <label className="text-[10px] uppercase tracking-widest font-bold text-zinc-500">Job Description</label>
                <Textarea
                  className="bg-zinc-900 border-zinc-800 text-zinc-100 flex-grow resize-none"
                  value={targetJobDescription}
                  onChange={(e) => setTargetJobDescription(e.target.value)}
                />
              </div>
            </div>

            <div className="pt-6 mt-auto">
              <Button
                className="w-full bg-cyan-accent text-black font-bold uppercase tracking-widest h-14 premium-touch"
                onClick={handleGenerate}
                disabled={status === 'loading'}
              >
                {status === 'loading' ? 'Generating...' : 'Execute Generation'}
              </Button>
            </div>
          </aside>
        )}

        <main className={`print-path flex-grow h-full bg-[#111111] flex flex-col overflow-hidden relative ${isSidebarHidden ? 'w-full' : 'w-auto'}`}>
          <div className="no-print h-[64px] bg-zinc-950/60 backdrop-blur-md border-b border-zinc-900 flex items-center justify-between px-6 z-50">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => { setIsSidebarHidden(!isSidebarHidden); playHaptic(); }} 
                className="p-2.5 bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-cyan-accent premium-touch"
                title="Toggle Master Data"
              >
                <LucideTerminal className="w-4 h-4" />
              </button>
              
              <div className="flex items-center gap-2 min-w-0 shrink-0">
                <span className="text-[10px] font-black uppercase tracking-widest text-white shrink-0">
                  <span className="hidden sm:inline">Version </span>V{resumeData?.version_number || 1}
                </span>
              </div>
            </div>
            
            <div className="flex items-center gap-2 sm:gap-4 scale-90 sm:scale-100 origin-right">
              {/* Size Toggle - Re-relocated & Responsive */}
              <div className="flex items-center bg-zinc-900 border border-zinc-800 rounded-sm overflow-hidden">
                <button 
                  onClick={() => { setPageSize('A4'); playHaptic(); }} 
                  className={`px-2 sm:px-3 h-8 text-[8px] sm:text-[9px] font-mono tracking-tighter uppercase transition-colors ${pageSize === 'A4' ? 'bg-cyan-accent text-black font-bold' : 'text-zinc-500 hover:text-white'}`}
                >
                  A4
                </button>
                <button 
                  onClick={() => { setPageSize('LETTER'); playHaptic(); }} 
                  className={`px-2 sm:px-3 h-8 text-[8px] sm:text-[9px] font-mono tracking-tighter uppercase transition-colors ${pageSize === 'LETTER' ? 'bg-cyan-accent text-black font-bold' : 'text-zinc-500 hover:text-white'}`}
                >
                  LTR
                </button>
              </div>

              <div className="flex items-center gap-0.5 bg-zinc-900 border border-zinc-800 rounded-sm mr-2 shrink-0">
                <button 
                  onClick={() => { stack.undo(); playHaptic(); }} 
                  disabled={!stack.canUndo}
                  className="p-2 text-zinc-500 hover:text-white disabled:opacity-20 premium-touch"
                  title="Undo (Ctrl+Z)"
                >
                  <LucideUndo2 className="w-4 h-4" />
                </button>
                <div className="w-[1px] h-4 bg-zinc-800" />
                <button 
                  onClick={() => { stack.redo(); playHaptic(); }} 
                  disabled={!stack.canRedo}
                  className="p-2 text-zinc-500 hover:text-white disabled:opacity-20 premium-touch"
                  title="Redo (Ctrl+Y)"
                >
                  <LucideRedo2 className="w-4 h-4" />
                </button>
              </div>

              <div className="flex items-center gap-0.5 bg-zinc-900 border border-zinc-800 rounded-sm">
                <button onClick={() => { setZoomLevel(Math.max(0.4, zoomLevel - 0.1)); playHaptic(); }} className="p-2 text-zinc-500 hover:text-white"><LucideZoomOut className="w-4 h-4" /></button>
                <span className="text-[10px] font-mono w-10 text-center">{Math.round(zoomLevel * 100)}%</span>
                <button onClick={() => { setZoomLevel(Math.min(1.5, zoomLevel + 0.1)); playHaptic(); }} className="p-2 text-zinc-500 hover:text-white"><LucideZoomIn className="w-4 h-4" /></button>
              </div>
              {status === 'success' && (
                <Button className="bg-emerald-600 hover:bg-emerald-500 text-white font-black uppercase tracking-widest h-10 px-4 sm:px-6 premium-touch" onClick={handlePrint}>
                  <LucideDownload className="w-4 h-4 sm:mr-2" />
                  <span className="hidden sm:block">Export</span>
                </Button>
              )}
            </div>
          </div>

          <div className="flex-grow overflow-y-auto custom-scrollbar flex flex-col items-center py-12 px-6 relative bg-zinc-950/40">
            
            {status === 'success' && matchScore !== null && (
              <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-[850px] mb-8 glass-panel p-6 flex justify-between items-center">
                <div>
                   <h4 className="text-[10px] uppercase font-bold text-zinc-400 tracking-widest">Alignment Rating</h4>
                   <div className="text-4xl font-heading text-cyan-accent">{matchScore}%</div>
                </div>
                <div className="text-right">
                  <div className={`text-[10px] font-bold uppercase tracking-widest ${matchScore > (originalScore || 0) ? 'text-emerald-400' : 'text-zinc-500'}`}>
                    AI Boost: +{matchScore - (originalScore || 0)}%
                  </div>
                </div>
              </motion.div>
            )}

            <div
              className="relative flex-shrink-0 origin-top print:!transform-none print:!m-0"
              style={{ transform: `scale(${zoomLevel})`, marginBottom: `-${(1 - zoomLevel) * 1100}px`, willChange: 'transform' }}
            >
              <div 
                id="printable-resume-mount" 
                className={`bg-white shadow-2xl p-[10mm] relative transition-all duration-300 ${pageSize === 'LETTER' ? 'size-letter' : 'size-a4'}`}
                style={{ 
                  width: pageSize === 'A4' ? '794px' : '816px', 
                  minHeight: pageSize === 'A4' ? '1123px' : '1056px' 
                }}
              >
                <AnimatePresence mode="wait">
                  {status === 'idle' && (
                    <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} exit={{ opacity: 0 }} className="flex-grow flex items-center justify-center h-full min-h-[600px]">
                      <span className="text-zinc-400 font-heading italic text-2xl uppercase tracking-widest">System Idle</span>
                    </motion.div>
                  )}
                  {status === 'loading' && (
                    <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-8 pt-10">
                      <Skeleton className="h-12 w-2/3" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-3/4" />
                    </motion.div>
                  )}
                  {status === 'success' && resumeData && (
                    <ResumePreview key="success" resumeData={resumeData} formatBullet={formatBullet} />
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </main>
      </div>
      <PremiumModal isOpen={isPremiumModalOpen} onClose={() => setIsPremiumModalOpen(false)} title={errorDetails?.title} description={errorDetails?.message} errorCode={errorDetails?.code} />
    </AuthGuard>
  );
}

function formatBullet(text: string) {
  if (!text) return null;
  const formatted = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  return <span dangerouslySetInnerHTML={{ __html: formatted }} />;
}

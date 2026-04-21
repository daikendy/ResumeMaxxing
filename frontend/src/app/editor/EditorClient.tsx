'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { resumeService } from '@/lib/api/services/resumeService';
import { generatePrintStyles } from '@/lib/utils/print';
import { AuthGuard } from '@/components/AuthGuard';
import { PremiumModal } from '@/components/PremiumModal';
import { toast } from 'sonner';
import { useResumeStore } from '@/store/useResumeStore';
import { ImpactStyle, Haptics } from '@capacitor/haptics';
import { SITE_CONFIG } from '@/lib/config';

// New Atomic Components (Centralized)
import { EditorToolbar } from '@/components/editor/EditorToolbar';
import { EditorSidebar } from '@/components/editor/EditorSidebar';
import { EditorWorkspace } from '@/components/editor/EditorWorkspace';

export default function EditorClient({ jobId }: { jobId: string }) {
  const { getToken, isLoaded } = useAuth();
  const store = useResumeStore();
  
  // Local UI state (not in store)
  const [isPremiumModalOpen, setIsPremiumModalOpen] = useState(false);
  const [errorDetails, setErrorDetails] = useState<{ title: string, message: string, code?: string } | null>(null);

  // 1. Initial Data Fetch & Store Synchronization
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = await getToken();
        if (!token) return;

        store.setIsProfileLoading(true);

        // Fetch Profile
        const profile = await resumeService.getMasterResume(token);
        if (profile?.resume_data) {
          store.setMasterProfile(profile.resume_data);
        }

        // Fetch Job Details & Versions
        if (jobId && jobId !== '1') {
          const job = await resumeService.getTrackedJob(jobId, token);
          if (job) {
            store.setJobDetails(job.job_title, job.job_description || '');
            
            if (job.resume_versions && job.resume_versions.length > 0) {
              store.initializeWithHistory(job.resume_versions);
              
              // Set initial status to success if we have versions
              store.setStatus('success');
              
              // Match the active version if possible
              const activeIndex = job.resume_versions.findIndex((v: any) => v.is_active);
              if (activeIndex !== -1) {
                store.jumpTo(activeIndex);
              }
            }
          }
        }
      } catch (err) {
        console.error("❌ CLOUD SYNC ERROR:", err);
        store.setStatus('error');
      } finally {
        store.setIsProfileLoading(false);
      }
    };

    if (isLoaded) {
      fetchData();
    }
  }, [jobId, isLoaded]);

  // 2. Print Dynamic Stylist (Synchronized with PageSize)
  useEffect(() => {
    const styleId = 'dynamic-page-size';
    let style = document.getElementById(styleId);
    if (!style) {
      style = document.createElement('style');
      style.id = styleId;
      document.head.appendChild(style);
    }
    style.innerHTML = generatePrintStyles(store.pageSize);
  }, [store.pageSize]);

  // 3. Auto-Scaling Engine (Subscribed to Resize)
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        const screenWidth = window.innerWidth;
        const availableWidth = screenWidth - 40;
        const baseWidth = 850;
        const fitZoom = Math.min(1, Math.max(0.4, availableWidth / baseWidth));
        store.setZoom(fitZoom);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [store.isSidebarHidden]);

  // 4. Hotkeys (Undo/Redo)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'z') { e.preventDefault(); store.undo(); }
      if ((e.ctrlKey || e.metaKey) && e.key === 'y') { e.preventDefault(); store.redo(); }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // 5. Root Actions
  const handlePrint = async () => {
    const isNative = typeof window !== 'undefined' && (window as any).Capacitor?.isNativePlatform();
    
    if (isNative) {
      const element = document.getElementById('printable-resume-mount');
      if (!element) return;

      const opt = {
        margin: 0,
        filename: `${SITE_CONFIG.name}_Resume.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: 'mm', format: store.pageSize === 'A4' ? 'a4' : 'letter', orientation: 'portrait' }
      };

      toast.loading("ARCHITECTING PDF...");
      
      try {
        // @ts-ignore - html2pdf is traditionally imported this way
        const html2pdf = (await import('html2pdf.js')).default;
        // @ts-ignore - html2pdf options can be complex for untyped JS lib
        const pdfBlob = await html2pdf().from(element).set(opt).output('blob');
        
        const { shareNativeFile } = await import('@/lib/utils/nativeShare');
        await shareNativeFile(pdfBlob, `${SITE_CONFIG.name}_Resume.pdf`);
        toast.dismiss();
      } catch (err) {
        console.error("PDF SHARE ERROR:", err);
        toast.error("NATIVE EXPORT FAILED");
      }
    } else {
      const originalTitle = document.title;
      document.title = SITE_CONFIG.name;
      window.print();
      setTimeout(() => { document.title = originalTitle; }, 1000);
    }
  };

  const handleGenerate = async () => {
    if (!store.targetJobTitle || !store.targetJobDescription) {
      toast.error("MISSING TARGET DATA");
      return;
    }
    
    store.setStatus('loading');
    try {
      const token = await getToken();
      if (!token) throw new Error("No session found");
      
      const response = await resumeService.generateTailoredResume({
        tracked_job_id: parseInt(jobId) || 1,
        raw_resume_data: store.masterProfile || {}
      }, token);
      
      store.setResume(response);
      toast.success("OPTIMIZATION COMPLETE");
      store.setStatus('success');
      store.setSidebarHidden(true);
      
      try { await Haptics.impact({ style: ImpactStyle.Heavy }); } catch (e) {}
    } catch (error: any) {
      const apiError = error.response?.data;
      if (apiError && (apiError.code === 'QUOTA_EXCEEDED' || apiError.code === 'LIMIT_REACHED')) {
        setErrorDetails({ title: apiError.code, message: apiError.message, code: apiError.code });
        setIsPremiumModalOpen(true);
        store.setStatus('idle');
      } else {
        store.setStatus('error');
      }
    }
  };

  return (
    <AuthGuard>
      <div className="print-path flex flex-col md:flex-row h-[calc(100vh-64px)] w-full bg-black industrial-grid selection:bg-cyan-accent selection:text-black font-sans relative overflow-x-hidden">
        
        {/* Modular Components */}
        <EditorSidebar onGenerate={handleGenerate} />

        <main className={`print-path flex-grow h-full bg-[#111111] flex flex-col overflow-hidden relative transition-all duration-500`}>
          <EditorToolbar onPrint={handlePrint} />
          <EditorWorkspace />
          
          {/* Generation Trigger (Keep in Sidebar for accessibility) */}
          {!store.isSidebarHidden && (
            <div className="md:hidden fixed bottom-6 right-6 z-50">
              <button 
                onClick={handleGenerate}
                disabled={store.status === 'loading'}
                className="w-14 h-14 bg-cyan-accent text-black rounded-full shadow-2xl flex items-center justify-center premium-touch font-bold text-[10px] uppercase"
              >
                  {store.status === 'loading' ? '...' : 'Execute'}
              </button>
            </div>
          )}
        </main>
      </div>

      {/* Global Modals */}
      <PremiumModal 
        isOpen={isPremiumModalOpen} 
        onClose={() => setIsPremiumModalOpen(false)} 
        title={errorDetails?.title} 
        description={errorDetails?.message} 
        errorCode={errorDetails?.code} 
      />
    </AuthGuard>
  );
}

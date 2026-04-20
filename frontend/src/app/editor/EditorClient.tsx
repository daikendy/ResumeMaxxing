'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@clerk/clerk-react';
import { resumeService } from '@/lib/api/services/resumeService';
import { ResumeResponse } from '@/lib/api/types/resume';
import { calculateMatchScore } from '@/lib/utils/keywordMatcher';
import { AuthGuard } from '@/components/AuthGuard';

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
  LucideDownload
} from 'lucide-react';
import Link from 'next/link';

type EditorState = 'idle' | 'loading' | 'success' | 'error';

export default function EditorClient({ jobId }: { jobId: string }) {
  const { getToken, isLoaded } = useAuth();
  const [targetJobTitle, setTargetJobTitle] = useState('');
  const [targetJobDescription, setTargetJobDescription] = useState('');
  const [status, setStatus] = useState<EditorState>('idle');
  const [resumeData, setResumeData] = useState<ResumeResponse | null>(null);
  const [matchScore, setMatchScore] = useState<number | null>(null);
  const [originalScore, setOriginalScore] = useState<number | null>(null);
  const [masterProfile, setMasterProfile] = useState<any | null>(null);
  const [showAllSkills, setShowAllSkills] = useState(false);
  const [isSidebarHidden, setIsSidebarHidden] = useState(false);
  const [pageSize, setPageSize] = useState<'A4' | 'LETTER'>('A4');

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
        }

        // Fetch Job Details
        if (jobId && jobId !== '1') {
          const job = await resumeService.getTrackedJob(jobId, token);
          if (job) {
            setTargetJobTitle(job.job_title);
            setTargetJobDescription(job.job_description || '');
            console.log("📍 JOB DATA SYNCED:", job.job_title);
          }
        }
      } catch (err) {
        console.error("Failed to fetch editor data:", err);
      }
    };

    if (isLoaded) {
      fetchData();
    }
  }, [jobId, isLoaded]);

  // Handle Dynamic @page Size for Print
  useEffect(() => {
    const styleId = 'dynamic-page-size';
    let style = document.getElementById(styleId);
    if (!style) {
      style = document.createElement('style');
      style.id = styleId;
      document.head.appendChild(style);
    }
    style.innerHTML = `
      @media print {
        @page {
          size: ${pageSize === 'A4' ? 'A4' : '8.5in 11in'} portrait !important;
          margin: 0 !important;
        }
      }
    `;
  }, [pageSize]);

  const handleGenerate = async () => {
    if (!targetJobTitle || !targetJobDescription) return;

    setStatus('loading');
    setResumeData(null);

    try {
      console.log("🚀 GENERATION START", {
        jobId,
        targetJobTitle,
        masterProfileSent: masterProfile || "FALLBACK"
      });

      const token = await getToken();
      if (!token) throw new Error("No session found");

      const response = await resumeService.generateTailoredResume({
        tracked_job_id: parseInt(jobId) || 1,
        raw_resume_data: masterProfile || {
          name: "Unknown User",
          experience: [],
          skills: []
        }
      }, token);

      console.log("✅ AI RESPONSE RECEIVED:", response.resume_content);
      setResumeData(response);

      // Calculate Before vs After
      const baseScore = calculateMatchScore(targetJobDescription, masterProfile);
      const optimizedScore = calculateMatchScore(targetJobDescription, response.resume_content);

      setOriginalScore(baseScore);
      setMatchScore(optimizedScore);

      setStatus('success');
      setIsSidebarHidden(true); // Auto-hide sidebar on success
    } catch (error) {
      console.error(error);
      setStatus('error');
    }
  };



  return (
    <AuthGuard>
      <div className="print-path flex flex-col md:flex-row h-[calc(100vh-64px)] w-full bg-black industrial-grid selection:bg-cyan-accent selection:text-black font-sans relative overflow-x-hidden">
      {/* LEFT COLUMN: The Design Studio Controls */}
      {!isSidebarHidden && (
        <div className="print:hidden w-full md:w-[40%] lg:w-[32%] xl:w-[28%] h-full bg-zinc-950 text-zinc-50 flex flex-col pt-6 pb-8 px-6 md:px-10 overflow-y-auto border-r border-zinc-900 shadow-2xl relative z-20">

        {/* Navigation & Header */}
        <div className="flex flex-col gap-6 mb-10">
          {/* Navbar placeholder padding removed - Navbar is global now */}

          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-1.5 bg-zinc-800 rounded-sm">
                <LucideLayers3 className="w-4 h-4 text-zinc-400" />
              </div>
              <h1 className="text-xl font-heading font-bold tracking-[0.1em] uppercase text-white">
                Editor Studio
              </h1>
            </div>
            <p className="text-zinc-500 text-[10px] font-mono leading-relaxed uppercase tracking-wider">
              System: ATS-Alignment v2.1 // Cold Generation
            </p>
          </div>
        </div>

        <div className="flex flex-col space-y-8 flex-grow">
          {/* Data Snapshot Widget */}
          <div className="p-4 bg-zinc-900/50 border border-zinc-800 rounded-sm space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
              <div className="flex items-center gap-2">
                <LucideDatabase className="w-3 h-3 text-cyan-accent" />
                <span className="text-[10px] uppercase tracking-widest font-bold text-zinc-400">Master Data</span>
              </div>
              <span className="text-[9px] font-mono text-zinc-600">Identity: Clerk Verified</span>
            </div>

            {!masterProfile ? (
              <div className="flex items-center gap-3 py-2 text-zinc-600 animate-pulse">
                <LucideCircleDashed className="w-4 h-4 animate-spin" />
                <span className="text-[10px] uppercase tracking-tighter">Syncing Profile...</span>
              </div>
            ) : (
              <div className="space-y-3">
                {/* Profile summary counts */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <LucideBriefcase className="w-3 h-3 text-zinc-500" />
                      <span className="text-[9px] text-zinc-400 font-mono">Experience</span>
                    </div>
                    <span className="text-[9px] text-zinc-300 font-mono font-bold">{masterProfile.experience?.length || 0}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <LucideGraduationCap className="w-3 h-3 text-zinc-500" />
                      <span className="text-[9px] text-zinc-400 font-mono">Education</span>
                    </div>
                    <span className="text-[9px] text-zinc-300 font-mono font-bold">{masterProfile.education?.length || 0}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <LucideFolderGit2 className="w-3 h-3 text-zinc-500" />
                      <span className="text-[9px] text-zinc-400 font-mono">Projects</span>
                    </div>
                    <span className="text-[9px] text-zinc-300 font-mono font-bold">{masterProfile.projects?.length || 0}</span>
                  </div>
                </div>

                <div className="border-t border-zinc-800 pt-2">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <LucideCpu className="w-3 h-3 text-zinc-500" />
                      <span className="text-[10px] text-zinc-300 font-mono italic">
                        {masterProfile.skills?.length || 0} Skills Detected
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1 opacity-60">
                    {(showAllSkills ? masterProfile.skills : masterProfile.skills?.slice(0, 8))?.map((s: string, i: number) => (
                      <span key={i} className="px-1.5 py-0.5 bg-zinc-800 text-[8px] text-zinc-400 uppercase tracking-tighter border border-zinc-700">
                        {s}
                      </span>
                    ))}
                  </div>
                  {masterProfile.skills?.length > 8 && (
                    <button
                      onClick={() => setShowAllSkills(!showAllSkills)}
                      className="flex items-center gap-1 mt-2 text-[8px] text-zinc-500 hover:text-zinc-300 uppercase tracking-widest transition-colors group"
                    >
                      {showAllSkills ? (
                        <><LucideChevronUp className="w-3 h-3" /> Show Less</>
                      ) : (
                        <><LucideChevronDown className="w-3 h-3" /> Show All {masterProfile.skills.length} Skills</>
                      )}
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Job Title Input */}
          <div className="space-y-3">
            <label className="text-[10px] uppercase tracking-widest font-bold text-zinc-500 flex justify-between">
              Target Title
              <span className="text-[9px] font-normal lowercase italic text-zinc-700"> ATS Anchor</span>
            </label>
            <Input
              placeholder="e.g. Senior Frontend Engineer"
              className="bg-zinc-900 border-zinc-800 text-zinc-100 placeholder:text-zinc-600 focus-visible:ring-1 focus-visible:ring-zinc-400 rounded-sm h-11 text-xs"
              value={targetJobTitle}
              onChange={(e) => setTargetJobTitle(e.target.value)}
              disabled={status === 'loading'}
            />
          </div>

          {/* Job Description Textarea */}
          <div className="space-y-3 flex-grow flex flex-col">
            <label className="text-[10px] uppercase tracking-widest font-bold text-zinc-500 flex justify-between">
              Job Description
              <span className="text-[9px] font-normal lowercase italic text-zinc-700"> Extraction Source</span>
            </label>
            <Textarea
              placeholder="Paste the target JD here..."
              className="bg-zinc-900 border-zinc-800 text-zinc-100 placeholder:text-zinc-600 focus-visible:ring-1 focus-visible:ring-zinc-400 rounded-sm flex-grow resize-none p-4 text-xs leading-relaxed"
              value={targetJobDescription}
              onChange={(e) => setTargetJobDescription(e.target.value)}
              disabled={status === 'loading'}
            />
          </div>
        </div>

        {/* Page Architecture Controls */}
        <div className="py-6 border-t border-zinc-900 space-y-4">
          <label className="text-[10px] uppercase tracking-widest font-bold text-zinc-500">Page Architecture</label>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setPageSize('A4')}
              className={`h-10 text-[10px] uppercase tracking-widest font-mono border transition-all duration-300 ${pageSize === 'A4' ? 'bg-zinc-100 text-zinc-950 border-white' : 'bg-transparent text-zinc-600 border-zinc-800 hover:border-zinc-700'}`}
            >
              A4 (Metric)
            </button>
            <button
              onClick={() => setPageSize('LETTER')}
              className={`h-10 text-[10px] uppercase tracking-widest font-mono border transition-all duration-300 ${pageSize === 'LETTER' ? 'bg-zinc-100 text-zinc-950 border-white' : 'bg-transparent text-zinc-600 border-zinc-800 hover:border-zinc-700'}`}
            >
              Letter (US)
            </button>
          </div>
          <p className="text-[8px] text-zinc-700 font-mono italic">Dimensions: {pageSize === 'A4' ? '210mm × 297mm' : '8.5in × 11in'}</p>
        </div>

        <div className="pt-6 mt-auto space-y-3">
          <Button
            className="w-full bg-zinc-50 hover:bg-white text-zinc-950 rounded-sm h-14 text-xs uppercase tracking-[0.2em] font-bold transition-all duration-300 shadow-[0_0_20px_rgba(255,255,255,0.05)] flex items-center justify-center gap-2 group"
            onClick={handleGenerate}
            disabled={status === 'loading' || !targetJobTitle || !targetJobDescription}
          >
            {status === 'loading' ? (
              <>
                <LucideCircleDashed className="w-4 h-4 animate-spin text-zinc-600" />
                Processing...
              </>
            ) : (
              <>
                <LucideZap className="w-4 h-4 transition-transform group-hover:scale-125" />
                Execute Generation
              </>
            )}
          </Button>

          {/* Print / Save as PDF Button */}
          {status === 'success' && resumeData && (
            <Button
              className="print:hidden no-print w-full bg-emerald-600 hover:bg-emerald-500 text-white rounded-sm h-12 text-xs uppercase tracking-[0.2em] font-bold transition-all duration-300 shadow-[0_0_20px_rgba(16,185,129,0.15)] flex items-center justify-center gap-2 group"
              onClick={() => window.print()}
            >
              <LucideDownload className="w-4 h-4 transition-transform group-hover:translate-y-0.5" />
              Save as PDF
            </Button>
          )}

          {status === 'error' && (
            <p className="text-rose-400 text-[10px] mt-4 text-center font-mono uppercase tracking-widest">Protocol Failure: Backend Connection Lost</p>
          )}
        </div>
      </div>
      )}

      {/* RIGHT COLUMN: The Design Canvas */}
      <div className={`print-path print:p-0 flex-grow h-full bg-[#111111] print:bg-white p-4 sm:p-6 md:p-10 lg:p-16 xl:p-24 overflow-y-auto flex flex-col items-center custom-scrollbar relative ${isSidebarHidden ? 'w-full' : 'w-auto'}`}>
        
        {/* Toggle Sidebar Button (Persistent) */}
        <button 
          onClick={() => setIsSidebarHidden(!isSidebarHidden)}
          className="no-print absolute top-12 left-8 z-50 p-3 bg-zinc-900/90 backdrop-blur-md border border-zinc-800 text-zinc-400 hover:text-white rounded-sm flex items-center gap-3 transition-all duration-300 hover:bg-zinc-800 group shadow-xl active:scale-95"
          title={isSidebarHidden ? "Open Design Studio" : "Full Focus View"}
        >
          <LucideTerminal className={`w-4 h-4 ${isSidebarHidden ? 'text-zinc-500' : 'text-cyan-accent'} group-hover:scale-110 transition-transform duration-300`} />
          {isSidebarHidden && (
            <span className="text-[10px] uppercase tracking-[0.2em] font-bold animate-in fade-in slide-in-from-left-2 duration-300">Open Design Studio</span>
          )}
        </button>

        {/* Subtle Canvas Pattern Overlay */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
          style={{ backgroundImage: 'radial-gradient(#ffffff 0.5px, transparent 0.5px)', backgroundSize: '24px 24px' }}></div>

        {/* ============================================= */}
        {/* HUD: OUTSIDE the A4 paper, on dark background */}
        {/* ============================================= */}
        {(status === 'success' && resumeData) && matchScore !== null && originalScore !== null && (
          <div className="no-print print:hidden w-full max-w-[850px] mb-6 p-5 bg-white/5 border border-white/10 backdrop-blur-sm relative z-10 animate-in fade-in duration-700">
            <div className="flex justify-between items-end mb-4">
              <div className="space-y-4">
                <div>
                  <h4 className="text-[9px] uppercase tracking-[0.3em] font-bold text-zinc-400 mb-1 font-sans">Document Alignment Analysis</h4>
                  <p className="text-[10px] text-zinc-500 font-sans italic opacity-70">Smarter technical weighted matching v2.0</p>
                </div>

                <div className="flex gap-4 items-center">
                  <div className="px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded-sm">
                    <div className="text-[8px] uppercase tracking-widest text-zinc-500 mb-0.5">Master Profile</div>
                    <div className="text-sm font-mono text-zinc-400">{originalScore}%</div>
                  </div>
                  <div className="w-4 h-[1px] bg-zinc-800" />
                  <div className="px-3 py-1.5 bg-zinc-900 border border-zinc-700 rounded-sm relative overflow-hidden group">
                    <div className="absolute inset-0 bg-teal-500/5 group-hover:bg-teal-500/10 transition-colors" />
                    <div className="text-[8px] uppercase tracking-widest text-teal-500/80 mb-0.5 relative z-10">Tailored Match</div>
                    <div className="text-sm font-mono text-teal-400 relative z-10">{matchScore}%</div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col items-end">
                <div className="flex items-center gap-3">
                  {matchScore > originalScore && (
                    <div className="px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-[9px] font-bold text-emerald-400 uppercase tracking-tighter animate-bounce shadow-[0_0_15px_rgba(16,185,129,0.1)]">
                      +{matchScore - originalScore}% AI Boost
                    </div>
                  )}
                  <span className={`text-5xl font-playfair tracking-tighter ${matchScore >= 80 ? 'text-teal-400' :
                    matchScore >= 60 ? 'text-amber-400' :
                      'text-rose-400'
                    }`}>
                    {matchScore}%
                  </span>
                </div>
                <span className="text-[8px] uppercase tracking-widest text-zinc-500 font-sans font-bold mt-1">Accuracy Score</span>
              </div>
            </div>

            <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-[1500ms] ease-out ${matchScore >= 80 ? 'bg-teal-500 shadow-[0_0_15px_rgba(20,184,166,0.3)]' :
                  matchScore >= 60 ? 'bg-amber-400 shadow-[0_0_15px_rgba(251,191,36,0.3)]' :
                    'bg-rose-500 shadow-[0_0_15px_rgba(244,63,94,0.3)]'
                  }`}
                style={{ width: `${matchScore}%` }}
              />
            </div>

            {/* Tailored Match sub-header */}
            <div className="mt-4 pt-3 border-t border-white/10 text-center">
              <h2 className="text-lg font-playfair uppercase tracking-[0.3em] mb-1 leading-tight text-white/80">
                Tailored Match
              </h2>
              <div className="flex items-center justify-center gap-4 text-[10px] font-sans tracking-[0.4em] text-zinc-500 uppercase font-medium">
                <span>Version {resumeData.version_number}</span>
                <div className="w-1 h-1 rounded-full bg-zinc-600" />
                <span>Job Artifact ID {resumeData.tracked_job_id}</span>
              </div>
            </div>
          </div>
        )}

        {/* A4 PAPER CONTAINER: Clean resume data ONLY */}
        <div 
          id="printable-resume-mount" 
          className={`print:shadow-none print:border-none print:p-[6mm] a4-paper bg-white shadow-[0_30px_90px_rgba(0,0,0,0.15)] rounded-sm border border-zinc-300 px-4 md:px-6 py-4 md:py-6 relative transition-all duration-700 flex flex-col ${pageSize === 'LETTER' ? 'w-full max-w-[816px] min-h-[1056px] size-letter' : 'w-full max-w-[850px] min-h-[1100px] size-a4'}`}
        >

          {/* Aesthetic Paper Texture Overlay */}
          <div className="absolute inset-0 opacity-[0.02] pointer-events-none mix-blend-multiply rounded-sm"
            style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E\")" }}>
          </div>

          {/* IDLE STATE */}
          {status === 'idle' && (
            <div className="flex-grow flex flex-col items-center justify-center text-center opacity-40">
              <span className="text-zinc-400 font-playfair italic text-3xl mb-4 tracking-tight">
                Drafting your match...
              </span>
              <div className="w-24 h-[1px] bg-zinc-200"></div>
            </div>
          )}

          {/* LOADING STATE */}
          {status === 'loading' && (
            <div className="space-y-10 animate-pulse pt-6 flex-grow">
              <div className="space-y-4">
                <Skeleton className="h-10 w-[60%] bg-zinc-100" />
                <Skeleton className="h-3 w-1/3 bg-zinc-50" />
              </div>
              <div className="space-y-5">
                <Skeleton className="h-1.5 w-full bg-zinc-50" />
                <Skeleton className="h-1.5 w-full bg-zinc-50" />
                <Skeleton className="h-1.5 w-[90%] bg-zinc-50" />
                <Skeleton className="h-1.5 w-[85%] bg-zinc-50" />
              </div>
              <div className="space-y-5">
                <Skeleton className="h-1.5 w-full bg-zinc-50" />
                <Skeleton className="h-1.5 w-[75%] bg-zinc-50" />
              </div>
            </div>
          )}

          {/* SUCCESS STATE — Resume content only */}
          {(status === 'success' && resumeData) && (
            <div className="flex-grow animate-in slide-in-from-bottom-4 fade-in duration-1000 flex flex-col">

              {/* EXPORT TARGET: Only resume content */}
              <div id="resume-export-target" className="flex-grow space-y-4 text-zinc-800 pb-6" style={{ fontFamily: "'Georgia', 'Times New Roman', serif" }}>

                {/* 1. Header & Contact */}
                <div className="text-center space-y-0.5">
                  <h1 className="text-2xl font-bold tracking-tight text-zinc-900 border-b-2 border-zinc-900 inline-block px-3 pb-1" style={{ fontFamily: "'Georgia', serif" }}>
                    {resumeData.resume_content.contact?.name || "Candidate Name"}
                  </h1>
                  <div className="flex flex-wrap items-center justify-center gap-x-2 gap-y-0.5 text-[9px] uppercase tracking-wider font-sans font-bold text-zinc-500 pt-1">
                    {resumeData.resume_content.contact?.email && (
                      <span>{resumeData.resume_content.contact.email}</span>
                    )}
                    {resumeData.resume_content.contact?.phone && (
                      <><span className="opacity-30">|</span><span>{resumeData.resume_content.contact.phone}</span></>
                    )}
                    {resumeData.resume_content.contact?.github && (
                      <><span className="opacity-30">|</span><span>{resumeData.resume_content.contact.github}</span></>
                    )}
                    {resumeData.resume_content.contact?.linkedin && (
                      <><span className="opacity-30">|</span><span>{resumeData.resume_content.contact.linkedin}</span></>
                    )}
                  </div>
                </div>

                {/* 1.5 Professional Summary */}
                {resumeData.resume_content.summary && (
                  <div className="pt-2">
                    <p className="text-[11px] leading-relaxed text-zinc-700 text-center mx-auto max-w-[90%]">
                      {resumeData.resume_content.summary}
                    </p>
                  </div>
                )}

                {/* 2. Professional Experience */}
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <h3 className="text-[10px] uppercase tracking-[0.3em] font-black text-zinc-400 whitespace-nowrap font-sans">Professional Experience</h3>
                    <div className="h-[1px] w-full bg-zinc-200" />
                  </div>
                  <div className="space-y-3">
                    {resumeData.resume_content.experience?.map((exp: any, i: number) => (
                      <div key={i} className="space-y-1">
                        <div className="flex justify-between items-baseline">
                          <h4 className="text-sm font-bold text-zinc-900 font-sans leading-tight">{exp.title}</h4>
                          <span className="text-[9px] font-mono text-zinc-500 font-bold shrink-0 ml-2 tracking-tighter">
                            {exp.startDate ? `${exp.startDate} ${exp.endDate ? `— ${exp.endDate}` : '— Present'}` : (exp.duration || "Present")}
                          </span>
                        </div>
                        <div className="flex justify-between items-center text-[10px] uppercase tracking-wider font-bold text-zinc-500 font-sans">
                          <div className="italic">{exp.company}</div>
                          {exp.location && <div className="text-[9px] font-normal tracking-widest text-zinc-400">{exp.location}</div>}
                        </div>
                        {exp.technologies && (
                          <div className="text-[9px] text-zinc-500 italic leading-tight font-sans mt-0.5 opacity-80">
                            {exp.technologies}
                          </div>
                        )}
                        <ul className="list-disc pl-4 space-y-0.5 marker:text-zinc-300 mt-1">
                          {exp.bullets?.map((b: string, bi: number) => (
                            <li key={bi} className="text-[11px] leading-snug text-zinc-700 pl-1">{formatBullet(b)}</li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 3. Projects */}
                {resumeData.resume_content.projects && resumeData.resume_content.projects.length > 0 && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <h3 className="text-[10px] uppercase tracking-[0.3em] font-black text-zinc-400 whitespace-nowrap font-sans">Strategic Projects</h3>
                      <div className="h-[1px] w-full bg-zinc-200" />
                    </div>
                    <div className="space-y-2">
                      {resumeData.resume_content.projects.map((proj: any, i: number) => (
                        <div key={i} className="space-y-0.5">
                          <div className="flex justify-between items-baseline">
                            <h4 className="text-sm font-bold text-zinc-900 font-sans leading-snug">{proj.title}</h4>
                            <span className="text-[9px] font-mono text-zinc-400 shrink-0 ml-2">
                              {proj.startDate ? `${proj.startDate} ${proj.endDate ? `— ${proj.endDate}` : ''}` : ''}
                            </span>
                          </div>
                          <div className="flex justify-between items-center text-[9px] uppercase tracking-wider font-bold text-zinc-500 font-sans">
                            {proj.technologies && (
                              <div className="italic leading-tight opacity-80">
                                {proj.technologies}
                              </div>
                            )}
                            {proj.location && <div className="font-normal tracking-widest text-zinc-400 uppercase">{proj.location}</div>}
                          </div>
                          <p className="text-[11px] leading-snug text-zinc-700 italic mt-0.5">
                            {formatBullet(proj.description || "")}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 4. Skills Matrix */}
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <h3 className="text-[10px] uppercase tracking-[0.3em] font-black text-zinc-400 whitespace-nowrap font-sans">Technical Skills</h3>
                    <div className="h-[1px] w-full bg-zinc-200" />
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {resumeData.resume_content.skills?.map((skill: string, i: number) => (
                      <span key={i} className="border border-zinc-200 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-zinc-600 bg-zinc-50">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                {/* 5. Education */}
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <h3 className="text-[10px] uppercase tracking-[0.3em] font-black text-zinc-400 whitespace-nowrap font-sans">Education</h3>
                    <div className="h-[1px] w-full bg-zinc-200" />
                  </div>
                  {resumeData.resume_content.education?.map((edu: any, i: number) => (
                    <div key={i} className="flex justify-between items-start">
                      <div className="space-y-0.5">
                        <h4 className="text-[11px] font-bold text-zinc-900 font-sans leading-tight">{edu.degree}</h4>
                        <div className="flex items-center gap-2">
                          <p className="text-[9px] uppercase tracking-widest text-zinc-600 font-sans font-bold">{edu.institution}</p>
                          {edu.location && <span className="text-[8px] text-zinc-400 tracking-widest uppercase">| {edu.location}</span>}
                        </div>
                        {edu.gpa && <p className="text-[9px] text-zinc-500 italic mt-0.5">GPA: {edu.gpa}</p>}
                      </div>
                      <span className="text-[9px] font-mono text-zinc-500 font-bold tracking-tighter">{edu.year}</span>
                    </div>
                  ))}
                </div>

              </div>
              {/* ========= END EXPORT TARGET ========= */}

              {/* FOOTER ADORNMENT */}
              <div className="print:hidden no-print mt-auto pt-6 border-t border-zinc-100 flex justify-between items-center opacity-40 text-[8px] font-sans tracking-widest uppercase text-zinc-400">
                <span>ResumeMaxxing V1.0-MVP</span>
                <span>System Generated Artifact</span>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
    </AuthGuard>
  );
}

// Lightweight Markdown bolding formatter
function formatBullet(text: string) {
  if (!text) return null;
  // Replace **text** with <strong>text</strong>
  const formatted = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  return <span dangerouslySetInnerHTML={{ __html: formatted }} />;
}

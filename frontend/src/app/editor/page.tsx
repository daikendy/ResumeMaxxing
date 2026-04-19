'use client';

import React, { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { resumeService } from '@/lib/api/services/resumeService';
import { ResumeResponse } from '@/lib/api/types/resume';

type EditorState = 'idle' | 'loading' | 'success' | 'error';

function EditorContent() {
  const searchParams = useSearchParams();
  const jobId = searchParams.get('jobId') || '1'; // Reads ?jobId=123 from URL

  const [targetJobTitle, setTargetJobTitle] = useState('');
  const [targetJobDescription, setTargetJobDescription] = useState('');
  const [status, setStatus] = useState<EditorState>('idle');
  const [resumeData, setResumeData] = useState<ResumeResponse | null>(null);

  const handleGenerate = async () => {
    if (!targetJobTitle || !targetJobDescription) return;
    
    setStatus('loading');
    setResumeData(null);

    try {
      const dummyRawResume = {
        contact: { name: "Your Name", email: "test@test.com" },
        experience: [{ title: "Raw Title", company: "Raw Co", bullets: ["Did stuff"] }]
      };

      const response = await resumeService.generateTailoredResume({
        tracked_job_id: parseInt(jobId) || 1,
        user_id: "dev-user-123",
        raw_resume_data: dummyRawResume
      });

      setResumeData(response);
      setStatus('success');
    } catch (error) {
      console.error(error);
      setStatus('error');
    }
  };

  return (
    <div className="flex flex-col md:flex-row h-screen w-full bg-[#f4f4f5] overflow-hidden font-sans">
      
      {/* LEFT COLUMN: The Input Panel (Utilitarian & Severe) */}
      <div className="w-full md:w-[40%] lg:w-[35%] h-full bg-zinc-950 text-zinc-50 flex flex-col pt-12 pb-8 px-8 md:px-12 overflow-y-auto border-r border-zinc-900 shadow-2xl relative z-10">
        <div className="mb-12">
          <h1 className="text-3xl font-playfair font-normal tracking-tight mb-2 text-white">
            Resume Editor
          </h1>
          <p className="text-zinc-400 text-sm font-light leading-relaxed">
            Configure the parameters for the AI generation cycle. 
            Inputs strictly dictate the alignment of the tailored output.
          </p>
        </div>

        <div className="flex flex-col space-y-8 flex-grow">
          {/* Job Title Input */}
          <div className="space-y-3">
            <label className="text-xs uppercase tracking-wider font-semibold text-zinc-500">
              Target Job Title
            </label>
            <Input 
              placeholder="e.g. Senior Frontend Engineer" 
              className="bg-zinc-900 border-zinc-800 text-zinc-100 placeholder:text-zinc-600 focus-visible:ring-1 focus-visible:ring-zinc-400 rounded-sm h-12"
              value={targetJobTitle}
              onChange={(e) => setTargetJobTitle(e.target.value)}
              disabled={status === 'loading'}
            />
          </div>

          {/* Job Description Textarea */}
          <div className="space-y-3 flex-grow flex flex-col">
            <label className="text-xs uppercase tracking-wider font-semibold text-zinc-500">
              Target Job Description
            </label>
            <Textarea 
              placeholder="Paste the full job description here..." 
              className="bg-zinc-900 border-zinc-800 text-zinc-100 placeholder:text-zinc-600 focus-visible:ring-1 focus-visible:ring-zinc-400 rounded-sm flex-grow resize-none p-4"
              value={targetJobDescription}
              onChange={(e) => setTargetJobDescription(e.target.value)}
              disabled={status === 'loading'}
            />
          </div>
        </div>

        <div className="pt-8 mt-auto">
          <Button 
            className="w-full bg-white hover:bg-zinc-200 text-zinc-950 rounded-sm h-14 text-sm uppercase tracking-widest font-semibold transition-all duration-300"
            onClick={handleGenerate}
            disabled={status === 'loading' || !targetJobTitle || !targetJobDescription}
          >
            {status === 'loading' ? 'Generating...' : 'Generate Tailored Resume'}
          </Button>
          {status === 'error' && (
            <p className="text-red-400 text-xs mt-3 text-center">Failed to connect to backend.</p>
          )}
        </div>
      </div>

      {/* RIGHT COLUMN: The Live Preview (Tactile & Elegant) */}
      <div className="w-full md:w-[60%] lg:w-[65%] h-full flex flex-col items-center justify-center bg-[#eaeaea] p-8 md:p-12 lg:p-20 overflow-y-auto">
        <div className="w-full max-w-3xl min-h-[85vh] bg-[#fdfdfc] shadow-[0_20px_60px_rgba(0,0,0,0.08)] rounded border border-[#ececec] px-12 py-16 transition-all duration-500 relative">
          
          <div className="absolute inset-0 opacity-[0.015] pointer-events-none mix-blend-multiply" 
               style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}>
          </div>

          {status === 'idle' && (
            <div className="h-full flex flex-col items-center justify-center text-center opacity-60">
              <span className="text-[#a0a0a0] font-playfair italic text-2xl mb-4">
                Awaiting job description...
              </span>
              <div className="w-16 h-[1px] bg-[#d0d0d0]"></div>
            </div>
          )}

          {status === 'loading' && (
            <div className="space-y-12 animate-pulse pt-4">
              <div className="space-y-4">
                <Skeleton className="h-10 w-[40%] bg-zinc-200" />
                <Skeleton className="h-4 w-1/4 bg-zinc-100" />
              </div>
              <div className="space-y-4">
                <Skeleton className="h-6 w-[20%] bg-zinc-200" />
                <Skeleton className="h-2 w-full bg-zinc-100" />
                <Skeleton className="h-2 w-full bg-zinc-100" />
                <Skeleton className="h-2 w-[85%] bg-zinc-100" />
              </div>
            </div>
          )}

          {(status === 'success' && resumeData) && (
            <div className="h-full animate-in fade-in duration-700 font-serif text-zinc-800 space-y-8">
              <div className="border-b border-zinc-200 pb-6 mb-8 text-center">
                <h2 className="text-3xl font-playfair text-zinc-900 uppercase tracking-widest mb-2">
                  Tailored Match
                </h2>
                <p className="text-sm font-sans tracking-widest text-zinc-400">
                  VERSION {resumeData.version_number} &bull; JOB ID {resumeData.tracked_job_id}
                </p>
              </div>

              <div className="font-sans text-sm pb-8 leading-relaxed text-zinc-600">
                {resumeData.resume_content?.experience?.map((exp: any, idx: number) => (
                  <div key={idx} className="mb-8">
                    <h3 className="text-zinc-900 font-bold text-lg font-playfair tracking-wide">{exp.title}</h3>
                    <h4 className="text-zinc-500 font-semibold text-xs tracking-wider uppercase mb-3">
                      {exp.company}
                    </h4>
                    <ul className="list-disc pl-5 space-y-2 mt-2 text-zinc-700 marker:text-zinc-400">
                      {exp.bullets?.map((bullet: string, bIdx: number) => (
                        <li key={bIdx} className="pl-1">{bullet}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

export default function EditorPage() {
  return (
    <Suspense fallback={<div className="h-screen w-full bg-zinc-950"></div>}>
      <EditorContent />
    </Suspense>
  );
}

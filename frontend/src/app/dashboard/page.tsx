'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@clerk/clerk-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { resumeService } from '@/lib/api/services/resumeService';
import { AuthGuard } from '@/components/AuthGuard';
import { PremiumModal } from '@/components/PremiumModal';
import {
  LucidePlus,
  LucideTerminal,
  LucideBriefcase,
  LucideArrowRight,
  LucideLayoutDashboard,
  LucidePlusCircle,
  LucideSearch,
  LucideFileText,
  LucideX,
  LucideAlertCircle,
  LucideTrash2
} from 'lucide-react';

interface TrackedJob {
  id: number;
  job_title: string;
  company_name: string;
  job_description: string;
  status: string;
  created_at: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const { getToken, isLoaded } = useAuth();
  const [jobs, setJobs] = useState<TrackedJob[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Profile Status
  const [profileStatus, setProfileStatus] = useState<'COMPLETE' | 'INITIALIZING' | 'EMPTY'>('INITIALIZING');

  // New Job Form State
  const [newJob, setNewJob] = useState({
    job_title: '',
    company_name: '',
    job_description: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPremiumModalOpen, setIsPremiumModalOpen] = useState(false);
  const [errorDetails, setErrorDetails] = useState<{title: string, message: string} | null>(null);

  useEffect(() => {
    if (isLoaded) {
      fetchJobs();
      fetchProfileStatus();
    }
  }, [isLoaded]);

  const fetchProfileStatus = async () => {
    try {
      const token = await getToken();
      if (!token) return;
      const response = await resumeService.getMasterResume(token);
      if (response && response.resume_data && response.resume_data.experience?.length > 0) {
        setProfileStatus('COMPLETE');
      } else {
        setProfileStatus('EMPTY');
      }
    } catch (e) {
      setProfileStatus('EMPTY');
    }
  };

  const fetchJobs = async () => {
    try {
      setIsLoading(true);
      const token = await getToken();
      
      if (!token) {
        setIsLoading(false);
        return;
      }
      
      const data = await resumeService.getTrackedJobs(token);
      setJobs(data || []);
      setError(null);
    } catch (err: any) {
      console.error("Failed to fetch jobs:", err);
      setError(err.message || "Unable to sync with master control. Check your connection.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateJob = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newJob.job_title || !newJob.company_name || !newJob.job_description) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const token = await getToken();
      if (!token) throw new Error("No session found");

      const response = await resumeService.createTrackedJob(newJob, token);
      router.push(`/editor?jobId=${response.id}`);
    } catch (err: any) {
      const apiError = err.response?.data;
      if (apiError && apiError.code === 'LIMIT_REACHED') {
        setIsPremiumModalOpen(true);
        setIsModalOpen(false); // Close the small form modal
        setErrorDetails({
          title: "RESOURCE LIMIT REACHED",
          message: apiError.message || "Upgrade to Pro to track more opportunities.",
          code: apiError.code
        });
      } else {
        setError(err.message || "System glitch. Please try again in a moment.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteJob = async (id: number) => {
    if (!confirm("Are you sure you want to terminate this track?")) return;
    try {
      const token = await getToken();
      if (!token) return;
      await resumeService.deleteTrackedJob(id, token);
      setJobs(jobs.filter(j => j.id !== id));
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <AuthGuard>
      <div className="min-h-screen bg-black industrial-grid selection:bg-cyan-accent selection:text-black font-sans pb-20">
      
      {/* MODAL / OVERLAY FORM */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-xl bg-zinc-950 border border-white/10 p-8 relative animate-in fade-in zoom-in duration-300">
            <button 
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-white/40 hover:text-white transition-colors"
            >
              <LucideX className="w-6 h-6" />
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-cyan-muted border border-cyan-accent/20">
                <LucideBriefcase className="w-5 h-5 text-cyan-accent" />
              </div>
              <h2 className="text-xl font-heading text-white uppercase tracking-[0.15em]">Track New Job</h2>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-3 animate-in slide-in-from-top-2">
                <LucideAlertCircle className="w-4 h-4 flex-shrink-0" />
                <p className="font-mono uppercase tracking-tight">{error}</p>
              </div>
            )}

            <form onSubmit={handleCreateJob} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] uppercase font-heading text-white/40 tracking-[0.2em]">Target Role</label>
                <Input 
                  value={newJob.job_title}
                  onChange={e => setNewJob({...newJob, job_title: e.target.value})}
                  className="bg-black/40 border-white/10 text-white font-mono placeholder:text-white/10 focus:border-cyan-accent h-12 text-sm"
                  placeholder="e.g. Senior Backend Engineer"
                  autoFocus
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] uppercase font-heading text-white/40 tracking-[0.2em]">Company Name</label>
                <Input 
                  value={newJob.company_name}
                  onChange={e => setNewJob({...newJob, company_name: e.target.value})}
                  className="bg-black/40 border-white/10 text-white font-mono placeholder:text-white/10 focus:border-cyan-accent h-12 text-sm"
                  placeholder="e.g. Google, Inc."
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] uppercase font-heading text-white/40 tracking-[0.2em]">Job Description</label>
                <Textarea 
                  value={newJob.job_description}
                  onChange={e => setNewJob({...newJob, job_description: e.target.value})}
                  className="bg-black/40 border-white/10 text-white font-mono placeholder:text-white/10 focus:border-cyan-accent min-h-[150px] text-xs leading-relaxed"
                  placeholder="Paste the requirements or JD here..."
                />
              </div>

              <div className="pt-4">
                <Button 
                  type="submit"
                  disabled={isSubmitting || !newJob.job_title || !newJob.company_name || !newJob.job_description}
                  className="w-full h-14 bg-cyan-accent text-black hover:bg-white uppercase font-heading font-bold tracking-[0.2em] text-xs transition-all shadow-[0_0_20px_rgba(0,240,255,0.15)]"
                >
                  {isSubmitting ? 'ESTABLISHING TRACK...' : 'INITIALIZE TRACK'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MAIN CONTENT */}
      <main className="pt-12 px-6 md:px-12 max-w-[1400px] mx-auto pb-40">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 mb-12">
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <h2 className="text-3xl md:text-5xl font-heading text-white tracking-tighter uppercase leading-none">
                Tracked <span className="text-cyan-accent cyan-glow">Opportunities</span>
              </h2>
              <div className="hidden md:flex px-3 py-1 bg-white/5 border border-white/10 rounded-full items-center gap-2">
                <div className={`w-1.5 h-1.5 rounded-full ${profileStatus === 'COMPLETE' ? 'bg-cyan-accent cyan-glow animate-pulse' : 'bg-white/20'}`} />
                <span className="text-[9px] font-mono text-white/40 uppercase tracking-widest">
                  PROFILE_STATUS: {profileStatus}
                </span>
              </div>
            </div>
            <p className="text-[10px] md:text-xs font-mono text-white/30 uppercase tracking-[0.2em]">
              Manage and tailor your applications strategically.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-6 lg:ml-auto">
            <div className="flex items-center gap-4 border-b border-white/10 pb-2 flex-grow min-w-[200px] md:min-w-[300px]">
              <LucideSearch className="w-4 h-4 text-white/20" />
              <input 
                type="text" 
                placeholder="SEARCH_TRACKS..." 
                className="bg-transparent border-none text-xs font-mono text-white placeholder:text-white/10 w-full focus:outline-none uppercase tracking-widest" 
              />
            </div>
            
            <Button 
              onClick={() => setIsModalOpen(true)}
              className="bg-cyan-accent text-black hover:bg-white h-12 px-8 uppercase font-heading font-bold tracking-widest text-[10px] transition-all shadow-[0_0_20px_rgba(0,240,255,0.1)]"
            >
              <LucidePlusCircle className="w-4 h-4 mr-2" />
              New Track +
            </Button>
          </div>
        </div>

        {/* LOADING STATE */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-72 bg-white/5 animate-pulse border border-white/10" />
            ))}
          </div>
        ) : jobs.length === 0 ? (
          /* EMPTY STATE */
          <div className="flex flex-col items-center justify-center py-40 border border-dashed border-white/10 bg-black/40">
            <LucideBriefcase className="w-12 h-12 text-white/10 mb-6" />
            <h3 className="text-xl font-heading text-white/40 uppercase tracking-[0.2em] mb-2">No active tracks</h3>
            <p className="text-[10px] font-mono text-white/20 uppercase tracking-widest mb-8 text-center max-w-sm px-6 leading-relaxed">
              Initialize your first job tracking sequence to start tailoring your resume.
            </p>
            <Button 
              onClick={() => setIsModalOpen(true)}
              className="bg-white/5 hover:bg-cyan-accent hover:text-black border border-white/10 text-white uppercase text-[10px] font-bold tracking-widest h-12 px-10 transition-all font-heading"
            >
              Start First Track
            </Button>
          </div>
        ) : (
          /* JOB GRID */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {jobs.map((job) => (
              <Card key={job.id} className="bg-black/60 border-white/10 hover:border-cyan-accent/30 transition-all group overflow-hidden relative flex flex-col h-full min-h-[320px]">
                <div className="absolute top-0 left-0 w-1 h-full bg-cyan-accent/0 group-hover:bg-cyan-accent transition-all" />
                
                <CardHeader className="pb-4">
                  <div className="flex justify-between items-start mb-2">
                    <div className="px-2 py-0.5 bg-cyan-muted text-cyan-accent text-[8px] font-heading border border-cyan-accent/20 uppercase tracking-widest">
                      {job.status}
                    </div>
                    <span className="text-[9px] font-mono text-white/20">
                      {new Date(job.created_at).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                  </div>
                  <CardTitle className="text-lg md:text-xl font-heading text-white group-hover:text-cyan-accent transition-colors truncate">
                    {job.job_title}
                  </CardTitle>
                  <CardDescription className="text-[10px] font-mono uppercase tracking-[0.15em] text-white/40">
                    {job.company_name}
                  </CardDescription>
                </CardHeader>
                
                <CardContent className="flex-grow overflow-y-auto custom-scrollbar relative pr-2 max-h-32 mb-4">
                  <p className="text-[10px] text-white/30 font-mono leading-relaxed whitespace-pre-wrap">
                    {job.job_description}
                  </p>
                </CardContent>

                <CardFooter className="pt-4 border-t border-white/5 flex gap-2 mt-auto">
                  <Button 
                    onClick={() => router.push(`/editor?jobId=${job.id}`)}
                    className="flex-grow bg-white/5 hover:bg-cyan-accent hover:text-black text-white text-[10px] font-heading font-bold tracking-widest transition-all h-10 gap-2"
                  >
                    Open Editor
                    <LucideArrowRight className="w-3 h-3" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    onClick={() => handleDeleteJob(job.id)}
                    className="w-10 h-10 p-0 hover:bg-red-500/10 hover:text-red-500 text-white/20 border border-white/10 transition-colors"
                  >
                    <LucideTrash2 className="w-4 h-4" />
                  </Button>
                </CardFooter>
              </Card>
            ))}
            
            {/* ADD MORE PLACEHOLDER CARD */}
            {jobs.length < 3 && (
              <button 
                onClick={() => setIsModalOpen(true)}
                className="h-full min-h-[320px] border border-dashed border-white/10 hover:border-cyan-accent/40 bg-white/[0.02] hover:bg-cyan-muted transition-all flex flex-col items-center justify-center group"
              >
                <div className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center mb-4 group-hover:border-cyan-accent group-hover:bg-cyan-accent/10 transition-all">
                  <LucidePlus className="w-5 h-5 text-white/20 group-hover:text-cyan-accent" />
                </div>
                <span className="text-[10px] font-heading uppercase tracking-widest text-white/20 group-hover:text-white">Initialize Track {jobs.length + 1}</span>
              </button>
            )}
            
            {/* TIER LIMIT CARD */}
            {jobs.length >= 3 && (
              <div className="h-full min-h-[320px] border border-white/10 bg-zinc-950/50 p-8 flex flex-col items-center justify-center text-center">
                <div className="p-3 bg-white/5 mb-4">
                  <LucideTerminal className="w-6 h-6 text-white/20" />
                </div>
                <h4 className="text-[10px] font-heading uppercase tracking-widest text-white/40 mb-2">Limit Reached</h4>
                <p className="text-[9px] font-mono text-white/20 uppercase leading-relaxed max-w-[200px]">
                  Upgrade to Pro to track unlimited opportunities.
                </p>
              </div>
            )}
          </div>
        ) }
      </main>

      {/* FOOTER STATS */}
      <footer className="fixed bottom-0 left-0 w-full z-40 bg-black/90 backdrop-blur-md border-t border-white/10 px-8 py-3 flex justify-between items-center text-[9px] font-mono text-white/20 uppercase tracking-[0.25em]">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 bg-cyan-accent rounded-full animate-pulse" />
            <span>CLOUD_SYNC: STABLE</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 bg-zinc-700 rounded-full" />
            <span>ENFORCING_TIER: FREE_V1</span>
          </div>
        </div>
        <div className="hidden sm:block">
          TOTAL_TRACKS_SAVED: {jobs.length} / 03
        </div>
      </footer>

      <PremiumModal 
        isOpen={isPremiumModalOpen} 
        onClose={() => setIsPremiumModalOpen(false)}
        title={errorDetails?.title}
        description={errorDetails?.message}
        errorCode={errorDetails?.code}
      />
    </div>
    </AuthGuard>
  );
}

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
  LucideX,
  LucideTrash2,
  LucideSettings,
  LucideShare2,
  LucideCopy,
  LucideShieldCheck,
  LucideAlertCircle
} from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { Haptics, ImpactStyle } from '@capacitor/haptics';

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

  const [profileStatus, setProfileStatus] = useState<'COMPLETE' | 'INITIALIZING' | 'EMPTY'>('INITIALIZING');
  const [newJob, setNewJob] = useState({
    job_title: '',
    company_name: '',
    job_description: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPremiumModalOpen, setIsPremiumModalOpen] = useState(false);
  const [errorDetails, setErrorDetails] = useState<{title: string, message: string, code?: string} | null>(null);
  const [userData, setUserData] = useState<any>(null);
  const [referralInput, setReferralInput] = useState('');
  const [isRedeeming, setIsRedeeming] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);

  const playHaptic = async (style = ImpactStyle.Light) => {
    try {
      await Haptics.impact({ style });
    } catch (e) {}
  };

  useEffect(() => {
    if (isLoaded) {
      fetchJobs();
      fetchProfileStatus();
      fetchUserData();
    }
  }, [isLoaded]);

  const fetchUserData = async () => {
    try {
      const token = await getToken();
      if (!token) return;
      const data = await resumeService.getUserProfile(token);
      setUserData(data);
    } catch (e) {
      console.error("Failed to fetch user profile", e);
    }
  };

  const handleRedeemCode = async () => {
    if (!referralInput) return;
    setIsRedeeming(true);
    playHaptic(ImpactStyle.Medium);
    try {
      const token = await getToken();
      if (!token) throw new Error("No session");
      await resumeService.redeemReferralCode(referralInput, token);
      setReferralInput('');
      fetchUserData(); 
      toast.success("BONUS ACTIVATED!", { description: "+5 Generations added to your account." });
    } catch (err: any) {
      toast.error("REFERRAL FAILED", { description: err.response?.data?.detail || "Invalid or double-referral code." });
    } finally {
      setIsRedeeming(false);
    }
  };

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
      setError(err.message || "Unable to sync with master control.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateJob = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newJob.job_title || !newJob.company_name || !newJob.job_description) return;
    setIsSubmitting(true);
    setError(null);
    playHaptic(ImpactStyle.Heavy);
    try {
      const token = await getToken();
      if (!token) throw new Error("No session found");
      const response = await resumeService.createTrackedJob(newJob, token);
      router.push(`/editor?jobId=${response.id}`);
    } catch (err: any) {
      const apiError = err.response?.data;
      if (apiError && apiError.code === 'LIMIT_REACHED') {
        setIsPremiumModalOpen(true);
        setIsModalOpen(false);
        setErrorDetails({
          title: "RESOURCE LIMIT REACHED",
          message: apiError.message || "Upgrade to Pro to track more opportunities.",
          code: apiError.code
        });
      } else {
        setError(err.message || "System glitch. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteJob = async (id: number) => {
    playHaptic(ImpactStyle.Light);
    if (confirmDeleteId !== id) {
      setConfirmDeleteId(id);
      setTimeout(() => setConfirmDeleteId(null), 3000);
      return;
    }
    playHaptic(ImpactStyle.Heavy);
    try {
      const token = await getToken();
      if (!token) return;
      await resumeService.deleteTrackedJob(id, token);
      setJobs(jobs.filter(j => j.id !== id));
      toast.success("TRACK TERMINATED");
    } catch (e) {
      toast.error("DELETE FAILED");
    } finally {
      setConfirmDeleteId(null);
    }
  };

  const filteredJobs = jobs.filter(job => 
    job.job_title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    job.company_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <AuthGuard>
      <div className="min-h-screen bg-black industrial-grid selection:bg-cyan-accent selection:text-black font-sans pb-20">
      
      <AnimatePresence>
        {isModalOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="w-full max-w-xl bg-zinc-950 border border-white/10 p-8 relative">
              <button onClick={() => { setIsModalOpen(false); playHaptic(); }} className="absolute top-4 right-4 text-white/40 hover:text-white transition-colors premium-touch"><LucideX className="w-6 h-6" /></button>
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-cyan-muted border border-cyan-accent/20"><LucideBriefcase className="w-5 h-5 text-cyan-accent" /></div>
                <h2 className="text-xl font-heading text-white uppercase tracking-[0.15em]">Track New Job</h2>
              </div>
              <form onSubmit={handleCreateJob} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-heading text-white/40 tracking-[0.2em]">Target Role</label>
                  <Input value={newJob.job_title} onChange={e => setNewJob({...newJob, job_title: e.target.value})} className="bg-black/40 border-white/10 text-white" placeholder="e.g. Senior Backend Engineer" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-heading text-white/40 tracking-[0.2em]">Company Name</label>
                  <Input value={newJob.company_name} onChange={e => setNewJob({...newJob, company_name: e.target.value})} className="bg-black/40 border-white/10 text-white" placeholder="e.g. Google, Inc." />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-heading text-white/40 tracking-[0.2em]">Job Description</label>
                  <Textarea value={newJob.job_description} onChange={e => setNewJob({...newJob, job_description: e.target.value})} className="bg-black/40 border-white/10 text-white min-h-[150px]" placeholder="Paste requirements..." />
                </div>
                <Button type="submit" disabled={isSubmitting || !newJob.job_title || !newJob.company_name || !newJob.job_description} className="w-full h-14 bg-cyan-accent text-black font-heading font-bold tracking-[0.2em] premium-touch">
                  {isSubmitting ? 'ESTABLISHING TRACK...' : 'INITIALIZE TRACK'}
                </Button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="pt-24 px-6 md:px-12 max-w-[1400px] mx-auto pb-40">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 mb-12">
          <div className="space-y-4">
            <motion.h2 initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="text-3xl md:text-5xl font-heading text-white tracking-tighter uppercase">Tracked <span className="text-cyan-accent cyan-glow">Opportunities</span></motion.h2>
            <div className="flex items-center gap-4">
               <div className="flex px-3 py-1 glass-panel rounded-full items-center gap-2">
                 <div className={`w-1.5 h-1.5 rounded-full ${profileStatus === 'COMPLETE' ? 'bg-cyan-accent cyan-glow animate-pulse' : 'bg-white/20'}`} />
                 <span className="text-[9px] font-mono text-white/40 uppercase">PROFILE_STATUS: {profileStatus}</span>
               </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className="flex items-center gap-4 border-b border-white/10 pb-2 min-w-[250px]">
              <LucideSearch className="w-4 h-4 text-white/20" />
              <input type="text" placeholder="SEARCH_TRACKS..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="bg-transparent border-none text-xs font-mono text-white focus:outline-none uppercase tracking-widest w-full" />
            </div>
            <Button onClick={() => { setIsModalOpen(true); playHaptic(); }} className="bg-cyan-accent text-black font-heading font-bold h-12 px-8 premium-touch">New Track +</Button>
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => <div key={i} className="h-72 bg-white/5 animate-pulse border border-white/10" />)}
          </div>
        ) : (
          <AnimatePresence>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredJobs.map((job) => (
                <motion.div key={job.id} layout initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}>
                  <Card className="bg-black/60 border-white/10 hover:border-cyan-accent/30 transition-all flex flex-col h-full min-h-[320px] glass-panel-heavy group relative overflow-hidden">
                    <CardHeader>
                      <div className="flex justify-between items-start mb-2">
                        <div className="px-2 py-0.5 bg-cyan-muted text-cyan-accent text-[8px] font-bold uppercase">{job.status}</div>
                        <span className="text-[9px] font-mono text-white/20">{new Date(job.created_at).toLocaleDateString()}</span>
                      </div>
                      <CardTitle className="text-xl font-heading text-white group-hover:text-cyan-accent transition-colors truncate">{job.job_title}</CardTitle>
                      <CardDescription className="text-[10px] uppercase font-mono text-white/40">{job.company_name}</CardDescription>
                    </CardHeader>
                    <CardContent className="flex-grow">
                      <p className="text-[10px] text-white/30 font-mono italic line-clamp-4">{job.job_description}</p>
                    </CardContent>
                    <CardFooter className="pt-4 border-t border-white/5 flex gap-2">
                      <Button onClick={() => { router.push(`/editor?jobId=${job.id}`); playHaptic(); }} className="flex-grow bg-white/5 text-white text-[10px] font-heading font-bold h-10 premium-touch">Open Editor</Button>
                      <Button variant="ghost" onClick={() => handleDeleteJob(job.id)} className={`w-10 h-10 p-0 transition-colors ${confirmDeleteId === job.id ? 'bg-red-500' : 'hover:bg-red-500/10 text-white/20'} border border-white/10 premium-touch`}>
                        {confirmDeleteId === job.id ? <LucideAlertCircle className="w-4 h-4 animate-pulse" /> : <LucideTrash2 className="w-4 h-4" />}
                      </Button>
                    </CardFooter>
                  </Card>
                </motion.div>
              ))}
              {jobs.length < (userData?.generations_limit + userData?.bonus_quota || 5) && (
                <button onClick={() => { setIsModalOpen(true); playHaptic(); }} className="h-full min-h-[320px] border border-dashed border-white/10 hover:border-cyan-accent/40 bg-white/[0.02] flex flex-col items-center justify-center group premium-touch">
                   <LucidePlus className="w-8 h-8 text-white/20 group-hover:text-cyan-accent mb-4 transition-all" />
                   <span className="text-[10px] font-heading uppercase tracking-widest text-white/20 group-hover:text-white">Initialize Track {jobs.length + 1}</span>
                </button>
              )}
            </motion.div>
          </AnimatePresence>
        )}

        <div className="mt-20 grid grid-cols-1 md:grid-cols-2 gap-6">
           <div className="p-8 glass-panel space-y-6 relative overflow-hidden">
              <h3 className="text-xl font-black text-white italic uppercase">Invite Uplink</h3>
              <div className="flex gap-2">
                 <div className="flex-grow p-4 bg-zinc-900 border border-zinc-800 flex items-center justify-between font-mono text-2xl text-cyan-accent italic">
                    {userData?.referral_code || '------'}
                    <button onClick={() => { navigator.clipboard.writeText(userData?.referral_code || ''); toast.success('COPIED'); }} className="hover:text-white"><LucideCopy className="w-4 h-4" /></button>
                 </div>
              </div>
           </div>
           <div className="p-8 glass-panel space-y-6">
              {userData?.referred_by ? (
                <div className="flex flex-col items-center justify-center h-full text-emerald-500 font-mono text-[10px] uppercase tracking-widest animate-pulse">
                   <LucideShieldCheck className="w-8 h-8 mb-2" /> Bonus Active
                </div>
              ) : (
                <>
                  <h3 className="text-xl font-black text-white italic uppercase">Redeem Bonus</h3>
                  <div className="flex gap-2">
                     <input type="text" placeholder="CODE" value={referralInput} onChange={(e) => setReferralInput(e.target.value.toUpperCase())} className="flex-grow p-4 bg-zinc-900 border border-zinc-800 text-white outline-none focus:border-cyan-accent" />
                     <Button onClick={handleRedeemCode} disabled={isRedeeming || !referralInput} className="bg-zinc-800 hover:bg-white hover:text-black h-14 px-8">ACTIVATE</Button>
                  </div>
                </>
              )}
           </div>
        </div>
      </main>

      <footer className="fixed bottom-0 left-0 w-full z-40 glass-panel px-8 py-3 flex justify-between items-center text-[9px] font-mono text-white/20 uppercase tracking-widest no-print">
        <div className="flex gap-6">
           <span>CLOUD: STABLE</span>
           <span>V0.2 PREMIUM</span>
        </div>
        <div className="hidden sm:block">AI UNLOCKED: {userData?.generations_used || 0} / {(userData?.generations_limit + userData?.bonus_quota) || 5}</div>
        <div className="flex gap-4">
           <Link href="/terms" className="hover:text-white">Terms</Link>
           <Link href="/privacy" className="hover:text-white">Privacy</Link>
        </div>
      </footer>

      <PremiumModal isOpen={isPremiumModalOpen} onClose={() => setIsPremiumModalOpen(false)} title={errorDetails?.title} description={errorDetails?.message} errorCode={errorDetails?.code} />
    </div>
    </AuthGuard>
  );
}

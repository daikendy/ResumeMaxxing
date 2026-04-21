'use client';

import React, { useState, useEffect, useMemo } from 'react';
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
  LucideBriefcase,
  LucideX,
  LucideTrash2,
  LucideCopy,
  LucideShieldCheck,
  LucideAlertCircle,
  LucideExternalLink,
  LucideCheckCircle2,
  LucideClock,
  LucideFileText,
  LucideSearch,
  LucideChevronDown,
  LucideBarChart3,
  LucidePencil
} from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { TrackedJob } from '@/types/resume';

// 🎨 Status Config: Colors and Icons for the "Industry Look"
const STATUS_CONFIG: Record<string, { color: string, bg: string, icon: any, priority: number }> = {
  'hired': { color: 'text-emerald-400', bg: 'bg-emerald-400/10', icon: LucideShieldCheck, priority: 1 },
  'interviewing': { color: 'text-yellow-400', bg: 'bg-yellow-400/10', icon: LucideBriefcase, priority: 2 },
  'applied': { color: 'text-cyan-accent', bg: 'bg-cyan-accent/10', icon: LucideCheckCircle2, priority: 3 },
  'bookmarked': { color: 'text-white/40', bg: 'bg-white/5', icon: LucideClock, priority: 4 },
  'rejected': { color: 'text-red-400', bg: 'bg-red-400/10', icon: LucideX, priority: 5 },
};

const STATUS_ORDER = ['bookmarked', 'applied', 'interviewing', 'hired', 'rejected'];

// 🛡️ Input Limits (Synced with Backend)
const LIMITS = {
  TITLE: 100,
  COMPANY: 100,
  URL: 500,
  DESCRIPTION: 15000,
  REFERRAL: 6
};

export default function DashboardPage() {
  const router = useRouter();
  const { getToken, isLoaded } = useAuth();
  const [jobs, setJobs] = useState<TrackedJob[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [profileStatus, setProfileStatus] = useState<'COMPLETE' | 'INITIALIZING' | 'EMPTY'>('INITIALIZING');
  
  // 📝 Form State (Handles both Create and Edit)
  const [jobFormData, setJobFormData] = useState({
    id: null as number | null,
    job_title: '',
    company_name: '',
    job_description: '',
    job_url: ''
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPremiumModalOpen, setIsPremiumModalOpen] = useState(false);
  const [errorDetails, setErrorDetails] = useState<{title: string, message: string, code?: string} | null>(null);
  const [userData, setUserData] = useState<any>(null);
  const [referralInput, setReferralInput] = useState('');
  const [isRedeeming, setIsRedeeming] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);
  const [activeStatusDropdown, setActiveStatusDropdown] = useState<number | null>(null);
  const [focusedField, setFocusedField] = useState<string | null>(null);

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

  // 📊 Analytics & Sorting Logic
  const stats = useMemo(() => {
    const counts = { total: jobs.length, applied: 0, interviewing: 0, hired: 0, rejected: 0, bookmarked: 0 };
    jobs.forEach(j => {
      if (counts[j.status as keyof typeof counts] !== undefined) {
        counts[j.status as keyof typeof counts]++;
      }
    });
    return counts;
  }, [jobs]);

  const filteredJobs = useMemo(() => {
    return jobs
      .filter(job => {
        const matchesSearch = job.job_title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                             job.company_name?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = !statusFilter || job.status === statusFilter;
        return matchesSearch && matchesStatus;
      })
      .sort((a, b) => {
        const pA = STATUS_CONFIG[a.status]?.priority || 99;
        const pB = STATUS_CONFIG[b.status]?.priority || 99;
        return pA - pB; // Primary: Status Priority
      });
  }, [jobs, searchTerm, statusFilter]);

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
    if (!referralInput || referralInput.length !== 6) return;
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

  const handleOpenEdit = (job: TrackedJob) => {
    setJobFormData({
      id: job.id,
      job_title: job.job_title,
      company_name: job.company_name || '',
      job_description: job.job_description,
      job_url: job.job_url || ''
    });
    setIsModalOpen(true);
    playHaptic();
  };

  const handleJobSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!jobFormData.job_title || !jobFormData.company_name || !jobFormData.job_description) return;
    setIsSubmitting(true);
    setError(null);
    playHaptic(ImpactStyle.Heavy);
    
    try {
      const token = await getToken();
      if (!token) throw new Error("No session found");
      
      if (jobFormData.id) {
        // 🔄 UPDATE MODE
        const response = await resumeService.updateTrackedJob(jobFormData.id, jobFormData, token);
        setJobs(jobs.map(j => j.id === jobFormData.id ? response : j));
        setIsModalOpen(false);
        toast.success("TRACK UPDATED", { description: "Metadata successfully synchronized." });
      } else {
        // ✨ CREATE MODE
        const response = await resumeService.createTrackedJob(jobFormData, token);
        router.push(`/editor?jobId=${response.id}`);
      }
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

  const handleUpdateStatus = async (jobId: number, newStatus: string) => {
    playHaptic(ImpactStyle.Medium);
    const originalJobs = [...jobs];
    
    // Optimistic UI Update
    setJobs(jobs.map(j => j.id === jobId ? { ...j, status: newStatus } : j));
    setActiveStatusDropdown(null);

    try {
      const token = await getToken();
      if (!token) throw new Error("No session");
      await resumeService.updateTrackedJob(jobId, { status: newStatus }, token);
      toast.success(`STATUS: ${newStatus.toUpperCase()}`);
    } catch (err) {
      setJobs(originalJobs); // Rollback
      toast.error("SYNC FAILED", { description: "Application status could not be updated." });
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

  const getCounterColor = (length: number, max: number) => {
    const ratio = length / max;
    if (ratio >= 1) return 'text-red-500';
    if (ratio >= 0.8) return 'text-yellow-500/60';
    return 'text-white/20';
  };

  const handleInputChange = (field: keyof typeof jobFormData, value: string, max: number) => {
    if (value.length > max) {
      playHaptic(ImpactStyle.Medium);
      return;
    }
    setJobFormData({ ...jobFormData, [field]: value });
  };

  return (
    <AuthGuard>
      <div className="min-h-screen bg-black industrial-grid selection:bg-cyan-accent selection:text-black font-sans pb-20 overflow-x-hidden">
      
      <AnimatePresence>
        {isModalOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="w-full max-w-xl bg-zinc-950 border border-white/10 p-8 relative">
              <button 
                onClick={() => { setIsModalOpen(false); setJobFormData({id: null, job_title: '', company_name: '', job_description: '', job_url: ''}); playHaptic(); }} 
                className="absolute top-4 right-4 text-white/40 hover:text-white transition-colors"
                ><LucideX className="w-6 h-6" /></button>
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-cyan-muted border border-cyan-accent/20"><LucideBriefcase className="w-5 h-5 text-cyan-accent" /></div>
                <h2 className="text-xl font-heading text-white uppercase tracking-[0.15em]">{jobFormData.id ? 'Edit Track' : 'Track New Job'}</h2>
              </div>
              <form onSubmit={handleJobSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <div className="space-y-2 relative">
                     <div className="flex justify-between items-center">
                        <label className="text-[10px] uppercase font-heading text-white/40 tracking-[0.2em]">Target Role</label>
                        {focusedField === 'title' && <span className={`text-[9px] font-mono ${getCounterColor(jobFormData.job_title.length, LIMITS.TITLE)}`}>{jobFormData.job_title.length}/{LIMITS.TITLE}</span>}
                     </div>
                     <Input 
                        value={jobFormData.job_title} 
                        onFocus={() => setFocusedField('title')}
                        onBlur={() => setFocusedField(null)}
                        onChange={e => handleInputChange('job_title', e.target.value, LIMITS.TITLE)} 
                        className="bg-black/40 border-white/10 text-white" 
                        placeholder="e.g. Senior Backend Engineer" 
                     />
                   </div>
                   <div className="space-y-2 relative">
                     <div className="flex justify-between items-center">
                        <label className="text-[10px] uppercase font-heading text-white/40 tracking-[0.2em]">Company Name</label>
                        {focusedField === 'company' && <span className={`text-[9px] font-mono ${getCounterColor(jobFormData.company_name.length, LIMITS.COMPANY)}`}>{jobFormData.company_name.length}/{LIMITS.COMPANY}</span>}
                     </div>
                     <Input 
                        value={jobFormData.company_name} 
                        onFocus={() => setFocusedField('company')}
                        onBlur={() => setFocusedField(null)}
                        onChange={e => handleInputChange('company_name', e.target.value, LIMITS.COMPANY)} 
                        className="bg-black/40 border-white/10 text-white" 
                        placeholder="e.g. Google, Inc." 
                     />
                   </div>
                </div>
                <div className="space-y-2 relative">
                   <div className="flex justify-between items-center">
                      <label className="text-[10px] uppercase font-heading text-white/40 tracking-[0.2em]">Job URL {jobFormData.id && '(Edit)'}</label>
                      {focusedField === 'url' && <span className={`text-[9px] font-mono ${getCounterColor(jobFormData.job_url.length, LIMITS.URL)}`}>{jobFormData.job_url.length}/{LIMITS.URL}</span>}
                   </div>
                   <Input 
                      value={jobFormData.job_url} 
                      onFocus={() => setFocusedField('url')}
                      onBlur={() => setFocusedField(null)}
                      onChange={e => handleInputChange('job_url', e.target.value, LIMITS.URL)} 
                      className="bg-black/40 border-white/10 text-white" 
                      placeholder="https://linkedin.com/jobs/..." 
                   />
                </div>
                <div className="space-y-2 relative">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] uppercase font-heading text-white/40 tracking-[0.2em]">Job Description</label>
                    {focusedField === 'desc' && <span className={`text-[9px] font-mono ${getCounterColor(jobFormData.job_description.length, LIMITS.DESCRIPTION)}`}>{jobFormData.job_description.length}/{LIMITS.DESCRIPTION}</span>}
                  </div>
                  <Textarea 
                    value={jobFormData.job_description} 
                    onFocus={() => setFocusedField('desc')}
                    onBlur={() => setFocusedField(null)}
                    onChange={e => handleInputChange('job_description', e.target.value, LIMITS.DESCRIPTION)} 
                    className="bg-black/40 border-white/10 text-white min-h-[150px]" 
                    placeholder="Paste requirements..." 
                  />
                </div>
                <Button type="submit" disabled={isSubmitting || !jobFormData.job_title || !jobFormData.company_name || !jobFormData.job_description} className="w-full h-14 bg-cyan-accent text-black font-heading font-bold tracking-[0.2em] premium-touch">
                  {isSubmitting ? 'SYNCING...' : jobFormData.id ? 'SAVE CHANGES' : 'INITIALIZE TRACK'}
                </Button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="pt-24 px-6 md:px-12 max-w-[1400px] mx-auto pb-40">
        {/* 📊 ANALYTICS DASHBOARD */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-12">
           <button 
              onClick={() => { setStatusFilter(null); playHaptic(); }}
              className={`p-4 border transition-all text-left group ${!statusFilter ? 'bg-white/10 border-white/20' : 'bg-black/40 border-white/5 hover:border-white/10'}`}
           >
              <div className="text-[9px] uppercase font-mono text-white/40 group-hover:text-white/60 mb-1">ALL_TOTAL</div>
              <div className="text-2xl font-heading text-white">{stats.total}</div>
           </button>
           {STATUS_ORDER.map(s => (
             <button 
                key={s}
                onClick={() => { setStatusFilter(statusFilter === s ? null : s); playHaptic(); }}
                className={`p-4 border transition-all text-left group ${statusFilter === s ? 'bg-white/10 border-white/20' : 'bg-black/40 border-white/5 hover:border-white/10'}`}
             >
                <div className={`text-[9px] uppercase font-mono mb-1 ${STATUS_CONFIG[s].color}`}>{s}</div>
                <div className="text-2xl font-heading text-white">{stats[s as keyof typeof stats]}</div>
             </button>
           ))}
        </div>

        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 mb-12">
          <div className="space-y-4">
            <motion.h2 initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="text-3xl md:text-5xl font-heading text-white tracking-tighter uppercase italic">Operative <span className="text-cyan-accent cyan-glow">Dashboard</span></motion.h2>
            <div className="flex items-center gap-4">
               <div className="flex px-3 py-1 glass-panel rounded-full items-center gap-2">
                 <div className={`w-1.5 h-1.5 rounded-full ${profileStatus === 'COMPLETE' ? 'bg-cyan-accent cyan-glow animate-pulse' : 'bg-white/20'}`} />
                 <span className="text-[9px] font-mono text-white/40 uppercase">PROFILE_SYNC: {profileStatus}</span>
               </div>
               {statusFilter && (
                 <button onClick={() => setStatusFilter(null)} className="text-[9px] font-mono text-cyan-accent hover:text-white transition-colors uppercase border-b border-cyan-accent/20">CLEAR_FILTER: {statusFilter}</button>
               )}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className="flex items-center gap-4 border-b border-white/10 pb-2 min-w-[250px]">
              <LucideSearch className="w-4 h-4 text-white/20" />
              <input type="text" placeholder="FILTER_OBLIGATIONS..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="bg-transparent border-none text-xs font-mono text-white focus:outline-none uppercase tracking-widest w-full" />
            </div>
            <Button onClick={() => { setJobFormData({id: null, job_title: '', company_name: '', job_description: '', job_url: ''}); setIsModalOpen(true); playHaptic(); }} className="bg-cyan-accent text-black font-heading font-bold h-12 px-8 premium-touch">NEW TRACK +</Button>
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => <div key={i} className="h-72 bg-white/5 animate-pulse border border-white/10" />)}
          </div>
        ) : (
          <AnimatePresence>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredJobs.map((job) => {
                const StatusIcon = STATUS_CONFIG[job.status]?.icon || LucideClock;
                return (
                  <motion.div key={job.id} layout initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}>
                    <Card className="bg-black/60 border-white/10 hover:border-cyan-accent/30 transition-all flex flex-col h-full min-h-[320px] glass-panel-heavy group relative overflow-hidden">
                      <CardHeader>
                        <div className="flex justify-between items-start mb-2">
                          {/* 🔄 QUICK STATUS DROPDOWN */}
                          <div className="relative">
                             <button 
                                onClick={(e) => { e.stopPropagation(); setActiveStatusDropdown(activeStatusDropdown === job.id ? null : job.id); playHaptic(); }}
                                className={`px-2 py-1 rounded-sm border border-white/5 flex items-center gap-1.5 transition-all text-[8px] font-bold uppercase ${STATUS_CONFIG[job.status]?.bg} ${STATUS_CONFIG[job.status]?.color} hover:bg-white/10`}
                             >
                               <StatusIcon className="w-3 h-3" />
                               {job.status}
                               <LucideChevronDown className="w-3 h-3 opacity-40" />
                             </button>

                             <AnimatePresence>
                               {activeStatusDropdown === job.id && (
                                 <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 5 }} className="absolute top-full left-0 mt-2 w-32 bg-zinc-950 border border-white/10 shadow-2xl z-50 py-1">
                                    {STATUS_ORDER.map(s => (
                                      <button 
                                        key={s} 
                                        onClick={(e) => { e.stopPropagation(); handleUpdateStatus(job.id, s); }}
                                        className={`w-full text-left px-3 py-2 text-[8px] uppercase font-bold tracking-widest hover:bg-white/5 transition-colors ${s === job.status ? 'text-cyan-accent bg-cyan-accent/5' : 'text-white/40'}`}
                                      >
                                        {s}
                                      </button>
                                    ))}
                                 </motion.div>
                               )}
                             </AnimatePresence>
                          </div>
                          
                          <div className="flex items-center gap-2">
                             <button onClick={() => handleOpenEdit(job)} className="p-1 hover:bg-white/10 rounded-sm text-white/20 hover:text-white transition-all"><LucidePencil className="w-3 h-3" /></button>
                             <span className="text-[9px] font-mono text-white/20">{new Date(job.created_at || '').toLocaleDateString()}</span>
                          </div>
                        </div>
                        <CardTitle className="text-xl font-heading text-white group-hover:text-cyan-accent transition-colors truncate">{job.job_title}</CardTitle>
                        <CardDescription className="text-[10px] uppercase font-mono text-white/40 flex items-center gap-2">
                          {job.company_name}
                          {job.job_url && (
                             <a href={job.job_url} target="_blank" rel="noopener noreferrer" className="p-1 hover:bg-white/10 rounded-sm text-cyan-accent/60 hover:text-cyan-accent transition-all">
                                <LucideExternalLink className="w-3 h-3" />
                             </a>
                          )}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="flex-grow">
                        <p className="text-[10px] text-white/20 font-mono italic line-clamp-3 leading-relaxed">{job.job_description}</p>
                      </CardContent>
                      <CardFooter className="pt-4 border-t border-white/5 flex gap-2">
                        <Button onClick={() => { router.push(`/editor?jobId=${job.id}`); playHaptic(); }} className="flex-grow bg-white/5 text-white text-[10px] font-heading font-bold h-10 hover:bg-cyan-accent hover:text-black transition-all premium-touch">
                           <LucideFileText className="w-3.5 h-3.5 mr-2" />
                           Open Studio
                        </Button>
                        <Button variant="ghost" onClick={() => handleDeleteJob(job.id)} className={`w-10 h-10 p-0 transition-colors ${confirmDeleteId === job.id ? 'bg-red-500' : 'hover:bg-red-500/10 text-white/20'} border border-white/10 premium-touch`}>
                          {confirmDeleteId === job.id ? <LucideAlertCircle className="w-4 h-4 animate-pulse" /> : <LucideTrash2 className="w-4 h-4" />}
                        </Button>
                      </CardFooter>
                    </Card>
                  </motion.div>
                );
              })}
              {jobs.length < (userData?.generations_limit + userData?.bonus_quota || 5) && !statusFilter && (
                <button onClick={() => { setJobFormData({id: null, job_title: '', company_name: '', job_description: '', job_url: ''}); setIsModalOpen(true); playHaptic(); }} className="h-full min-h-[320px] border border-dashed border-white/10 hover:border-cyan-accent/40 bg-white/[0.02] flex flex-col items-center justify-center group">
                   <LucidePlus className="w-8 h-8 text-white/20 group-hover:text-cyan-accent mb-4 transition-all" />
                   <span className="text-[10px] font-heading uppercase tracking-widest text-white/20 group-hover:text-white">Initialize Track {jobs.length + 1}</span>
                </button>
              )}
            </motion.div>
          </AnimatePresence>
        )}

        {/* ... Bottom stats ... */}
        <div className="mt-20 grid grid-cols-1 md:grid-cols-2 gap-6">
           <div className="p-8 glass-panel space-y-6 relative overflow-hidden">
              <h3 className="text-xl font-bold text-white italic uppercase tracking-tighter">Referral <span className="text-cyan-accent">Protocol</span></h3>
              <div className="flex gap-2">
                 <div className="flex-grow p-4 bg-zinc-900 border border-zinc-800 flex items-center justify-between font-mono text-2xl text-cyan-accent italic">
                    {userData?.referral_code || '------'}
                    <button onClick={() => { navigator.clipboard.writeText(userData?.referral_code || ''); toast.success('PROTOCOL_COPIED'); }} className="hover:text-white"><LucideCopy className="w-4 h-4" /></button>
                 </div>
              </div>
           </div>
           <div className="p-8 glass-panel space-y-6">
              {userData?.referred_by ? (
                <div className="flex flex-col items-center justify-center h-full text-emerald-500 font-mono text-[10px] uppercase tracking-widest animate-pulse">
                   <LucideShieldCheck className="w-8 h-8 mb-2" /> Security Bonus Active
                </div>
              ) : (
                <>
                  <div className="flex justify-between items-center mb-1">
                     <h3 className="text-xl font-bold text-white italic uppercase tracking-tighter">Enter <span className="text-cyan-accent">Key</span></h3>
                     {referralInput.length > 0 && <span className={`text-[9px] font-mono ${getCounterColor(referralInput.length, LIMITS.REFERRAL)}`}>{referralInput.length}/{LIMITS.REFERRAL}</span>}
                  </div>
                  <div className="flex gap-2">
                     <input 
                        type="text" 
                        placeholder="ACCESS_CODE" 
                        value={referralInput} 
                        onChange={(e) => {
                           const val = e.target.value.toUpperCase();
                           if (val.length <= LIMITS.REFERRAL) {
                              setReferralInput(val);
                              if (val.length === LIMITS.REFERRAL) playHaptic(ImpactStyle.Medium);
                           } else {
                              playHaptic(ImpactStyle.Heavy);
                           }
                        }} 
                        className="flex-grow p-4 bg-zinc-900 border border-zinc-800 text-white outline-none focus:border-cyan-accent font-mono" 
                     />
                     <Button onClick={handleRedeemCode} disabled={isRedeeming || referralInput.length !== LIMITS.REFERRAL} className="bg-zinc-800 hover:bg-white hover:text-black h-14 px-8">ACTIVATE</Button>
                  </div>
                </>
              )}
           </div>
        </div>
      </main>

      <footer className="fixed bottom-0 left-0 w-full z-40 glass-panel px-8 py-3 flex justify-between items-center text-[9px] font-mono text-white/20 uppercase tracking-widest no-print">
        <div className="flex gap-6">
           <span>CLOUD_STATUS: STABLE</span>
           <span>SECURE_SESSION V0.5</span>
        </div>
        <div className="hidden sm:block">QUOTA: {userData?.generations_used || 0} / {(userData?.generations_limit + userData?.bonus_quota) || 5}</div>
        <div className="flex gap-4">
           <Link href="/terms" className="hover:text-white">Privacy</Link>
           <Link href="/privacy" className="hover:text-white">Security</Link>
        </div>
      </footer>

      <PremiumModal isOpen={isPremiumModalOpen} onClose={() => setIsPremiumModalOpen(false)} title={errorDetails?.title} description={errorDetails?.message} errorCode={errorDetails?.code} />
    </div>
    </AuthGuard>
  );
}

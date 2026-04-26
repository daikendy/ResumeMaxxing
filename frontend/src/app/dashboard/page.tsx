'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@clerk/clerk-react';
import { resumeService } from '@/lib/api/services/resumeService';
import { HUD_EVENT_SYNC } from '@/lib/constants';
import { AuthGuard } from '@/components/AuthGuard';
import { Button } from '@/components/ui/button';
import {
  LucideBriefcase,
  LucideShieldCheck,
  LucideCheckCircle2,
  LucideClock,
  LucideX
} from 'lucide-react';
import { toast } from 'sonner';
import { TrackedJob } from '@/types/resume';
import { playHaptic, LIMITS, ImpactStyle } from '@/lib/constants';

// Page Components
import StatsBanner from './components/StatsBanner';
import ReferralPortal from './components/ReferralPortal';
import JobTracker from './components/JobTracker';
import JobFormModal from './components/JobFormModal';
import ActivityFeed from './components/ActivityFeed';
import VaultManager from './components/VaultManager';
import ThemeToggle from '@/components/ThemeToggle';

const STATUS_CONFIG: Record<string, { color: string, bg: string, icon: any, priority: number }> = {
  'hired': { color: 'text-emerald-400', bg: 'bg-emerald-400/10', icon: LucideShieldCheck, priority: 1 },
  'interviewing': { color: 'text-violet-400', bg: 'bg-violet-400/10', icon: LucideBriefcase, priority: 2 },
  'applied': { color: 'text-accent-primary', bg: 'bg-accent-primary/10', icon: LucideCheckCircle2, priority: 3 },
  'bookmarked': { color: 'text-white/40', bg: 'bg-white/5', icon: LucideClock, priority: 4 },
  'rejected': { color: 'text-red-400', bg: 'bg-red-400/10', icon: LucideX, priority: 5 },
};

const STATUS_ORDER = ['bookmarked', 'applied', 'interviewing', 'hired', 'rejected'];

export default function DashboardPage() {
  const router = useRouter();
  const { getToken, isLoaded } = useAuth();
  const [jobs, setJobs] = useState<TrackedJob[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [userData, setUserData] = useState<any>(null);
  const [referralInput, setReferralInput] = useState('');
  const [isRedeeming, setIsRedeeming] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);
  const [activeStatusDropdown, setActiveStatusDropdown] = useState<number | null>(null);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [jobFormData, setJobFormData] = useState<{
    id: number | null;
    job_title: string;
    company_name: string;
    job_description: string;
    job_url: string;
  }>({ id: null, job_title: '', company_name: '', job_description: '', job_url: '' });

  const fetchJobs = async () => {
    try {
      const token = await getToken();
      if (!token) return;
      const data = await resumeService.getTrackedJobs(token);
      setJobs(data);
    } catch (e) {
      console.error("Fetch failed", e);
    }
  };

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

  useEffect(() => {
    if (isLoaded) {
      fetchJobs();
      fetchUserData();
    }
  }, [isLoaded]);

  const stats = useMemo(() => {
    const counts = { total: jobs.length, applied: 0, interviewing: 0, hired: 0, rejected: 0, bookmarked: 0 };
    jobs.forEach(j => { if (counts[j.status as keyof typeof counts] !== undefined) counts[j.status as keyof typeof counts]++; });
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
      .sort((a, b) => (STATUS_CONFIG[a.status]?.priority || 99) - (STATUS_CONFIG[b.status]?.priority || 99));
  }, [jobs, searchTerm, statusFilter]);

  const handleRedeemCode = useCallback(async () => {
    if (!referralInput || referralInput.length !== 6) return;
    setIsRedeeming(true);
    try {
      const token = await getToken();
      if (!token) throw new Error("No session");
      await resumeService.redeemReferralCode(referralInput, token);
      setReferralInput('');
      fetchUserData();
      toast.success("CODE_REDEEMED", { description: "Protocol bonus applied to your quota." });
      window.dispatchEvent(new Event(HUD_EVENT_SYNC));
      playHaptic(ImpactStyle.Heavy);
    } catch (err: any) {
      toast.error("REFERRAL FAILED", { description: err.response?.data?.detail || "Invalid code." });
    } finally { setIsRedeeming(false); }
  }, [referralInput, getToken]);

  const handleUpdateStatus = useCallback(async (jobId: number, newStatus: string) => {
    try {
      const token = await getToken();
      if (!token) return;
      await resumeService.updateTrackedJob(jobId, { status: newStatus }, token);
      setJobs(prev => prev.map(j => j.id === jobId ? { ...j, status: newStatus } : j));
      toast.success("STATUS_SYNCED");
    } catch (e) {
      // Handled by global API interceptor
    }
  }, [getToken]);

  const handleDeleteJob = useCallback(async (id: number) => {
    try {
      const token = await getToken();
      if (!token) return;
      await resumeService.deleteTrackedJob(id, token);
      setJobs(prev => prev.filter(j => j.id !== id));
      toast.info("TARGET_DECOMMISSIONED");
      window.dispatchEvent(new Event(HUD_EVENT_SYNC));
      playHaptic(ImpactStyle.Medium);
    } catch (e) {
      // Handled by global API interceptor
    } finally { setConfirmDeleteId(null); }
  }, [getToken]);

  const handleSubmitJob = async () => {
    setIsSubmitting(true);
    try {
      const token = await getToken();
      if (!token) return;
      if (jobFormData.id) {
        const payload = {
          job_title: jobFormData.job_title,
          company_name: jobFormData.company_name,
          job_url: jobFormData.job_url,
          job_description: jobFormData.job_description
        };
        await resumeService.updateTrackedJob(jobFormData.id, payload, token);
        setJobs(prev => prev.map(j => j.id === jobFormData.id ? { ...j, ...payload } : j));
        toast.success("TARGET_UPDATED");
      } else {
        const newJob = await resumeService.createTrackedJob(jobFormData, token);
        setJobs(prev => [newJob, ...prev]);
        toast.success("TARGET_ACQUIRED", { description: `${jobFormData.job_title} at ${jobFormData.company_name}` });
      }
      setIsModalOpen(false);
      window.dispatchEvent(new Event(HUD_EVENT_SYNC));
      playHaptic(ImpactStyle.Heavy);
      setJobFormData({ id: null, job_title: '', company_name: '', job_description: '', job_url: '' });
    } catch (e) {
      // Handled by global API interceptor
    } finally { setIsSubmitting(false); }
  };

  const openEditModal = useCallback((job: TrackedJob) => {
    setJobFormData({
      id: job.id,
      job_title: job.job_title,
      company_name: job.company_name || '',
      job_description: job.job_description || '',
      job_url: job.job_url || ''
    });
    setIsModalOpen(true);
  }, []);

  return (
    <AuthGuard>
      <div className="min-h-screen bg-background selection:bg-accent-primary selection:text-white font-sans pb-32 relative overflow-x-hidden">
        {/* Premium Background Gradient */}
        <div className="fixed top-0 left-1/2 -translate-x-1/2 w-full h-[600px] bg-accent-primary/5 blur-[120px] pointer-events-none" />

        <main className="pt-24 sm:pt-32 px-4 md:px-8 max-w-[1400px] mx-auto">
          <StatsBanner stats={stats} />
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
            <div className="lg:col-span-2">
                <VaultManager />
            </div>
            <div className="lg:col-span-1">
                <ActivityFeed />
            </div>
          </div>

          <ReferralPortal
            referralCode={userData?.referral_code}
            referralInput={referralInput}
            isRedeeming={isRedeeming}
            onRedeem={handleRedeemCode}
            onInputChange={setReferralInput}
            playHaptic={playHaptic}
            hasRedeemed={!!userData?.referred_by}
          />
          <JobTracker
            searchTerm={searchTerm} onSearchChange={setSearchTerm}
            statusFilter={statusFilter} onStatusFilterChange={setStatusFilter}
            filteredJobs={filteredJobs} statusOrder={STATUS_ORDER} statusConfig={STATUS_CONFIG}
            activeStatusDropdown={activeStatusDropdown} onToggleDropdown={setActiveStatusDropdown}
            onUpdateStatus={handleUpdateStatus} onEditJob={openEditModal}
            onDeleteJob={handleDeleteJob} confirmDeleteId={confirmDeleteId} setConfirmDeleteId={setConfirmDeleteId}
            onOpenModal={() => { setJobFormData({ id: null, job_title: '', company_name: '', job_description: '', job_url: '' }); setIsModalOpen(true); }}
          />
        </main>

        <JobFormModal
          isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}
          formData={jobFormData} onInputChange={(k, v) => setJobFormData(prev => ({ ...prev, [k]: v }))}
          onSubmit={handleSubmitJob} isSubmitting={isSubmitting}
          focusedField={focusedField} setFocusedField={setFocusedField}
        />

        <footer className="fixed bottom-0 left-0 w-full z-40 glass-panel px-8 py-3 flex justify-between items-center text-[9px] font-mono text-white/20 uppercase no-print">
          <div className="flex gap-6 items-center">
            <span>SYNC_ROOT: ACTIVE</span>
            <span>ARMED</span>
          </div>
          <div className="flex gap-4"><span>VERSION: 1.0.0_PRODUCTION</span></div>
        </footer>
      </div>
    </AuthGuard>
  );
}

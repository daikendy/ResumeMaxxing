'use client';

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@clerk/clerk-react';
import { Button } from '@/components/ui/button';
import { resumeService } from '@/lib/api/services/resumeService';
import { AuthGuard } from '@/components/AuthGuard';
import { 
  LucideUpload, 
  LucideTerminal, 
  LucideFileText, 
  LucideX, 
  LucideAlertTriangle, 
  LucideLayoutDashboard,
  LucideRotateCcw 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { ImpactStyle } from '@capacitor/haptics';
import { toast } from 'sonner';

// Shared Utils & Constants
import { LIMITS, playHaptic, validateInput } from '@/lib/constants';

// Page Components
import SummarySection from './components/SummarySection';
import ContactSection from './components/ContactSection';
import ExperienceSection from './components/ExperienceSection';
import EducationSection from './components/EducationSection';
import SkillsSection from './components/SkillsSection';
import ProjectsSection from './components/ProjectsSection';

interface Experience {
  title: string;
  company: string;
  location?: string;
  startDate?: string;
  endDate?: string;
  technologies?: string;
  bullets: string[];
}

interface Education {
  institution: string;
  degree: string;
  year: string;
  location?: string;
  gpa?: string;
}

interface Project {
  title: string;
  description: string;
  location?: string;
  startDate?: string;
  endDate?: string;
  technologies?: string;
}

export default function MasterResumePage() {
  const router = useRouter();
  const { getToken, isLoaded } = useAuth();
  const [focusedField, setFocusedField] = useState<string | null>(null);

  // State for the interactive builder
  const [contact, setContact] = useState({ name: '', email: '', phone: '', github: '', linkedin: '' });
  const [summary, setSummary] = useState('');
  const [experience, setExperience] = useState<Experience[]>([]);
  const [education, setEducation] = useState<Education[]>([]);
  const [skills, setSkills] = useState<string[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);

  // Snapshot for dirty checking
  const [lastSavedHash, setLastSavedHash] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'uploading' | 'saving' | 'error'>('loading');
  const [errorMsg, setErrorMsg] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Uploaded resume viewer state
  const [uploadedFileUrl, setUploadedFileUrl] = useState<string | null>(null);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [showResumeViewer, setShowResumeViewer] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Compute if there are unsaved changes
  const hasChanges = useMemo(() => {
    const currentHash = JSON.stringify({ contact, summary, experience, education, skills, projects });
    return currentHash !== lastSavedHash;
  }, [contact, summary, experience, education, skills, projects, lastSavedHash]);

  // Load existing DB profile
  useEffect(() => {
    const fetchMasterResume = async () => {
      try {
        const token = await getToken();
        if (!token) return;
        const response = await resumeService.getMasterResume(token);
        if (response?.resume_data) {
          const data = response.resume_data;
          const initialData = {
            contact: {
                name: data.contact?.name || '', email: data.contact?.email || '',
                phone: data.contact?.phone || '', github: data.contact?.github || '',
                linkedin: data.contact?.linkedin || '',
            },
            summary: data.summary || '',
            experience: data.experience || [],
            education: data.education || [],
            skills: data.skills || [],
            projects: data.projects || []
          };
          setContact(initialData.contact);
          setSummary(initialData.summary);
          setExperience(initialData.experience);
          setEducation(initialData.education);
          setSkills(initialData.skills);
          setProjects(initialData.projects);
          setLastSavedHash(JSON.stringify(initialData));
        } else {
          setLastSavedHash(JSON.stringify({
            contact: { name: '', email: '', phone: '', github: '', linkedin: '' },
            summary: '', experience: [], education: [], skills: [], projects: []
          }));
        }
        setStatus('idle');
      } catch (error: any) {
        setStatus('idle');
      }
    };
    if (isLoaded) fetchMasterResume();
  }, [isLoaded, getToken]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setStatus('uploading');
    setErrorMsg('');
    const objectUrl = URL.createObjectURL(file);
    setUploadedFileUrl(objectUrl);
    setUploadedFileName(file.name);
    try {
      const token = await getToken();
      if (!token) throw new Error("No session found");
      const response = await resumeService.uploadResume(file, token);
      if (response?.resume_data) {
        const data = response.resume_data;
        setContact({
          name: data.contact?.name || '', email: data.contact?.email || '',
          phone: data.contact?.phone || '', github: data.contact?.github || '',
          linkedin: data.contact?.linkedin || '',
        });
        setSummary(data.summary || '');
        setExperience(data.experience || []);
        setEducation(data.education || []);
        setSkills(data.skills || []);
        setProjects(data.projects || []);
      }
      setStatus('idle');
    } catch (err: any) {
      setErrorMsg(err.message || 'Detection failed.');
      setStatus('idle');
    }
  };

  const handleReset = useCallback(() => {
    setContact({ name: '', email: '', phone: '', github: '', linkedin: '' });
    setSummary('');
    setExperience([]);
    setEducation([]);
    setSkills([]);
    setProjects([]);
    setErrorMsg('');
    setSaveSuccess(false);
    playHaptic(ImpactStyle.Heavy);
    toast.info("BUFFER_CLEARED");
  }, []);

  const handleSave = async () => {
    if (!hasChanges) return;
    setStatus('saving');
    setErrorMsg('');
    playHaptic(ImpactStyle.Medium);
    const parsedJson = { contact, summary, experience, education, skills, projects };
    try {
      const token = await getToken();
      if (!token) throw new Error("No session found");
      await resumeService.saveMasterResume(parsedJson, token);
      setLastSavedHash(JSON.stringify(parsedJson));
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
      setStatus('idle');
      toast.success("PROFILE_SYNC: SUCCESS");
    } catch (error: any) {
      setErrorMsg(error.message || 'Sync Failed.');
      setStatus('error');
    }
  };

  // --- SUB-RENDERERS (Memoized) ---
  const updateContact = useCallback((data: Partial<typeof contact>) => {
    setContact(prev => {
        const key = Object.keys(data)[0] as keyof typeof contact;
        const val = data[key] as string;
        return { ...prev, [key]: validateInput(val, LIMITS[key.toUpperCase() as keyof typeof LIMITS] || 200) };
    });
  }, []);

  const addExperience = useCallback(() => setExperience(prev => [...prev, { title: '', company: '', bullets: [''], location: '', startDate: '', endDate: '', technologies: '' }]), []);
  const removeExperience = useCallback((idx: number) => setExperience(prev => prev.filter((_, i) => i !== idx)), []);
  const updateExp = useCallback((index: number, key: keyof Experience, value: string) => {
    setExperience(prev => {
        const newExp = [...prev];
        (newExp[index] as any)[key] = validateInput(value, key === 'title' || key === 'company' ? LIMITS.TITLE : 500);
        return newExp;
    });
  }, []);
  const addBullet = useCallback((expIdx: number) => {
    setExperience(prev => {
        const newExp = [...prev];
        newExp[expIdx].bullets.push('');
        return newExp;
    });
  }, []);
  const updateBullet = useCallback((expIdx: number, bIdx: number, val: string) => {
    setExperience(prev => {
        const newExp = [...prev];
        newExp[expIdx].bullets[bIdx] = validateInput(val, LIMITS.BULLET);
        return newExp;
    });
  }, []);
  const removeBullet = useCallback((expIdx: number, bIdx: number) => {
    setExperience(prev => {
        const newExp = [...prev];
        newExp[expIdx].bullets = newExp[expIdx].bullets.filter((_, i) => i !== bIdx);
        return newExp;
    });
  }, []);

  const addEducation = useCallback(() => setEducation(prev => [...prev, { institution: '', degree: '', year: '', location: '', gpa: '' }]), []);
  const removeEducation = useCallback((idx: number) => setEducation(prev => prev.filter((_, i) => i !== idx)), []);
  const updateEdu = useCallback((idx: number, key: keyof Education, val: string) => {
    setEducation(prev => {
        const newEdu = [...prev];
        (newEdu[idx] as any)[key] = validateInput(val, 200);
        return newEdu;
    });
  }, []);

  const addSkill = useCallback(() => setSkills(prev => [...prev, '']), []);
  const updateSkill = useCallback((idx: number, val: string) => {
    setSkills(prev => {
        const newSkills = [...prev];
        newSkills[idx] = validateInput(val, LIMITS.SKILL);
        return newSkills;
    });
  }, []);
  const removeSkill = useCallback((idx: number) => setSkills(prev => prev.filter((_, i) => i !== idx)), []);

  const addProject = useCallback(() => setProjects(prev => [...prev, { title: '', description: '', startDate: '', endDate: '', technologies: '' }]), []);
  const removeProject = useCallback((idx: number) => setProjects(prev => prev.filter((_, i) => i !== idx)), []);
  const updateProject = useCallback((idx: number, key: keyof Project, val: string) => {
    setProjects(prev => {
        const newProj = [...prev];
        (newProj[idx] as any)[key] = validateInput(val, key === 'description' ? LIMITS.PROJECT_DESC : 200);
        return newProj;
    });
  }, []);

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center font-mono p-4">
        <div className="text-cyan-accent animate-pulse tracking-widest flex flex-col items-center gap-4 text-center">
          <LucideTerminal className="w-8 h-8" />
          <span className="text-sm">LOADING_MASTER_PROFILE...</span>
        </div>
      </div>
    );
  }

  return (
    <AuthGuard>
      <div className="min-h-screen bg-black industrial-grid selection:bg-cyan-accent selection:text-black font-sans pb-32">
        <AnimatePresence>
            {showResumeViewer && uploadedFileUrl && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
                <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} className="relative w-full max-w-4xl h-[85vh] bg-zinc-950 border border-white/10 flex flex-col">
                <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
                    <div className="flex items-center gap-3">
                    <LucideFileText className="w-4 h-4 text-cyan-accent" />
                    <span className="text-[10px] uppercase tracking-widest font-heading text-white">Detection Source</span>
                    </div>
                    <button onClick={() => setShowResumeViewer(false)} className="text-white/40 hover:text-white p-1"><LucideX className="w-5 h-5" /></button>
                </div>
                <div className="flex-grow"><iframe src={uploadedFileUrl} className="w-full h-full border-0" title="Source" /></div>
                </motion.div>
            </motion.div>
            )}
        </AnimatePresence>

        <main className="pt-8 px-4 md:px-8 max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 mt-16">
            <aside className="lg:col-span-3 space-y-8">
                <div className="lg:sticky lg:top-24 space-y-6">
                    <div className="border border-white/10 bg-black/60 p-6 relative overflow-hidden backdrop-blur-sm">
                        <h3 className="text-[10px] font-heading text-cyan-accent mb-2 uppercase tracking-[0.2em]">Detection Lab</h3>
                        <p className="text-[9px] text-white/40 mb-6 uppercase font-mono font-bold tracking-tighter">PDF Parsing: Active</p>
                        <input type="file" accept=".pdf" className="hidden" ref={fileInputRef} onChange={handleFileUpload} />
                        <button onClick={() => fileInputRef.current?.click()} className="w-full h-32 border border-dashed border-white/20 hover:border-cyan-accent/50 hover:bg-cyan-muted flex flex-col items-center justify-center group transition-all">
                            <LucideUpload className={`w-6 h-6 mb-4 ${status === 'uploading' ? 'text-cyan-accent animate-bounce' : 'text-white/20 group-hover:text-cyan-accent'}`} />
                            <span className="text-[9px] uppercase font-heading tracking-tighter text-white/40 group-hover:text-white">Auto-fill via PDF</span>
                        </button>
                    </div>
                    {errorMsg && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-4 border border-red-500/20 bg-red-500/5 text-red-500 text-[10px] uppercase font-mono">
                        {errorMsg}
                    </motion.div>
                    )}
                </div>
            </aside>

            <div className="lg:col-span-6 space-y-16">
                <SummarySection summary={summary} focusedField={focusedField} setFocusedField={setFocusedField} setSummary={setSummary} />
                <ContactSection contact={contact} focusedField={focusedField} setFocusedField={setFocusedField} updateContact={updateContact} />
                <ExperienceSection 
                    experience={experience} focusedField={focusedField} setFocusedField={setFocusedField} 
                    addExperience={addExperience} removeExperience={removeExperience} updateExp={updateExp} 
                    addBullet={addBullet} updateBullet={updateBullet} removeBullet={removeBullet} 
                />
                <EducationSection education={education} focusedField={focusedField} setFocusedField={setFocusedField} addEducation={addEducation} removeEducation={removeEducation} updateEdu={updateEdu} />
                <SkillsSection skills={skills} addSkill={addSkill} removeSkill={removeSkill} updateSkill={updateSkill} />
                <ProjectsSection projects={projects} focusedField={focusedField} setFocusedField={setFocusedField} addProject={addProject} removeProject={removeProject} updateProject={updateProject} />
            </div>

            <aside className="lg:col-span-3 space-y-6">
                <div className="lg:sticky lg:top-24 space-y-6">
                    <div className={`border p-6 backdrop-blur-md transition-all ${hasChanges ? 'border-amber-500/20 bg-amber-500/5' : 'border-cyan-accent/20 bg-cyan-muted'}`}>
                        <h3 className={`text-[10px] font-heading mb-4 uppercase tracking-widest ${hasChanges ? 'text-amber-500' : 'text-cyan-accent cyan-glow'}`}>
                            {hasChanges ? 'Buffer Dirty' : 'Buffer Synced'}
                        </h3>
                        <p className="text-[9px] font-mono leading-relaxed text-white/40 uppercase">
                            Ready for commit? {hasChanges ? 'YES' : 'NO'}<br />
                            Size check: PASS
                        </p>
                    </div>
                    <Button onClick={handleSave} disabled={status === 'saving' || !hasChanges} className={`w-full h-16 uppercase font-heading tracking-widest text-[10px] font-bold border transition-all ${hasChanges ? 'bg-white text-black hover:bg-cyan-accent' : 'bg-white/5 text-white/20 cursor-not-allowed'}`}>
                        {status === 'saving' ? 'Committing...' : hasChanges ? 'Commit Changes' : 'Stable'}
                    </Button>
                    <Button onClick={() => router.push('/dashboard')} variant="ghost" className="w-full text-white/20 hover:text-white uppercase font-heading tracking-widest text-[9px] mb-2"><LucideLayoutDashboard className="w-3 h-3 mr-2" /> Back to Dashboard</Button>

                    <AlertDialog>
                        <AlertDialogTrigger render={<Button variant="ghost" className="w-full text-white/5 hover:text-red-500/60 uppercase font-heading tracking-widest text-[9px] transition-colors"><LucideRotateCcw className="w-3 h-3 mr-2" /> Reset Local Buffer</Button>} />
                        <AlertDialogContent className="bg-zinc-950 border-white/10 text-white font-sans">
                            <AlertDialogHeader>
                                <AlertDialogTitle className="font-heading tracking-widest uppercase text-amber-500 flex items-center gap-2 text-sm">
                                    <LucideAlertTriangle className="w-4 h-4" />
                                    Hard Reset Warning
                                </AlertDialogTitle>
                                <AlertDialogDescription className="text-white/40 text-[11px] uppercase tracking-wide font-mono leading-relaxed">
                                    This action will clear your current local session data. You will lose all unsaved progress. This cannot be undone.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter className="mt-6">
                                <AlertDialogCancel className="bg-white/5 border-white/10 text-white/40 hover:bg-white/10 hover:text-white uppercase font-heading tracking-widest text-[9px]">Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={handleReset} className="bg-red-600/20 text-red-500 border border-red-500/30 hover:bg-red-600 hover:text-white uppercase font-heading tracking-widest text-[9px]">Confirm Reset</AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </div>
            </aside>
        </main>

        <footer className="fixed bottom-0 left-0 w-full z-40 glass-panel px-8 py-3 flex justify-between items-center text-[9px] font-mono text-white/20 uppercase no-print">
            <div className="flex gap-6"><span>SYNC_ROOT: ACTIVE</span><span>ARMED</span></div>
            <div className="flex gap-4"><Link href="/terms" className="hover:text-white">Privacy</Link><Link href="/privacy" className="hover:text-white">Security</Link></div>
        </footer>
      </div>
    </AuthGuard>
  );
}

'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@clerk/clerk-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { resumeService } from '@/lib/api/services/resumeService';
import { AuthGuard } from '@/components/AuthGuard';
import { LucideUpload, LucidePlus, LucideTrash2, LucideCheck, LucideTerminal, LucideUser, LucideBriefcase, LucideGraduationCap, LucideCpu, LucideFolderGit2, LucideCloudCheck, LucideArrowRight, LucideFileText, LucideEye, LucideX, LucideAlertTriangle, LucideLayoutDashboard } from 'lucide-react';
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
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { toast } from 'sonner';

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

// 🛡️ UI Character Limits
const LIMITS = {
  NAME: 100,
  EMAIL: 100,
  PHONE: 50,
  SOCIAL: 200,
  SUMMARY: 5000,
  TITLE: 100,
  COMPANY: 100,
  BULLET: 1000,
  PROJECT_DESC: 2000
};

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

  const playHaptic = async (style = ImpactStyle.Light) => {
    try {
      await Haptics.impact({ style });
    } catch (e) {}
  };

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
        if (response && response.resume_data) {
          const data = response.resume_data;
          setContact({
            name: data.contact?.name || '',
            email: data.contact?.email || '',
            phone: data.contact?.phone || '',
            github: data.contact?.github || '',
            linkedin: data.contact?.linkedin || '',
          });
          setSummary(data.summary || '');
          setExperience(data.experience || []);
          setEducation(data.education || []);
          setSkills(data.skills || []);
          setProjects(data.projects || []);
          
          const hash = JSON.stringify({
            contact: {
              name: data.contact?.name || '',
              email: data.contact?.email || '',
              phone: data.contact?.phone || '',
              github: data.contact?.github || '',
              linkedin: data.contact?.linkedin || '',
            },
            summary: data.summary || '',
            experience: data.experience || [],
            education: data.education || [],
            skills: data.skills || [],
            projects: data.projects || []
          });
          setLastSavedHash(hash);
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
    if (isLoaded) {
      fetchMasterResume();
    }
  }, [isLoaded]);

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
      if (response && response.resume_data) {
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
      setErrorMsg(err.message || 'Detection failed. Please check the PDF format.');
      setStatus('idle');
    }
  };

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

  const getCounterColor = (length: number, max: number) => {
    const ratio = length / max;
    if (ratio >= 1) return 'text-red-500';
    if (ratio >= 0.8) return 'text-yellow-500/60';
    return 'text-white/20';
  };

  const validateInput = (val: string, max: number) => {
    if (val.length >= max) playHaptic(ImpactStyle.Medium);
    return val.slice(0, max);
  };

  // --- SUB-RENDERERS ---
  const addExperience = () => setExperience([...experience, { title: '', company: '', bullets: [''], location: '', startDate: '', endDate: '', technologies: '' }]);
  const removeExperience = (idx: number) => setExperience(experience.filter((_, i) => i !== idx));
  const updateExp = (index: number, key: string, value: string) => {
    const newExp = [...experience];
    (newExp[index] as any)[key] = validateInput(value, key === 'title' || key === 'company' ? LIMITS.TITLE : 500);
    setExperience(newExp);
  };
  const addBullet = (expIdx: number) => {
    const newExp = [...experience];
    newExp[expIdx].bullets.push('');
    setExperience(newExp);
  };
  const updateBullet = (expIdx: number, bIdx: number, val: string) => {
    const newExp = [...experience];
    newExp[expIdx].bullets[bIdx] = validateInput(val, LIMITS.BULLET);
    setExperience(newExp);
  };
  const removeBullet = (expIdx: number, bIdx: number) => {
    const newExp = [...experience];
    newExp[expIdx].bullets = newExp[expIdx].bullets.filter((_, i) => i !== bIdx);
    setExperience(newExp);
  };

  const addEducation = () => setEducation([...education, { institution: '', degree: '', year: '', location: '', gpa: '' }]);
  const removeEducation = (idx: number) => setEducation(education.filter((_, i) => i !== idx));
  const updateEdu = (idx: number, key: string, val: string) => {
    const newEdu = [...education];
    (newEdu[idx] as any)[key] = validateInput(val, 200);
    setEducation(newEdu);
  };

  const addSkill = () => setSkills([...skills, '']);
  const updateSkill = (idx: number, val: string) => {
    const newSkills = [...skills];
    newSkills[idx] = validateInput(val, 50);
    setSkills(newSkills);
  };
  const removeSkill = (idx: number) => setSkills(skills.filter((_, i) => i !== idx));

  const addProject = () => setProjects([...projects, { title: '', description: '', startDate: '', endDate: '', technologies: '' }]);
  const removeProject = (idx: number) => setProjects(projects.filter((_, i) => i !== idx));
  const updateProject = (idx: number, key: string, val: string) => {
    const newProj = [...projects];
    (newProj[idx] as any)[key] = validateInput(val, key === 'description' ? LIMITS.PROJECT_DESC : 200);
    setProjects(newProj);
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center font-mono p-4">
        <div className="text-cyan-accent animate-pulse tracking-widest flex flex-col items-center gap-4 text-center">
          <LucideTerminal className="w-8 h-8" />
          <span className="text-sm">LOADING MASTER PROFILE...</span>
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
              <p className="text-[9px] text-white/40 mb-6 uppercase font-mono">Upload PDF to auto-populate profile fields.</p>
              <input type="file" accept=".pdf" className="hidden" ref={fileInputRef} onChange={handleFileUpload} />
              <button onClick={() => fileInputRef.current?.click()} className="w-full h-32 border border-dashed border-white/20 hover:border-cyan-accent/50 hover:bg-cyan-muted flex flex-col items-center justify-center group transition-all">
                <LucideUpload className={`w-6 h-6 mb-4 ${status === 'uploading' ? 'text-cyan-accent animate-bounce' : 'text-white/20 group-hover:text-cyan-accent'}`} />
                <span className="text-[9px] uppercase font-heading tracking-tighter text-white/40 group-hover:text-white">Auto-fill via PDF</span>
              </button>
            </div>

            <nav className="border border-white/10 p-6 space-y-3 font-mono bg-black/40">
              <div className="text-[9px] text-white/30 mb-4 tracking-widest uppercase border-b border-white/10 pb-2">Sync Status</div>
              {[['name', LucideUser, 'Bio'], [experience.length, LucideBriefcase, 'Exp'], [education.length, LucideGraduationCap, 'Edu'], [skills.length, LucideCpu, 'Skills']].map(([val, Icon, label]: any) => (
                <div key={label} className="flex justify-between items-center text-[10px] py-1">
                  <span className={`flex items-center gap-2 ${val ? 'text-white' : 'text-white/40'}`}><Icon className={`w-3 h-3 ${val ? 'text-cyan-accent cyan-glow' : ''}`} /> {label}</span>
                  {val ? <LucideCheck className="w-3 h-3 text-cyan-accent" /> : <div className="w-1 h-1 bg-white/20" />}
                </div>
              ))}
            </nav>
          </div>
        </aside>

        <div className="lg:col-span-6 space-y-16">
          {/* 01. SUMMARY */}
          <section id="summary" className="space-y-6">
            <div className="flex justify-between items-end">
               <div className="flex items-baseline gap-4">
                  <span className="text-4xl font-heading text-white/5 italic">01</span>
                  <h2 className="text-xl font-heading text-white tracking-widest uppercase">Professional Summary</h2>
               </div>
               {focusedField === 'summary' && <span className={`text-[9px] font-mono mb-1 ${getCounterColor(summary.length, LIMITS.SUMMARY)}`}>{summary.length}/{LIMITS.SUMMARY}</span>}
            </div>
            <div className="p-6 md:p-8 border border-white/10 bg-black/40">
              <Textarea
                value={summary}
                onFocus={() => setFocusedField('summary')}
                onBlur={() => setFocusedField(null)}
                onChange={e => setSummary(validateInput(e.target.value, LIMITS.SUMMARY))}
                className="bg-transparent border-white/10 text-white font-mono placeholder:text-white/10 focus:border-cyan-accent min-h-[140px] text-xs leading-relaxed"
                placeholder="Briefly explain your core professional expertise..."
              />
            </div>
          </section>

          {/* 02. CONTACT */}
          <section id="contact" className="space-y-6">
            <div className="flex items-baseline gap-4">
              <span className="text-4xl font-heading text-white/5 italic">02</span>
              <h2 className="text-xl font-heading text-white tracking-widest uppercase">Contact Details</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-6 border border-white/10 bg-black/40 backdrop-blur-sm">
              {[
                { label: 'Full Name', key: 'name', ph: 'John Doe', max: LIMITS.NAME },
                { label: 'Email', key: 'email', ph: 'john@example.com', max: LIMITS.EMAIL },
                { label: 'Phone Number', key: 'phone', ph: '+1 (555) 000-0000', max: LIMITS.PHONE },
                { label: 'GitHub', key: 'github', ph: 'github.com/johndoe', max: LIMITS.SOCIAL },
                { label: 'LinkedIn', key: 'linkedin', ph: 'linkedin.com/in/johndoe', max: LIMITS.SOCIAL }
              ].map(f => (
                <div key={f.key} className={`space-y-1 ${f.key === 'github' ? 'md:col-span-2' : ''}`}>
                   <div className="flex justify-between items-center">
                      <label className="text-[10px] uppercase font-heading text-white/40">{f.label}</label>
                      {focusedField === f.key && <span className={`text-[8px] font-mono ${getCounterColor((contact as any)[f.key].length, f.max)}`}>{(contact as any)[f.key].length}/{f.max}</span>}
                   </div>
                   <Input 
                      value={(contact as any)[f.key]} 
                      onFocus={() => setFocusedField(f.key)}
                      onBlur={() => setFocusedField(null)}
                      onChange={e => setContact({...contact, [f.key]: validateInput(e.target.value, f.max)})} 
                      className="bg-transparent border-white/10 text-white font-mono h-9 text-xs" 
                      placeholder={f.ph} 
                   />
                </div>
              ))}
            </div>
          </section>

          {/* 03. EXPERIENCE */}
          <section id="experience" className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-baseline gap-4">
                <span className="text-4xl font-heading text-white/5 italic">03</span>
                <h2 className="text-xl font-heading text-white tracking-widest uppercase">Work Experience</h2>
              </div>
              <Button variant="ghost" className="text-[10px] text-cyan-accent uppercase" onClick={addExperience}>+ Add Job</Button>
            </div>
            {experience.map((exp, expIdx) => (
              <div key={expIdx} className="border border-white/10 bg-black/40 p-8 space-y-6 relative group">
                <button onClick={() => removeExperience(expIdx)} className="absolute top-4 right-4 text-white/10 hover:text-red-500 transition-colors p-1"><LucideTrash2 className="w-4 h-4" /></button>
                
                {/* Title & Company */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {[['title', 'Job Title', LIMITS.TITLE], ['company', 'Company', LIMITS.COMPANY]].map(([k, l, m]: any) => (
                    <div key={k} className="space-y-1">
                      <div className="flex justify-between items-baseline">
                         <label className="text-[10px] uppercase text-white/40">{l}</label>
                         {focusedField === `exp-${expIdx}-${k}` && <span className={`text-[8px] font-mono ${getCounterColor((exp as any)[k].length, m)}`}>{(exp as any)[k].length}/{m}</span>}
                      </div>
                      <Input 
                         value={(exp as any)[k]} 
                         onFocus={() => setFocusedField(`exp-${expIdx}-${k}`)}
                         onBlur={() => setFocusedField(null)}
                         onChange={e => updateExp(expIdx, k, e.target.value)} 
                         className="bg-transparent border-white/10 font-mono text-xs" 
                      />
                    </div>
                  ))}
                </div>

                {/* Dates & Location */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                   {[
                      { label: 'Start Date', key: 'startDate', ph: 'Jan 2020' },
                      { label: 'End Date', key: 'endDate', ph: 'Present' },
                      { label: 'Location', key: 'location', ph: 'Remote' }
                   ].map(f => (
                     <div key={f.key} className="space-y-1">
                        <label className="text-[10px] uppercase text-white/40">{f.label}</label>
                        <Input 
                           value={(exp as any)[f.key] || ''} 
                           onChange={e => updateExp(expIdx, f.key, e.target.value)} 
                           placeholder={f.ph}
                           className="bg-transparent border-white/10 font-mono text-xs h-9" 
                        />
                     </div>
                   ))}
                </div>

                {/* Tech Stack */}
                <div className="space-y-1">
                   <label className="text-[10px] uppercase text-white/40">Technologies & Tools</label>
                   <Input 
                      value={exp.technologies || ''} 
                      onChange={e => updateExp(expIdx, 'technologies', e.target.value)} 
                      placeholder="React, TypeScript, Node.js..."
                      className="bg-transparent border-white/10 font-mono text-xs h-9" 
                   />
                </div>

                {/* Bullets */}
                <div className="space-y-4">
                   {exp.bullets.map((b, bIdx) => (
                     <div key={bIdx} className="relative group/bullet">
                        <div className="flex justify-between mb-1">
                           <span className="text-[8px] uppercase font-mono text-white/20">Achievement #{bIdx+1}</span>
                           {focusedField === `bullet-${expIdx}-${bIdx}` && <span className={`text-[8px] font-mono ${getCounterColor(b.length, LIMITS.BULLET)}`}>{b.length}/{LIMITS.BULLET}</span>}
                        </div>
                        <Textarea 
                           value={b} 
                           onFocus={() => setFocusedField(`bullet-${expIdx}-${bIdx}`)}
                           onBlur={() => setFocusedField(null)}
                           onChange={e => updateBullet(expIdx, bIdx, e.target.value)} 
                           className="bg-transparent border-white/5 text-[11px] font-mono min-h-[60px]" 
                        />
                        <button onClick={() => removeBullet(expIdx, bIdx)} className="absolute bottom-2 right-2 opacity-0 group-hover/bullet:opacity-100 text-red-500"><LucideTrash2 className="w-3 h-3" /></button>
                     </div>
                   ))}
                   <Button variant="ghost" onClick={() => addBullet(expIdx)} className="w-full border border-dashed border-white/5 text-[9px] uppercase text-white/20 hover:text-cyan-accent">+ Add New Point</Button>
                </div>
              </div>
            ))}
          </section>

          {/* 04. EDUCATION */}
          <section id="education" className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-baseline gap-4">
                <span className="text-4xl font-heading text-white/5 italic">04</span>
                <h2 className="text-xl font-heading text-white tracking-widest uppercase">Education</h2>
              </div>
              <Button variant="ghost" className="text-[10px] text-cyan-accent uppercase" onClick={addEducation}>+ Add School</Button>
            </div>
            <div className="space-y-4">
              {education.map((edu, idx) => (
                <div key={idx} className="border border-white/10 bg-black/40 p-6 space-y-4 relative group">
                   <button onClick={() => removeEducation(idx)} className="absolute top-4 right-4 text-white/10 hover:text-red-500"><LucideTrash2 className="w-4 h-4" /></button>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
                      <div><label className="text-[10px] uppercase text-white/40 block mb-1">Institution</label><Input value={edu.institution} onChange={e => updateEdu(idx, 'institution', e.target.value)} className="bg-transparent border-white/10" /></div>
                      <div><label className="text-[10px] uppercase text-white/40 block mb-1">Degree</label><Input value={edu.degree} onChange={e => updateEdu(idx, 'degree', e.target.value)} className="bg-transparent border-white/10" /></div>
                      <div className="grid grid-cols-2 gap-2">
                        <div><label className="text-[10px] uppercase text-white/40 block mb-1">Year</label><Input value={edu.year} onChange={e => updateEdu(idx, 'year', e.target.value)} className="bg-transparent border-white/10" /></div>
                        <div><label className="text-[10px] uppercase text-white/40 block mb-1">GPA</label><Input value={edu.gpa} onChange={e => updateEdu(idx, 'gpa', e.target.value)} className="bg-transparent border-white/10" /></div>
                      </div>
                      <div><label className="text-[10px] uppercase text-white/40 block mb-1">Location</label><Input value={edu.location} onChange={e => updateEdu(idx, 'location', e.target.value)} className="bg-transparent border-white/10" /></div>
                   </div>
                </div>
              ))}
            </div>
          </section>

          {/* 05. SKILLS */}
          <section id="skills" className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-baseline gap-4">
                <span className="text-4xl font-heading text-white/5 italic">05</span>
                <h2 className="text-xl font-heading text-white tracking-widest uppercase">Skills & Tools</h2>
              </div>
              <Button variant="ghost" className="text-[10px] text-cyan-accent uppercase" onClick={addSkill}>+ Add Skill</Button>
            </div>
            <div className="flex flex-wrap gap-2 p-6 border border-white/10 bg-black/40">
               {skills.map((skill, idx) => (
                 <div key={idx} className="relative group">
                    <Input value={skill} onChange={e => updateSkill(idx, e.target.value)} className="w-32 bg-transparent border-white/10 text-[10px] font-mono h-8 uppercase" />
                    <button onClick={() => removeSkill(idx)} className="absolute right-1 top-1 opacity-0 group-hover:opacity-100 text-red-500"><LucideTrash2 className="w-3 h-3" /></button>
                 </div>
               ))}
               {skills.length === 0 && <span className="text-[10px] text-white/20 font-mono italic">NO_SKILLS_RECORDED</span>}
            </div>
          </section>

          {/* 06. PROJECTS */}
          <section id="projects" className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-baseline gap-4">
                <span className="text-4xl font-heading text-white/5 italic">06</span>
                <h2 className="text-xl font-heading text-white tracking-widest uppercase">Key Projects</h2>
              </div>
              <Button variant="ghost" className="text-[10px] text-cyan-accent uppercase" onClick={addProject}>+ Add Project</Button>
            </div>
            {projects.map((proj, idx) => (
              <div key={idx} className="border border-white/10 bg-black/40 p-8 space-y-4 relative">
                 <button onClick={() => removeProject(idx)} className="absolute top-4 right-4 text-white/10 hover:text-red-500"><LucideTrash2 className="w-4 h-4" /></button>
                 <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <div className="flex justify-between items-baseline">
                         <label className="text-[10px] uppercase text-white/40">Title</label>
                         {focusedField === `proj-${idx}-title` && <span className={`text-[8px] font-mono ${getCounterColor(proj.title.length, LIMITS.TITLE || 200)}`}>{proj.title.length}/{LIMITS.TITLE || 200}</span>}
                      </div>
                      <Input value={proj.title} onFocus={() => setFocusedField(`proj-${idx}-title`)} onBlur={() => setFocusedField(null)} onChange={e => updateProject(idx, 'title', e.target.value)} className="bg-transparent border-white/10 font-mono text-xs h-9" />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                       <div className="space-y-1"><label className="text-[10px] uppercase text-white/40">Start</label><Input value={proj.startDate} onChange={e => updateProject(idx, 'startDate', e.target.value)} className="bg-transparent border-white/10 font-mono text-xs h-9" /></div>
                       <div className="space-y-1"><label className="text-[10px] uppercase text-white/40">End</label><Input value={proj.endDate} onChange={e => updateProject(idx, 'endDate', e.target.value)} className="bg-transparent border-white/10 font-mono text-xs h-9" /></div>
                    </div>
                 </div>
                 <div className="space-y-1">
                    <div className="flex justify-between items-center">
                       <label className="text-[10px] uppercase text-white/40">Description</label>
                       {focusedField === `proj-${idx}-desc` && <span className={`text-[8px] font-mono ${getCounterColor(proj.description.length, LIMITS.PROJECT_DESC)}`}>{proj.description.length}/{LIMITS.PROJECT_DESC}</span>}
                    </div>
                    <Textarea value={proj.description} onFocus={() => setFocusedField(`proj-${idx}-desc`)} onBlur={() => setFocusedField(null)} onChange={e => updateProject(idx, 'description', e.target.value)} className="bg-transparent border-white/5 text-[11px] font-mono min-h-[80px]" />
                 </div>
                 <div className="space-y-1"><label className="text-[10px] uppercase text-white/40">Tech Stack</label><Input value={proj.technologies} onChange={e => updateProject(idx, 'technologies', e.target.value)} className="bg-transparent border-white/10 font-mono text-xs h-9" /></div>
              </div>
            ))}
          </section>
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
            <Button onClick={() => router.push('/dashboard')} variant="ghost" className="w-full text-white/20 hover:text-white uppercase font-heading tracking-widest text-[9px]"><LucideLayoutDashboard className="w-3 h-3 mr-2" /> Back to Dashboard</Button>
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

'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { resumeService } from '@/lib/api/services/resumeService';
import { LucideUpload, LucidePlus, LucideTrash2, LucideCheck, LucideTerminal, LucideUser, LucideBriefcase, LucideGraduationCap, LucideCpu, LucideFolderGit2, LucideCloudCheck } from 'lucide-react';

interface Experience {
  title: string;
  company: string;
  bullets: string[];
}

interface Education {
  school: string;
  degree: string;
  years: string;
}

interface Project {
  title: string;
  description: string;
}

export default function MasterResumePage() {
  const router = useRouter();
  
  // State for the interactive builder
  const [contact, setContact] = useState({ name: '', email: '' });
  const [experience, setExperience] = useState<Experience[]>([]);
  const [education, setEducation] = useState<Education[]>([]);
  const [skills, setSkills] = useState<string[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  
  // Snapshot for dirty checking
  const [lastSavedHash, setLastSavedHash] = useState('');
  
  const [status, setStatus] = useState<'idle' | 'loading' | 'uploading' | 'saving' | 'error'>('loading');
  const [errorMsg, setErrorMsg] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Compute if there are unsaved changes
  const hasChanges = useMemo(() => {
    const currentHash = JSON.stringify({ contact, experience, education, skills, projects });
    return currentHash !== lastSavedHash;
  }, [contact, experience, education, skills, projects, lastSavedHash]);

  // Load existing DB profile
  useEffect(() => {
    const fetchMasterResume = async () => {
      try {
        const response = await resumeService.getMasterResume('dev-user-123');
        if (response && response.resume_data) {
          const data = response.resume_data;
          if (data.contact) setContact(data.contact || { name: '', email: '' });
          setExperience(data.experience || []);
          setEducation(data.education || []);
          setSkills(data.skills || []);
          setProjects(data.projects || []);
          // Sync the hash to exactly match the loaded data
          setLastSavedHash(JSON.stringify({
            contact: data.contact || { name: '', email: '' },
            experience: data.experience || [],
            education: data.education || [],
            skills: data.skills || [],
            projects: data.projects || []
          }));
        } else {
          // Initialize empty
          const empty = { contact: { name: '', email: '' }, experience: [], education: [], skills: [], projects: [] };
          setLastSavedHash(JSON.stringify(empty));
        }
        setStatus('idle');
      } catch (error: any) {
        if (error.response && error.response.status === 404) {
          setLastSavedHash(JSON.stringify({ contact, experience, education, skills, projects }));
          setStatus('idle');
        } else {
          console.error(error);
          setStatus('idle');
        }
      }
    };
    fetchMasterResume();
  }, []);

  // --- ACTIONS ---

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setStatus('uploading');
    setErrorMsg('');

    try {
      const response = await resumeService.uploadResume('dev-user-123', file);
      if (response && response.resume_data) {
        const data = response.resume_data;
        // REPLACE existing data as per use request 
        setContact(data.contact || { name: '', email: '' });
        setExperience(data.experience || []);
        setEducation(data.education || []);
        setSkills(data.skills || []);
        setProjects(data.projects || []);
      }
      setStatus('idle');
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.response?.data?.detail || 'Whoops! We couldn\'t read that PDF. Please try another one.');
      setStatus('idle');
    }
  };

  const handleSave = async () => {
    if (!hasChanges) return;
    setStatus('saving');
    setErrorMsg('');
    setSaveSuccess(false);

    const parsedJson = { contact, experience, education, skills, projects };

    try {
      await resumeService.saveMasterResume('dev-user-123', parsedJson);
      setLastSavedHash(JSON.stringify(parsedJson));
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
      setStatus('idle');
    } catch (error) {
      console.error(error);
      setErrorMsg('Cloud Sync Failed: Check your connection.');
      setStatus('error');
    }
  };

  // --- SUB-RENDERERS ---

  const addExperience = () => setExperience([...experience, { title: '', company: '', bullets: [''] }]);
  const removeExperience = (idx: number) => setExperience(experience.filter((_, i) => i !== idx));
  const updateExp = (index: number, key: string, value: string) => {
    const newExp = [...experience];
    (newExp[index] as any)[key] = value;
    setExperience(newExp);
  };
  const addBullet = (expIdx: number) => {
    const newExp = [...experience];
    newExp[expIdx].bullets.push('');
    setExperience(newExp);
  };
  const updateBullet = (expIdx: number, bIdx: number, val: string) => {
    const newExp = [...experience];
    newExp[expIdx].bullets[bIdx] = val;
    setExperience(newExp);
  };
  const removeBullet = (expIdx: number, bIdx: number) => {
    const newExp = [...experience];
    newExp[expIdx].bullets = newExp[expIdx].bullets.filter((_, i) => i !== bIdx);
    setExperience(newExp);
  };

  const addEducation = () => setEducation([...education, { school: '', degree: '', years: '' }]);
  const removeEducation = (idx: number) => setEducation(education.filter((_, i) => i !== idx));
  const updateEdu = (idx: number, key: string, val: string) => {
    const newEdu = [...education];
    (newEdu[idx] as any)[key] = val;
    setEducation(newEdu);
  };

  const addSkill = () => setSkills([...skills, '']);
  const updateSkill = (idx: number, val: string) => {
    const newSkills = [...skills];
    newSkills[idx] = val;
    setSkills(newSkills);
  };
  const removeSkill = (idx: number) => setSkills(skills.filter((_, i) => i !== idx));

  const addProject = () => setProjects([...projects, { title: '', description: '' }]);
  const removeProject = (idx: number) => setProjects(projects.filter((_, i) => i !== idx));
  const updateProject = (idx: number, key: string, val: string) => {
    const newProj = [...projects];
    (newProj[idx] as any)[key] = val;
    setProjects(newProj);
  };

  const handleReset = () => {
    if (window.confirm('WARNING: This will clear all data in the current session. Proceed?')) {
      setContact({ name: '', email: '' });
      setExperience([]);
      setEducation([]);
      setSkills([]);
      setProjects([]);
      setErrorMsg('');
      setSaveSuccess(false);
    }
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center font-mono p-6">
        <div className="text-cyan-accent animate-pulse tracking-widest flex flex-col items-center gap-4 text-center">
          <LucideTerminal className="w-8 h-8" />
          <span className="text-sm">LOADING YOUR MASTER PROFILE...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black industrial-grid selection:bg-cyan-accent selection:text-black font-sans pb-32 overflow-x-hidden">
      
      {/* HEADER BAR */}
      <header className="fixed top-0 left-0 w-full z-50 bg-black/90 backdrop-blur-lg border-b border-white/10 px-4 md:px-8 py-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-cyan-accent flex items-center justify-center shadow-[0_0_15px_rgba(0,240,255,0.4)]">
            <LucideTerminal className="w-5 h-5 text-black" />
          </div>
          <h1 className="text-sm md:text-lg font-heading text-white tracking-widest uppercase cyan-glow">Master Profile</h1>
        </div>
        <div className="flex items-center gap-3 md:gap-6">
          {saveSuccess && (
            <div className="hidden sm:flex items-center gap-2 text-[10px] text-cyan-accent animate-pulse uppercase tracking-widest">
              <LucideCloudCheck className="w-3 h-3" />
              Changes Saved
            </div>
          )}
          {!hasChanges && !saveSuccess && (
             <div className="hidden sm:flex items-center gap-2 text-[10px] text-white/20 uppercase tracking-widest font-mono">
                <LucideCheck className="w-3 h-3" />
                All Synced
             </div>
          )}
          <Button 
            onClick={handleSave} 
            disabled={status === 'saving' || status === 'uploading' || !hasChanges}
            className={`transition-all uppercase font-heading px-4 md:px-8 h-10 tracking-widest text-[10px] md:text-xs font-bold ${
              hasChanges 
              ? 'bg-cyan-accent text-black hover:bg-white shadow-[0_0_20px_rgba(0,240,255,0.2)]' 
              : 'bg-white/5 text-white/20 border-white/5 cursor-not-allowed'
            }`}
          >
            {status === 'saving' ? 'Saving...' : 'Save Profile'}
          </Button>
        </div>
      </header>

      <main className="pt-24 px-4 md:px-8 max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12">
        
        {/* LEFT COLUMN: UPLOAD & STEPS */}
        <aside className="lg:col-span-4 xl:col-span-3 space-y-6 md:space-y-8">
          <div className="lg:sticky lg:top-24 space-y-6">
            <div className="relative group overflow-hidden border border-white/10 bg-black/60 p-6 md:p-8 backdrop-blur-sm">
              {/* Animation Scan Line */}
              {status === 'uploading' && <div className="absolute top-0 left-0 w-full scan-line animate-scan z-10" />}
              
              <div className="relative z-0">
                <h3 className="text-[10px] font-heading text-cyan-accent mb-2 tracking-[0.2em] uppercase">Magic Auto-Fill</h3>
                <p className="text-[10px] text-white/40 mb-6 leading-tight uppercase font-mono">
                  Upload a PDF and our AI will automatically fill in your details for you.
                </p>
                
                <input type="file" accept=".pdf" className="hidden" ref={fileInputRef} onChange={handleFileUpload} />
                
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  disabled={status === 'uploading'}
                  className="w-full h-32 md:h-40 border border-dashed border-white/20 hover:border-cyan-accent/50 hover:bg-cyan-muted flex flex-col items-center justify-center transition-all group"
                >
                  <LucideUpload className={`w-6 h-6 md:w-8 md:h-8 mb-4 ${status === 'uploading' ? 'text-cyan-accent animate-bounce' : 'text-white/20 group-hover:text-cyan-accent'}`} />
                  <span className="text-[10px] uppercase font-heading tracking-widest text-white/40 group-hover:text-white">
                    {status === 'uploading' ? 'Reading PDF...' : 'Upload Resume'}
                  </span>
                </button>

                <p className="text-[9px] mt-4 text-white/30 uppercase font-mono italic">
                  Note: This will replace your current manual edits.
                </p>
              </div>
            </div>

            <nav className="border border-white/10 p-6 space-y-3 font-mono bg-black/40">
               <div className="text-[9px] text-white/30 mb-4 tracking-widest uppercase border-b border-white/10 pb-2">Profile Checklist</div>
               <div className="flex justify-between items-center text-[10px] py-1">
                 <span className={`flex items-center gap-2 transition-colors ${contact.name ? 'text-white' : 'text-white/40'}`}>
                   <LucideUser className={`w-3 h-3 ${contact.name ? 'text-cyan-accent cyan-drop-shadow' : 'text-white/40'}`}/> Personal Info
                 </span> 
                 {contact.name ? <LucideCheck className="w-3 h-3 text-cyan-accent cyan-drop-shadow" /> : <div className="w-1 h-1 bg-white/20" />}
               </div>
               <div className="flex justify-between items-center text-[10px] py-1">
                 <span className={`flex items-center gap-2 transition-colors ${experience.length > 0 ? 'text-white' : 'text-white/40'}`}>
                   <LucideBriefcase className={`w-3 h-3 ${experience.length > 0 ? 'text-cyan-accent cyan-drop-shadow' : 'text-white/40'}`}/> Work History
                 </span> 
                 <span className={experience.length > 0 ? "text-cyan-accent cyan-glow font-bold" : "text-white/20"}>{experience.length} Items</span>
               </div>
               <div className="flex justify-between items-center text-[10px] py-1">
                 <span className={`flex items-center gap-2 transition-colors ${education.length > 0 ? 'text-white' : 'text-white/40'}`}>
                   <LucideGraduationCap className={`w-3 h-3 ${education.length > 0 ? 'text-cyan-accent cyan-drop-shadow' : 'text-white/40'}`}/> Education
                 </span> 
                 <span className={education.length > 0 ? "text-cyan-accent cyan-glow font-bold" : "text-white/20"}>{education.length} Items</span>
               </div>
               <div className="flex justify-between items-center text-[10px] py-1">
                 <span className={`flex items-center gap-2 transition-colors ${skills.length > 0 ? 'text-white' : 'text-white/40'}`}>
                   <LucideCpu className={`w-3 h-3 ${skills.length > 0 ? 'text-cyan-accent cyan-drop-shadow' : 'text-white/40'}`}/> Skills
                 </span> 
                 <span className={skills.length > 0 ? "text-cyan-accent cyan-glow font-bold" : "text-white/20"}>{skills.length} Items</span>
               </div>
            </nav>
          </div>
        </aside>

        {/* CENTER COLUMN: FORM */}
        <div className="lg:col-span-8 xl:col-span-6 space-y-12 md:space-y-16">
          
          {/* 1. CONTACT */}
          <section id="contact" className="space-y-6">
            <div className="flex items-baseline gap-4">
              <span className="text-3xl md:text-4xl font-heading text-white/10">01</span>
              <h2 className="text-xl md:text-2xl font-heading text-white tracking-widest">Personal Details</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 p-6 md:p-8 border border-white/10 bg-black/40 backdrop-blur-sm">
              <div className="space-y-2">
                <label className="text-[10px] uppercase font-heading text-white/40 tracking-widest">Full Name</label>
                <Input 
                  value={contact.name} 
                  onChange={e => setContact({...contact, name: e.target.value})} 
                  className="bg-transparent border-white/20 text-white font-mono placeholder:text-white/10 focus:border-cyan-accent transition-all uppercase h-10 text-xs md:text-sm"
                  placeholder="John Doe"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] uppercase font-heading text-white/40 tracking-widest">Email Address</label>
                <Input 
                  value={contact.email} 
                  onChange={e => setContact({...contact, email: e.target.value})} 
                  className="bg-transparent border-white/20 text-white font-mono placeholder:text-white/10 focus:border-cyan-accent transition-all h-10 text-xs md:text-sm"
                  placeholder="john@example.com"
                />
              </div>
            </div>
          </section>

          {/* 2. EXPERIENCE */}
          <section id="experience" className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-baseline gap-4">
                <span className="text-3xl md:text-4xl font-heading text-white/10">02</span>
                <h2 className="text-xl md:text-2XL font-heading text-white tracking-widest uppercase">Work Experience</h2>
              </div>
              <Button variant="ghost" className="text-[10px] text-cyan-accent uppercase tracking-widest hover:bg-cyan-muted h-8" onClick={addExperience}>
                <LucidePlus className="w-3 h-3 mr-2" /> Add Job
              </Button>
            </div>
            
            <div className="space-y-6 md:space-y-8">
              {experience.length === 0 && (
                <div className="p-8 border border-dashed border-white/10 text-center">
                  <p className="text-[10px] text-white/30 uppercase tracking-[0.2em] font-mono">No work experience listed yet.</p>
                </div>
              )}
              {experience.map((exp, expIdx) => (
                <div key={expIdx} className="border border-white/10 bg-black/40 p-6 md:p-8 space-y-6 relative group">
                  <button onClick={() => removeExperience(expIdx)} className="absolute top-4 right-4 text-white/20 hover:text-red-500 transition-colors p-2">
                    <LucideTrash2 className="w-4 h-4" />
                  </button>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase font-heading text-white/40 tracking-widest">Job Title</label>
                      <Input value={exp.title} onChange={e => updateExp(expIdx, 'title', e.target.value)} className="bg-transparent border-white/20 text-white font-mono h-10 text-xs md:text-sm" placeholder="Senior Architect" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase font-heading text-white/40 tracking-widest">Company</label>
                      <Input value={exp.company} onChange={e => updateExp(expIdx, 'company', e.target.value)} className="bg-transparent border-white/20 text-white font-mono h-10 text-xs md:text-sm" placeholder="Global Tech Inc." />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <label className="text-[10px] uppercase font-heading text-white/40 tracking-widest">Key Achievements</label>
                      <Button variant="ghost" size="sm" onClick={() => addBullet(expIdx)} className="h-6 text-[9px] text-white/40 hover:text-cyan-accent uppercase tracking-widest">
                        + Add Bullet
                      </Button>
                    </div>
                    {exp.bullets.map((bullet, bIdx) => (
                      <div key={bIdx} className="flex gap-4 group/bullet">
                        <div className="w-0.5 min-h-[60px] bg-white/5 group-hover/bullet:bg-cyan-accent transition-colors" />
                        <Textarea 
                          value={bullet} 
                          onChange={e => updateBullet(expIdx, bIdx, e.target.value)}
                          className="bg-transparent border-transparent hover:border-white/10 focus:border-white/20 text-xs text-white/80 font-mono resize-none h-[60px] py-1"
                          placeholder="What did you achieve in this role?"
                        />
                        <button onClick={() => removeBullet(expIdx, bIdx)} className="opacity-0 group-hover/bullet:opacity-100 text-white/20 hover:text-red-500 flex items-center p-2">
                          <LucideTrash2 className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* 3. EDUCATION */}
          <section id="education" className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-baseline gap-4">
                <span className="text-3xl md:text-4xl font-heading text-white/10">03</span>
                <h2 className="text-xl md:text-2xl font-heading text-white tracking-widest uppercase">Education</h2>
              </div>
              <Button variant="ghost" className="text-[10px] text-cyan-accent uppercase tracking-widest hover:bg-cyan-muted h-8" onClick={addEducation}>
                <LucidePlus className="w-3 h-3 mr-2" /> Add School
              </Button>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {education.map((edu, idx) => (
                <div key={idx} className="border border-white/10 bg-black/40 p-6 space-y-4 relative">
                  <button onClick={() => removeEducation(idx)} className="absolute top-4 right-4 text-white/20 hover:text-red-500 p-2">
                    <LucideTrash2 className="w-4 h-4" />
                  </button>
                  <div className="space-y-1">
                    <label className="text-[9px] uppercase text-white/40 font-heading">School / University</label>
                    <Input value={edu.school} onChange={e => updateEdu(idx, 'school', e.target.value)} className="bg-transparent border-white/10 text-xs font-mono h-8" placeholder="University of Life" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[9px] uppercase text-white/40 font-heading">Degree</label>
                      <Input value={edu.degree} onChange={e => updateEdu(idx, 'degree', e.target.value)} className="bg-transparent border-white/10 text-xs font-mono h-8" placeholder="B.S. Innovation" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] uppercase text-white/40 font-heading">Years</label>
                      <Input value={edu.years} onChange={e => updateEdu(idx, 'years', e.target.value)} className="bg-transparent border-white/10 text-xs font-mono h-8" placeholder="2020 - 2024" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* 4. SKILLS */}
          <section id="skills" className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-baseline gap-4">
                <span className="text-3xl md:text-4xl font-heading text-white/10">04</span>
                <h2 className="text-xl md:text-2xl font-heading text-white tracking-widest uppercase">Skills & Tools</h2>
              </div>
              <Button variant="ghost" className="text-[10px] text-cyan-accent uppercase tracking-widest hover:bg-cyan-muted h-8" onClick={addSkill}>
                <LucidePlus className="w-3 h-3 mr-2" /> Add Skill
              </Button>
            </div>
            
            <div className="flex flex-wrap gap-2 p-6 md:p-8 border border-white/10 bg-black/40">
              {skills.map((skill, idx) => (
                <div key={idx} className="flex items-center group relative">
                  <Input 
                    value={skill} 
                    onChange={e => updateSkill(idx, e.target.value)} 
                    className="w-28 md:w-32 bg-transparent border-white/20 text-[10px] font-mono h-8 uppercase focus:border-cyan-accent px-2"
                    placeholder="New Skill"
                  />
                  <button onClick={() => removeSkill(idx)} className="absolute right-1 opacity-0 group-hover:opacity-100 text-red-500 transition-opacity z-10 p-1">
                    <LucideTrash2 className="w-3 h-3" />
                  </button>
                </div>
              ))}
              {skills.length === 0 && <span className="text-[10px] text-white/20 font-mono italic tracking-widest uppercase">Add your top skills here...</span>}
            </div>
          </section>

          {/* 5. PROJECTS */}
          <section id="projects" className="space-y-6">
             <div className="flex items-center justify-between">
              <div className="flex items-baseline gap-4">
                <span className="text-3xl md:text-4xl font-heading text-white/10">05</span>
                <h2 className="text-xl md:text-2xl font-heading text-white tracking-widest uppercase">Favorite Projects</h2>
              </div>
              <Button variant="ghost" className="text-[10px] text-cyan-accent uppercase tracking-widest hover:bg-cyan-muted h-8" onClick={addProject}>
                <LucidePlus className="w-3 h-3 mr-2" /> Add Project
              </Button>
            </div>
            <div className="space-y-6">
              {projects.map((proj, idx) => (
                <div key={idx} className="border border-white/10 bg-black/40 p-6 md:p-8 space-y-4 relative">
                  <button onClick={() => removeProject(idx)} className="absolute top-4 right-4 text-white/20 hover:text-red-500 p-2">
                    <LucideTrash2 className="w-4 h-4" />
                  </button>
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase font-heading text-white/40 tracking-widest">Project Name</label>
                    <Input value={proj.title} onChange={e => updateProject(idx, 'title', e.target.value)} className="bg-transparent border-white/20 text-white font-mono h-10 text-xs md:text-sm" placeholder="AI Resume Builder" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase font-heading text-white/40 tracking-widest">Description</label>
                    <Textarea value={proj.description} onChange={e => updateProject(idx, 'description', e.target.value)} className="bg-transparent border-white/20 text-white font-mono text-xs h-20" placeholder="Built a platform that uses AI to help users land their dream jobs." />
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* RIGHT COLUMN: STATUS (Mobile Stacked) */}
        <aside className="lg:col-span-12 xl:col-span-3">
          <div className="lg:sticky lg:top-24 space-y-6">
            <div className="border border-white/10 p-6 bg-black/60 backdrop-blur-sm hidden xl:block">
              <h3 className="text-[10px] font-heading text-white mb-6 uppercase tracking-widest">Profile Stats</h3>
              <div className="space-y-4 font-mono text-[9px]">
                <div className="flex justify-between items-center text-white/30 lowercase">
                  <span>data_integrity</span>
                  <span className="text-cyan-accent uppercase">OK</span>
                </div>
                <div className="flex justify-between items-center text-white/30 lowercase">
                  <span>cloud_sync</span>
                  <span className="text-cyan-accent uppercase">Active</span>
                </div>
                <div className="flex justify-between items-center text-white/30 border-t border-white/5 pt-4">
                  <span className="lowercase">total_entries</span>
                  <span className="text-white text-[11px]">{experience.length + education.length + skills.length + projects.length}</span>
                </div>
              </div>
            </div>

            <div className={`border p-6 backdrop-blur-md transition-all duration-500 ${hasChanges ? 'border-amber-500/20 bg-amber-500/5' : 'border-cyan-accent/20 bg-cyan-muted'}`}>
               <h3 className={`text-[10px] font-heading mb-4 uppercase tracking-widest ${hasChanges ? 'text-amber-500' : 'text-cyan-accent cyan-glow'}`}>
                 {hasChanges ? 'Unsaved Changes' : 'All Synced'}
               </h3>
               <p className={`text-[10px] font-mono leading-loose ${hasChanges ? 'text-amber-500/70' : 'text-cyan-accent/70'}`}>
                 SYNC: {status === 'saving' ? 'BUSY...' : hasChanges ? 'OUTDATED' : 'STABLE'}<br/>
                 LAST: {saveSuccess ? 'JUST NOW' : hasChanges ? 'PENDING' : 'SAVED'}<br/>
                 STATE: {hasChanges ? 'DIRTY' : 'CLEAN'}
               </p>
            </div>

            <Button 
                onClick={handleSave} 
                disabled={status === 'saving' || !hasChanges}
                className={`w-full h-16 transition-all uppercase font-heading tracking-[0.2em] text-xs font-bold shadow-[0_4px_20px_rgba(255,255,255,0.05)] border ${
                  hasChanges 
                  ? 'bg-white text-black hover:bg-cyan-accent hover:border-cyan-accent shadow-[0_0_20px_rgba(0,240,255,0.1)]' 
                  : 'bg-white/5 text-white/20 border-white/5 cursor-not-allowed'
                }`}
              >
                {hasChanges ? 'Commit Changes' : 'Profile up to date'}
            </Button>

            <button 
              onClick={handleReset}
              className="w-full text-[10px] text-white/20 hover:text-red-500 uppercase tracking-widest font-mono transition-colors pt-2"
            >
              [ Reset Local Buffer ]
            </button>
            
            {errorMsg && <div className="text-[10px] text-red-500 font-mono uppercase bg-red-500/5 border border-red-500/20 p-4">{errorMsg}</div>}
          </div>
        </aside>

      </main>
    </div>
  );
}

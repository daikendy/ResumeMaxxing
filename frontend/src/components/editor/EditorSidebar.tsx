'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { 
  LucideLayers3, 
  LucideCircleDashed, 
  LucideBriefcase, 
  LucideGraduationCap, 
  LucideFolderGit2, 
  LucideChevronUp, 
  LucideChevronDown 
} from 'lucide-react';
import { useResumeStore } from '@/store/useResumeStore';
import { Haptics, ImpactStyle } from '@capacitor/haptics';

import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';

interface EditorSidebarProps {
  onGenerate: () => void;
}

export function EditorSidebar({ onGenerate }: EditorSidebarProps) {
  const store = useResumeStore();
  
  const playHaptic = async () => {
    try { await Haptics.impact({ style: ImpactStyle.Light }); } catch (e) {}
  };

  if (store.isSidebarHidden) return null;

  return (
    <aside className="print:hidden w-full md:w-[40%] lg:w-[32%] xl:w-[28%] h-full bg-zinc-950 text-zinc-50 flex flex-col pt-6 pb-8 px-6 md:px-10 overflow-y-auto border-r border-zinc-900 shadow-2xl relative z-20">
      <div className="flex flex-col gap-6 mb-10">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-1.5 bg-zinc-800 rounded-sm">
              <LucideLayers3 className="w-4 h-4 text-zinc-400" />
            </div>
            <h1 className="text-xl font-heading font-bold tracking-[0.1em] uppercase text-white">Editor Studio</h1>
          </div>
          <p className="text-zinc-500 text-[10px] font-mono leading-relaxed uppercase tracking-wider">System: V2.2 // Premium</p>
        </div>
      </div>

      <div className="flex flex-col space-y-8 flex-grow">
        <div className="p-4 bg-zinc-900/50 border border-zinc-800 rounded-sm space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase tracking-widest font-bold text-zinc-400">Master Data</span>
            </div>
          </div>
          
          {store.isProfileLoading ? (
            <div className="flex items-center gap-3 py-2 text-zinc-600 animate-pulse">
              <LucideCircleDashed className="w-4 h-4 animate-spin" />
              <span className="text-[10px] uppercase font-mono tracking-tighter">Syncing Engine...</span>
            </div>
          ) : store.masterProfile ? (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-2">
                <div className="p-2 bg-zinc-950 border border-zinc-800/50 rounded-sm text-center">
                  <div className="flex items-center justify-center gap-1.5 mb-1.5 opacity-40">
                    <LucideBriefcase className="w-2.5 h-2.5" />
                    <span className="text-[7px] uppercase font-bold tracking-tighter text-white">Exp.</span>
                  </div>
                  <div className="text-xs font-heading text-white">{store.masterProfile.experience?.length || 0}</div>
                </div>
                <div className="p-2 bg-zinc-950 border border-zinc-800/50 rounded-sm text-center">
                  <div className="flex items-center justify-center gap-1.5 mb-1.5 opacity-40">
                    <LucideGraduationCap className="w-2.5 h-2.5" />
                    <span className="text-[7px] uppercase font-bold tracking-tighter text-white">Edu.</span>
                  </div>
                  <div className="text-xs font-heading text-white">{store.masterProfile.education?.length || 0}</div>
                </div>
                <div className="p-2 bg-zinc-950 border border-zinc-800/50 rounded-sm text-center">
                  <div className="flex items-center justify-center gap-1.5 mb-1.5 opacity-40">
                    <LucideFolderGit2 className="w-2.5 h-2.5" />
                    <span className="text-[7px] uppercase font-bold tracking-tighter text-white">Proj.</span>
                  </div>
                  <div className="text-xs font-heading text-white">{store.masterProfile.projects?.length || 0}</div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex flex-wrap gap-1">
                  {(store.showAllSkills ? store.masterProfile.skills : store.masterProfile.skills?.slice(0, 6))?.map((s: string, i: number) => (
                    <span key={i} className="px-1.5 py-0.5 bg-zinc-800/50 text-[8px] text-zinc-400 uppercase tracking-tighter border border-zinc-800 font-mono">
                      {s}
                    </span>
                  ))}
                </div>
                
                {store.masterProfile.skills?.length > 6 && (
                  <button 
                    onClick={() => { store.setShowAllSkills(!store.showAllSkills); playHaptic(); }}
                    className="text-[8px] uppercase tracking-widest font-black text-cyan-accent hover:opacity-80 transition-opacity flex items-center gap-1 mt-1"
                  >
                    {store.showAllSkills ? 'Minimize Data' : `+${store.masterProfile.skills.length - 6} More Tags`}
                    {store.showAllSkills ? <LucideChevronUp className="w-2 h-2" /> : <LucideChevronDown className="w-2 h-2" />}
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="py-4 text-center">
              <span className="text-[10px] text-zinc-600 uppercase font-mono tracking-tighter">No Profile Data Linked</span>
            </div>
          )}
        </div>

        <div className="space-y-6 flex-grow flex flex-col">
          <div className="space-y-3">
            <label className="text-[10px] uppercase tracking-widest font-bold text-zinc-500">Target Title</label>
            <Input
              className="bg-zinc-900 border-zinc-800 text-zinc-100"
              value={store.targetJobTitle}
              onChange={(e) => store.setJobDetails(e.target.value, store.targetJobDescription)}
            />
          </div>

          <div className="space-y-3 flex-grow flex flex-col">
            <label className="text-[10px] uppercase tracking-widest font-bold text-zinc-500">Job Description</label>
            <Textarea
              className="bg-zinc-900 border-zinc-800 text-zinc-100 flex-grow resize-none"
              value={store.targetJobDescription}
              onChange={(e) => store.setJobDetails(store.targetJobTitle, e.target.value)}
            />
          </div>
        </div>

        <div className="pt-6 mt-auto">
          <Button
            className="w-full bg-cyan-accent text-black font-bold uppercase tracking-widest h-14 premium-touch"
            onClick={onGenerate}
            disabled={store.status === 'loading'}
          >
            {store.status === 'loading' ? 'Generating...' : 'Execute Generation'}
          </Button>
        </div>
      </div>
    </aside>
  );
}

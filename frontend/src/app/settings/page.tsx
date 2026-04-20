'use client';

import React from 'react';
import { UserProfile } from '@clerk/clerk-react';
import { AuthGuard } from '@/components/AuthGuard';
import { 
  LucideSettings, 
  LucideShieldCheck, 
  LucideZap, 
  LucideCreditCard,
  LucideChevronLeft,
  LucideDatabase
} from 'lucide-react';
import Link from 'next/link';

export default function SettingsPage() {
  return (
    <AuthGuard>
      <div className="min-h-screen bg-black text-zinc-50 selection:bg-cyan-accent selection:text-black font-sans pb-20">
        
        {/* TOP NAVIGATION */}
        <div className="h-16 border-b border-zinc-900 bg-zinc-950/50 backdrop-blur-md flex items-center justify-between px-6 sticky top-0 z-50">
          <div className="flex items-center gap-4">
            <Link 
              href="/dashboard"
              className="p-2 hover:bg-zinc-900 rounded-sm text-zinc-500 hover:text-white transition-all transform active:scale-95"
            >
              <LucideChevronLeft className="w-5 h-5" />
            </Link>
            <div className="flex items-center gap-2">
              <LucideSettings className="w-4 h-4 text-cyan-accent" />
              <h1 className="text-sm font-black uppercase tracking-[0.2em] text-white">Project Settings</h1>
            </div>
          </div>
          
          <div className="flex items-center gap-2 px-3 py-1 bg-zinc-900 border border-zinc-800 rounded-sm">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-tighter">System: Online</span>
          </div>
        </div>

        <main className="max-w-6xl mx-auto px-6 pt-12 grid grid-cols-1 lg:grid-cols-[1fr,350px] gap-12">
          
          {/* LEFT COLUMN: THE CLERK PROFILE */}
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div>
              <h2 className="text-2xl font-black uppercase tracking-tight text-white mb-2">Account Architecture</h2>
              <p className="text-zinc-500 text-xs italic font-mono uppercase tracking-widest">Identify & Resource Management // V1.0</p>
            </div>

            <div className="bg-zinc-950 border border-zinc-900 rounded-sm overflow-hidden shadow-2xl">
              <UserProfile 
                appearance={{
                  baseTheme: undefined,
                  elements: {
                    card: "bg-transparent shadow-none w-full",
                    navbar: "hidden", // We'll use our own side list or just show the profile
                    rootBox: "w-full",
                    scrollBox: "bg-transparent",
                    pageScrollBox: "p-0",
                    headerTitle: "text-white text-xl font-black uppercase tracking-tight",
                    headerSubtitle: "text-zinc-500 text-xs font-mono uppercase tracking-widest",
                    profileSectionTitleText: "text-zinc-400 text-[10px] font-black uppercase tracking-[0.2em] border-b border-zinc-900 pb-2 mb-6",
                    userPreviewMainIdentifier: "text-white font-bold",
                    userPreviewSecondaryIdentifier: "text-zinc-500 font-mono text-[10px]",
                    formButtonPrimary: "bg-white text-black hover:bg-zinc-200 transition-all rounded-none uppercase text-[10px] font-black tracking-widest py-3",
                    formFieldLabel: "text-zinc-400 text-[9px] uppercase tracking-widest font-bold",
                    formFieldInput: "bg-zinc-900 border-zinc-800 text-white rounded-none focus:ring-1 focus:ring-cyan-accent",
                    footer: "hidden",
                    userButtonPopoverFooter: "hidden",
                    actionCard: "bg-zinc-900 border border-zinc-800 rounded-none",
                    badge: "bg-zinc-800 text-zinc-300 rounded-none text-[8px] uppercase font-bold",
                    profilePage: "gap-12"
                  }
                }}
              />
            </div>
          </div>

          {/* RIGHT COLUMN: SYSTEM METRICS & SECURITY */}
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-700 delay-200">
            
            {/* SECURITY WIDGET */}
            <div className="p-6 bg-zinc-950 border border-zinc-900 industrial-grid relative group overflow-hidden">
               <div className="relative z-10 space-y-4">
                 <div className="flex items-center gap-2 pb-3 border-b border-zinc-900">
                    <LucideShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Security Clearance</span>
                 </div>
                 <p className="text-[10px] leading-relaxed text-zinc-500 font-mono italic">
                   Your account is secured with Clerk Auth. Deleting your account will permanently scrub your identity and any <strong>Resumes</strong> associated with this ID.
                 </p>
                 <div className="pt-2">
                   <div className="flex items-center justify-between text-[9px] font-mono mb-1">
                     <span className="text-zinc-600 uppercase">Encryption:</span>
                     <span className="text-emerald-500/80">AES-256 Enabled</span>
                   </div>
                   <div className="flex items-center justify-between text-[9px] font-mono">
                     <span className="text-zinc-600 uppercase">Status:</span>
                     <span className="text-emerald-500/80">Verified</span>
                   </div>
                 </div>
               </div>
               <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
                 <LucideShieldCheck className="w-12 h-12 text-zinc-500" />
               </div>
            </div>

            {/* QUOTA WIDGET */}
            <div className="p-6 bg-zinc-950 border border-zinc-900 relative group overflow-hidden">
               <div className="relative z-10 space-y-4">
                 <div className="flex items-center gap-2 pb-3 border-b border-zinc-900">
                    <LucideZap className="w-3.5 h-3.5 text-cyan-accent" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Resource Quota</span>
                 </div>
                 <div className="space-y-4">
                    <div className="flex justify-between items-end">
                       <span className="text-3xl font-black text-white italic">FREE</span>
                       <span className="text-[9px] font-mono text-zinc-600 uppercase">Tier 0.1</span>
                    </div>
                    <div className="space-y-1.5">
                       <div className="flex justify-between text-[9px] uppercase tracking-widest text-zinc-500">
                          <span>Generations</span>
                          <span>Max Limit: 5</span>
                       </div>
                       <div className="h-1.5 w-full bg-zinc-900 border border-zinc-800 rounded-full overflow-hidden">
                          <div className="h-full w-[20%] bg-cyan-accent shadow-[0_0_10px_rgba(34,211,238,0.5)]" />
                       </div>
                    </div>
                    <button className="w-full py-3 border border-zinc-800 text-[9px] font-bold uppercase tracking-[0.2em] text-zinc-400 hover:text-white hover:bg-zinc-900 transition-all flex items-center justify-center gap-2 group">
                       <LucideCreditCard className="w-3 h-3 transition-transform group-hover:scale-110" />
                       Upgrade Account
                    </button>
                 </div>
               </div>
               <div className="absolute -bottom-2 -right-2 p-2 opacity-5">
                 <LucideZap className="w-16 h-16 text-zinc-500" />
               </div>
            </div>

            {/* DATA SYNC STATUS */}
            <div className="p-4 bg-zinc-900/20 border border-dotted border-zinc-800 flex items-center gap-4">
                <div className="p-2 bg-zinc-900 rounded-sm">
                  <LucideDatabase className="w-4 h-4 text-zinc-600" />
                </div>
                <div>
                   <p className="text-[8px] font-mono text-zinc-500 uppercase tracking-widest mb-0.5">Database Snapshot</p>
                   <p className="text-[9px] font-bold text-zinc-200 uppercase tracking-tight">MySQL & Clerk Synchronized</p>
                </div>
            </div>

          </div>

        </main>
      </div>
    </AuthGuard>
  );
}

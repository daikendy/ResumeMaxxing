'use client';

import React from 'react';
import { LucideShieldCheck, LucideExternalLink, LucideChevronLeft, LucideDatabase, LucideTrash2, LucideLock } from 'lucide-react';
import Link from 'next/link';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-black text-zinc-300 selection:bg-cyan-accent selection:text-black font-sans pb-40">
      
      {/* HEADER */}
      <div className="h-16 border-b border-zinc-900 bg-zinc-950/80 backdrop-blur-xl sticky top-0 z-50 flex items-center justify-between px-6">
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="p-2 hover:bg-zinc-900 rounded-sm text-zinc-500 hover:text-white transition-all">
            <LucideChevronLeft className="w-5 h-5" />
          </Link>
          <div className="flex items-center gap-2">
            <LucideShieldCheck className="w-4 h-4 text-cyan-accent" />
            <h1 className="text-xs font-black uppercase tracking-[0.2em] text-white">Privacy Architecture</h1>
          </div>
        </div>
        <span className="text-[10px] font-mono text-zinc-600 uppercase tracking-widest">Effective: April 2026</span>
      </div>

      <main className="max-w-3xl mx-auto px-6 pt-20">
        
        {/* HERO SECTION */}
        <div className="mb-20 animate-in fade-in slide-in-from-bottom-6 duration-1000">
          <h2 className="text-4xl md:text-6xl font-black text-white italic uppercase tracking-tighter leading-none mb-6">
            Zero <span className="text-cyan-accent">Compromise</span>
          </h2>
          <p className="text-zinc-500 text-sm md:text-base leading-relaxed max-w-xl font-medium italic">
            In an era of exploitative AI training, we built ResumeMaxxing on a different foundation: Pure Utility, Total Ownership.
          </p>
        </div>

        {/* THE THREE TENETS */}
        <div className="space-y-12 mb-20">
          
          <div className="p-8 bg-zinc-950 border border-zinc-900 relative group overflow-hidden animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-100">
            <div className="relative z-10 flex gap-6">
              <div className="bg-zinc-900 p-4 rounded-sm self-start">
                <LucideLock className="w-6 h-6 text-cyan-accent" />
              </div>
              <div>
                <h3 className="text-white font-black uppercase tracking-widest text-sm mb-3">No Training Data</h3>
                <p className="text-zinc-400 text-xs md:text-sm leading-relaxed">
                  We use enterprise-grade AI APIs to process your resume. Your personal data is strictly processed in transit and is <strong className="text-white">NEVER</strong> used to train public AI models. We pay for premium tokens so your career data stays yours.
                </p>
              </div>
            </div>
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
              <LucideShieldCheck className="w-20 h-20 text-zinc-500" />
            </div>
          </div>

          <div className="p-8 bg-zinc-950 border border-zinc-900 relative group overflow-hidden animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200">
            <div className="relative z-10 flex gap-6">
              <div className="bg-zinc-900 p-4 rounded-sm self-start">
                <LucideDatabase className="w-6 h-6 text-emerald-500" />
              </div>
              <div>
                <h3 className="text-white font-black uppercase tracking-widest text-sm mb-3">Encrypted Storage</h3>
                <p className="text-zinc-400 text-xs md:text-sm leading-relaxed">
                  Your data is encrypted at rest and tied exclusively to your secure authentication token. We use secure cloud infrastructure to ensure that only you—and the AI you authorize—ever see your resume details.
                </p>
              </div>
            </div>
          </div>

          <div className="p-8 bg-zinc-950 border border-zinc-900 relative group overflow-hidden animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300">
            <div className="relative z-10 flex gap-6">
              <div className="bg-zinc-900 p-4 rounded-sm self-start">
                <LucideTrash2 className="w-6 h-6 text-red-500" />
              </div>
              <div>
                <h3 className="text-white font-black uppercase tracking-widest text-sm mb-3">You Own Your Data</h3>
                <p className="text-zinc-400 text-xs md:text-sm leading-relaxed">
                  Total autonomy is our promise. Delete your account from the Settings page at any time, and your tracked jobs and resumes vanish from our servers instantly and permanently. 
                </p>
              </div>
            </div>
          </div>

        </div>

        {/* COOKIE NOTICE & SUBTEXT */}
        <div className="border-t border-zinc-900 pt-10 text-[10px] font-mono text-zinc-600 uppercase tracking-widest leading-loose">
          <p className="mb-4">SYSTEM_LOG // PRIVACY_MODULE_ACTIVE</p>
          <p>We use essential cookies to maintain your login session. No third-party tracking scripts are permitted to harvest your experience data. For legal inquiries, please contact info@resumemaxxing.com.</p>
        </div>

      </main>

      {/* FLOATING ACTION */}
      <div className="fixed bottom-10 left-1/2 -translate-x-1/2 bg-white text-black px-8 py-4 rounded-none shadow-2xl flex items-center gap-4 animate-bounce duration-[3000ms]">
         <span className="text-[10px] font-black uppercase tracking-[0.2em]">Secure Session Active</span>
         <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
      </div>

    </div>
  );
}

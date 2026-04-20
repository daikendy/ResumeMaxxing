'use client';

import React from 'react';
import { LucideChevronLeft, LucideShieldAlert, LucideScale, LucideZap, LucideCpu } from 'lucide-react';
import Link from 'next/link';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-black text-zinc-50 selection:bg-cyan-accent selection:text-black font-sans pb-40">
      
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
            <LucideScale className="w-4 h-4 text-cyan-accent" />
            <h1 className="text-sm font-black uppercase tracking-[0.2em] text-white">Legal Framework</h1>
          </div>
        </div>
      </div>

      <main className="max-w-3xl mx-auto px-6 pt-24 animate-in fade-in slide-in-from-bottom-8 duration-1000">
        
        {/* HEADER */}
        <div className="mb-16 border-l-2 border-cyan-accent pl-8">
          <h2 className="text-5xl font-black uppercase tracking-tighter text-white mb-4 italic">Terms of <span className="text-cyan-accent">Engagement</span></h2>
          <p className="text-zinc-500 text-xs font-mono uppercase tracking-[0.3em]">Revision V1.0 // Effective April 2026</p>
        </div>

        {/* CONTENT SECTIONS */}
        <div className="space-y-16">
          
          {/* 1. ACCEPTANCE */}
          <section className="space-y-4">
            <div className="flex items-center gap-3 text-white mb-6">
              <div className="p-2 bg-zinc-900 border border-zinc-800 rounded-sm">
                <LucideZap className="w-4 h-4 text-cyan-accent" />
              </div>
              <h3 className="text-lg font-black uppercase tracking-widest">01 / Acceptance</h3>
            </div>
            <p className="text-zinc-400 text-sm leading-relaxed font-mono">
              By accessing "ResumeMaxxing" (the "Platform"), you acknowledge that you have read, understood, and agreed to be bound by these Terms. If you do not agree to these terms, you are not authorized to use our AI tailoring engine.
            </p>
          </section>

          {/* 2. AI LIABILITY */}
          <section className="space-y-4">
            <div className="flex items-center gap-3 text-white mb-6">
              <div className="p-2 bg-zinc-900 border border-zinc-800 rounded-sm">
                <LucideCpu className="w-4 h-4 text-amber-500" />
              </div>
              <h3 className="text-lg font-black uppercase tracking-widest">02 / AI Deployment & Liability</h3>
            </div>
            <div className="p-6 bg-amber-500/5 border border-amber-500/20 rounded-sm">
              <p className="text-amber-500/80 text-sm leading-relaxed font-mono italic mb-4">
                "GEN-AI IS AN ASSISTANT, NOT A GUARANTOR."
              </p>
              <p className="text-zinc-400 text-sm leading-relaxed font-mono">
                The Platform uses enterprise-grade AI to assist in resume generation. AI models may produce inaccurate, biased, or unintended outputs ("Hallucinations"). <strong className="text-white">The user is solely responsible</strong> for reviewing, editing, and verifying the accuracy of all content before submitting it to employers. We are not liable for missed employment opportunities, incorrect contact info, or any damages resulting from AI-generated text.
              </p>
            </div>
          </section>

          {/* 3. FAIR USE & REFERRALS */}
          <section className="space-y-4">
            <div className="flex items-center gap-3 text-white mb-6">
              <div className="p-2 bg-zinc-900 border border-zinc-800 rounded-sm">
                <LucideShieldAlert className="w-4 h-4 text-red-500" />
              </div>
              <h3 className="text-lg font-black uppercase tracking-widest">03 / Fair Use & Termination</h3>
            </div>
            <p className="text-zinc-400 text-sm leading-relaxed font-mono">
              Accounts are for individual personal use only. We maintain a zero-tolerance policy for:
            </p>
            <ul className="space-y-3 pl-4 border-l border-zinc-800">
               <li className="text-[11px] font-mono text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                 <div className="w-1 h-1 bg-zinc-700" /> API abuse or automated script interactions
               </li>
               <li className="text-[11px] font-mono text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                 <div className="w-1 h-1 bg-zinc-700" /> Exploiting the referral system (Self-referral, Botting, Spam)
               </li>
               <li className="text-[11px] font-mono text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                 <div className="w-1 h-1 bg-zinc-700" /> Attempting to scrape or re-sell generated data
               </li>
            </ul>
            <p className="text-zinc-400 text-sm leading-relaxed font-mono pt-4">
              We reserve the right to terminate accounts and void any earned referral bonuses immediately if abuse is detected.
            </p>
          </section>

          {/* 4. INTELLECTUAL PROPERTY */}
          <section className="space-y-4">
            <div className="flex items-center gap-3 text-white mb-6">
              <div className="p-2 bg-zinc-900 border border-zinc-800 rounded-sm">
                <LucideScale className="w-4 h-4 text-zinc-400" />
              </div>
              <h3 className="text-lg font-black uppercase tracking-widest">04 / Ownership</h3>
            </div>
            <p className="text-zinc-400 text-sm leading-relaxed font-mono">
              <strong className="text-white">Your Data:</strong> You retain 100% ownership of your master profile and final PDF exports.
            </p>
            <p className="text-zinc-400 text-sm leading-relaxed font-mono">
              <strong className="text-white">Our Platform:</strong> We retain all rights to the underlying code, AI architecture, and branding of ResumeMaxxing.
            </p>
          </section>

          <div className="pt-20 border-t border-zinc-900 text-center">
             <Link href="/dashboard" className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-600 hover:text-cyan-accent transition-colors">
               RETURN_TO_SYSTEM
             </Link>
          </div>

        </div>
      </main>
    </div>
  );
}

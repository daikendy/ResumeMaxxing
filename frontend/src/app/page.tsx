'use client';

import React from 'react';
import Link from 'next/link';
import { SignInButton, SignedIn, SignedOut } from '@clerk/clerk-react';
import { Button } from '@/components/ui/button';
import { 
  LucideTerminal, 
  LucideLayoutDashboard, 
  LucideZap, 
  LucideShieldCheck, 
  LucideTarget, 
  LucideCpu,
  LucideArrowRight
} from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-black industrial-grid selection:bg-cyan-accent selection:text-black font-sans overflow-x-hidden">
      
      {/* HERO SECTION */}
      <section className="relative min-h-[90vh] flex flex-col items-center justify-center pt-24 pb-20 px-6 overflow-hidden">
        {/* Background Accents */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-cyan-accent/5 rounded-full blur-[120px] pointer-events-none" />
        
        <div className="max-w-5xl mx-auto text-center relative z-10 w-full">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/5 border border-white/10 rounded-full mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-accent opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-accent"></span>
            </span>
            <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-white/60">System Online: v1.0 Production</span>
          </div>

          <h1 className="text-5xl md:text-7xl lg:text-8xl font-heading text-white tracking-tighter uppercase leading-[0.85] mb-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
            Stop guessing.<br />
            Start <span className="text-cyan-accent cyan-glow italic">winning.</span>
          </h1>

          <p className="max-w-2xl mx-auto text-sm md:text-lg font-mono text-white/40 uppercase tracking-[0.2em] leading-relaxed mb-12 animate-in fade-in slide-in-from-bottom-12 duration-700">
            The AI Resume Architect built for engineers. engineered for results. zero jargon. total precision. 
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 w-full animate-in fade-in slide-in-from-bottom-16 duration-700">
            <SignedOut>
              <SignInButton mode="modal">
                <Button className="w-full sm:w-auto h-16 px-12 bg-cyan-accent text-black hover:bg-white uppercase font-heading font-bold tracking-[0.2em] text-sm transition-all shadow-[0_0_30px_rgba(0,240,255,0.2)]">
                  Get Started
                </Button>
              </SignInButton>
            </SignedOut>
            
            <SignedIn>
              <Link href="/dashboard" className="w-full sm:w-auto">
                <Button className="w-full h-16 px-12 bg-cyan-accent text-black hover:bg-white uppercase font-heading font-bold tracking-[0.2em] text-sm transition-all shadow-[0_0_30px_rgba(0,240,255,0.2)]">
                  Go to Console
                </Button>
              </Link>
            </SignedIn>

            <Link href="#features" className="w-full sm:w-auto group hidden md:flex items-center justify-center">
              <span className="text-[10px] uppercase font-bold tracking-[0.3em] text-white/40 hover:text-white transition-colors flex items-center gap-3">
                How it works <LucideArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
              </span>
            </Link>
          </div>
        </div>
      </section>

      {/* FEATURE GRID - HIDDEN ON MOBILE FOR NATIVE FEEL */}
      <section id="features" className="hidden md:block py-24 px-6 border-t border-white/5 relative z-10">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="p-8 bg-zinc-950/50 border border-white/5 hover:border-cyan-accent/30 transition-all group">
              <div className="w-12 h-12 bg-white/5 border border-white/10 flex items-center justify-center mb-6 group-hover:bg-cyan-accent group-hover:text-black transition-all">
                <LucideCpu className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-heading text-white uppercase tracking-widest mb-4">Master Profile</h3>
              <p className="text-xs font-mono text-white/40 uppercase leading-relaxed">
                Save everything once. Your skills, history, and impact, stored in a perfectly engineered identity vault.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="p-8 bg-zinc-950/50 border border-white/5 hover:border-cyan-accent/30 transition-all group">
              <div className="w-12 h-12 bg-white/5 border border-white/10 flex items-center justify-center mb-6 group-hover:bg-cyan-accent group-hover:text-black transition-all">
                <LucideTarget className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-heading text-white uppercase tracking-widest mb-4">Tailored Match</h3>
              <p className="text-xs font-mono text-white/40 uppercase leading-relaxed">
                Instant resume adaptation. Match the job requirement perfectly every single time without lifting a finger.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="p-8 bg-zinc-950/50 border border-white/5 hover:border-cyan-accent/30 transition-all group">
              <div className="w-12 h-12 bg-white/5 border border-white/10 flex items-center justify-center mb-6 group-hover:bg-cyan-accent group-hover:text-black transition-all">
                <LucideShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-heading text-white uppercase tracking-widest mb-4">ATS Verified</h3>
              <p className="text-xs font-mono text-white/40 uppercase leading-relaxed">
                Engineered for robots, designed for humans. We make sure you bypass the filters and land on the hiring manager's desk.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CALL TO ACTION - MOBILE NATIVE VERSION */}
      <section className="py-20 md:py-32 px-6 text-center border-t border-white/5">
        <div className="max-w-2xl mx-auto space-y-12">
          <h2 className="text-3xl md:text-5xl font-heading text-white tracking-tighter uppercase leading-[0.9]">
            Ready to <span className="text-cyan-accent">Scale?</span>
          </h2>
          <SignedOut>
            <SignInButton mode="modal">
              <Button className="w-full md:w-auto h-16 px-16 bg-white text-black hover:bg-cyan-accent uppercase font-heading font-bold tracking-[0.2em] text-sm transition-all">
                Create Account
              </Button>
            </SignInButton>
          </SignedOut>
          <SignedIn>
            <Link href="/dashboard" className="w-full md:w-auto">
              <Button className="w-full md:w-auto h-16 px-16 bg-white text-black hover:bg-cyan-accent uppercase font-heading font-bold tracking-[0.2em] text-sm transition-all">
                Return to Dashboard
              </Button>
            </Link>
          </SignedIn>
          <p className="text-[9px] font-mono text-white/20 uppercase tracking-[0.5em]">No credit card required for tier V1</p>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="py-12 px-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-8">
        <div className="flex items-center gap-4">
          <LucideTerminal className="w-6 h-6 text-cyan-accent" />
          <span className="text-[10px] font-mono text-white/20 uppercase tracking-[0.3em]">© 2026 Resumemaxxing. Engineered for impact.</span>
        </div>
        <div className="flex gap-8 text-[10px] font-mono text-white/20 uppercase tracking-widest">
          <Link href="#" className="hover:text-cyan-accent transition-colors">Privacy</Link>
          <Link href="#" className="hover:text-cyan-accent transition-colors">Terms</Link>
          <Link href="#" className="hover:text-cyan-accent transition-colors">Documentation</Link>
        </div>
      </footer>

    </div>
  );
}

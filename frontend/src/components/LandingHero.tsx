'use client';

import React from 'react';
import Link from 'next/link';
import { SignInButton, SignedIn, SignedOut } from '@clerk/clerk-react';
import { Button } from '@/components/ui/button';
import { LucideArrowRight } from 'lucide-react';

export default function LandingHero() {
  return (
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
          The AI Resume Architect engineered for <strong className="text-white">Software Engineers</strong>. Zero jargon. Total precision. <strong className="text-white">ATS-verified exports</strong> built for technical recruiters.
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

          <Link href="#features" className="w-full sm:w-auto group hidden md:flex items-center justify-center text-white/40 hover:text-white transition-colors">
            <span className="text-[10px] uppercase font-bold tracking-[0.3em] flex items-center gap-3">
              How it works <LucideArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
            </span>
          </Link>
        </div>
      </div>
    </section>
  );
}

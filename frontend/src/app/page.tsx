'use client';

import React from 'react';
import Link from 'next/link';
import { SignInButton, SignedIn, SignedOut } from '@clerk/clerk-react';
import { Button } from '@/components/ui/button';
import {
  LucideLayoutDashboard,
  LucideCheckCircle2,
  LucideBriefcase,
  LucideShieldCheck,
  LucideTarget,
  LucideCpu,
  LucideArrowRight
} from 'lucide-react';
import { SITE_CONFIG } from '@/lib/config';
import Footer from '@/components/Footer';
import MobileAppHome from '@/components/MobileAppHome';
import { Capacitor } from '@capacitor/core';
import { useRouter } from 'next/navigation';
import { useAuth } from '@clerk/clerk-react';
import LandingHero from '@/components/LandingHero';

export default function Home() {
  const [isNative, setIsNative] = React.useState(false);
  const { isSignedIn, isLoaded } = useAuth();
  const router = useRouter();

  React.useEffect(() => {
    const checkPlatform = async () => {
      const isNativePlatform = Capacitor.getPlatform() !== 'web';
      setIsNative(isNativePlatform);
      
      // Auto-redirect native users if already signed in
      if (isNativePlatform && isLoaded && isSignedIn) {
        router.replace('/dashboard');
      }
    };
    
    checkPlatform();
  }, [isLoaded, isSignedIn, router]);

  if (isNative) {
    if (isSignedIn) return null; // Wait for redirect
    return <MobileAppHome />;
  }

  return (
    <div className="min-h-screen bg-black industrial-grid selection:bg-cyan-accent selection:text-black font-sans overflow-x-hidden">

      <LandingHero />

      {/* FEATURE GRID - HIDDEN ON MOBILE FOR NATIVE FEEL */}
      <section id="features" className="hidden md:block py-24 px-6 border-t border-white/5 relative z-10">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="p-8 bg-zinc-950/50 border border-white/5 hover:border-cyan-accent/30 transition-all group">
              <div className="w-12 h-12 bg-white/5 border border-white/10 flex items-center justify-center mb-6 group-hover:bg-cyan-accent group-hover:text-black transition-all">
                <LucideCpu className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-heading text-white uppercase tracking-widest mb-4">Master Identity</h3>
              <p className="text-xs font-mono text-white/40 uppercase leading-relaxed">
                Save your tech stack once. From Kubernetes to React, store your impact and history in a perfectly indexed vault.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="p-8 bg-zinc-950/50 border border-white/5 hover:border-cyan-accent/30 transition-all group">
              <div className="w-12 h-12 bg-white/5 border border-white/10 flex items-center justify-center mb-6 group-hover:bg-cyan-accent group-hover:text-black transition-all">
                <LucideTarget className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-heading text-white uppercase tracking-widest mb-4">Tech-First Match</h3>
              <p className="text-xs font-mono text-white/40 uppercase leading-relaxed">
                Instant role adaptation. We align your experience with job descriptions using precision AI that speaks "Developer."
              </p>
            </div>

            {/* Feature 3 */}
            <div className="p-8 bg-zinc-950/50 border border-white/5 hover:border-cyan-accent/30 transition-all group">
              <div className="w-12 h-12 bg-white/5 border border-white/10 flex items-center justify-center mb-6 group-hover:bg-cyan-accent group-hover:text-black transition-all">
                <LucideShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-heading text-white uppercase tracking-widest mb-4">Parser Hardened</h3>
              <p className="text-xs font-mono text-white/40 uppercase leading-relaxed">
                Mathematically engineered single-column templates that pass Greenhouse, Workday, and Lever parsers with 100% accuracy.
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

      <Footer />

    </div>
  );
}

'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { 
  LucideDownload, 
  LucideSmartphone, 
  LucideShieldCheck, 
  LucideZap,
  LucideArrowRight,
  LucideTerminal,
  LucideGlobe,
  LucideApple,
  LucidePlay
} from 'lucide-react';
import { SITE_CONFIG } from '@/lib/config';
import { motion } from 'framer-motion';
import Footer from '@/components/Footer';

export default function DownloadPage() {
  const downloadUrl = SITE_CONFIG.mobile.downloads.android;
  const versionInfo = SITE_CONFIG.mobile.downloads.version;

  return (
    <div className="min-h-screen bg-black industrial-grid selection:bg-cyan-accent selection:text-black font-sans overflow-x-hidden">
      {/* Global HUD Overlay */}
      <div className="hud-scanline no-print" />

      {/* Navigation Header */}
      <header className="fixed top-0 left-0 w-full z-50 border-b border-white/5 bg-black/80 backdrop-blur-md px-8 py-4 flex justify-between items-center">
        <Link href="/" className="flex items-center gap-2 group cursor-pointer">
          <div className="w-8 h-8 bg-white text-black flex items-center justify-center font-heading font-black text-xl italic group-hover:bg-cyan-accent transition-colors">R</div>
          <span className="font-heading font-bold text-sm tracking-tighter text-white uppercase">{SITE_CONFIG.name} <span className="text-cyan-accent opacity-50 font-mono text-[10px]">MOBILE_UPLINK</span></span>
        </Link>
        <Link href="/dashboard" className="text-[10px] font-heading font-bold uppercase tracking-widest text-white/40 hover:text-white transition-colors">
          Return to Console
        </Link>
      </header>

      <main className="pt-32 pb-24 px-6 relative z-10">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            
            {/* Left: Content */}
            <div className="space-y-12">
              <div className="space-y-6">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-cyan-accent/10 border border-cyan-accent/20 rounded-full">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-accent opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-accent"></span>
                  </span>
                  <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-cyan-accent">Native Distribution Ready</span>
                </div>
                
                <h1 className="text-5xl md:text-7xl font-heading text-white tracking-tighter uppercase leading-[0.85]">
                  Experience <span className="text-cyan-accent italic">Peak</span><br />
                  Performance.
                </h1>
                
                <p className="max-w-md text-sm md:text-base font-mono text-white/40 uppercase tracking-[0.1em] leading-relaxed">
                  Bypass the latency of the browser. Download the native {SITE_CONFIG.name} application for lightning-fast resume generation and real-time job tracking.
                </p>
              </div>

              <div className="flex flex-col gap-4">
                <a href={downloadUrl} download>
                  <Button className="w-full md:w-auto h-20 px-12 bg-white text-black hover:bg-cyan-accent uppercase font-heading font-black tracking-[0.2em] text-lg transition-all group flex items-center justify-center gap-4 shadow-[0_0_40px_rgba(255,255,255,0.1)] hover:shadow-[0_0_40px_rgba(0,240,255,0.3)]">
                    <LucideDownload className="w-6 h-6 group-hover:animate-bounce" />
                    DOWNLOAD APK
                  </Button>
                </a>
                <div className="flex items-center gap-6 px-4">
                  <div className="flex items-center gap-2">
                    <LucideShieldCheck className="w-4 h-4 text-cyan-accent/40" />
                    <span className="text-[9px] font-mono text-white/20 uppercase">SHA-256 Verified</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <LucideZap className="w-4 h-4 text-cyan-accent/40" />
                    <span className="text-[9px] font-mono text-white/20 uppercase">V{versionInfo}</span>
                  </div>
                </div>
              </div>

              {/* Install Protocols */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-8 border-t border-white/5">
                <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-2">
                    <LucidePlay className="w-4 h-4 text-cyan-accent" />
                    <h3 className="text-[10px] font-heading font-black text-white uppercase tracking-widest">Android Protocol</h3>
                  </div>
                  <ul className="space-y-3 text-[10px] font-mono text-white/40 uppercase tracking-tighter leading-relaxed">
                    <li className="flex gap-3"><span className="text-cyan-accent">01</span> Execute APK Download</li>
                    <li className="flex gap-3"><span className="text-cyan-accent">02</span> Enable "Allow Unknown Sources"</li>
                    <li className="flex gap-3"><span className="text-cyan-accent">03</span> Deploy Application Package</li>
                  </ul>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-2">
                    <LucideApple className="w-4 h-4 text-cyan-accent" />
                    <h3 className="text-[10px] font-heading font-black text-white uppercase tracking-widest">iOS Protocol (PWA)</h3>
                  </div>
                  <ul className="space-y-3 text-[10px] font-mono text-white/40 uppercase tracking-tighter leading-relaxed">
                    <li className="flex gap-3"><span className="text-cyan-accent">01</span> Open {SITE_CONFIG.domain} in Safari</li>
                    <li className="flex gap-3"><span className="text-cyan-accent">02</span> Tap the "Share" Propulsion Icon</li>
                    <li className="flex gap-3"><span className="text-cyan-accent">03</span> Select "Add to Home Screen"</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Right: Mockup Preview */}
            <div className="relative">
              <div className="absolute inset-0 bg-cyan-accent/5 rounded-full blur-[150px]" />
              <motion.div 
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="relative z-10 perspective-1000"
              >
                <div className="relative group">
                  <div className="absolute -inset-1 bg-gradient-to-r from-cyan-accent/20 to-transparent blur opacity-25 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
                  <div className="relative bg-black rounded-3xl overflow-hidden border border-white/10 shadow-2xl skew-y-1 group-hover:skew-y-0 transition-transform duration-700">
                    <Image 
                      src="/app-mockup.png" 
                      alt="App Mockup" 
                      width={800} 
                      height={1200}
                      className="w-full h-auto opacity-90 group-hover:opacity-100 transition-opacity"
                      priority
                    />
                  </div>
                </div>
                
                {/* Floating Telemetry Blobs */}
                <motion.div 
                  animate={{ y: [0, -10, 0] }} 
                  transition={{ duration: 4, repeat: Infinity }}
                  className="absolute -top-10 -right-10 bg-black/60 backdrop-blur-xl border border-white/10 p-4 rounded-xl hidden md:block"
                >
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      <span className="text-[8px] font-mono text-white tracking-widest uppercase">Encryption_Stable</span>
                    </div>
                    <span className="text-[10px] font-mono text-cyan-accent">UPLINK_STRENGTH: 98%</span>
                  </div>
                </motion.div>
              </motion.div>
            </div>
          </div>
        </div>
      </main>

      {/* Trust Section */}
      <section className="py-24 border-t border-white/5 bg-zinc-950/30">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-12">
          {/* Item 1 */}
          <div className="space-y-4">
            <LucideZap className="w-8 h-8 text-cyan-accent" />
            <h3 className="text-xs font-heading font-black text-white uppercase tracking-[0.2em]">Extreme Velocity</h3>
            <p className="text-[10px] font-mono text-white/40 uppercase leading-relaxed">
              Proprietary local caching engine ensures zero-latency between navigation nodes. Optimized for rapid refinement cycles.
            </p>
          </div>
          {/* Item 2 */}
          <div className="space-y-4">
            <LucideShieldCheck className="w-8 h-8 text-cyan-accent" />
            <h3 className="text-xs font-heading font-black text-white uppercase tracking-[0.2em]">Walled Ecosystem</h3>
            <p className="text-[10px] font-mono text-white/40 uppercase leading-relaxed">
              Native sandbox environment prevents browser-based cross-site tracking and data harvesting. Your identity remains yours.
            </p>
          </div>
          {/* Item 3 */}
          <div className="space-y-4">
            <LucideSmartphone className="w-8 h-8 text-cyan-accent" />
            <h3 className="text-xs font-heading font-black text-white uppercase tracking-[0.2em]">Universal Parity</h3>
            <p className="text-[10px] font-mono text-white/40 uppercase leading-relaxed">
              1:1 Feature parity with the desktop console. Capture snapshots, track jobs, and optimize resumes from anywhere.
            </p>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

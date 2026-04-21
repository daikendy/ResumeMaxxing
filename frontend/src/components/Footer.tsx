'use client';

import React from 'react';
import Link from 'next/link';
import { LucideTerminal, LucideArrowRight } from 'lucide-react';
import { SITE_CONFIG } from '@/lib/config';
import { toast } from 'sonner';
import { Capacitor } from '@capacitor/core';

export default function Footer() {
  const [isNative, setIsNative] = React.useState(false);

  React.useEffect(() => {
    // Check if running on native platform (Android/iOS)
    if (Capacitor.getPlatform() !== 'web') {
      setIsNative(true);
    }
  }, []);

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Integrate with actual newsletter API (Loops, Resend, etc.)
    toast.success("SYSTEM UPDATES ARMED", {
      description: "You've been added to the early access list."
    });
    (e.target as HTMLFormElement).reset();
  };

  if (isNative) return null;

  return (
    <footer className="w-full bg-black border-t border-white/5 pt-20 pb-12 px-8 no-print">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 mb-20">

        {/* Brand & Newsletter */}
        <div className="md:col-span-2 space-y-8">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-cyan-accent flex items-center justify-center">
              <LucideTerminal className="w-5 h-5 text-black" />
            </div>
            <span className="font-heading font-bold text-sm tracking-[0.2em] uppercase text-white">
              {SITE_CONFIG.name}
            </span>
          </div>
          <p className="max-w-xs text-[11px] font-mono text-white/40 uppercase tracking-widest leading-relaxed">
            Engineered for Software Engineers. Stop guessing, start winning interviews at top tech firms.
          </p>

          <form onSubmit={handleNewsletterSubmit} className="max-w-sm">
            <label className="text-[9px] font-mono text-cyan-accent/60 uppercase tracking-tighter block mb-3">Newsletter / System Access</label>
            <div className="flex gap-2">
              <input
                type="email"
                required
                placeholder="ENGINEER@DOMAIN.COM"
                className="flex-grow bg-white/5 border border-white/10 px-4 py-2 text-[10px] font-mono text-white uppercase placeholder:text-white/20 focus:border-cyan-accent/40 outline-none transition-all"
              />
              <button
                type="submit"
                className="bg-cyan-accent text-black px-4 py-2 text-[10px] font-heading font-bold uppercase tracking-widest hover:bg-white transition-colors"
              >
                JOIN
              </button>
            </div>
          </form>
        </div>

        {/* Alternatives (Discoverability) */}
        <div className="space-y-6">
          <h4 className="text-[10px] font-heading font-bold text-white uppercase tracking-[0.3em]">System_Alternatives</h4>
          <ul className="flex flex-col gap-4 text-[10px] font-mono text-white/30 uppercase tracking-widest">
            <li>
              <Link href="/alternative/teal" className="hover:text-cyan-accent transition-colors flex items-center gap-2">
                Vs. Teal <LucideArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
              </Link>
            </li>
            <li>
              <Link href="/alternative/novoresume" className="hover:text-cyan-accent transition-colors flex items-center gap-2">
                Vs. Novoresume
              </Link>
            </li>
            <li>
              <Link href="/alternative/zety" className="hover:text-cyan-accent transition-colors flex items-center gap-2">
                Vs. Zety
              </Link>
            </li>
          </ul>
        </div>

        {/* Resources */}
        <div className="space-y-6">
          <h4 className="text-[10px] font-heading font-bold text-white uppercase tracking-[0.3em]">Resources</h4>
          <ul className="flex flex-col gap-4 text-[10px] font-mono text-white/30 uppercase tracking-widest">
            <li><Link href="/download" className="hover:text-cyan-accent transition-colors flex items-center gap-2">Mobile App <span className="text-[8px] px-1 bg-cyan-accent/10 text-cyan-accent border border-cyan-accent/20">NEW</span></Link></li>
            <li><Link href="/blog" className="hover:text-cyan-accent transition-colors">Technical Blog</Link></li>
            <li><Link href="/privacy" className="hover:text-cyan-accent transition-colors">Privacy Protocol</Link></li>
            <li><Link href="/terms" className="hover:text-cyan-accent transition-colors">Terms of Service</Link></li>
            <li><Link href={`mailto:${SITE_CONFIG.company.email}`} className="hover:text-cyan-accent transition-colors">Contact Engineering</Link></li>
          </ul>
        </div>

      </div>

      <div className="max-w-7xl mx-auto border-t border-white/5 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
        <span className="text-[9px] font-mono text-white/20 uppercase tracking-[0.4em]">
          © {new Date().getFullYear()} {SITE_CONFIG.name}. V{SITE_CONFIG.version} - ALL SYSTEMS OPERATIONAL.
        </span>
      </div>
    </footer>
  );
}

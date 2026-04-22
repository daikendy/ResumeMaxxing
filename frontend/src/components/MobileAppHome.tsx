'use client';

import React from 'react';
import Link from 'next/link';
import { SignInButton, SignedIn, SignedOut } from '@clerk/clerk-react';
import { LucideTerminal, LucideCpu, LucideShieldCheck, LucideZap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SITE_CONFIG } from '@/lib/config';
import { motion } from 'framer-motion';
import { Haptics, ImpactStyle } from '@capacitor/haptics';

export default function MobileAppHome() {
  const playHaptic = async (style = ImpactStyle.Heavy) => {
    try {
      await Haptics.impact({ style });
    } catch (e) {}
  };

  const systemId = React.useMemo(() => Math.random().toString(36).substr(2, 9).toUpperCase(), []);

  return (
    <div className="h-screen fixed inset-0 bg-black flex flex-col items-center justify-center p-8 overflow-hidden touch-none selection:none">
      {/* Background HUD Layers */}
      <div className="absolute inset-0 industrial-grid opacity-20 pointer-events-none" />
      
      {/* Dynamic Scanning Line */}
      <motion.div 
        initial={{ top: '-10%' }}
        animate={{ top: '110%' }}
        transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
        className="absolute left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-cyan-accent/50 to-transparent z-0 pointer-events-none"
      />

      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-cyan-accent/5 rounded-full blur-[100px] pointer-events-none" />
      
      {/* System Status Top */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 0.4, y: 0 }}
        transition={{ delay: 0.5 }}
        className="absolute top-safe-top pt-8 left-0 w-full px-8 flex justify-between items-center"
      >
        <div className="flex items-center gap-2">
          <motion.div 
            animate={{ opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-2 h-2 bg-cyan-accent shadow-[0_0_8px_#00f0ff]" 
          />
          <span className="text-[10px] font-mono uppercase tracking-widest text-white">Console_Active</span>
        </div>
        <span className="text-[10px] font-mono uppercase tracking-widest text-white">V{SITE_CONFIG.version}</span>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative z-10 text-center space-y-12 w-full max-w-sm"
      >
        <motion.div 
          animate={{ y: [0, -8, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className="flex justify-center mb-4"
        >
          <div className="relative group">
            <div className="absolute inset-0 bg-cyan-accent/20 blur-xl group-hover:bg-cyan-accent/40 transition-colors" />
            <div className="relative w-20 h-20 bg-cyan-accent flex items-center justify-center shadow-[0_0_40px_rgba(0,240,255,0.3)]">
              <LucideTerminal className="w-10 h-10 text-black" />
            </div>
          </div>
        </motion.div>

        <div className="space-y-4">
          <h1 className="text-4xl font-heading text-white tracking-tighter uppercase leading-none">
            System <motion.span 
              animate={{ opacity: [1, 0.7, 1] }}
              transition={{ duration: 0.1, repeat: 3, delay: 1 }}
              className="text-cyan-accent"
            >Online</motion.span>
          </h1>
          <p className="text-[11px] font-mono text-white/40 uppercase tracking-[0.2em] leading-relaxed max-w-[280px] mx-auto">
            Welcome to the ResumeMaxxing Architect Console. Environment loaded and ready for deployment.
          </p>
        </div>

        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="pt-8 flex flex-col gap-4"
        >
          <SignedIn>
             <Link href="/dashboard" className="w-full">
                <Button 
                  onClick={() => playHaptic()}
                  className="w-full h-20 bg-cyan-accent text-black hover:bg-white uppercase font-heading font-black tracking-[0.2em] text-sm transition-all shadow-lg active:scale-95"
                >
                  Enter Dashboard
                </Button>
             </Link>
          </SignedIn>

          <SignedOut>
            <SignInButton mode="modal">
              <Button 
                onClick={() => playHaptic()}
                className="w-full h-20 bg-cyan-accent text-black hover:bg-white uppercase font-heading font-black tracking-[0.2em] text-sm transition-all shadow-lg active:scale-95"
              >
                Initialize Console
              </Button>
            </SignInButton>
          </SignedOut>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.4 }}
          transition={{ delay: 1.2 }}
          className="grid grid-cols-3 gap-4 pt-12 border-t border-white/5"
        >
           <div className="flex flex-col items-center gap-2">
              <LucideCpu className="w-4 h-4 text-cyan-accent" />
              <span className="text-[7px] font-mono uppercase tracking-tighter">AI_Core</span>
           </div>
           <div className="flex flex-col items-center gap-2 border-x border-white/10">
              <LucideShieldCheck className="w-4 h-4 text-cyan-accent" />
              <span className="text-[7px] font-mono uppercase tracking-tighter">ATS_Ready</span>
           </div>
           <div className="flex flex-col items-center gap-2">
              <LucideZap className="w-4 h-4 text-cyan-accent" />
              <span className="text-[7px] font-mono uppercase tracking-tighter">Instant_Sync</span>
           </div>
        </motion.div>
      </motion.div>

      {/* System Footer Bar */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.2 }}
        transition={{ delay: 1.5 }}
        className="absolute bottom-safe-bottom pb-8 left-0 w-full px-12 flex justify-between items-center"
      >
         <span className="text-[8px] font-mono">ID: {systemId}</span>
         <div className="flex items-center gap-1">
            <div className="w-1 h-1 rounded-full bg-cyan-accent animate-ping" />
            <span className="text-[8px] font-mono uppercase">Uplink_STABLE</span>
         </div>
      </motion.div>
    </div>
  );
}

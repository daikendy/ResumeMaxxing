'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  SignedIn,
  SignedOut,
  SignInButton,
  UserButton
} from '@clerk/clerk-react';
import { LucideTerminal, LucideLayoutDashboard, LucideUser } from 'lucide-react';
import { Button } from './ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { Haptics, ImpactStyle } from '@capacitor/haptics';

export default function Navbar() {
  const pathname = usePathname();

  const playHaptic = async () => {
    try {
      await Haptics.impact({ style: ImpactStyle.Light });
    } catch (e) {
      // Ignore if not on mobile/capacitor
    }
  };

  const navLinks = [
    { href: '/master-resume', label: 'Profile', icon: LucideUser },
    { href: '/dashboard', label: 'Dashboard', icon: LucideLayoutDashboard },
  ];

  return (
    <nav className="fixed top-0 left-0 w-full z-[100] glass-panel-heavy px-4 sm:px-8 pt-[calc(0.75rem+var(--safe-area-top))] pb-3 flex justify-between items-center no-print">
      {/* Brand Section */}
      <div className="flex items-center gap-3">
        <Link 
          href="/" 
          onClick={playHaptic}
          className="flex items-center gap-3 group premium-touch"
        >
          <motion.div 
            whileHover={{ scale: 1.1, rotate: 5 }}
            whileTap={{ scale: 0.9 }}
            className="w-10 h-10 bg-cyan-accent flex items-center justify-center shadow-[0_0_20px_rgba(0,240,255,0.3)]"
          >
            <LucideTerminal className="w-6 h-6 text-black" />
          </motion.div>
          <div className="flex flex-col">
            <h1 className="text-base sm:text-lg font-heading text-white tracking-[0.2em] uppercase leading-none">
              ResumeMaxxing
            </h1>
            <span className="text-[8px] font-mono text-cyan-accent/50 tracking-widest mt-1 hidden sm:block">
              V0.2 PREMIUM ARCHITECTURE
            </span>
          </div>
        </Link>
      </div>

      {/* Logic & Navigation */}
      <div className="flex items-center gap-3 sm:gap-6">
        <SignedIn>
          <div className="flex items-center gap-2 sm:gap-6">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              const Icon = link.icon;
              
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={playHaptic}
                  className={`relative px-3 py-2 text-[10px] uppercase tracking-[0.15em] font-bold transition-colors flex items-center gap-2 premium-touch ${
                    isActive ? 'text-cyan-accent' : 'text-white/40 hover:text-white'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="hidden md:inline">{link.label}</span>
                  
                  {isActive && (
                    <motion.div
                      layoutId="nav-active"
                      className="absolute -bottom-1 left-0 w-full h-[2px] bg-cyan-accent shadow-[0_2px_10px_rgba(0,240,255,0.5)]"
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    />
                  )}
                </Link>
              );
            })}
          </div>

          <div className="pl-4 border-l border-white/10 flex items-center">
            <UserButton
              appearance={{
                elements: {
                  userButtonAvatarBox: "w-9 h-9 border border-cyan-accent/20 hover:border-cyan-accent transition-colors shadow-lg",
                }
              }}
            />
          </div>
        </SignedIn>

        <SignedOut>
          <SignInButton mode="modal">
            <Button 
              onClick={playHaptic}
              className="bg-cyan-accent text-black hover:bg-white border-none text-[10px] font-bold tracking-[0.2em] h-10 px-8 transition-all shadow-[0_0_20px_rgba(0,240,255,0.2)] hover:shadow-white/20 premium-touch"
            >
              INITIALIZE
            </Button>
          </SignInButton>
        </SignedOut>
      </div>
    </nav>
  );
}


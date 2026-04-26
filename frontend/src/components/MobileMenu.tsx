'use client';

import React from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LucideX, 
  LucideUser, 
  LucideLayoutDashboard, 
  LucideShield, 
  LucideFileText,
  LucideSettings
} from 'lucide-react';
import { SITE_CONFIG } from '@/lib/config';
import ThemeToggle from './ThemeToggle';

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  playHaptic: () => void;
}

export default function MobileMenu({ isOpen, onClose, playHaptic }: MobileMenuProps) {
  const links = [
    { href: '/master-resume', label: 'Profile', icon: LucideUser },
    { href: '/dashboard', label: 'Dashboard', icon: LucideLayoutDashboard },
    { href: '/settings', label: 'Settings', icon: LucideSettings },
    { href: '/terms', label: 'Terms of Service', icon: LucideFileText },
    { href: '/privacy', label: 'Privacy Protocol', icon: LucideShield },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-md z-[200]"
          />

          {/* Menu Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 h-full w-[80%] max-w-sm bg-background border-l border-white/10 z-[201] p-8 flex flex-col"
          >
            <div className="flex justify-between items-center mb-12">
              <span className="text-[10px] font-mono text-accent-primary tracking-[0.3em] uppercase">Navigation_Root</span>
              <button 
                onClick={() => { playHaptic(); onClose(); }}
                className="w-10 h-10 flex items-center justify-center bg-white/5 border border-white/10 rounded-full"
              >
                <LucideX className="w-5 h-5 text-white" />
              </button>
            </div>

            <div className="flex flex-col gap-2">
              {links.map((link, i) => {
                const Icon = link.icon;
                return (
                  <motion.div
                    key={link.href}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <Link
                      href={link.href}
                      onClick={() => { playHaptic(); onClose(); }}
                      className="flex items-center gap-4 p-4 hover:bg-white/5 border border-transparent hover:border-white/10 transition-all group rounded-xl"
                    >
                      <div className="w-10 h-10 bg-white/5 flex items-center justify-center group-hover:bg-accent-primary group-hover:text-black transition-colors rounded-lg">
                        <Icon className="w-5 h-5" />
                      </div>
                      <span className="text-xs font-heading font-bold uppercase tracking-widest text-white/60 group-hover:text-white">
                        {link.label}
                      </span>
                    </Link>
                  </motion.div>
                );
              })}
            </div>

            <div className="mt-auto space-y-6">
              <div className="pt-6 border-t border-white/5">
                <span className="text-[9px] font-mono text-white/20 uppercase tracking-widest block mb-4">Appearance_Profile</span>
                <ThemeToggle />
              </div>

              <div className="p-6 bg-accent-primary/5 border border-accent-primary/10 rounded-xl">
                <span className="text-[9px] font-mono text-accent-primary/40 uppercase tracking-tighter block mb-1">Authenticated Environment</span>
                <span className="text-[10px] font-heading font-bold text-white uppercase">{SITE_CONFIG.name} v{SITE_CONFIG.version}</span>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

'use client';

import React from 'react';
import Link from 'next/link';
import { 
  SignedIn,
  SignedOut, 
  SignInButton, 
  UserButton 
} from '@clerk/clerk-react';
import { LucideTerminal, LucideLayoutDashboard } from 'lucide-react';
import { Button } from './ui/button';

export default function Navbar() {
  return (
    <nav className="fixed top-0 left-0 w-full z-[100] bg-black/80 backdrop-blur-md border-b border-white/10 px-6 py-3 flex justify-between items-center no-print">
      <div className="flex items-center gap-3">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-8 h-8 bg-cyan-accent flex items-center justify-center shadow-[0_0_15px_rgba(0,240,255,0.4)] transition-transform group-hover:scale-110">
            <LucideTerminal className="w-5 h-5 text-black" />
          </div>
          <h1 className="text-lg font-heading text-white tracking-widest uppercase cyan-glow hidden sm:block">
            ResumeMaxxing
          </h1>
        </Link>
      </div>

      <div className="flex items-center gap-6">
        <SignedIn>
          <Link 
            href="/dashboard" 
            className="text-[10px] uppercase tracking-[0.2em] font-bold text-white/60 hover:text-cyan-accent transition-colors flex items-center gap-2"
          >
            <LucideLayoutDashboard className="w-4 h-4" />
            <span className="hidden sm:inline">Console</span>
          </Link>
          
          <div className="pl-4 border-l border-white/10 h-6 flex items-center">
            <UserButton 
              appearance={{
                elements: {
                  userButtonAvatarBox: "w-8 h-8 rounded-none border border-cyan-accent/20",
                }
              }}
            />
          </div>
        </SignedIn>

        <SignedOut>
          <SignInButton mode="modal">
            <Button className="bg-white/5 hover:bg-cyan-accent hover:text-black border border-white/10 text-white uppercase text-[10px] font-bold tracking-widest h-9 px-6 transition-all">
              Initialize Session
            </Button>
          </SignInButton>
        </SignedOut>
      </div>
    </nav>
  );
}

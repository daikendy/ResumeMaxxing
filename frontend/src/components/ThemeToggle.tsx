'use client';

import React, { useEffect, useState } from 'react';
import { useTheme } from 'next-themes';
import { LucideSun, LucideMoon, LucideCpu, LucideZap } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="flex items-center gap-2 p-1 bg-white/5 border border-white/10 rounded-full backdrop-blur-md no-print">
      <button
        onClick={() => setTheme('vanta')}
        className={`px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all flex items-center gap-2 ${
          theme === 'vanta' 
            ? 'bg-accent-primary text-white shadow-accent' 
            : 'text-white/40 hover:text-white'
        }`}
      >
        <LucideZap className="w-3 h-3" />
        Vanta
      </button>
      
      <button
        onClick={() => setTheme('industrial')}
        className={`px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all flex items-center gap-2 ${
          theme === 'industrial' 
            ? 'bg-accent-primary text-black shadow-accent' 
            : 'text-white/40 hover:text-white'
        }`}
      >
        <LucideCpu className="w-3 h-3" />
        Industrial
      </button>
    </div>
  );
}

'use client';

import { useAuth, ClerkLoading } from '@clerk/clerk-react';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';
import { LucideCircleDashed } from 'lucide-react';

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { isLoaded, userId } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (isLoaded && !userId) {
      // Not logged in, send to landing
      router.push('/');
    }
  }, [isLoaded, userId, router]);

  if (!isLoaded || !userId) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center space-y-6">
        <div className="relative">
          <div className="w-16 h-16 border-t-2 border-cyan-accent rounded-full animate-spin"></div>
          <LucideCircleDashed className="absolute inset-0 m-auto w-6 h-6 text-cyan-accent animate-pulse" />
        </div>
        <div className="text-center space-y-2">
            <h2 className="text-sm uppercase tracking-[0.3em] font-bold text-white/40">Secure Session</h2>
            <p className="text-[10px] uppercase tracking-widest text-zinc-500 font-mono animate-pulse">Initializing encrypted tunnel...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

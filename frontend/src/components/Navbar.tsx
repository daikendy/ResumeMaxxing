import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  SignedIn,
  SignedOut,
  SignInButton,
  UserButton,
  useUser
} from '@clerk/clerk-react';
import { LucideTerminal, LucideLayoutDashboard, LucideUser, LucideMenu } from 'lucide-react';
import { Button } from './ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { SITE_CONFIG } from '@/lib/config';
import MobileMenu from './MobileMenu';
import ThemeToggle from './ThemeToggle';

export default function Navbar() {
  const pathname = usePathname();
  const { user } = useUser();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const displayName = user?.fullName || "ANONYMOUS_OPERATOR";

  const playHaptic = async (style = ImpactStyle.Light) => {
    try {
      await Haptics.impact({ style });
    } catch (e) {
      // Ignore if not on mobile/capacitor
    }
  };

  const navLinks = [
    { href: '/master-resume', label: 'Profile', icon: LucideUser },
    { href: '/dashboard', label: 'Dashboard', icon: LucideLayoutDashboard },
  ];

  return (
    <>
      <nav className="fixed top-0 left-0 w-full z-[100] backdrop-blur-md bg-background/60 px-4 sm:px-8 pt-safe-top pb-safe-top flex justify-between items-center no-print border-b border-white/5 min-h-[60px] sm:min-h-[85px]">
        {/* Mobile: Hamburger (LEFT) | Desktop: Logo (LEFT) */}
        <div className="flex items-center gap-3 w-1/3 sm:w-auto">
          {/* Mobile Hamburger Toggle (Left on Mobile) */}
          <button 
            onClick={() => { playHaptic(ImpactStyle.Medium); setIsMenuOpen(true); }}
            className="sm:hidden w-10 h-10 flex items-center justify-center bg-white/5 border border-white/10 rounded-sm premium-touch"
          >
            <LucideMenu className="w-5 h-5 text-white" />
          </button>

          {/* Desktop Logo & Name */}
          <Link 
            href="/" 
            onClick={() => playHaptic()}
            className="hidden sm:flex items-center gap-3 group premium-touch"
          >
            <motion.div 
              whileHover={{ scale: 1.1, rotate: 5 }}
              whileTap={{ scale: 0.9 }}
              className="w-10 h-10 flex items-center justify-center"
            >
              <img src="/logo_premium.png" alt="Resumaxxing Logo" className="w-full h-full object-contain" />
            </motion.div>
            <div className="flex flex-col">
              <h1 className="text-lg font-heading text-white tracking-[0.2em] uppercase leading-none">
                {SITE_CONFIG.name}
              </h1>
              <span className="text-[8px] font-mono text-accent-primary/50 tracking-widest mt-1">
                V{SITE_CONFIG.version} PREMIUM ARCHITECTURE
              </span>
            </div>
          </Link>
        </div>

        {/* Mobile: Logo (CENTER) | Desktop: Navigation */}
        <div className="flex justify-center items-center w-1/3 sm:w-auto">
          {/* Mobile Logo Only (Centered) */}
          <Link 
            href="/" 
            onClick={() => playHaptic()}
            className="sm:hidden flex items-center justify-center premium-touch"
          >
            <motion.div 
              whileTap={{ scale: 0.9 }}
              className="w-10 h-10 flex items-center justify-center"
            >
              <img src="/logo_premium.png" alt="ResumeMaxxing Logo" className="w-full h-full object-contain" />
            </motion.div>
          </Link>

          {/* Desktop Nav Links */}
          <SignedIn>
            <div className="hidden sm:flex items-center gap-2 sm:gap-6">
              {navLinks.map((link) => {
                const isActive = pathname === link.href;
                const Icon = link.icon;
                
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => playHaptic()}
                    className={`relative px-3 py-2 text-[10px] uppercase tracking-[0.15em] font-bold transition-colors flex items-center gap-2 premium-touch ${
                      isActive ? 'text-accent-primary' : 'text-white/40 hover:text-white'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="hidden md:inline">{link.label}</span>
                    
                    {isActive && (
                      <motion.div
                        layoutId="nav-active"
                        className="absolute -bottom-1 left-0 w-full h-[2px] bg-accent-primary shadow-accent"
                        transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                      />
                    )}
                  </Link>
                );
              })}
            </div>
          </SignedIn>
        </div>

        {/* Profile/Controls (RIGHT) */}
        <div className="flex items-center justify-end gap-3 sm:gap-6 w-1/3 sm:w-auto">
          <div className="hidden lg:block">
            <ThemeToggle />
          </div>

          <SignedIn>
            <div className="flex items-center gap-4">
              <div className="hidden md:flex flex-col items-end mr-2">
                <span className="text-[8px] font-mono text-accent-primary uppercase tracking-tighter">System Status</span>
                <span className="text-[10px] font-heading text-white tracking-widest uppercase truncate max-w-[150px]">
                  {displayName}
                </span>
              </div>
              <UserButton
                appearance={{
                  elements: {
                    userButtonAvatarBox: "w-9 h-9 border border-accent-primary/20 hover:border-accent-primary transition-colors shadow-lg",
                  }
                }}
              />
            </div>
          </SignedIn>

          <SignedOut>
            <SignInButton mode="modal">
              <Button 
                onClick={() => playHaptic()}
                className="bg-accent-primary text-white hover:bg-white hover:text-black border-none text-[10px] font-bold tracking-[0.2em] h-10 px-6 sm:px-8 transition-all shadow-accent premium-touch"
              >
                INITIALIZE
              </Button>
            </SignInButton>
          </SignedOut>
        </div>
      </nav>

      <MobileMenu 
        isOpen={isMenuOpen} 
        onClose={() => setIsMenuOpen(false)} 
        playHaptic={() => playHaptic(ImpactStyle.Light)} 
      />
    </>
  );
}


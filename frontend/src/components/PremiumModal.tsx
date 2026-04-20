import React from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { LucideZap, LucideCheckCircle2, LucideLayers3, LucideCpu } from 'lucide-react';
import { Button } from './ui/button';

interface PremiumModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  errorCode?: string;
}

export const PremiumModal: React.FC<PremiumModalProps> = ({
  isOpen,
  onClose,
  title = "Update your plan",
  description = "You've reached the limit for your current plan. Upgrade to a Pro account to unlock more features and unlimited resume tailoring.",
  errorCode
}) => {

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent className="bg-zinc-950 border border-zinc-900 text-white p-0 overflow-hidden w-[92vw] sm:max-w-lg md:max-w-xl lg:max-w-2xl shadow-2xl rounded-xl max-h-[92vh] flex flex-col selection:bg-cyan-accent selection:text-black">
        <div className="h-20 md:h-28 bg-zinc-900 relative flex-shrink-0 flex items-center justify-center overflow-hidden border-b border-zinc-900">
           <div className="absolute inset-0 bg-gradient-to-b from-cyan-accent/10 to-transparent" />
           <div className="relative z-10 p-3 bg-zinc-950 border border-cyan-accent/20 rounded-full shadow-[0_0_20px_rgba(0,240,255,0.1)]">
              <LucideZap className="w-6 h-6 text-cyan-accent" />
           </div>
        </div>

        <div className="p-5 md:p-8 space-y-6 overflow-y-auto custom-scrollbar flex-grow bg-black/20">
          <AlertDialogHeader className="space-y-4 flex flex-col items-center">
            <div className="space-y-1 text-center flex flex-col items-center w-full">
                <AlertDialogTitle className="text-xl md:text-3xl font-bold tracking-tight leading-tight break-words text-center">
                {title}
                </AlertDialogTitle>
                {errorCode && (
                    <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest text-center">
                        Error ID: {errorCode}
                    </p>
                )}
            </div>
            
            <div className="bg-zinc-900/50 border border-zinc-800 p-4 md:p-5 relative rounded-lg">
                <AlertDialogDescription className="text-zinc-300 text-center text-sm md:text-base leading-relaxed">
                  {description}
                </AlertDialogDescription>
            </div>
          </AlertDialogHeader>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="flex items-center gap-4 p-4 bg-zinc-900/30 border border-zinc-800/50 rounded-lg hover:border-cyan-accent/30 transition-all group">
                <div className="shrink-0 p-2 bg-zinc-800 rounded-md group-hover:bg-cyan-accent/10 transition-colors">
                    <LucideCheckCircle2 className="w-5 h-5 text-cyan-accent" />
                </div>
                <div className="space-y-0.5">
                    <p className="text-xs font-bold text-white">Unlimited Access</p>
                    <p className="text-[10px] text-zinc-500 leading-tight">No limits on resume creation.</p>
                </div>
            </div>
            <div className="flex items-center gap-4 p-4 bg-zinc-900/30 border border-zinc-800/50 rounded-lg hover:border-cyan-accent/30 transition-all group">
                <div className="shrink-0 p-2 bg-zinc-800 rounded-md group-hover:bg-cyan-accent/10 transition-colors">
                    <LucideLayers3 className="w-5 h-5 text-cyan-accent" />
                </div>
                <div className="space-y-0.5">
                    <p className="text-xs font-bold text-white">Save Your Progress</p>
                    <p className="text-[10px] text-zinc-500 leading-tight">Your history is kept forever.</p>
                </div>
            </div>
          </div>
        </div>

        <AlertDialogFooter className="p-5 md:p-8 bg-zinc-950 border-t border-zinc-900 flex flex-col sm:flex-row gap-3 flex-shrink-0">
          <AlertDialogCancel className="bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg h-12 text-sm transition-all sm:w-1/3">
            Not now
          </AlertDialogCancel>
          <AlertDialogAction 
            className="bg-cyan-accent hover:opacity-90 text-black font-bold text-sm h-12 rounded-lg px-8 transition-all shadow-lg shadow-cyan-accent/20 sm:flex-grow border-none"
          >
            Upgrade Now
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

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
                <AlertDialogTitle className="text-xl md:text-3xl font-black italic uppercase tracking-tighter text-white">
                  {title === "Update your plan" ? "QUOTA_EXCEEDED" : title}
                </AlertDialogTitle>
                {errorCode && (
                    <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest text-center">
                        LOG_ID: {errorCode}
                    </p>
                )}
            </div>
            
            <div className="bg-zinc-900/50 border border-zinc-800 p-4 md:p-5 relative rounded-none">
                <AlertDialogDescription className="text-zinc-400 text-center text-[11px] md:text-xs font-mono uppercase tracking-widest leading-relaxed">
                  {description.includes("reached the limit") 
                    ? "Maximum generation capacity reached for this cycle. Re-initiate systems by upgrading or unlocking bonus resources."
                    : description}
                </AlertDialogDescription>
            </div>
          </AlertDialogHeader>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pb-4">
            <div className="flex items-center gap-4 p-4 bg-zinc-900/10 border border-emerald-500/10 rounded-none hover:border-emerald-500/30 transition-all group">
                <div className="shrink-0 p-2 bg-emerald-500/5 rounded-none group-hover:bg-emerald-500/10 transition-colors">
                    <LucideZap className="w-5 h-5 text-emerald-500" />
                </div>
                <div className="space-y-0.5">
                    <p className="text-[10px] font-black text-white uppercase tracking-widest">Refer & Earn</p>
                    <p className="text-[9px] text-zinc-600 uppercase font-mono">+5 Slots Per Invite</p>
                </div>
            </div>
            <div className="flex items-center gap-4 p-4 bg-cyan-accent/5 border border-cyan-accent/10 rounded-none hover:border-cyan-accent/30 transition-all group">
                <div className="shrink-0 p-2 bg-cyan-accent/5 rounded-none group-hover:bg-cyan-accent/10 transition-colors">
                    <LucideCpu className="w-5 h-5 text-cyan-accent" />
                </div>
                <div className="space-y-0.5">
                    <p className="text-[10px] font-black text-white uppercase tracking-widest">Unlock Pro</p>
                    <p className="text-[9px] text-zinc-600 uppercase font-mono">Infinite Generations</p>
                </div>
            </div>
          </div>
        </div>

        <AlertDialogFooter className="p-5 md:p-8 bg-zinc-950 border-t border-zinc-900 flex flex-col sm:flex-row gap-4 flex-shrink-0">
          <AlertDialogCancel className="bg-transparent border-zinc-800 text-zinc-500 hover:text-white hover:bg-zinc-900 rounded-none h-14 text-[10px] uppercase font-black tracking-widest transition-all sm:flex-grow">
            Return_To_Dashboard
          </AlertDialogCancel>
          <AlertDialogAction 
            className="bg-white hover:bg-cyan-accent text-black font-black text-[10px] uppercase tracking-[0.2em] h-14 rounded-none px-12 transition-all shadow-[0_0_30px_rgba(34,211,238,0.1)] sm:flex-grow border-none"
          >
            Upgrade_Account
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

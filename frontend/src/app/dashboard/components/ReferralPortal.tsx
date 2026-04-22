import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { LucideCopy, LucideExternalLink, LucideTerminal } from 'lucide-react';
import { toast } from 'sonner';

interface ReferralPortalProps {
  referralCode: string;
  referralInput: string;
  isRedeeming: boolean;
  onRedeem: () => void;
  onInputChange: (val: string) => void;
  playHaptic: () => void;
  hasRedeemed: boolean;
}

const ReferralPortal = React.memo(({
  referralCode,
  referralInput,
  isRedeeming,
  onRedeem,
  onInputChange,
  playHaptic,
  hasRedeemed
}: ReferralPortalProps) => {

  const copyRefCode = () => {
    navigator.clipboard.writeText(referralCode || '');
    toast.success("CODE_COPIED", { description: "Your protocol ID is ready for transmission." });
    playHaptic();
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
      {/* Referral Card */}
      <Card className="bg-black/40 border-white/10 rounded-none h-[220px] shadow-2xl relative overflow-hidden flex flex-col">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyan-accent/20 to-transparent" />
        <div className="px-8 pt-8 pb-4 border-b border-white/5 flex justify-between items-center bg-zinc-900/40">
          <div className="flex items-center gap-3">
            <LucideExternalLink className="w-4 h-4 text-cyan-accent opacity-50" />
            <h3 className="text-[10px] font-heading text-white tracking-[0.2em] uppercase">Referral Protocol</h3>
          </div>
          <span className="text-[8px] font-mono text-cyan-accent/40 tracking-tighter">ID: UNIQUE_SYS_REF</span>
        </div>
        <CardContent className="flex-grow p-8 flex flex-col justify-center gap-6">
          <div className="flex flex-col gap-2">
            <span className="text-[9px] font-mono text-white/20 uppercase tracking-widest mb-1 font-bold">Transmission Code:</span>
            <div className="flex gap-2">
              <div className="flex-grow bg-white/5 border border-white/10 px-4 py-3 font-mono text-lg tracking-[0.5em] text-cyan-accent flex items-center justify-center">
                {referralCode || '------'}
              </div>
              <button 
                onClick={copyRefCode}
                className="bg-white/5 border border-white/10 px-4 hover:bg-cyan-accent hover:text-black hover:border-cyan-accent transition-all duration-300"
              >
                <LucideCopy className="w-4 h-4" />
              </button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Activation Card */}
      <Card className="bg-black/40 border-white/10 rounded-none h-[220px] shadow-2xl relative overflow-hidden flex flex-col">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        <div className="px-8 pt-8 pb-4 border-b border-white/5 flex justify-between items-center bg-zinc-900/40">
          <div className="flex items-center gap-3">
            <LucideTerminal className="w-4 h-4 text-white opacity-50" />
            <h3 className="text-[10px] font-heading text-white tracking-[0.2em] uppercase">Activation Card</h3>
          </div>
          <span className={`text-[8px] font-mono tracking-tighter ${hasRedeemed ? 'text-emerald-500' : 'text-white/40'}`}>
            STATUS: {hasRedeemed ? 'PROTOCOL_ACTIVATED' : 'ARMED'}
          </span>
        </div>
        <CardContent className="flex-grow p-8 flex flex-col justify-center gap-6">
          <div className="flex flex-col gap-2">
            <span className="text-[9px] font-mono text-white/20 uppercase tracking-widest mb-1 font-bold">
              {hasRedeemed ? 'Protocol Link Established:' : 'Enter Referral ID:'}
            </span>
            <div className="flex gap-2 h-14">
              <Input 
                value={hasRedeemed ? 'SUCCESS' : referralInput}
                onChange={(e) => onInputChange(e.target.value)}
                disabled={hasRedeemed}
                maxLength={6}
                placeholder="000000"
                className={`bg-white/5 border-white/10 rounded-none h-full font-mono text-lg tracking-[0.5em] text-center focus:border-cyan-accent focus:ring-0 uppercase placeholder:text-white/5 placeholder:tracking-normal ${hasRedeemed ? 'text-emerald-500 border-emerald-500/20' : 'text-cyan-accent'}`}
              />
              <button 
                onClick={onRedeem}
                disabled={isRedeeming || referralInput.length !== 6 || hasRedeemed}
                className={`px-6 h-full font-heading text-[10px] tracking-widest transition-all uppercase ${
                  hasRedeemed 
                  ? 'bg-emerald-500/20 text-emerald-500 border border-emerald-500/50 cursor-not-allowed' 
                  : 'bg-cyan-accent text-black hover:bg-white disabled:opacity-30 disabled:hover:bg-cyan-accent disabled:cursor-not-allowed'
                }`}
              >
                {hasRedeemed ? 'ACTIVATED' : isRedeeming ? 'Validating' : 'Redeem'}
              </button>
            </div>
            {hasRedeemed && (
              <p className="text-[8px] font-mono text-emerald-500/60 uppercase tracking-tighter mt-1">
                BONUS_QUOTA_SYNCED: +5 Node capacity enabled.
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
});

ReferralPortal.displayName = 'ReferralPortal';

export default ReferralPortal;

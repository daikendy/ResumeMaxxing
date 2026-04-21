'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { resumeService } from '@/lib/api/services/resumeService';
import { motion, AnimatePresence } from 'framer-motion';
import { LucideShieldCheck, LucideDatabase, LucideRotateCcw, LucidePlus, LucideLoader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface Snapshot {
  id: number;
  name: string;
  created_at: string;
}

export default function VaultManager() {
  const { getToken } = useAuth();
  const [snapshots, setSnapshots] = useState<Snapshot[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCapturing, setIsCapturing] = useState(false);
  const [restoringId, setRestoringId] = useState<number | null>(null);

  useEffect(() => {
    fetchSnapshots();
  }, [getToken]);

  const fetchSnapshots = async () => {
    try {
      const token = await getToken();
      if (!token) return;
      const data = await resumeService.getVaultSnapshots(token);
      setSnapshots(data);
    } catch (e) {
      console.error("VAULT_INDEX_ERROR", e);
    } finally {
      setLoading(false);
    }
  };

  const handleCapture = async () => {
    setIsCapturing(true);
    try {
      const token = await getToken();
      if (!token) return;
      const newSnapshot = await resumeService.createVaultSnapshot(token);
      setSnapshots(prev => [newSnapshot, ...prev]);
      toast.success("SNAPSHOT_STORED", { description: newSnapshot.name });
    } catch (e) {
      toast.error("VAULT_SYNC_FAILED");
    } finally {
      setIsCapturing(false);
    }
  };

  const handleRestore = async (id: number, name: string) => {
    setRestoringId(id);
    try {
      const token = await getToken();
      if (!token) return;
      await resumeService.restoreVaultSnapshot(id, token);
      toast.success("PROFILE_RECONSTRUCTED", { description: `Active Master set to: ${name}` });
      // In a real app, we might want to refresh the Master Resume view here
    } catch (e) {
      toast.error("RESTORE_FAILED");
    } finally {
      setRestoringId(null);
    }
  };

  return (
    <div className="hud-border bg-cyan-accent/5 p-6 space-y-6 flex flex-col group relative">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-cyan-accent/20 flex items-center justify-center">
            <LucideShieldCheck className="w-5 h-5 text-cyan-accent" />
          </div>
          <div className="flex flex-col">
            <h3 className="text-xs font-heading font-black tracking-[0.3em] uppercase text-white">The_Vault</h3>
            <span className="text-[8px] font-mono text-cyan-accent/60 uppercase">Snapshot Persistence Active</span>
          </div>
        </div>
        <Button 
          onClick={handleCapture}
          disabled={isCapturing}
          className="h-10 px-4 bg-cyan-accent text-black hover:bg-white text-[10px] font-heading font-bold tracking-widest transition-all active:scale-95 group/btn"
        >
          {isCapturing ? <LucideLoader2 className="w-4 h-4 animate-spin" /> : <LucidePlus className="w-4 h-4 mr-2" />}
          SNAPSHOT_NOW
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto max-h-[350px] custom-scrollbar space-y-2 pr-2">
        {loading ? (
           <div className="py-12 flex flex-col items-center justify-center opacity-20">
              <LucideDatabase className="w-8 h-8 animate-pulse mb-2" />
              <span className="text-[10px] font-mono tracking-widest">QUERYING_VAULT...</span>
           </div>
        ) : snapshots.length === 0 ? (
           <div className="py-12 border border-dashed border-white/5 flex flex-col items-center justify-center text-center">
              <span className="text-[9px] font-mono text-white/20 uppercase tracking-widest leading-relaxed px-4">
                No secure snapshots found. Click SNAPSHOT_NOW to preserve your current master profile.
              </span>
           </div>
        ) : (
          <AnimatePresence>
            {snapshots.map((s) => (
              <motion.div
                key={s.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 bg-white/5 border border-white/5 hover:border-cyan-accent/30 transition-all flex justify-between items-center group/item"
              >
                <div className="flex flex-col gap-1">
                  <span className="text-[11px] font-mono text-white font-bold tracking-tight uppercase group-hover/item:text-cyan-accent transition-colors">
                    {s.name}
                  </span>
                  <span className="text-[8px] font-mono text-white/30 uppercase">
                    ID: {s.id} | CREATED: {new Date(s.created_at).toLocaleDateString()}
                  </span>
                </div>
                <Button 
                  onClick={() => handleRestore(s.id, s.name)}
                  disabled={restoringId !== null}
                  variant="ghost"
                  className="h-8 w-8 p-0 hover:bg-cyan-accent hover:text-black transition-all"
                >
                  {restoringId === s.id ? <LucideLoader2 className="w-3 h-3 animate-spin" /> : <LucideRotateCcw className="w-4 h-4" />}
                </Button>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>

      <div className="pt-4 border-t border-white/5 flex flex-col gap-2 opacity-30">
          <div className="flex justify-between items-center text-[7px] font-mono uppercase tracking-widest">
            <span>Redundancy: STATUS_OK</span>
            <span>{snapshots.length}/50 Slots Filled</span>
          </div>
          <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
             <motion.div 
               initial={{ width: 0 }}
               animate={{ width: `${(snapshots.length / 50) * 100}%` }}
               className="h-full bg-cyan-accent" 
             />
          </div>
      </div>
    </div>
  );
}

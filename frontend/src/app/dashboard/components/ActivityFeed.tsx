'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { resumeService } from '@/lib/api/services/resumeService';
import { motion, AnimatePresence } from 'framer-motion';
import { LucideTerminal, LucideActivity } from 'lucide-react';

interface Activity {
  id: number;
  action_code: string;
  description: string;
  timestamp: string;
}

export default function ActivityFeed() {
  const { getToken } = useAuth();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchActivity = async () => {
      try {
        const token = await getToken();
        if (!token) return;
        const data = await resumeService.getActivityTelemetry(token);
        setActivities(data);
      } catch (e) {
        console.error("TELEMETRY_FAILURE", e);
      } finally {
        setLoading(false);
      }
    };

    fetchActivity();
    const interval = setInterval(fetchActivity, 15000); // 15s refresh for 'Live' feel
    return () => clearInterval(interval);
  }, [getToken]);

  return (
    <div className="hud-border bg-black/60 p-6 space-y-4 min-h-[300px] flex flex-col group">
      <div className="flex justify-between items-center border-b border-white/5 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-cyan-accent/10 flex items-center justify-center">
            <LucideActivity className="w-4 h-4 text-cyan-accent animate-pulse" />
          </div>
          <h3 className="text-xs font-heading font-black tracking-[0.3em] uppercase text-white">System_Telemetry</h3>
        </div>
        <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[9px] font-mono text-emerald-500/60 uppercase">Uplink_Encrypted</span>
        </div>
      </div>

      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto custom-scrollbar space-y-3 pr-2"
      >
        {loading && activities.length === 0 ? (
           <div className="flex items-center gap-2 opacity-20 py-4">
              <LucideTerminal className="w-4 h-4 animate-blink-fast" />
              <span className="text-[10px] font-mono">INITIALIZING_FEED...</span>
           </div>
        ) : activities.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 opacity-10">
              <LucideTerminal className="w-8 h-8 mb-4" />
              <span className="text-[10px] font-mono">NO_DATA_LOGGED_YET</span>
          </div>
        ) : (
          <AnimatePresence initial={false}>
            {activities.map((log, idx) => (
              <motion.div
                key={log.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="flex gap-4 items-start py-2 border-b border-white/[0.02] last:border-0"
              >
                <span className="text-[10px] font-mono text-cyan-accent/30 whitespace-nowrap pt-0.5">
                  [{new Date(log.timestamp).toLocaleTimeString([], { hour12: false })}]
                </span>
                <div className="flex flex-col">
                  <span className="text-[9px] font-mono font-bold text-white/40 mb-1">
                    ${log.action_code}
                  </span>
                  <p className="text-[11px] font-mono text-white/70 leading-relaxed uppercase tracking-tight">
                    {log.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>

      <div className="border-t border-white/5 pt-4 flex justify-between items-center opacity-30">
          <span className="text-[8px] font-mono uppercase tracking-[0.2em]">Log_Buffer: ACTIVE</span>
          <span className="text-[8px] font-mono">{activities.length} TELEMETRY_NODES</span>
      </div>
    </div>
  );
}

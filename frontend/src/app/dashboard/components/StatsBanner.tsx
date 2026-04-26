import React from 'react';
import { motion } from 'framer-motion';
import { LucideBarChart3 } from 'lucide-react';

interface Stats {
  total: number;
  applied: number;
  interviewing: number;
  hired: number;
  rejected: number;
  bookmarked: number;
}

interface StatsBannerProps {
  stats: Stats;
}

const StatsBanner = React.memo(({ stats }: StatsBannerProps) => {
  const items = [
    { label: 'Total_Scanned', count: stats.total, code: '001' },
    { label: 'Interviewing', count: stats.interviewing, code: '002' },
    { label: 'Current_Hired', count: stats.hired, code: '003' },
    { label: 'Archived_Def', count: stats.rejected, code: '004' }
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
      {items.map((stat, idx) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: idx * 0.1 }}
          className="glass-panel p-6 flex flex-col items-center justify-center text-center group relative rounded-2xl overflow-hidden shadow-glass"
        >
          {/* Subtle Accent Glow */}
          <div className="absolute -top-12 -right-12 w-24 h-24 bg-accent-primary/10 blur-3xl group-hover:bg-accent-primary/20 transition-all duration-500" />

          <div className="flex items-center gap-2 mb-2">
            <div className="w-1 h-1 rounded-full bg-accent-primary animate-pulse" />
            <span className="text-[9px] uppercase tracking-[0.3em] text-white/60 font-mono font-bold whitespace-nowrap">{stat.label}</span>
          </div>
          <span className="text-4xl font-heading text-white tracking-widest bg-gradient-to-br from-white to-white/40 bg-clip-text text-transparent">
            {stat.count.toString().padStart(2, '0')}
          </span>
        </motion.div>
      ))}
    </div>
  );
});

StatsBanner.displayName = 'StatsBanner';

export default StatsBanner;

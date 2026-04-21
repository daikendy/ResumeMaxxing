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
    { label: 'Total Scanned', count: stats.total },
    { label: 'Interviewing', count: stats.interviewing },
    { label: 'Current Hired', count: stats.hired },
    { label: 'Deferred', count: stats.rejected }
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
      {items.map((stat, idx) => (
        <motion.div 
          key={stat.label}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: idx * 0.1 }}
          className="bg-black/60 border border-white/10 p-6 flex flex-col items-center justify-center text-center group hover:border-cyan-accent/50 transition-all backdrop-blur-sm"
        >
          <div className="flex items-center gap-2 mb-2">
            <LucideBarChart3 className="w-3 h-3 text-cyan-accent opacity-50 group-hover:opacity-100 transition-opacity" />
            <span className="text-[9px] uppercase tracking-widest text-white/40 font-heading">{stat.label}</span>
          </div>
          <span className="text-3xl font-heading text-white tracking-widest group-hover:text-cyan-accent transition-colors">
            {stat.count.toString().padStart(2, '0')}
          </span>
        </motion.div>
      ))}
    </div>
  );
});

StatsBanner.displayName = 'StatsBanner';

export default StatsBanner;

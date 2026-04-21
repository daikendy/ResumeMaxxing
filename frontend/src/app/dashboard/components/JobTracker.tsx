import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LucideSearch, 
  LucidePlus, 
  LucideChevronDown, 
  LucideExternalLink, 
  LucidePencil, 
  LucideTrash2,
  LucideAlertCircle,
  LucideFileText
} from 'lucide-react';
import Link from 'next/link';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { TrackedJob } from '@/types/resume';

interface JobTrackerProps {
  searchTerm: string;
  onSearchChange: (val: string) => void;
  statusFilter: string | null;
  onStatusFilterChange: (val: string | null) => void;
  filteredJobs: TrackedJob[];
  statusOrder: string[];
  statusConfig: Record<string, { color: string, bg: string, icon: any }>;
  activeStatusDropdown: number | null;
  onToggleDropdown: (id: number | null) => void;
  onUpdateStatus: (id: number, status: string) => void;
  onEditJob: (job: TrackedJob) => void;
  onDeleteJob: (id: number) => void;
  confirmDeleteId: number | null;
  setConfirmDeleteId: (id: number | null) => void;
  onOpenModal: () => void;
}

const JobItem = React.memo(({
  job,
  statusConfig,
  activeStatusDropdown,
  onToggleDropdown,
  onUpdateStatus,
  onEditJob,
  onDeleteJob,
  confirmDeleteId,
  setConfirmDeleteId,
  statusOrder
}: {
  job: TrackedJob;
  statusConfig: any;
  activeStatusDropdown: number | null;
  onToggleDropdown: (id: number | null) => void;
  onUpdateStatus: (id: number, status: string) => void;
  onEditJob: (job: TrackedJob) => void;
  onDeleteJob: (id: number) => void;
  confirmDeleteId: number | null;
  setConfirmDeleteId: (id: number | null) => void;
  statusOrder: string[];
}) => {
  const config = statusConfig[job.status] || statusConfig['bookmarked'];
  const Icon = config.icon;

  return (
    <motion.div 
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="bg-zinc-950/50 border border-white/5 p-5 md:p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 group hover:border-white/10 transition-all"
    >
      <div className="flex items-start gap-4 flex-grow">
        <div className={`mt-1 p-2 rounded-lg ${config.bg} ${config.color}`}>
          <Icon className="w-5 h-5" />
        </div>
        <div className="flex flex-col gap-1 min-w-0">
          <div className="flex items-center gap-3">
            <h4 className="text-sm font-heading font-medium text-white tracking-wide truncate">{job.job_title}</h4>
            {job.job_url && (
              <a href={job.job_url} target="_blank" rel="noopener noreferrer" className="text-white/20 hover:text-cyan-accent transition-colors">
                <LucideExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>
          <p className="text-[10px] uppercase font-mono tracking-widest text-white/40">{job.company_name}</p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* Status Dropdown */}
        <div className="relative">
          <button 
            onClick={() => onToggleDropdown(activeStatusDropdown === job.id ? null : job.id)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border border-white/5 text-[9px] uppercase font-heading tracking-widest transition-all ${config.bg} ${config.color}`}
          >
            {job.status}
            <LucideChevronDown className={`w-3 h-3 transition-transform ${activeStatusDropdown === job.id ? 'rotate-180' : ''}`} />
          </button>
          
          <AnimatePresence>
            {activeStatusDropdown === job.id && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: -10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -10 }}
                className="absolute top-full right-0 mt-2 w-40 bg-zinc-900 border border-white/10 shadow-2xl z-50 p-1"
              >
                {statusOrder.map(status => (
                  <button
                    key={status}
                    onClick={() => {
                        onUpdateStatus(job.id, status);
                        onToggleDropdown(null);
                    }}
                    className="w-full text-left px-3 py-2 text-[9px] uppercase font-heading tracking-widest text-white/40 hover:text-white hover:bg-white/5 transition-all"
                  >
                    {status}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="flex items-center gap-2">
          <Link href={`/editor?jobId=${job.id}`} className="p-2 text-cyan-accent/40 hover:text-cyan-accent transition-colors">
            <LucideFileText className="w-4 h-4" />
          </Link>
          <button onClick={() => onEditJob(job)} className="p-2 text-white/20 hover:text-white transition-colors">
            <LucidePencil className="w-4 h-4" />
          </button>
          
          <div className="relative">
            {confirmDeleteId === job.id ? (
              <motion.button 
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                onClick={() => onDeleteJob(job.id)}
                className="p-2 text-red-500 bg-red-500/10 rounded-lg"
              >
                <LucideAlertCircle className="w-4 h-4" />
              </motion.button>
            ) : (
              <button onClick={() => setConfirmDeleteId(job.id)} className="p-2 text-white/20 hover:text-red-500 transition-colors">
                <LucideTrash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
});

JobItem.displayName = 'JobItem';

const JobTracker = React.memo(({
  searchTerm,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  filteredJobs,
  statusOrder,
  statusConfig,
  activeStatusDropdown,
  onToggleDropdown,
  onUpdateStatus,
  onEditJob,
  onDeleteJob,
  confirmDeleteId,
  setConfirmDeleteId,
  onOpenModal
}: JobTrackerProps) => {
  return (
    <div className="space-y-6">
      {/* Search & Filter Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 py-6 border-b border-white/5">
        <div className="flex items-baseline gap-4">
          <h2 className="text-xl font-heading text-white tracking-widest uppercase">Target Ledger</h2>
          <span className="text-[10px] font-mono text-white/20">{filteredJobs.length} NODES_FOUND</span>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative w-full md:w-64">
            <LucideSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
            <Input 
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="SEARCH_NODE..."
              className="pl-10 bg-white/5 border-white/10 text-xs h-9 uppercase tracking-widest focus:border-cyan-accent"
            />
          </div>
          
          <div className="flex gap-1 bg-white/5 p-1">
            {['all', ...statusOrder].map(status => (
              <button
                key={status}
                onClick={() => onStatusFilterChange(status === 'all' ? null : status)}
                className={`px-3 py-1.5 text-[8px] font-heading tracking-widest uppercase transition-all ${
                  (status === 'all' && !statusFilter) || statusFilter === status
                  ? 'bg-cyan-accent text-black'
                  : 'text-white/40 hover:text-white'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
          
          <Button onClick={onOpenModal} className="h-9 bg-white text-black hover:bg-cyan-accent px-4 font-heading text-[10px] tracking-widest uppercase">
            <LucidePlus className="w-4 h-4 mr-2" /> New Target
          </Button>
        </div>
      </div>

      {/* Job List */}
      <div className="space-y-4">
        {filteredJobs.length > 0 ? (
          <AnimatePresence mode="popLayout">
            {filteredJobs.map(job => (
              <JobItem 
                key={job.id}
                job={job}
                statusConfig={statusConfig}
                activeStatusDropdown={activeStatusDropdown}
                onToggleDropdown={onToggleDropdown}
                onUpdateStatus={onUpdateStatus}
                onEditJob={onEditJob}
                onDeleteJob={onDeleteJob}
                confirmDeleteId={confirmDeleteId}
                setConfirmDeleteId={setConfirmDeleteId}
                statusOrder={statusOrder}
              />
            ))}
          </AnimatePresence>
        ) : (
          <div className="h-64 flex flex-col items-center justify-center border border-dashed border-white/5 text-white/20">
            <LucideAlertCircle className="w-8 h-8 mb-4 opacity-20" />
            <span className="text-[10px] font-mono tracking-widest uppercase">NO_TARGETS_ACQUIRED</span>
          </div>
        )}
      </div>
    </div>
  );
});

JobTracker.displayName = 'JobTracker';

export default JobTracker;

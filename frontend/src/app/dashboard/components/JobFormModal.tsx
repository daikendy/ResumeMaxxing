import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LucideBriefcase, LucideX } from 'lucide-react';
import { TacticalInput, TacticalTextarea } from '@/components/shared/TacticalUI';
import { LIMITS } from '@/lib/constants';

interface JobFormData {
  id: number | null;
  job_title: string;
  company_name: string;
  job_description: string;
  job_url: string;
}

interface JobFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  formData: JobFormData;
  onInputChange: (key: keyof JobFormData, val: string) => void;
  onSubmit: () => void;
  isSubmitting: boolean;
  focusedField: string | null;
  setFocusedField: (id: string | null) => void;
}

const JobFormModal = React.memo(({
  isOpen,
  onClose,
  formData,
  onInputChange,
  onSubmit,
  isSubmitting,
  focusedField,
  setFocusedField
}: JobFormModalProps) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-md" 
          />
          <motion.div 
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            className="relative w-full max-w-2xl bg-zinc-950 border border-white/10 shadow-2xl overflow-hidden"
          >
            <div className="px-8 py-6 border-b border-white/5 flex justify-between items-center bg-zinc-900/40">
              <div className="flex items-center gap-3">
                <LucideBriefcase className="w-4 h-4 text-cyan-accent" />
                <h3 className="text-xs font-heading text-white tracking-[0.2em] uppercase">
                  {formData.id ? 'Modify Target' : 'New Target Acquisition'}
                </h3>
              </div>
              <button onClick={onClose} className="text-white/40 hover:text-white transition-colors">
                <LucideX className="w-5 h-5" />
              </button>
            </div>

            <div className="p-8 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <TacticalInput
                  label="Position / Title"
                  value={formData.job_title}
                  max={LIMITS.TITLE}
                  isFocused={focusedField === 'job_title'}
                  onFocus={() => setFocusedField('job_title')}
                  onBlur={() => setFocusedField(null)}
                  onChange={(val) => onInputChange('job_title', val)}
                  placeholder="Software Engineer..."
                />
                <TacticalInput
                  label="Organization / Company"
                  value={formData.company_name}
                  max={LIMITS.COMPANY}
                  isFocused={focusedField === 'company_name'}
                  onFocus={() => setFocusedField('company_name')}
                  onBlur={() => setFocusedField(null)}
                  onChange={(val) => onInputChange('company_name', val)}
                  placeholder="ACME Corp..."
                />
              </div>

              <TacticalInput
                label="Target URL"
                value={formData.job_url}
                max={LIMITS.URL}
                isFocused={focusedField === 'job_url'}
                onFocus={() => setFocusedField('job_url')}
                onBlur={() => setFocusedField(null)}
                onChange={(val) => onInputChange('job_url', val)}
                placeholder="https://careers.acme.com/..."
              />

              <TacticalTextarea
                label="Intelligence / Job Description"
                value={formData.job_description}
                max={LIMITS.DESCRIPTION}
                isFocused={focusedField === 'job_description'}
                onFocus={() => setFocusedField('job_description')}
                onBlur={() => setFocusedField(null)}
                onChange={(val) => onInputChange('job_description', val)}
                placeholder="Paste the full job requirements here for AI tailoring..."
                className="min-h-[250px] text-[10px]"
              />
            </div>

            <div className="px-8 py-6 border-t border-white/5 bg-zinc-900/20 flex justify-end gap-4">
              <button 
                onClick={onClose}
                className="px-6 py-2 text-[10px] uppercase font-heading text-white/40 hover:text-white transition-colors"
              >
                Abort
              </button>
              <button 
                onClick={onSubmit}
                disabled={isSubmitting || !formData.job_title || !formData.company_name}
                className="bg-cyan-accent text-black px-8 py-2 font-heading text-[10px] tracking-widest hover:bg-white transition-all disabled:opacity-30 uppercase"
              >
                {isSubmitting ? 'Syncing...' : formData.id ? 'Commit Update' : 'Establish Node'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
});

JobFormModal.displayName = 'JobFormModal';

export default JobFormModal;

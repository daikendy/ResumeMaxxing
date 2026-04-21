import React from 'react';
import { TacticalTextarea } from '@/components/shared/TacticalUI';
import { LIMITS } from '@/lib/constants';

interface SummarySectionProps {
  summary: string;
  focusedField: string | null;
  setFocusedField: (id: string | null) => void;
  setSummary: (val: string) => void;
}

const SummarySection = React.memo(({
  summary,
  focusedField,
  setFocusedField,
  setSummary
}: SummarySectionProps) => {
  return (
    <section id="summary" className="space-y-6">
      <div className="flex items-baseline gap-4">
        <span className="text-4xl font-heading text-white/5 italic">01</span>
        <h2 className="text-xl font-heading text-white tracking-widest uppercase">Bio Prototype</h2>
      </div>
      <div className="bg-black/40 border border-white/10 p-6">
        <TacticalTextarea
          label="Professional Summary"
          value={summary}
          max={LIMITS.SUMMARY}
          isFocused={focusedField === 'summary'}
          onFocus={() => setFocusedField('summary')}
          onBlur={() => setFocusedField(null)}
          onChange={setSummary}
          placeholder="Strategic technologist with expertise in high-load systems..."
          className="min-h-[200px]"
        />
      </div>
    </section>
  );
});

SummarySection.displayName = 'SummarySection';

export default SummarySection;

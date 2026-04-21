import React from 'react';
import { LucideTrash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TacticalInput, TacticalTextarea } from '@/components/shared/TacticalUI';
import { LIMITS } from '@/lib/constants';

interface Experience {
  title: string;
  company: string;
  location?: string;
  startDate?: string;
  endDate?: string;
  technologies?: string;
  bullets: string[];
}

interface ExperienceSectionProps {
  experience: Experience[];
  focusedField: string | null;
  setFocusedField: (id: string | null) => void;
  addExperience: () => void;
  removeExperience: (idx: number) => void;
  updateExp: (idx: number, key: keyof Experience, val: any) => void;
  addBullet: (expIdx: number) => void;
  updateBullet: (expIdx: number, bIdx: number, val: string) => void;
  removeBullet: (expIdx: number, bIdx: number) => void;
}

const ExperienceItem = React.memo(({ 
  exp, 
  idx, 
  focusedField, 
  setFocusedField, 
  removeExperience, 
  updateExp, 
  addBullet, 
  updateBullet, 
  removeBullet 
}: { 
  exp: Experience; 
  idx: number; 
  focusedField: string | null; 
  setFocusedField: (id: string | null) => void;
  removeExperience: (idx: number) => void;
  updateExp: (idx: number, key: keyof Experience, val: any) => void;
  addBullet: (expIdx: number) => void;
  updateBullet: (expIdx: number, bIdx: number, val: string) => void;
  removeBullet: (expIdx: number, bIdx: number) => void;
}) => {
  return (
    <div className="border border-white/10 bg-black/40 p-8 space-y-6 relative group">
      <button onClick={() => removeExperience(idx)} className="absolute top-4 right-4 text-white/10 hover:text-red-500 transition-colors p-1">
        <LucideTrash2 className="w-4 h-4" />
      </button>
      
      {/* Title & Company */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <TacticalInput
          label="Job Title"
          value={exp.title}
          max={LIMITS.TITLE}
          isFocused={focusedField === `exp-${idx}-title`}
          onFocus={() => setFocusedField(`exp-${idx}-title`)}
          onBlur={() => setFocusedField(null)}
          onChange={(val) => updateExp(idx, 'title', val)}
        />
        <TacticalInput
          label="Company"
          value={exp.company}
          max={LIMITS.COMPANY}
          isFocused={focusedField === `exp-${idx}-company`}
          onFocus={() => setFocusedField(`exp-${idx}-company`)}
          onBlur={() => setFocusedField(null)}
          onChange={(val) => updateExp(idx, 'company', val)}
        />
      </div>

      {/* Dates & Location */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: 'Start Date', key: 'startDate', ph: 'Jan 2020' },
          { label: 'End Date', key: 'endDate', ph: 'Present' },
          { label: 'Location', key: 'location', ph: 'Remote' }
        ].map(f => (
          <div key={f.key} className="space-y-1">
            <label className="text-[10px] uppercase text-white/40">{f.label}</label>
            <TacticalInput
              label={f.label}
              value={(exp as any)[f.key] || ''}
              max={100}
              isFocused={focusedField === `exp-${idx}-${f.key}`}
              onFocus={() => setFocusedField(`exp-${idx}-${f.key}`)}
              onBlur={() => setFocusedField(null)}
              onChange={(val) => updateExp(idx, f.key as any, val)}
              placeholder={f.ph}
              className="h-9"
            />
          </div>
        ))}
      </div>

      {/* Tech Stack */}
      <TacticalInput
        label="Technologies & Tools"
        value={exp.technologies || ''}
        max={LIMITS.TITLE * 2}
        isFocused={focusedField === `exp-${idx}-tech`}
        onFocus={() => setFocusedField(`exp-${idx}-tech`)}
        onBlur={() => setFocusedField(null)}
        onChange={(val) => updateExp(idx, 'technologies', val)}
        placeholder="React, TypeScript, Node.js..."
      />

      {/* Bullets */}
      <div className="space-y-4">
        {exp.bullets.map((b, bIdx) => (
          <div key={bIdx} className="relative group/bullet">
            <TacticalTextarea
              label={`Achievement #${bIdx + 1}`}
              value={b}
              max={LIMITS.BULLET}
              isFocused={focusedField === `bullet-${idx}-${bIdx}`}
              onFocus={() => setFocusedField(`bullet-${idx}-${bIdx}`)}
              onBlur={() => setFocusedField(null)}
              onChange={(val) => updateBullet(idx, bIdx, val)}
              className="min-h-[60px]"
            />
            <button onClick={() => removeBullet(idx, bIdx)} className="absolute bottom-2 right-2 opacity-0 group-hover/bullet:opacity-100 text-red-500">
              <LucideTrash2 className="w-3 h-3" />
            </button>
          </div>
        ))}
        <Button variant="ghost" onClick={() => addBullet(idx)} className="w-full border border-dashed border-white/5 text-[9px] uppercase text-white/20 hover:text-cyan-accent">
          + Add New Point
        </Button>
      </div>
    </div>
  );
});

ExperienceItem.displayName = 'ExperienceItem';

const ExperienceSection = React.memo(({ 
  experience, 
  focusedField, 
  setFocusedField, 
  addExperience, 
  removeExperience, 
  updateExp, 
  addBullet, 
  updateBullet, 
  removeBullet 
}: ExperienceSectionProps) => {
  return (
    <section id="experience" className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-baseline gap-4">
          <span className="text-4xl font-heading text-white/5 italic">03</span>
          <h2 className="text-xl font-heading text-white tracking-widest uppercase">Work Experience</h2>
        </div>
        <Button variant="ghost" className="text-[10px] text-cyan-accent uppercase" onClick={addExperience}>+ Add Job</Button>
      </div>
      {experience.map((exp, idx) => (
        <ExperienceItem
          key={idx}
          exp={exp}
          idx={idx}
          focusedField={focusedField}
          setFocusedField={setFocusedField}
          removeExperience={removeExperience}
          updateExp={updateExp}
          addBullet={addBullet}
          updateBullet={updateBullet}
          removeBullet={removeBullet}
        />
      ))}
    </section>
  );
});

ExperienceSection.displayName = 'ExperienceSection';

export default ExperienceSection;

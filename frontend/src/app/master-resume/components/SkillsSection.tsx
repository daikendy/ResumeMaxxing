import React from 'react';
import { LucideTrash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { LIMITS } from '@/lib/constants';

interface SkillsSectionProps {
  skills: string[];
  addSkill: () => void;
  removeSkill: (idx: number) => void;
  updateSkill: (idx: number, val: string) => void;
}

const SkillsSection = React.memo(({
  skills,
  addSkill,
  removeSkill,
  updateSkill
}: SkillsSectionProps) => {
  return (
    <section id="skills" className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-baseline gap-4">
          <span className="text-4xl font-heading text-white/5 italic">05</span>
          <h2 className="text-xl font-heading text-white tracking-widest uppercase">Skills & Tools</h2>
        </div>
        <Button variant="ghost" className="text-[10px] text-cyan-accent uppercase" onClick={addSkill}>+ Add Skill</Button>
      </div>
      <div className="flex flex-wrap gap-2 p-6 border border-white/10 bg-black/40">
         {skills.map((skill, idx) => (
           <div key={idx} className="relative group">
              <Input 
                value={skill} 
                onChange={e => updateSkill(idx, e.target.value)} 
                className="w-32 bg-transparent border-white/10 text-[10px] font-mono h-8 uppercase focus:border-cyan-accent/50" 
                placeholder="SKILL_ID"
                maxLength={LIMITS.SKILL}
              />
              <button 
                onClick={() => removeSkill(idx)} 
                className="absolute right-1 top-1.5 opacity-0 group-hover:opacity-100 text-red-500 transition-opacity"
              >
                <LucideTrash2 className="w-3 h-3" />
              </button>
           </div>
         ))}
         {skills.length === 0 && <span className="text-[10px] text-white/20 font-mono italic">NO_SKILLS_RECORDED</span>}
      </div>
    </section>
  );
});

SkillsSection.displayName = 'SkillsSection';

export default SkillsSection;

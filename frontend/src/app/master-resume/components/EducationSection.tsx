import React from 'react';
import { LucideTrash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TacticalInput } from '@/components/shared/TacticalUI';

interface Education {
  institution: string;
  degree: string;
  year: string;
  location?: string;
  gpa?: string;
}

interface EducationSectionProps {
  education: Education[];
  focusedField: string | null;
  setFocusedField: (id: string | null) => void;
  addEducation: () => void;
  removeEducation: (idx: number) => void;
  updateEdu: (idx: number, key: keyof Education, val: string) => void;
}

const EducationSection = React.memo(({
  education,
  focusedField,
  setFocusedField,
  addEducation,
  removeEducation,
  updateEdu
}: EducationSectionProps) => {
  return (
    <section id="education" className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-baseline gap-4">
          <span className="text-4xl font-heading text-white/5 italic">04</span>
          <h2 className="text-xl font-heading text-white tracking-widest uppercase">Education</h2>
        </div>
        <Button variant="ghost" className="text-[10px] text-cyan-accent uppercase" onClick={addEducation}>+ Add School</Button>
      </div>
      <div className="space-y-4">
        {education.map((edu, idx) => (
          <div key={idx} className="border border-white/10 bg-black/40 p-6 space-y-4 relative group">
             <button onClick={() => removeEducation(idx)} className="absolute top-4 right-4 text-white/10 hover:text-red-500 transition-colors p-1">
               <LucideTrash2 className="w-4 h-4" />
             </button>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <TacticalInput
                  label="Institution"
                  value={edu.institution}
                  max={200}
                  isFocused={focusedField === `edu-${idx}-inst`}
                  onFocus={() => setFocusedField(`edu-${idx}-inst`)}
                  onBlur={() => setFocusedField(null)}
                  onChange={(val) => updateEdu(idx, 'institution', val)}
                />
                <TacticalInput
                  label="Degree"
                  value={edu.degree}
                  max={200}
                  isFocused={focusedField === `edu-${idx}-deg`}
                  onFocus={() => setFocusedField(`edu-${idx}-deg`)}
                  onBlur={() => setFocusedField(null)}
                  onChange={(val) => updateEdu(idx, 'degree', val)}
                />
                <div className="grid grid-cols-2 gap-2">
                  <TacticalInput
                    label="Year"
                    value={edu.year}
                    max={50}
                    isFocused={focusedField === `edu-${idx}-year`}
                    onFocus={() => setFocusedField(`edu-${idx}-year`)}
                    onBlur={() => setFocusedField(null)}
                    onChange={(val) => updateEdu(idx, 'year', val)}
                  />
                  <TacticalInput
                    label="GPA"
                    value={edu.gpa || ''}
                    max={50}
                    isFocused={focusedField === `edu-${idx}-gpa`}
                    onFocus={() => setFocusedField(`edu-${idx}-gpa`)}
                    onBlur={() => setFocusedField(null)}
                    onChange={(val) => updateEdu(idx, 'gpa', val)}
                  />
                </div>
                <TacticalInput
                  label="Location"
                  value={edu.location || ''}
                  max={100}
                  isFocused={focusedField === `edu-${idx}-loc`}
                  onFocus={() => setFocusedField(`edu-${idx}-loc`)}
                  onBlur={() => setFocusedField(null)}
                  onChange={(val) => updateEdu(idx, 'location', val)}
                />
             </div>
          </div>
        ))}
      </div>
    </section>
  );
});

EducationSection.displayName = 'EducationSection';

export default EducationSection;

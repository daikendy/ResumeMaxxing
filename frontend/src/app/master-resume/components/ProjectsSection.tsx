import React from 'react';
import { LucideTrash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TacticalInput, TacticalTextarea } from '@/components/shared/TacticalUI';
import { LIMITS } from '@/lib/constants';

interface Project {
  title: string;
  description: string;
  location?: string;
  startDate?: string;
  endDate?: string;
  technologies?: string;
}

interface ProjectsSectionProps {
  projects: Project[];
  focusedField: string | null;
  setFocusedField: (id: string | null) => void;
  addProject: () => void;
  removeProject: (idx: number) => void;
  updateProject: (idx: number, key: keyof Project, val: string) => void;
}

const ProjectsSection = React.memo(({
  projects,
  focusedField,
  setFocusedField,
  addProject,
  removeProject,
  updateProject
}: ProjectsSectionProps) => {
  return (
    <section id="projects" className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-baseline gap-4">
          <span className="text-4xl font-heading text-white/5 italic">06</span>
          <h2 className="text-xl font-heading text-white tracking-widest uppercase">Projects</h2>
        </div>
        <Button variant="ghost" className="text-[10px] text-cyan-accent uppercase" onClick={addProject}>+ Add Project</Button>
      </div>
      <div className="space-y-6">
        {projects.map((proj, idx) => (
          <div key={idx} className="border border-white/10 bg-black/40 p-8 space-y-4 relative group">
             <button onClick={() => removeProject(idx)} className="absolute top-4 right-4 text-white/10 hover:text-red-500 transition-colors p-1">
               <LucideTrash2 className="w-4 h-4" />
             </button>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <TacticalInput
                  label="Title"
                  value={proj.title}
                  max={LIMITS.PROJECT_TITLE}
                  isFocused={focusedField === `proj-${idx}-title`}
                  onFocus={() => setFocusedField(`proj-${idx}-title`)}
                  onBlur={() => setFocusedField(null)}
                  onChange={(val) => updateProject(idx, 'title', val)}
                />
                <div className="grid grid-cols-2 gap-2">
                   <TacticalInput
                    label="Start Date"
                    value={proj.startDate || ''}
                    max={50}
                    isFocused={focusedField === `proj-${idx}-start`}
                    onFocus={() => setFocusedField(`proj-${idx}-start`)}
                    onBlur={() => setFocusedField(null)}
                    onChange={(val) => updateProject(idx, 'startDate', val)}
                    placeholder="Jan 2020"
                   />
                   <TacticalInput
                    label="End Date"
                    value={proj.endDate || ''}
                    max={50}
                    isFocused={focusedField === `proj-${idx}-end`}
                    onFocus={() => setFocusedField(`proj-${idx}-end`)}
                    onBlur={() => setFocusedField(null)}
                    onChange={(val) => updateProject(idx, 'endDate', val)}
                    placeholder="Mar 2021"
                   />
                </div>
             </div>
             <TacticalTextarea
                label="Description"
                value={proj.description}
                max={LIMITS.PROJECT_DESC}
                isFocused={focusedField === `proj-${idx}-desc`}
                onFocus={() => setFocusedField(`proj-${idx}-desc`)}
                onBlur={() => setFocusedField(null)}
                onChange={(val) => updateProject(idx, 'description', val)}
                className="min-h-[100px]"
             />
             <TacticalInput
                label="Tech Stack"
                value={proj.technologies || ''}
                max={200}
                isFocused={focusedField === `proj-${idx}-tech`}
                onFocus={() => setFocusedField(`proj-${idx}-tech`)}
                onBlur={() => setFocusedField(null)}
                onChange={(val) => updateProject(idx, 'technologies', val)}
                placeholder="Next.js, Tailwind, FastAPI..."
             />
          </div>
        ))}
      </div>
    </section>
  );
});

ProjectsSection.displayName = 'ProjectsSection';

export default ProjectsSection;

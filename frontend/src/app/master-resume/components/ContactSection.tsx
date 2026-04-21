import React from 'react';
import { TacticalInput } from '@/components/shared/TacticalUI';
import { LIMITS } from '@/lib/constants';

interface Contact {
  name: string;
  email: string;
  phone: string;
  github: string;
  linkedin: string;
}

interface ContactSectionProps {
  contact: Contact;
  focusedField: string | null;
  setFocusedField: (id: string | null) => void;
  updateContact: (data: Partial<Contact>) => void;
}

const ContactSection = React.memo(({ 
  contact, 
  focusedField, 
  setFocusedField, 
  updateContact 
}: ContactSectionProps) => {
  const fields = [
    { label: 'Full Name', key: 'name', ph: 'John Doe', max: LIMITS.NAME },
    { label: 'Email', key: 'email', ph: 'john@example.com', max: LIMITS.EMAIL },
    { label: 'Phone Number', key: 'phone', ph: '+1 (555) 000-0000', max: LIMITS.PHONE },
    { label: 'GitHub', key: 'github', ph: 'github.com/johndoe', max: LIMITS.SOCIAL },
    { label: 'LinkedIn', key: 'linkedin', ph: 'linkedin.com/in/johndoe', max: LIMITS.SOCIAL }
  ] as const;

  return (
    <section id="contact" className="space-y-6">
      <div className="flex items-baseline gap-4">
        <span className="text-4xl font-heading text-white/5 italic">02</span>
        <h2 className="text-xl font-heading text-white tracking-widest uppercase">Contact</h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-6 border border-white/10 bg-black/40 backdrop-blur-sm">
        {fields.map(f => (
          <div key={f.key} className={f.key === 'github' ? 'md:col-span-2' : ''}>
            <TacticalInput
              label={f.label}
              value={contact[f.key]}
              max={f.max}
              isFocused={focusedField === f.key}
              onFocus={() => setFocusedField(f.key)}
              onBlur={() => setFocusedField(null)}
              onChange={(val) => updateContact({ [f.key]: val })}
              placeholder={f.ph}
            />
          </div>
        ))}
      </div>
    </section>
  );
});

ContactSection.displayName = 'ContactSection';

export default ContactSection;

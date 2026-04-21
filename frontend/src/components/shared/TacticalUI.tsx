import React from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { getCounterColor } from '@/lib/constants';
import { cn } from '@/lib/utils';

interface TacticalFieldProps {
  label: string;
  value: string;
  max: number;
  isFocused: boolean;
  onFocus: () => void;
  onBlur: () => void;
  onChange: (val: string) => void;
  placeholder?: string;
  className?: string;
}

export const TacticalInput = React.memo(({ 
  label, 
  value, 
  max, 
  isFocused, 
  onFocus, 
  onBlur, 
  onChange, 
  placeholder,
  className
}: TacticalFieldProps) => {
  return (
    <div className="space-y-1">
      <div className="flex justify-between items-center">
        <label className="text-[10px] uppercase font-heading text-white/40">{label}</label>
        {isFocused && (
          <span className={cn("text-[8px] font-mono", getCounterColor(value.length, max))}>
            {value.length}/{max}
          </span>
        )}
      </div>
      <Input
        value={value}
        onFocus={onFocus}
        onBlur={onBlur}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={cn("bg-transparent border-white/10 text-white font-mono h-9 text-xs", className)}
      />
    </div>
  );
});

TacticalInput.displayName = 'TacticalInput';

export const TacticalTextarea = React.memo(({ 
  label, 
  value, 
  max, 
  isFocused, 
  onFocus, 
  onBlur, 
  onChange, 
  placeholder,
  className
}: TacticalFieldProps) => {
  return (
    <div className="space-y-1">
      <div className="flex justify-between items-center">
        <label className="text-[10px] uppercase font-heading text-white/40">{label}</label>
        {isFocused && (
          <span className={cn("text-[8px] font-mono", getCounterColor(value.length, max))}>
            {value.length}/{max}
          </span>
        )}
      </div>
      <Textarea
        value={value}
        onFocus={onFocus}
        onBlur={onBlur}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={cn("bg-transparent border-white/5 text-[11px] font-mono min-h-[80px]", className)}
      />
    </div>
  );
});

TacticalTextarea.displayName = 'TacticalTextarea';

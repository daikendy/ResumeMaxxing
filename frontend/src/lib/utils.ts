import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Ensures a date string is treated as UTC if it doesn't have a timezone marker,
 * then converts it to local time for the HUD.
 */
export function formatHudTime(dateStr: string): string {
  if (!dateStr) return "[--:--]";
  const utcDate = dateStr.endsWith('Z') ? dateStr : `${dateStr}Z`;
  return new Date(utcDate).toLocaleTimeString([], { 
    hour: '2-digit', 
    minute: '2-digit', 
    hour12: false 
  });
}

export function formatHudDate(dateStr: string): string {
  if (!dateStr) return "--/--/----";
  const utcDate = dateStr.endsWith('Z') ? dateStr : `${dateStr}Z`;
  return new Date(utcDate).toLocaleDateString();
}

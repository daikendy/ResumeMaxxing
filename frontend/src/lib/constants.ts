import { Haptics, ImpactStyle } from '@capacitor/haptics';

export const LIMITS = {
  NAME: 100,
  EMAIL: 100,
  PHONE: 50,
  SOCIAL: 200,
  SUMMARY: 5000,
  TITLE: 100,
  COMPANY: 100,
  BULLET: 1000,
  PROJECT_DESC: 2000,
  PROJECT_TITLE: 200,
  SKILL: 50,
  URL: 500,
  DESCRIPTION: 15000
};

export const playHaptic = async (style = ImpactStyle.Light) => {
  try {
    await Haptics.impact({ style });
  } catch (e) {}
};

export const getCounterColor = (length: number, max: number) => {
  const ratio = length / max;
  if (ratio >= 1) return 'text-red-500';
  if (ratio >= 0.8) return 'text-yellow-500/60';
  return 'text-white/20';
};

export const validateInput = (val: string, max: number) => {
  if (val.length >= max) playHaptic(ImpactStyle.Medium);
  return val.slice(0, max);
};

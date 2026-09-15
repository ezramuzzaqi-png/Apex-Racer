import { CarSkin } from '../types';

export interface AvatarOption {
  id: string;
  name: string;
  badgeBg: string;
  borderColor: string;
  textColor: string;
  symbol: string;
  specialty: string;
}

export const AVATAR_OPTIONS: AvatarOption[] = [
  {
    id: 'avatar_apex_red',
    name: 'Apex Demon',
    badgeBg: 'bg-gradient-to-br from-rose-500 to-red-700',
    borderColor: 'border-rose-400',
    textColor: 'text-rose-400',
    symbol: '⚡',
    specialty: 'High Speed Aggression',
  },
  {
    id: 'avatar_cyber_cyan',
    name: 'Cyber Visor',
    badgeBg: 'bg-gradient-to-br from-cyan-400 to-sky-600',
    borderColor: 'border-cyan-400',
    textColor: 'text-cyan-400',
    symbol: '💠',
    specialty: 'Precision Reflexes',
  },
  {
    id: 'avatar_golden_ace',
    name: 'Golden Champion',
    badgeBg: 'bg-gradient-to-br from-amber-400 to-yellow-600',
    borderColor: 'border-amber-400',
    textColor: 'text-amber-400',
    symbol: '👑',
    specialty: 'Trophy Dominance',
  },
  {
    id: 'avatar_phantom_black',
    name: 'Shadow Phantom',
    badgeBg: 'bg-gradient-to-br from-zinc-700 to-zinc-950',
    borderColor: 'border-zinc-500',
    textColor: 'text-zinc-300',
    symbol: '☠️',
    specialty: 'Ghost Slipstream',
  },
  {
    id: 'avatar_viper_emerald',
    name: 'Viper Drift',
    badgeBg: 'bg-gradient-to-br from-emerald-400 to-emerald-700',
    borderColor: 'border-emerald-400',
    textColor: 'text-emerald-400',
    symbol: '🐍',
    specialty: 'Nitro Optimization',
  },
  {
    id: 'avatar_violet_pulse',
    name: 'Electric Neon',
    badgeBg: 'bg-gradient-to-br from-purple-500 to-indigo-700',
    borderColor: 'border-purple-400',
    textColor: 'text-purple-400',
    symbol: '🌌',
    specialty: 'Quantum Overtake',
  },
];

export const RACER_TITLES: string[] = [
  'Pembalap Pemula',
  'Highway Phantom',
  'Apex Drifter',
  'Speed King',
  'Nitro Overlord',
  'Track Legend',
];

export const CAR_SKINS: CarSkin[] = [
  {
    id: 'apex-red',
    name: 'Apex GT Red',
    primaryColor: '#e11d48',
    secondaryColor: '#9f1239',
    stripeColor: '#ffffff',
    glassColor: '#1e293b',
    glowColor: '#fb7185',
  },
  {
    id: 'formula-f1',
    name: 'Formula Speed',
    primaryColor: '#0284c7',
    secondaryColor: '#0369a1',
    stripeColor: '#facc15',
    glassColor: '#0f172a',
    glowColor: '#38bdf8',
  },
  {
    id: 'midnight-black',
    name: 'Midnight Phantom',
    primaryColor: '#18181b',
    secondaryColor: '#27272a',
    stripeColor: '#f59e0b',
    glassColor: '#09090b',
    glowColor: '#fbbf24',
  },
  {
    id: 'neon-viper',
    name: 'Viper Emerald',
    primaryColor: '#16a34a',
    secondaryColor: '#14532d',
    stripeColor: '#f8fafc',
    glassColor: '#0f172a',
    glowColor: '#4ade80',
  },
  {
    id: 'sunset-orange',
    name: 'Inferno Orange',
    primaryColor: '#ea580c',
    secondaryColor: '#9a3412',
    stripeColor: '#fef08a',
    glassColor: '#18181b',
    glowColor: '#fb923c',
  },
  {
    id: 'solar-yellow',
    name: 'Solar Stinger',
    primaryColor: '#eab308',
    secondaryColor: '#a16207',
    stripeColor: '#18181b',
    glassColor: '#0f172a',
    glowColor: '#fde047',
  },
  {
    id: 'cyber-purple',
    name: 'Cyber Violet',
    primaryColor: '#9333ea',
    secondaryColor: '#581c87',
    stripeColor: '#38bdf8',
    glassColor: '#0f172a',
    glowColor: '#c084fc',
  },
  {
    id: 'pearl-silver',
    name: 'Titanium Ghost',
    primaryColor: '#e2e8f0',
    secondaryColor: '#94a3b8',
    stripeColor: '#e11d48',
    glassColor: '#0f172a',
    glowColor: '#cbd5e1',
  },
];

export const ENEMY_COLORS = [
  { primary: '#d97706', stripe: '#fef3c7', secondary: '#92400e' },
  { primary: '#2563eb', stripe: '#dbeafe', secondary: '#1e40af' },
  { primary: '#7c3aed', stripe: '#ede9fe', secondary: '#5b21b6' },
  { primary: '#059669', stripe: '#d1fae5', secondary: '#065f46' },
  { primary: '#e11d48', stripe: '#ffe4e6', secondary: '#9f1239' },
  { primary: '#475569', stripe: '#cbd5e1', secondary: '#1e293b' },
];

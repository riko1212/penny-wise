export const AVATAR_COLORS = [
  { id: 'indigo',  value: 'linear-gradient(135deg, #6366f1, #38b2ac)' },
  { id: 'rose',    value: 'linear-gradient(135deg, #f43f5e, #fb923c)' },
  { id: 'violet',  value: 'linear-gradient(135deg, #8b5cf6, #ec4899)' },
  { id: 'teal',    value: 'linear-gradient(135deg, #14b8a6, #3b82f6)' },
  { id: 'amber',   value: 'linear-gradient(135deg, #f59e0b, #ef4444)' },
  { id: 'emerald', value: 'linear-gradient(135deg, #10b981, #06b6d4)' },
];

export const THEMES = [
  { id: 'default', label: 'Default', icon: '🌤' },
  { id: 'dark',    label: 'Dark',    icon: '🌙' },
  { id: 'light',   label: 'Light',   icon: '☀️' },
];

export const MAX_DESCRIPTION_LENGTH = 100;
export const MAX_AMOUNT = 1_000_000;

export const todayStr = () => new Date().toISOString().slice(0, 10);

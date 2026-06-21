import type { TextStyle } from 'react-native';

/**
 * Paper design tokens — ported from the archived iOS prototype
 * (archived/ios/.../Design/DesignSystem.swift), which mirrors the web app's
 * light "paper" theme in frontend globals.css. Single light theme by design.
 */

export const colors = {
  // Backgrounds
  paper: '#F3EEE6',
  surface: '#FFFDFA',
  surfaceHover: '#F8F3EB',

  // Text
  ink: '#171717',
  textMuted: '#6A665F',
  textSoft: '#8B8478',

  // Brand / accent
  accent: '#2647D6',
  accentPress: '#1D37A4',
  accentSoft: 'rgba(38,71,214,0.12)',

  // Hairlines
  hairline: '#D7CCBD',
  inkBorder: 'rgba(23,23,23,0.12)',
  inkBorderStrong: 'rgba(23,23,23,0.25)',

  // Semantic
  success: '#059669',
  warning: '#D97706',
  danger: '#EF4444',
  info: '#2563EB',

  // Accent variants used by widget eyebrows
  popular: '#315EFB',
  random: '#7C3AED',
} as const;

/** Category pill palette — mirrors CATEGORY_COLORS in Widget.tsx. */
const CATEGORY_BG: Record<string, string> = {
  Technology: '#DBEAFE',
  Science: '#D1FAE5',
  Finance: '#FEF3C7',
  Food: '#FCE7F3',
  Culture: '#EDE9FE',
};
const CATEGORY_FG: Record<string, string> = {
  Technology: '#1D4ED8',
  Science: '#065F46',
  Finance: '#92400E',
  Food: '#9D174D',
  Culture: '#5B21B6',
};

export function categoryBg(category: string): string {
  return CATEGORY_BG[category] ?? '#F3F4F6';
}
export function categoryFg(category: string): string {
  return CATEGORY_FG[category] ?? '#374151';
}

/** Typography scale — ported from the `Font.kisisel*` set. */
export const type: Record<string, TextStyle> = {
  display: { fontSize: 34, fontWeight: '800', letterSpacing: -0.5 },
  h1: { fontSize: 22, fontWeight: '800' },
  h2: { fontSize: 18, fontWeight: '700' },
  h3: { fontSize: 15, fontWeight: '700' },
  body: { fontSize: 14, fontWeight: '400', lineHeight: 20 },
  label: { fontSize: 12, fontWeight: '600' },
  caption: { fontSize: 11, fontWeight: '500' },
  button: { fontSize: 14, fontWeight: '700' },
  pill: { fontSize: 10, fontWeight: '800', letterSpacing: 0.4 },
};

export const spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 12,
  four: 16,
  five: 24,
  six: 32,
} as const;

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  pill: 999,
} as const;

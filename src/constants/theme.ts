/**
 * Tahadi visual theme: dark, energetic game-show aesthetic.
 * Deep navy background, electric-green primary accent, amber secondary,
 * high contrast. Player colors distinguish the two contestants.
 */

export const Colors = {
  bg: '#080B1F',
  bgGradientEnd: '#0E1636',
  surface: '#141A3A',
  surfaceAlt: '#1C2450',
  surfaceHi: '#28316B',
  border: '#2B3566',

  text: '#FFFFFF',
  textSecondary: '#9AA3CC',
  textMuted: '#5E679A',

  accent: '#00E676', // electric green (primary)
  accentDark: '#00B85C',
  amber: '#FFB300', // secondary highlight
  amberDark: '#C98A00',

  success: '#00E676',
  danger: '#FF3B5C',
  warn: '#FFD400',

  // Timer color stops: green -> yellow -> red
  timerGreen: '#00E676',
  timerYellow: '#FFD400',
  timerRed: '#FF3B5C',

  // Player identity colors
  player1: '#22D3EE', // cyan
  player2: '#FB7185', // rose

  overlay: 'rgba(8,11,31,0.86)',
  transparent: 'transparent',
} as const;

export const Fonts = {
  regular: 'Cairo_400Regular',
  medium: 'Cairo_600SemiBold',
  bold: 'Cairo_700Bold',
  black: 'Cairo_900Black',
} as const;

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  xxxl: 48,
} as const;

export const Radius = {
  sm: 8,
  md: 14,
  lg: 20,
  xl: 28,
  pill: 999,
} as const;

export const FontSize = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 20,
  xl: 26,
  xxl: 34,
  huge: 48,
  display: 64,
} as const;

/** Minimum touch target height for in-game controls (spec: >= 56px). */
export const TOUCH_MIN = 56;

export function playerColor(index: 0 | 1): string {
  return index === 0 ? Colors.player1 : Colors.player2;
}

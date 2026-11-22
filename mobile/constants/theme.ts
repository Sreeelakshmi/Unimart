// mobile/constants/theme.ts
// Design tokens — single source of truth for all styling.
// Every component must import from here; no raw hex values in components.

import { StyleSheet, Platform } from 'react-native';

export const Colors = {
  background: '#F3EEFA',
  primary: '#B9A0EB',
  mint: '#CFF2E2',
  peach: '#FFC6BA',
  text: '#342949',
  textSecondary: '#7B6E8D',
  white: '#FFFFFF',
  error: '#FF6B6B',
  border: '#E2D5F5',
  shadowColor: '#B9A0EB',
  overlay: 'rgba(52,41,73,0.4)',
  // Lavender tint card
  lavender: '#E8DFFF',
} as const;

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  base: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
  xxxl: 48,
} as const;

export const Radius = {
  sm: 12,
  md: 20,
  lg: 28,
  xl: 36,
  full: 999,
} as const;

export const FontSize = {
  h1: 28,
  h2: 22,
  h3: 18,
  body: 15,
  caption: 12,
  button: 16,
} as const;

export const FontWeight = {
  regular: '400' as const,
  semiBold: '600' as const,
  bold: '700' as const,
};

/** Reusable claymorphism outer elevation shadow, optimized for 60fps on mobile */
export const clayElevation = Platform.select({
  ios: {
    shadowColor: Colors.shadowColor,
    shadowOffset: { width: 4, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
  },
  android: {
    elevation: 3,
  },
  default: {
    shadowColor: Colors.shadowColor,
    shadowOffset: { width: 4, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 3,
  },
});

/** High-availability fast CDN placeholder for products (replaces slow via.placeholder.com) */
export const PLACEHOLDER_PRODUCT_IMAGE =
  'https://images.unsplash.com/photo-1526738549149-8e07eca6c147?w=400&q=75&auto=format';

/** Typography presets */
export const Typography = StyleSheet.create({
  h1: { fontSize: FontSize.h1, fontWeight: FontWeight.bold, color: Colors.text },
  h2: { fontSize: FontSize.h2, fontWeight: FontWeight.bold, color: Colors.text },
  h3: { fontSize: FontSize.h3, fontWeight: FontWeight.semiBold, color: Colors.text },
  body: { fontSize: FontSize.body, fontWeight: FontWeight.regular, color: Colors.text },
  bodyBold: { fontSize: FontSize.body, fontWeight: FontWeight.semiBold, color: Colors.text },
  caption: { fontSize: FontSize.caption, fontWeight: FontWeight.regular, color: Colors.textSecondary },
  captionBold: { fontSize: FontSize.caption, fontWeight: FontWeight.semiBold, color: Colors.textSecondary },
  button: { fontSize: FontSize.button, fontWeight: FontWeight.bold, color: Colors.white },
});

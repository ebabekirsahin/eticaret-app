// src/constants/theme.ts

export const Colors = {
  primary: '#C8502A',       // Ana turuncu-kahve ton (züccaciye sıcaklığı)
  primaryDark: '#A03D1E',
  primaryLight: '#E8A080',
  primaryBg: '#FFF4F0',

  secondary: '#2C5F6E',     // Koyu petrol mavisi (kontrast)
  secondaryLight: '#4A8FA0',

  accent: '#F0A500',        // Altın sarısı (kampanya/badge)
  accentLight: '#FFD670',

  success: '#27AE60',
  error: '#E74C3C',
  warning: '#F39C12',
  info: '#3498DB',

  dark: '#1A1A2E',
  gray900: '#2D2D2D',
  gray800: '#4A4A4A',
  gray600: '#7A7A7A',
  gray400: '#AAAAAA',
  gray200: '#E0E0E0',
  gray100: '#F5F5F5',
  gray50: '#FAFAFA',
  white: '#FFFFFF',

  // Semantik
  background: '#F8F4F0',
  surface: '#FFFFFF',
  border: '#ECECEC',
  textPrimary: '#1A1A2E',
  textSecondary: '#6B6B6B',
  textMuted: '#AAAAAA',
};

export const Typography = {
  fontFamily: {
    regular: 'Inter-Regular',
    medium: 'Inter-Medium',
    semiBold: 'Inter-SemiBold',
    bold: 'Inter-Bold',
    display: 'Poppins-Bold',
    displayMedium: 'Poppins-Medium',
  },
  fontSize: {
    xs: 11,
    sm: 13,
    base: 15,
    md: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 28,
    '4xl': 32,
    display: 38,
  },
  lineHeight: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.7,
  },
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  base: 16,
  lg: 20,
  xl: 24,
  '2xl': 32,
  '3xl': 40,
  '4xl': 48,
  screen: 16, // horizontal screen padding
};

export const BorderRadius = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
};

export const Shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.10,
    shadowRadius: 12,
    elevation: 5,
  },
  lg: {
    shadowColor: '#C8502A',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
  },
};

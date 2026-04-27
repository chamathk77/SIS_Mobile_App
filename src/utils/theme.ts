// theme.ts
import { MD3LightTheme, MD3DarkTheme, MD3Theme } from 'react-native-paper';

const lightTheme: MD3Theme = {
  ...MD3LightTheme,
  colors: {
    ...(MD3LightTheme.colors as any),
    // Primary brand: Yellow/Amber/Zinc (light mode)
    primary: '#D97706',
    onPrimary: '#FFFFFF',
    primaryContainer: '#FFECB3',
    onPrimaryContainer: '#4A2A00',

    secondary: '#71717A',
    onSecondary: '#FFFFFF',
    secondaryContainer: '#F4F4F5',
    onSecondaryContainer: '#27272A',

    tertiary: '#F59E0B',
    onTertiary: '#FFFFFF',
    tertiaryContainer: '#FEF3C7',
    onTertiaryContainer: '#78350F',

    background: '#FFFBF5',
    onBackground: '#1F1F1F',
    surface: '#FFFFFF',
    onSurface: '#1F1F1F',
    surfaceVariant: '#F4F4F5',
    onSurfaceVariant: '#52525B',
    outline: '#D4D4D8',

    error: '#DC2626',
    errorContainer: '#FEE2E2',
    onErrorContainer: '#7F1D1D',
    onSurfaceDisabled: '#A1A1AA',

    // Success palette
    success: '#15803D',
    successContainer: '#DCFCE7',
    onSuccessContainer: '#14532D',
  } as any,
};

const darkTheme: MD3Theme = {
  ...MD3DarkTheme,
  colors: {
    ...(MD3DarkTheme.colors as any),
    // Primary brand: Yellow/Amber/Zinc (dark mode)
    primary: '#FBBF24',
    onPrimary: '#3D2800',
    primaryContainer: '#7C4A03',
    onPrimaryContainer: '#FFE8B2',

    secondary: '#A1A1AA',
    onSecondary: '#27272A',
    secondaryContainer: '#3F3F46',
    onSecondaryContainer: '#F4F4F5',

    tertiary: '#FCD34D',
    onTertiary: '#422006',
    tertiaryContainer: '#78350F',
    onTertiaryContainer: '#FDE68A',

    background: '#18181B',
    onBackground: '#F4F4F5',
    surface: '#232326',
    onSurface: '#F4F4F5',
    surfaceVariant: '#2F2F35',
    onSurfaceVariant: '#D4D4D8',
    outline: '#52525B',

    error: '#F87171',
    errorContainer: '#7F1D1D',
    onErrorContainer: '#FEE2E2',
    onSurfaceDisabled: '#71717A',

    // Success palette
    success: '#4ADE80',
    successContainer: '#14532D',
    onSuccessContainer: '#DCFCE7',
  } as any,
};

export type ThemeMode = 'light' | 'dark' | 'system';

export const getTheme = (mode: 'light' | 'dark'): MD3Theme => {
  return mode === 'dark' ? darkTheme : lightTheme;
};

export { lightTheme, darkTheme };

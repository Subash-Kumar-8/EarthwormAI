// Earthworm AI Theme definitions matched to Figma designs

export const COLORS = {
  primary: '#348B47',         // Bright Figma Green
  primaryDark: '#266835',     // Deep Green
  primaryLight: '#E8F5E9',    // Light Green Tint
  leafGreen: '#81C784',       // Logo Top Leaf Green
  chatAiGreen: '#52AD64',     // AI Assistant Chat Bubble Green
  chatUserGreen: '#266835',   // User Chat Bubble Green
  soilBrown: '#6D4C41',       // Earthy Soil Brown from Logo
  accent: '#FFB300',          // Gold Accent
  weatherPeach: '#FFF2EC',    // Weather Card Light Peach Tint
  fertilizerOrange: '#FF9800',// Fertilizer Diagnostics Orange Card
  background: '#F4F6F4',      // Soft Light Background
  surface: '#FFFFFF',         // Card Background
  surfaceVariant: '#EAEAEA',  // Input/Card Surface Gray
  inputDark: 'rgba(0, 0, 0, 0.22)', // Dark Translucent Input Fill for Auth
  text: '#1B1B1B',            // Dark Text
  textLight: '#FFFFFF',       // Light/White Text
  textSecondary: '#666666',   // Muted Gray Text
  textMuted: '#999999',       // Caption Text
  border: '#E0E0E0',          // Subtle Border Stroke
  
  // Status Colors
  success: '#348B47',
  successLight: '#E8F5E9',
  danger: '#E53935',
  dangerLight: '#FFEBEE',
  warning: '#F57C00',
  warningLight: '#FFF3E0',
  info: '#0288D1',

  white: '#FFFFFF',
  black: '#000000',
  transparent: 'transparent',
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 40,
};

export const RADIUS = {
  xs: 6,
  sm: 10,
  md: 16,
  lg: 24,
  full: 9999,
};

export const TYPOGRAPHY = {
  fontSize: {
    xs: 11,
    sm: 13,
    md: 15,
    lg: 18,
    xl: 22,
    xxl: 28,
    display: 34,
  },
  fontWeight: {
    regular: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },
};

export const SHADOWS = {
  small: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  medium: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  large: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 10,
  },
};

const theme = {
  COLORS,
  SPACING,
  RADIUS,
  TYPOGRAPHY,
  SHADOWS,
};

export default theme;

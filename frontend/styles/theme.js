// Default theme
export const COLORS = {
  primary: '#1B4332',
  primaryMed: '#2D6A4F',
  primaryLight: '#52B788',
  sage: '#74C69D',
  mint: '#95D5B2',
  paleGreen: '#D8F3DC',
  background: '#F8F5EE',
  surface: '#FFFFFF',
  card: '#FDFCF9',
  warning: '#C96A12',
  warningBg: '#FFF3E0',
  warningBadge: '#F4A261',
  danger: '#C0392B',
  success: '#2D6A4F',
  textDark: '#1A2816',
  textMid: '#3D5A3E',
  textLight: '#6B7F6C',
  textMuted: '#9CAD9D',
  border: '#E4E8E0',
  divider: '#EDEBE5',
  overlay: 'rgba(0,0,0,0.45)',
  tabBar: '#FFFFFF',
  tabBarActive: '#1B4332',
  tabBarInactive: '#9CAD9D',
  inputBg: '#F4F2EB',
};

// Eco theme — deep forest greens, earthy tones, nature feel
export const ECO_COLORS = {
  primary: '#1B5E20',
  primaryMed: '#2E7D32',
  primaryLight: '#66BB6A',
  sage: '#81C784',
  mint: '#A5D6A7',
  paleGreen: '#C8E6C9',
  background: '#E8F5E9',     // ← distinct light green background
  surface: '#F1F8E9',        // ← green-tinted surface
  card: '#DCEDC8',           // ← noticeably green cards
  warning: '#E65100',
  warningBg: '#FFF3E0',
  warningBadge: '#FF8F00',
  danger: '#C62828',
  success: '#2E7D32',
  textDark: '#1A3520',       // ← green-tinted text
  textMid: '#2E5338',
  textLight: '#4E7A58',
  textMuted: '#78A882',
  border: '#A5D6A7',         // ← green borders
  divider: '#C8E6C9',        // ← green dividers
  overlay: 'rgba(0,30,0,0.5)',
  tabBar: '#1B5E20',         // ← DARK FOREST GREEN tab bar
  tabBarActive: '#A5D6A7',   // ← mint green active labels
  tabBarInactive: 'rgba(255,255,255,0.5)',
  inputBg: '#E8F5E9',
};

// Premium theme — rich charcoal + gold accents throughout
export const PREMIUM_COLORS = {
  primary: '#1A3020',
  primaryMed: '#1E5C3A',
  primaryLight: '#C9A84C',   // ← GOLD replaces light green
  sage: '#C9A84C',           // ← GOLD (used for accents everywhere)
  mint: '#E8C84A',           // ← bright gold
  paleGreen: '#FEF3D0',      // ← golden pale (all light-bg areas turn gold)
  background: '#FFFEF7',     // ← warm cream background
  surface: '#FFFFFF',
  card: '#FFFDF0',           // ← gold-tinted cards
  warning: '#C96A12',
  warningBg: '#FFF3E0',
  warningBadge: '#F4A261',
  danger: '#C0392B',
  success: '#1E5C3A',
  textDark: '#1A1A0E',       // ← warm dark text
  textMid: '#3D4A2E',
  textLight: '#6B7050',
  textMuted: '#A09870',
  border: '#D4B483',         // ← golden borders
  divider: '#EDD895',        // ← golden dividers
  overlay: 'rgba(0,0,0,0.5)',
  tabBar: '#162720',         // ← VERY DARK charcoal-green tab bar
  tabBarActive: '#D4AC0D',   // ← GOLD active labels/icons
  tabBarInactive: 'rgba(255,255,255,0.4)',
  inputBg: '#FFFBEF',
  gold: '#D4AC0D',
  goldLight: '#FFF8DC',
};

// Admin panel — corporate, not affected by user themes
export const ADMIN_COLORS = {
  primary: '#1B4332',
  primaryMed: '#2D6A4F',
  background: '#F0F4F8',
  surface: '#FFFFFF',
  card: '#FFFFFF',
  headerBg: '#1B4332',
  headerText: '#FFFFFF',
  danger: '#C0392B',
  dangerBg: '#FFEAEA',
  dangerBorder: '#F5C6CB',
  warning: '#C96A12',
  warningBg: '#FFF3E0',
  info: '#2471A3',
  infoBg: '#EBF5FB',
  success: '#1E8449',
  successBg: '#E8F8F0',
  textDark: '#1A202C',
  textMid: '#4A5568',
  textLight: '#718096',
  textMuted: '#A0AEC0',
  border: '#E2E8F0',
  divider: '#EDF2F7',
  tabBar: '#1B4332',
  tabBarActive: '#95D5B2',
  tabBarInactive: 'rgba(255,255,255,0.5)',
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const RADIUS = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  pill: 50,
};

export const SHADOW = {
  soft: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 8,
    elevation: 3,
  },
  medium: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.10,
    shadowRadius: 12,
    elevation: 5,
  },
  strong: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.13,
    shadowRadius: 16,
    elevation: 8,
  },
};

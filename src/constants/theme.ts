// Colours and spacing, matching the website's Tailwind palette (emerald and slate)
export const colors = {
  primary: "#059669", // emerald-600
  primaryDark: "#047857", // emerald-700
  primaryDeep: "#065f46", // emerald-800
  primarySoft: "#ecfdf5", // emerald-50
  primaryBorder: "#6ee7b7", // emerald-300
  teal: "#0f766e", // teal-700
  amber: "#d97706", // amber-600
  amberSoft: "#fffbeb", // amber-50
  amberBorder: "#fde68a", // amber-200
  amberText: "#92400e", // amber-800
  sky: "#0284c7", // sky-600
  skySoft: "#f0f9ff", // sky-50
  red: "#dc2626", // red-600
  redSoft: "#fef2f2", // red-50
  redBorder: "#f87171", // red-400
  text: "#0f172a", // slate-900
  textBody: "#334155", // slate-700
  textMuted: "#64748b", // slate-500
  textFaint: "#94a3b8", // slate-400
  border: "#e2e8f0", // slate-200
  divider: "#f1f5f9", // slate-100
  surface: "#ffffff",
  background: "#f8fafc", // slate-50
  white: "#ffffff",
} as const;

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 999,
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
} as const;

export const shadow = {
  shadowColor: "#0f172a",
  shadowOpacity: 0.06,
  shadowRadius: 8,
  shadowOffset: { width: 0, height: 2 },
  elevation: 2,
} as const;

// The two gradient colours of the course and flashcard banners
export const brandGradient = [colors.primary, colors.teal] as const;

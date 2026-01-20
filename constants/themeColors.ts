export const themeColors = {
  Royal: "#0E0E55",
  Culture: "#34A853",
  Ginger: "#EA4335",
  Happy: "#FBBC05",
} as const;

export type ThemeColorKey = keyof typeof themeColors;

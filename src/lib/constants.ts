export const THEMES = {
  LIGHT: "light",
  DARK: "dark",
  SYSTEM: "system",
  CYBERPUNK: "cyberpunk",
} as const

export type Theme = (typeof THEMES)[keyof typeof THEMES]

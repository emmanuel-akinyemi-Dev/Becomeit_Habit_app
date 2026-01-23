import { themes, tokens } from "@tamagui/themes";
import { createTamagui } from "tamagui";
import colors from "./constants/colors";

const appTokens = {
  color: {
    primary: colors.primary,
    secondary: colors.secondary,
    background: colors.background,
    text: colors.text,
    success: colors.success,
    warning: colors.warning,
    danger: colors.danger,
  },
};

const appThemes = {
  light: {
    background: colors.background,
    color: colors.text,
    primary: colors.primary,
    secondary: colors.secondary,
  },
  dark: {
    background: colors.primary,
    color: colors.white,
    primary: colors.secondary,
    secondary: "#B3B3FF",
  },
};

const config = createTamagui({
  tokens: {
    ...tokens,
    ...appTokens,
  },
  themes: {
    ...themes,
    ...appThemes,
  },
});

export type AppConfig = typeof config;

declare module "tamagui" {
  interface TamaguiCustomConfig extends AppConfig {}
}

export default config;

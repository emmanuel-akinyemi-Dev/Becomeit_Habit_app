// tamagui.config.ts
import { createTamagui } from 'tamagui' 
import { themes ,tokens} from '@tamagui/themes'

export const config = createTamagui({
  tokens,
  themes: {
    light: themes.light,
    dark: themes.dark,
  },
  media: {
    // optional media queries
    // sm: '(max-width: 640px)',
    // md: '(max-width: 768px)',
    // lg: '(max-width: 1024px)',
  },
  // animations: {},
})

export type AppTheme = typeof themes


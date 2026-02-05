import type { VuetifyOptions } from 'vuetify'

export const vuetifyOptions: VuetifyOptions = {
  icons: {
    defaultSet: 'mdi',
    sets: ['mdi', 'fa'] as any
  },
  theme: {
    defaultTheme: 'light',
    themes: {
      light: {
        dark: false,
        colors: {
          primary: '#1976D2',
          secondary: '#424242',
          accent: '#82B1FF',
          error: '#FF5252',
          info: '#2196F3',
          success: '#4CAF50',
          warning: '#FB8C00',
        },
        variables: {
          'font-family': 'Kanit, Roboto, sans-serif',
        }
      },
      dark: {
        dark: true,
        colors: {
          primary: '#2196F3',
          secondary: '#424242',
          accent: '#FF4081',
          error: '#FF5252',
          info: '#2196F3',
          success: '#4CAF50',
          warning: '#FB8C00',
        },
        variables: {
          'font-family': 'Kanit, Roboto, sans-serif',
        }
      }
    }
  },
  defaults: {
    VBtn: {
      rounded: 'lg',
    },
    VCard: {
      rounded: 'lg',
    },
    VTextField: {
      variant: 'outlined',
      hideDetails: 'auto',
    }
  }
}

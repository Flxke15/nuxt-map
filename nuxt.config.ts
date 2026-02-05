// https://nuxt.com/docs/api/configuration/nuxt-config
import { vuetifyOptions } from './vuetify.config'

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: ['vuetify-nuxt-module', '@nuxtjs/google-fonts'],
  devServer: {
    port: 8080
  },

  // Global CSS
  css: ['~/assets/css/main.css'],

  // Google Fonts config
  googleFonts: {
    families: {
      // ค่าใน Array คือ Font Weight (น้ำหนักตัวอักษร)
      // ภาษาอังกฤษ
      Roboto: [100, 300, 400, 500, 700, 900],
      // ภาษาไทย
      Sarabun: true,
      Kanit: [400, 500, 700],
    },
    display: 'swap', // ป้องกัน FOUT
    preload: true,
  },
  vuetify: {
    vuetifyOptions: vuetifyOptions as any
  },
  app: {
    pageTransition: { name: 'page', mode: 'out-in' },
  },
})

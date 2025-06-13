// @ts-check
import { defineConfig } from 'astro/config';



// https://astro.build/config
export default defineConfig({
  integrations: [],

  vite: {
    resolve: {
      alias: {
        '@': '/src',
        '@components': '/src/components',
        '@assets': '/src/assets',
        '@styles': '/src/styles',
        '@layouts': '/src/layouts',
      },
    },

  },
});
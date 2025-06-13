// @ts-check
import { defineConfig } from 'astro/config';



import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({


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
    plugins: [tailwindcss()],
  },
});
import { defineConfig } from 'astro/config';
import vue from '@astrojs/vue';
import tailwindcss from '@tailwindcss/vite';
import node from '@astrojs/node';

export default defineConfig({
  output: 'server',
  integrations: [vue()],
  adapter: node({
    mode: 'standalone',
  }),
  vite: {
    resolve: {
      alias: {
        '@': './src',
        '@components': './src/components',
        '@assets': './src/assets',
        '@styles': './src/styles',
        '@layouts': './src/layouts',
      },
    },
    plugins: [tailwindcss()],
  },
});
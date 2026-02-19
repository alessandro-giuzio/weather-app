import { defineConfig } from 'astro/config';
import vue from '@astrojs/vue';
import tailwindcss from '@tailwindcss/vite';
import netlify from '@astrojs/netlify';

export default defineConfig({
  output: 'server',
  integrations: [vue()],
  adapter: netlify(),
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

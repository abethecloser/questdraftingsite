import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://shaningrid1207.github.io',
  base: '/questdrafting',
  trailingSlash: 'ignore',
  integrations: [sitemap()],
});

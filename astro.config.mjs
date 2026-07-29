import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://abethecloser.github.io',
  base: '/questdraftingsite',
  trailingSlash: 'ignore',
  integrations: [sitemap()],
});

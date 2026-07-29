import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  // Vercel serves at the domain root, so no `base` subpath.
  // Update `site` to your final Vercel domain (or custom domain) for
  // correct canonical URLs and sitemap.
  site: 'https://questdraftingsite.vercel.app',
  trailingSlash: 'ignore',
  integrations: [sitemap()],
});

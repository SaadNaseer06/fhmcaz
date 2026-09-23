// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

// Local XAMPP: /fhmcaz/  |  Vercel (root domain): /
const isVercel = process.env.VERCEL === '1' || process.env.DEPLOY_TARGET === 'vercel';
const site =
  process.env.SITE_URL ||
  (isVercel ? 'https://example.vercel.app' : 'http://localhost/fhmcaz');
const base = process.env.BASE_PATH || (isVercel ? '/' : '/fhmcaz/');

export default defineConfig({
  site,
  base,
  trailingSlash: 'always',
  vite: {
    plugins: [tailwindcss()],
  },
});

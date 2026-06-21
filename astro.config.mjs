// @ts-check
import { defineConfig } from 'astro/config';
import icon from 'astro-icon';
import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  site: 'https://yizhe.me',
  integrations: [
    icon({
      include: {
        'simple-icons': ['*'],
        devicon: ['*']
      }
    })
  ],
  vite: {
    plugins: [tailwindcss()]
  }
});

import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import { replaceCodePlugin } from "vite-plugin-replace";

const production = 'import.meta.env.PROD';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    replaceCodePlugin({
      replacements: [
        {
          from: "isProduction",
          to: production,
        },
      ],
    }),
    svelte(),
  ],
})

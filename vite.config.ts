import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import replace from "vite-plugin-filter-replace";

const production = 'import.meta.env.PROD';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    replace([
      {
        filter: "src/lib/consts.ts",
        replace: {
          from: "isProduction",
          to: production,
        },
      },
    ]),
    svelte(),
  ],
})

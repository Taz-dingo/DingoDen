// @ts-check

import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import vue from "@astrojs/vue";
import tailwind from "@astrojs/tailwind";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// https://astro.build/config
export default defineConfig({
  site: "https://example.com",
  integrations: [
    mdx(),
    sitemap(),
    react({ include: ["**/*.mdx"] }),
    vue(),
    tailwind({ applyBaseStyles: false }),
  ],
  redirects: {
    "/": "/blog",
  },
  vite: {
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "src"),
      },
    },
  },
});

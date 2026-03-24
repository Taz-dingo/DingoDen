// @ts-check

import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import vue from "@astrojs/vue";
import tailwind from "@astrojs/tailwind";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const siteUrl = process.env.PUBLIC_SITE_URL
  ? process.env.PUBLIC_SITE_URL
  : process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : "https://example.com";

// https://astro.build/config
export default defineConfig({
  site: siteUrl,
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

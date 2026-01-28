import eslint from "@eslint/js";
import tseslint from "typescript-eslint";
import pluginAstro from "eslint-plugin-astro";
import pluginVue from "eslint-plugin-vue";
import globals from "globals";

export default tseslint.config(
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  ...pluginAstro.configs["flat/recommended"],
  {
    // Config for Vue files
    files: ["**/*.vue"],
    extends: [...pluginVue.configs["flat/vue2-recommended"]],
    languageOptions: {
      parser: pluginVue.parser,
      parserOptions: {
        parser: tseslint.parser,
        sourceType: "module",
      },
      globals: {
        ...globals.browser,
      },
    },
  },
  {
    // Global rules overrides
    rules: {
      // "astro/no-set-html-directive": "error"
    },
  },
  {
    // Global ignores
    ignores: ["dist/", ".astro/", "postcss.config.cjs"],
  },
);

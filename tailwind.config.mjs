import typography from "@tailwindcss/typography";

/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}"],
  theme: {
    extend: {
      typography: ({ theme }) => ({
        DEFAULT: {
          css: {
            // 移除行内代码块前后的反引号
            "code::before": {
              content: '""',
            },
            "code::after": {
              content: '""',
            },
            // 恢复正常字重并添加背景色和边距
            code: {
              fontWeight: "400",
              backgroundColor: theme("colors.gray.100"),
              padding: "0.2rem 0.4rem",
              borderRadius: "0.25rem",
            },
          },
        },
        invert: {
          css: {
            // 移除行内代码块前后的反引号
            "code::before": {
              content: '""',
            },
            "code::after": {
              content: '""',
            },
            // 恢复正常字重并添加背景色和边距
            code: {
              color: theme("colors.gray.200"),
              fontWeight: "400",
              backgroundColor: theme("colors.gray.800"),
              padding: "0.2rem 0.4rem",
              borderRadius: "0.25rem",
            },
          },
        },
      }),
    },
  },
  plugins: [typography()],
};

import typography from "@tailwindcss/typography";

/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class", "class"],
  content: ["./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}"],
  theme: {
    extend: {
      colors: {
        highlight: 'var(--highlight-color)',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))'
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))'
        },
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))'
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))'
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))'
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))'
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))'
        },
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        chart: {
          '1': 'hsl(var(--chart-1))',
          '2': 'hsl(var(--chart-2))',
          '3': 'hsl(var(--chart-3))',
          '4': 'hsl(var(--chart-4))',
          '5': 'hsl(var(--chart-5))'
        }
      },
      ypography: ({ theme }) => ({
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
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)'
      }
    }
  },
  plugins: [typography(), require("tailwindcss-animate")],
};

import type { Config } from "tailwindcss";
import tailwindcssAnimate from "tailwindcss-animate";

export default {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontSize: {
        xs: ["clamp(0.75rem, 0.72rem + 0.15vw, 0.875rem)", { lineHeight: "1.25" }],
        sm: ["clamp(0.875rem, 0.84rem + 0.175vw, 1rem)", { lineHeight: "1.5" }],
        base: ["clamp(1rem, 0.97rem + 0.15vw, 1.125rem)", { lineHeight: "1.5" }],
        lg: ["clamp(1.125rem, 1.06rem + 0.325vw, 1.25rem)", { lineHeight: "1.75" }],
        xl: ["clamp(1.25rem, 1.15rem + 0.5vw, 1.5rem)", { lineHeight: "1.6" }],
        "2xl": ["clamp(1.5rem, 1.35rem + 0.75vw, 2rem)", { lineHeight: "1.3" }],
        "3xl": ["clamp(1.875rem, 1.65rem + 1.125vw, 2.5rem)", { lineHeight: "1.2" }],
        "4xl": ["clamp(2.25rem, 1.9rem + 1.75vw, 3rem)", { lineHeight: "1.15" }],
        "5xl": ["clamp(2.75rem, 2.25rem + 2.5vw, 3.75rem)", { lineHeight: "1" }],
        "6xl": ["clamp(3.25rem, 2.6rem + 3.25vw, 4.5rem)", { lineHeight: "1" }],
      },
      colors: {
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        chart: {
          "1": "hsl(var(--chart-1))",
          "2": "hsl(var(--chart-2))",
          "3": "hsl(var(--chart-3))",
          "4": "hsl(var(--chart-4))",
          "5": "hsl(var(--chart-5))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
    },
  },
  plugins: [tailwindcssAnimate],
} satisfies Config;

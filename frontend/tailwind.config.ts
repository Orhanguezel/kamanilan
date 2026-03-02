import type { Config } from "tailwindcss";

const config = {
  darkMode: ["class"],
  content: [
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  safelist: [
    // Custom page (dangerouslySetInnerHTML) gradient / color utilities
    { pattern: /^bg-gradient-to-(r|l|t|b|br|bl|tr|tl)$/ },
    { pattern: /^(from|to|via)-(slate|blue|white|black|gray)-(50|100|200|300|400|500|600|700|800|900|950)$/ },
    { pattern: /^text-(slate|blue|white|black|gray)-(50|100|200|300|400|500|600|700|800|900|950)$/ },
    { pattern: /^text-white(\/\d+)?$/ },
    { pattern: /^bg-(slate|blue|white|black|gray)-(50|100|200|300|400|500|600|700|800|900|950)$/ },
    { pattern: /^border-(slate|blue|gray)-(100|200|300|400|500|600|700|800|900)$/ },
    { pattern: /^border-(l|r|t|b)-(\d)$/ },
    "shrink-0",
    "space-y-1", "space-y-2", "space-y-4", "space-y-5",
    "leading-relaxed",
    "rounded-r-lg",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "1rem",
      screens: {
        "2xl": "1536px",
      },
    },
    fontFamily: {
      sans:  ['var(--font-nunito)', 'Nunito', 'system-ui', 'sans-serif'],
      serif: ['var(--font-playfair)', 'Playfair Display', 'Georgia', 'serif'],
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        marquee: {
          "0%": { transform: "translateX(0%)" },
          "100%": { transform: "translateX(-50%)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        marquee: "marquee 30s linear infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;

export default config;

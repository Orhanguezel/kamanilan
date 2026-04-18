import type { Config } from "tailwindcss";

/**
 * Kamanilan Design Tokens — warm Anatolian / editorial local-luxury palette.
 * Baz: kamanilan-premium.html §DESIGN TOKENS
 * HSL degerleri src/app/globals.css :root icinde, burada Tailwind utility alias'i.
 */
const config = {
  darkMode: ["class"],
  content: [
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  safelist: [
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
        "2xl": "1280px",
      },
    },
    fontFamily: {
      sans:     ["var(--font-manrope)", "system-ui", "sans-serif"],
      serif:    ["var(--font-fraunces)", "Georgia", "serif"],
      mono:     ["var(--font-mono)", "ui-monospace", "monospace"],
      // Premium pattern aliases
      manrope:  ["var(--font-manrope)", "system-ui", "sans-serif"],
      fraunces: ["var(--font-fraunces)", "Georgia", "serif"],
    },
    extend: {
      colors: {
        // --- shadcn system (mevcut) ---
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

        // --- Kamanilan Editorial Palette (premium pattern) ---
        // Toprak tonlari — ink → paper
        ink:        "hsl(var(--col-ink) / <alpha-value>)",
        espresso:   "hsl(var(--col-espresso) / <alpha-value>)",
        walnut:     "hsl(var(--col-walnut) / <alpha-value>)",
        bark:       "hsl(var(--col-bark) / <alpha-value>)",
        hazel:      "hsl(var(--col-hazel) / <alpha-value>)",
        wheat:      "hsl(var(--col-wheat) / <alpha-value>)",
        parchment:  "hsl(var(--col-parchment) / <alpha-value>)",
        ivory:      "hsl(var(--col-ivory) / <alpha-value>)",
        cream:      "hsl(var(--col-cream) / <alpha-value>)",
        paper:      "hsl(var(--col-paper) / <alpha-value>)",

        // Vurgu renkleri
        saffron: {
          DEFAULT: "hsl(var(--col-saffron) / <alpha-value>)",
          2:       "hsl(var(--col-saffron-2) / <alpha-value>)",
        },
        ember:      "hsl(var(--col-ember) / <alpha-value>)",
        olive:      "hsl(var(--col-olive) / <alpha-value>)",
        moss:       "hsl(var(--col-moss) / <alpha-value>)",
        sage:       "hsl(var(--col-sage) / <alpha-value>)",

        // Yardimci metin tonlari
        text: {
          DEFAULT: "hsl(var(--text) / <alpha-value>)",
          2:       "hsl(var(--text-2) / <alpha-value>)",
          3:       "hsl(var(--text-3) / <alpha-value>)",
        },

        // Yardimci yuzey + cizgi tonlari
        surface: {
          DEFAULT: "hsl(var(--surface) / <alpha-value>)",
          2:       "hsl(var(--surface-2) / <alpha-value>)",
        },
        line: {
          DEFAULT: "hsl(var(--line) / <alpha-value>)",
          2:       "hsl(var(--line-2) / <alpha-value>)",
        },

        // Fonksiyonel durum renkleri
        success: "hsl(var(--success) / <alpha-value>)",
        danger:  "hsl(var(--danger) / <alpha-value>)",
      },
      borderRadius: {
        sm: "var(--radius-sm)",
        md: "calc(var(--radius) - 2px)",
        lg: "var(--radius)",
        xl: "var(--radius-lg)",
      },
      boxShadow: {
        // Premium pattern — walnut-tinted warm shadows
        "editorial-1": "var(--shadow-1)",
        "editorial-2": "var(--shadow-2)",
        "editorial-3": "var(--shadow-3)",
      },
      transitionTimingFunction: {
        editorial: "cubic-bezier(0.22, 1, 0.36, 1)",
      },
      maxWidth: {
        container: "var(--container-max)",
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
        "accordion-up":   "accordion-up 0.2s ease-out",
        marquee:          "marquee 30s linear infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;

export default config;

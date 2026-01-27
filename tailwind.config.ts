import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // Elegant brand colors - refined indigo
        brand: {
          50: "#eef2ff",
          100: "#e0e7ff",
          200: "#c7d2fe",
          300: "#a5b4fc",
          400: "#818cf8",
          500: "#6366f1",
          600: "#4f46e5",
          700: "#4338ca",
          800: "#3730a3",
          900: "#312e81",
          950: "#1e1b4b",
        },
        // Elegant surface palette - Pure white to jet black
        surface: {
          // Light mode surfaces - clean whites and subtle grays
          50: "#ffffff",    // Pure white - main background
          100: "#fafafa",   // Very subtle off-white for cards
          150: "#f5f5f5",   // Light gray for secondary surfaces
          200: "#e5e5e5",   // Borders, dividers
          300: "#d4d4d4",   // Muted borders
          400: "#a3a3a3",   // Placeholder text
          500: "#737373",   // Muted text
          600: "#525252",   // Secondary text
          700: "#404040",   // Primary text (light mode)
          // Dark mode surfaces - jet black with subtle grays
          800: "#171717",   // Cards in dark mode - subtle gray
          850: "#0d0d0d",   // Elevated surfaces
          900: "#0a0a0a",   // Near black background
          950: "#000000",   // True jet black - main dark background
        },
        // Accent colors - elegant and muted
        accent: {
          gold: "#d4af37",      // Elegant gold
          emerald: "#10b981",   // Vibrant emerald
          cyan: "#06b6d4",      // Clean cyan
          rose: "#f43f5e",      // Modern rose
          blue: "#3b82f6",      // Professional blue
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
        display: ["Inter", "system-ui", "sans-serif"],
      },
      boxShadow: {
        // Light mode shadows - soft and professional
        "soft-sm": "0 1px 2px 0 rgba(0, 0, 0, 0.03), 0 1px 3px 0 rgba(0, 0, 0, 0.05)",
        "soft": "0 2px 4px -1px rgba(0, 0, 0, 0.04), 0 4px 6px -1px rgba(0, 0, 0, 0.06)",
        "soft-md": "0 4px 6px -2px rgba(0, 0, 0, 0.04), 0 10px 15px -3px rgba(0, 0, 0, 0.08)",
        "soft-lg": "0 10px 25px -5px rgba(0, 0, 0, 0.06), 0 20px 40px -10px rgba(0, 0, 0, 0.1)",
        "soft-xl": "0 20px 50px -12px rgba(0, 0, 0, 0.15)",
        // Card shadows
        "card": "0 1px 3px rgba(0, 0, 0, 0.04), 0 1px 2px rgba(0, 0, 0, 0.02)",
        "card-hover": "0 4px 12px rgba(0, 0, 0, 0.08), 0 2px 4px rgba(0, 0, 0, 0.04)",
        // Dark mode shadows
        "glass": "0 0 0 1px rgba(255,255,255,0.05), 0 1px 2px rgba(0,0,0,0.2)",
        "glass-lg": "0 0 0 1px rgba(255,255,255,0.05), 0 8px 32px rgba(0,0,0,0.3)",
        "glow": "0 0 20px rgba(91, 108, 242, 0.2)",
        "glow-brand": "0 0 30px rgba(91, 108, 242, 0.25)",
        "glow-success": "0 0 20px rgba(5, 150, 105, 0.2)",
        "glow-gold": "0 0 20px rgba(184, 134, 11, 0.2)",
        "elevation-1": "0 1px 3px rgba(0,0,0,0.4), 0 1px 2px rgba(0,0,0,0.3)",
        "elevation-2": "0 4px 6px rgba(0,0,0,0.4), 0 2px 4px rgba(0,0,0,0.3)",
        "elevation-3": "0 10px 20px rgba(0,0,0,0.4), 0 6px 6px rgba(0,0,0,0.3)",
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic": "conic-gradient(var(--tw-gradient-stops))",
        "grid-pattern": "linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)",
        "noise": "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E\")",
        "jet-gradient": "linear-gradient(180deg, #09090b 0%, #030303 100%)",
        "card-gradient": "linear-gradient(135deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)",
      },
      animation: {
        "fade-in": "fadeIn 0.5s ease-out",
        "fade-in-up": "fadeInUp 0.5s ease-out",
        "fade-in-down": "fadeInDown 0.5s ease-out",
        "slide-up": "slideUp 0.4s ease-out",
        "slide-down": "slideDown 0.4s ease-out",
        "slide-in-right": "slideInRight 0.4s ease-out",
        "slide-in-left": "slideInLeft 0.4s ease-out",
        "scale-in": "scaleIn 0.3s ease-out",
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "pulse-glow": "pulseGlow 2s ease-in-out infinite",
        "float": "float 6s ease-in-out infinite",
        "marquee": "marquee 30s linear infinite",
        "marquee-reverse": "marquee-reverse 30s linear infinite",
        "shimmer": "shimmer 2s linear infinite",
        "spin-slow": "spin 8s linear infinite",
        "bounce-subtle": "bounceSubtle 2s ease-in-out infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        fadeInUp: {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        fadeInDown: {
          "0%": { opacity: "0", transform: "translateY(-20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        slideDown: {
          "0%": { opacity: "0", transform: "translateY(-10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        slideInRight: {
          "0%": { opacity: "0", transform: "translateX(20px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        slideInLeft: {
          "0%": { opacity: "0", transform: "translateX(-20px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        scaleIn: {
          "0%": { opacity: "0", transform: "scale(0.95)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        pulseGlow: {
          "0%, 100%": { boxShadow: "0 0 20px rgba(99, 102, 241, 0.2)" },
          "50%": { boxShadow: "0 0 40px rgba(99, 102, 241, 0.4)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
        marquee: {
          "0%": { transform: "translateX(0%)" },
          "100%": { transform: "translateX(-50%)" },
        },
        "marquee-reverse": {
          "0%": { transform: "translateX(-50%)" },
          "100%": { transform: "translateX(0%)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        bounceSubtle: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-5px)" },
        },
      },
      transitionTimingFunction: {
        "bounce-in": "cubic-bezier(0.68, -0.55, 0.265, 1.55)",
        "smooth": "cubic-bezier(0.4, 0, 0.2, 1)",
      },
    },
  },
  plugins: [],
};

export default config;

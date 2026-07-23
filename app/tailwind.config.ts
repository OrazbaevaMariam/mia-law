import type { Config } from "tailwindcss";

const config: Config = {
    content: [
        "./app/**/*.{ts,tsx}",
        "./components/**/*.{ts,tsx}",
        "./features/**/*.{ts,tsx}",
    ],
    darkMode: "class",
    theme: {
        extend: {
            colors: {
                bg: "#0B0B0F",
                surface: "#12121A",
                warmText: "#E8DCCF",
                muted: "#9F9487",
                gold: "#D4AF37",
                oliveBase: "#556B2F",
                forestDeep: "#1F2A1E",
                dustyRose: "#D8A1A1",
                roseGold: "#C7A06B",
                magic: "#6B4EFF",
            },
            fontFamily: {
                serif: ["Cormorant Garamond", "Playfair Display", "serif"],
            },
            keyframes: {
                breathe: {
                    "0%, 100%": { transform: "scale(1)" },
                    "50%": { transform: "scale(1.02)" },
                },
                fadeUp: {
                    "0%": { opacity: "0", transform: "translateY(30px)" },
                    "100%": { opacity: "1", transform: "translateY(0)" },
                },
                smokeDrift: {
                    "0%": { transform: "translate(0,0) scale(1)" },
                    "50%": { transform: "translate(3%,-2%) scale(1.05)" },
                    "100%": { transform: "translate(-3%,2%) scale(1.02)" },
                },
            },
            animation: {
                breathe: "breathe 6s ease-in-out infinite",
                fadeUp: "fadeUp 0.8s ease-in-out forwards",
                smokeDrift: "smokeDrift 26s ease-in-out infinite alternate",
            },
            transitionTimingFunction: {
                spring: "cubic-bezier(0.22, 1, 0.36, 1)",
            },
        },
    },
    plugins: [],
};

export default config;
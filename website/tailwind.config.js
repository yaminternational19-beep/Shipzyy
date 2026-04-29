/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: ['class', '[data-theme="dark"]'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "var(--primary)",
          hover: "var(--primary-hover)",
        },
        secondary: "var(--secondary)",
        success: "var(--success)",
        warning: "var(--warning)",
        danger: "var(--danger)",
        textMain: "var(--text-main)",
        textLight: "var(--text-light)",
        textMuted: "var(--text-muted)",
        bgSoft: "var(--bg-soft)",
        cardBg: "var(--card-bg)",
        borderMain: "var(--border)",
      },
      backgroundImage: {
        'brand-gradient': "var(--brand-gradient)",
      },
      boxShadow: {
        float: "var(--shadow-float)",
      },
      borderRadius: {
        xl: "var(--radius-xl)",
        md: "var(--radius-md)",
      }
    },
  },
  plugins: [],
}
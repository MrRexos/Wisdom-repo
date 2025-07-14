/** @type {import('tailwindcss').Config} */
const plugin = require('tailwindcss/plugin');

module.exports = {
  darkMode: 'class',
  content: [
    "./App.{js,jsx,ts,tsx}",
    "./screens/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
    "./navigation/**/*.{js,jsx,ts,tsx}",
    "./theme/**/*.{js,jsx,ts,tsx}"
  ],
  presets: [require("nativewind/preset")],
  safelist: [
    'color-scheme-dark',
    'color-scheme-light'
  ],
  theme: {
    extend: {
      fontFamily:{
        'inter-medium': ['Inter-Medium'],
        'inter-semibold': ['Inter-SemiBold'],
        'inter-bold': ['Inter-Bold'],
      },
    },
  },
  plugins: [
    plugin(function({ addUtilities }) {
      addUtilities({
        '.color-scheme-dark': { 'color-scheme': 'dark' },
        '.color-scheme-light': { 'color-scheme': 'light' },
      });
    }),
  ],
}


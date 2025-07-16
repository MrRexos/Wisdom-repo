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
    'color-scheme-light',
    'dark',
    'light'
  ],
  theme: {
    extend: {
      fontFamily:{
        'inter-medium': ['Inter-Medium'],
        'inter-semibold': ['Inter-SemiBold'],
        'inter-bold': ['Inter-Bold'],
      },
      spacing: {
        '0.5':  '2px',   // 0.5 * 4 = 2px
        '1':    '4px',   // 1   * 4 = 4px
        '1.5':  '6px',
        '2':    '8px',
        '2.5':  '10px',
        '3':    '12px',
        '3.5':  '14px',
        '4':    '16px',
        '4.5':  '18px',
        '5':    '20px',
        '5.5':  '22px',
        '6':    '24px',
        '6.5':  '26px',
        '7':    '28px',
        '7.5':  '30px',
        '8':    '32px',
        '8.5':  '34px',
        '9':    '36px',
        '9.5':  '38px',
        '10':   '40px',
        '10.5': '42px',
        '11':   '44px',
        '11.5': '46px',
        '12':   '48px',
        '12.5': '50px',
        '13':   '52px',
        '13.5': '54px',
        '14':   '56px',
        '14.5': '58px',
        '15':   '60px',
        '15.5': '62px',
        '16':   '64px',
        '16.5': '66px',
        '17':   '68px',
        '17.5': '70px',
        '18':   '72px',
        '18.5': '74px',
        '19':   '76px',
        '19.5': '78px',
        '20':   '80px',
      },
      fontSize: {
        xs:  ['12px', { lineHeight: '16px' }],   // text-xs
        sm:  ['14px', { lineHeight: '20px' }],   // text-sm
        base:['16px', { lineHeight: '24px' }],   // text-base
        lg:  ['18px', { lineHeight: '28px' }],   // text-lg
        xl:  ['20px', { lineHeight: '28px' }],   // text-xl
        '2xl':['24px', { lineHeight: '32px' }],  // text-2xl
        '3xl':['30px', { lineHeight: '36px' }],  // text-3xl
        '4xl':['36px', { lineHeight: '40px' }],  // text-4xl
        '5xl':['48px', { lineHeight: '48px' }],  // text-5xl
        '6xl':['60px', { lineHeight: '60px' }],  // text-6xl
        '7xl':['72px', { lineHeight: '72px' }],  // text-7xl
        '8xl':['96px', { lineHeight: '96px' }],  // text-8xl
        '9xl':['128px',{ lineHeight: '128px'}], // text-9xl
      },
    },
  },
  plugins: [
    plugin(function({ addUtilities }) {
      addUtilities({
        '.color-scheme-dark': { 'colorScheme': 'dark' },
        '.color-scheme-light': { 'colorScheme': 'light' },
      });
    }),
  ],
}


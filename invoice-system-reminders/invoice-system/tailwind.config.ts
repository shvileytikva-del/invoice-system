import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        brand: '#2D2B6B',
        brandLight: '#3E3C8A',
        brandPink: '#F0C4D8',
        brandPinkLight: '#F8E4EE',
        brandPinkPale: '#FDF5F9',
        ink: '#2D2B6B',
        paper: '#FDF5F9',
        line: '#E8D0DE',
        muted: '#6B5F78',
        pending: '#9E7C20',
        pendingBg: '#FFF6E0',
        paid: '#2E7D4F',
        paidBg: '#DCEBDF',
        overdue: '#B23A34',
        overdueBg: '#F6DCDA',
      },
      fontFamily: {
        display: ['"Frank Ruhl Libre"', 'serif'],
        body: ['"Heebo"', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

export default config;

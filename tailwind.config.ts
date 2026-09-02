import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        ink: '#22303F',
        paper: '#F6F4EE',
        line: '#D8D2C4',
        muted: '#5B6B7A',
        pending: '#B8862B',
        pendingBg: '#F7EAD1',
        paid: '#3C6E47',
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

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"General Sans"', '"Plus Jakarta Sans"', 'Inter', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
      },
      colors: {
        brand: {
          maroon: '#6A1E17',
          maroonLight: '#8B261D',
          red: '#B91C1C',
          dark: '#1A1A1A',
          darker: '#111111',
          gray: '#808080',
          border: '#E6E6E6',
          disabled: '#CCCCCC',
          error: '#ED1010',
          success: '#0C9409',
        },
      },
    },
  },
  plugins: [],
};

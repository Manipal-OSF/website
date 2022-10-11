module.exports = {
  darkMode: 'class',
  content: [
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        'primary': {
          DEFAULT: '#fdfffe',
          dark:'#333049'
        },
        'secondary': {
          DEFAULT:'#13304b',
          dark:'#fdfffe'
        },
        'accent':  {
          DEFAULT:'#42b6a2',
          dark:'#42b6a2'
        }
      }
   },
    
  },
  plugins: [require('daisyui')],
  daisyui: {
    themes: false,
  },
};

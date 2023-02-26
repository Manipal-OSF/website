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
          DEFAULT: '#a3dffd ',
          dark:'#333049'
        },
        'secondary': {
          DEFAULT:'#090a66  ',
          dark:'#f3ecff'
        },
        'accent':  {
          DEFAULT:'#4436fe',
          dark:'#b3c055'
        },
        'neutral': {
          DEFAULT:'#474554',
          dark:'#f5f5f5'
        }
      }
   },
    
  },
  plugins: [require('daisyui')],
  daisyui: {
    themes: false,
  },
};

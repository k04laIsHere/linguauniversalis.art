module.exports = {
  content: [
    './index.html',
    './src/**/*.{js,jsx,ts,tsx}'
  ],
  theme: {
    extend: {
      colors: {
        cinematic: '#0b0b0b',
        paper: '#e9e6e1',
        ochre: '#b76e2f'
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        serif: ['Merriweather', 'serif']
      }
    }
  },
  plugins: []
};
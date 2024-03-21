/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',

    // Or if using `src` directory:
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    fontFamily: {
      robot: ['IBMPlexMono-Regular', 'Arial'],
      'robot-bold': ['IBMPlexMono-Bold', 'Arial'],
      'robot-light': ['IBMPlexMono-Light', 'Arial'],
    },
    extend: {
      colors: {
        'odis-dark': '#1d2c5d',
        'odis-light': '#4c68c7', // #263C89
        'odis-light-2': '#e8ebf8',
        'odis-extra-light': '#F7F8FD',
        active: '#b3bf56',
        'warning-100': '#fff1f0',
        'warning-200': '#ffa39e',
        'warning-300': '#f5222d',
      },
      keyframes: {
        'lds-hourglass': {
          '0%': {
            transform: 'rotate(0)',
            'animation-timing-function': 'cubic-bezier(0.55, 0.055, 0.675, 0.19)',
          },
          '50%': {
            transform: 'rotate(900deg)',
            'animation-timing-function': 'cubic-bezier(0.215, 0.61, 0.355, 1)',
          },
          '100%': {
            transform: 'rotate(1800deg)',
          },
        },
      },

      animation: {
        'spin-slow': 'spin 3s linear infinite',
        'cross-spin-2': 'lds-hourglass 1.2s infinite',
      },
    },
  },
  plugins: [],
}

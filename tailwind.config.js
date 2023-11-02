/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './index.html', 
    './public/**/*.html', 
    './src/**/*.{vue,js,ts,jsx,tsx}',
    'node_modules/flowbite-vue/**/*.{js,jsx,ts,tsx}',
    'node_modules/flowbite/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {},
    fontFamily: {
      Roboto: ["Roboto", "sans-seif"],
    },
  },
  plugins: [
    require('flowbite/plugin'),
  ],
}


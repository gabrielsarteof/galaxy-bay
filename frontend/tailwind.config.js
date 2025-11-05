/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  // Tailwind v4 não precisa de theme.extend aqui
  // As customizações são feitas via @theme no globals.css
  plugins: [],
};

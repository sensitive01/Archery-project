/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        outfit: ['Outfit', 'sans-serif'],
        inter: ['Inter', 'sans-serif'],
      },
      colors: {
        brand: {
          navy: '#0E215C',   // Deep navy from "Rchry" text
          red: '#D21F3C',    // Vibrant red from the bow
          blue: '#3ABEF9',   // Sky blue from the flourish
          yellow: '#FFD700', // Gold/Yellow from the arrow
          dark: '#0B1120',   // Complementary dark for depth
        }
      },
      backgroundImage: {
        'glass-gradient': 'linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05))',
        'mesh-gradient': 'radial-gradient(at 10% 10%, rgba(210, 31, 60, 0.1) 0px, transparent 50%), radial-gradient(at 90% 90%, rgba(58, 190, 249, 0.1) 0px, transparent 50%)',
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(14, 33, 92, 0.2)',
        'premium': '0 20px 40px -15px rgba(0, 0, 0, 0.3)',
        'glow-red': '0 0 20px rgba(210, 31, 60, 0.3)',
        'glow-blue': '0 0 20px rgba(58, 190, 249, 0.3)',
      }
    },
  },
  plugins: [],
}

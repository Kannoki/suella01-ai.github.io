/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./lib/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        pastelPink: '#FFD2E1',
        pastelPurple: '#E8DFFF',
        brandDark: '#1A1D20',
        brandBg: '#FBFBFD',
        pastel: {
          pink: '#FFD2E1',
          purple: '#E8DFFF',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['"Playfair Display"', 'Georgia', 'serif'],
      },
      boxShadow: {
        'soft': '0 4px 30px rgba(0, 0, 0, 0.02)',
        'card': '0 4px 30px rgba(0, 0, 0, 0.02)',
        'card-hover': '0 10px 40px rgba(232, 223, 255, 0.4)',
        'glow-pink': '0 0 30px rgba(255, 210, 225, 0.5)',
        'glow-purple': '0 0 30px rgba(232, 223, 255, 0.5)',
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'float-delayed': 'float 6s ease-in-out 2s infinite',
        'float-slow': 'float 8s ease-in-out 1s infinite',
        'pulse-soft': 'pulseSoft 3s ease-in-out infinite',
        'spin-slow': 'spin 20s linear infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
          '50%': { transform: 'translateY(-20px) rotate(5deg)' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '0.6' },
          '50%': { opacity: '1' },
        },
      },
      backgroundImage: {
        'pastel-gradient': 'linear-gradient(135deg, #FFF0F5 0%, #E8DFFF 50%, #FFD2E1 100%)',
        'hero-gradient': 'linear-gradient(135deg, #FFF0F5 0%, #E8DFFF 40%, #FFD2E1 80%)',
      }
    },
  },
  plugins: [],
}

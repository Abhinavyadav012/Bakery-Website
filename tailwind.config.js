/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index-vite.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                cream: '#FFF8E7',
                gold: '#D4AF37',
                brown: {
                    50: '#fdf8f6',
                    100: '#f2e8e5',
                    200: '#eaddd7',
                    300: '#d6c5bc',
                    400: '#bfa094',
                    500: '#a18072',
                    600: '#8B5A2B',
                    700: '#795548',
                    800: '#5D4037',
                    900: '#3E2723',
                },
            },
            fontFamily: {
                display: ['Playfair Display', 'serif'],
                sans: ['Poppins', 'sans-serif'],
            },
        },
    },
    plugins: [],
};

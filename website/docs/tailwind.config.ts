/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./app/**/*.{js,ts,jsx,tsx,mdx}",
        "./components/**/*.{js,ts,jsx,tsx,mdx}",
        "./content/**/*.{mdx}"
    ],
    theme: {
        extend: {
            fontFamily: {
                'inter': ['var(--font-inter)', 'Inter', 'sans-serif'],
                'custom': ['var(--font-inter)', 'Inter', 'sans-serif'],
            },
        },
    },
    plugins: [],
}
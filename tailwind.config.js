/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        './app/**/*.{js,ts,jsx,tsx,mdx}',
        './pages/**/*.{js,ts,jsx,tsx,mdx}',
        './components/**/*.{js,ts,jsx,tsx,mdx}',
    ],
    theme: {
        extend: {
            colors: {
                // Основные цвета
                ink: 'var(--ink)',
                'deep-olive': 'var(--deep-olive)',
                'archive-olive': 'var(--archive-olive)',
                stone: 'var(--stone)',

                // Пергамент
                parchment: 'var(--parchment)',
                'parchment-deep': 'var(--parchment-deep)',
                ivory: 'var(--ivory)',

                // Бургундия
                burgundy: 'var(--burgundy)',
                'deep-wine': 'var(--deep-wine)',
                rose: 'var(--rose)',

                // Золото
                'antique-gold': 'var(--antique-gold)',
                'soft-gold': 'var(--soft-gold)',
                bronze: 'var(--bronze)',

                // Текст читалки
                'reader-text': 'var(--reader-text)',
                'reader-muted': 'var(--reader-muted)',
                'dark-text': 'var(--dark-text)',
                'dark-muted': 'var(--dark-muted)',
            },
            fontFamily: {
                reader: ['Literata', 'serif'],
                display: ['Cormorant Garamond', 'serif'],
                interface: ['Manrope', 'sans-serif'],
            },
            fontSize: {
                'h1': ['3rem', { lineHeight: '1.2' }],
                'h2': ['2.25rem', { lineHeight: '1.3' }],
                'h3': ['1.875rem', { lineHeight: '1.4' }],
                'reader-base': ['1.125rem', { lineHeight: '1.8' }],
                'ui-sm': ['0.875rem', { lineHeight: '1.5' }],
            },
            lineHeight: {
                reader: '1.8',
            },
            maxWidth: {
                reader: '680px',
            },
            letterSpacing: {
                archive: '0.15em',
            },
        },
    },
    plugins: [],
};
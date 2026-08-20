import { Literata, Cormorant_Garamond, Manrope, PT_Serif } from 'next/font/google';

export const literata = Literata({
    subsets: ['latin', 'cyrillic'],
    variable: '--font-reader',
    weight: ['400', '500', '600', '700'],
    display: 'swap',
});

export const cormorant = Cormorant_Garamond({
    subsets: ['latin', 'cyrillic'],
    variable: '--font-display',
    weight: ['400', '500', '600'],
    display: 'swap',
});

export const manrope = Manrope({
    subsets: ['latin', 'cyrillic'],
    variable: '--font-interface',
    weight: ['400', '500', '600', '700', '800'],
    display: 'swap',
});

export const ptSerif = PT_Serif({
    subsets: ['latin', 'cyrillic'],
    variable: '--font-fallback',
    weight: ['400', '700'],
    display: 'swap',
});
// /** @type {import('tailwindcss').Config} */
// module.exports = {
//     content: [
//         './app/**/*.{js,ts,jsx,tsx,mdx}',
//         './components/**/*.{js,ts,jsx,tsx,mdx}',
//         './features/**/*.{js,ts,jsx,tsx,mdx}',
//         './shared/**/*.{js,ts,jsx,tsx,mdx}',
//     ],
//     theme: {
//         extend: {
//             colors: {
//                 warmBg: '#F5F1E8',
//                 warmBgAccent: '#E8DFD5',
//                 warmText: '#2D2420',
//                 gold: '#D4A574',
//                 goldDark: '#B8885C',
//                 burgundy: '#5C3D2E',
//                 olive: '#6B7D3A',
//                 rose: '#C9A9A0',
//                 textMuted: '#6B5D52',
//                 muted: '#6B5D52',
//                 dustyRose: '#C9A9A0',
//
//                 // ЦВЕТА ДЛЯ ЧИТАЛКИ (темы чтения)
//                 readerSepia: '#F4ECD8',
//                 readerSepiaText: '#3B2F1E',
//                 readerDark: '#1C1810',
//                 readerDarkText: '#E8DCCF',
//                 readerBlack: '#000000',
//                 readerBlackText: '#D4D4D4',
//             },
//             fontFamily: {
//                 serif: ['Cinzel', 'serif'],   // заголовки (у тебя уже есть)
//                 body: ['Lora', 'serif'],       // обычный текст (у тебя уже есть)
//                 lora: ['Lora', 'serif'],       // алиас — для явности в ридере
//             },
//         },
//     },
//     plugins: [],
// };

/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        './app/**/*.{js,ts,jsx,tsx,mdx}',
        './components/**/*.{js,ts,jsx,tsx,mdx}',
        './features/**/*.{js,ts,jsx,tsx,mdx}',
        './shared/**/*.{js,ts,jsx,tsx,mdx}',
    ],
    theme: {
        extend: {
            colors: {
                warmBg: '#F5F1E8',
                warmBgAccent: '#E8DFD5',
                warmText: '#2D2420',
                gold: '#D4A574',
                goldDark: '#B8885C',
                burgundy: '#5C3D2E',
                olive: '#6B7D3A',
                rose: '#C9A9A0',
                textMuted: '#6B5D52',
                muted: '#6B5D52',
                dustyRose: '#C9A9A0',

                readerSepia: '#F4ECD8',
                readerSepiaText: '#3B2F1E',
                readerDark: '#1C1810',
                readerDarkText: '#E8DCCF',
                readerBlack: '#000000',
                readerBlackText: '#D4D4D4',

                // НОВОЕ: сказочная зелёная тема
                forestGreen: '#5C7A4A',
                forestGreenLight: '#7A9A66',
                mossLight: '#9BB088',
                fireflyGlow: '#F0F5B8',
            },
            fontFamily: {
                serif: ['Cinzel', 'serif'],
                body: ['Lora', 'serif'],
                lora: ['Lora', 'serif'],
            },
        },
    },
    plugins: [],
};
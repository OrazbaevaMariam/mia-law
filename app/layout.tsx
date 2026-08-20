import type { Metadata } from 'next';
import { literata, cormorant, manrope, ptSerif } from '@/app/lib/fonts';
import { Header } from '@/app/components/layout/Header';
import { AnalyticsProvider } from '@/app/providers/AnalyticsProvider';
import { Toaster } from 'react-hot-toast'
import '@/app/globals.css';

export const metadata: Metadata = {
    title: 'Архив запретных миров Мии Лоу',
    description: 'Романтический архив историй, писем и магических миров',
    openGraph: {
        title: 'Архив запретных миров Мии Лоу',
        description: 'Ты не случайно здесь.',
        type: 'website',
    },
    robots: {
        index: true,
        follow: true,
    },
};

export default function RootLayout({
                                       children,
                                   }: {
    children: React.ReactNode;
}) {
    return (
        <html
            lang="ru"
            className={`${literata.variable} ${cormorant.variable} ${manrope.variable} ${ptSerif.variable}`}
            suppressHydrationWarning
        >
        <head>
            <meta charSet="utf-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1" />
            <link rel="icon" href="/favicon.ico" />
        </head>
        <body
            className={`
                  bg-parchment text-reader-text
                  font-reader
                  antialiased
                `}
        >
        <AnalyticsProvider>
            <Header />
            <Toaster position="top-right" />
            {children}
        </AnalyticsProvider>
        </body>
        </html>
    );
}
"use client";

import { useEffect } from "react";
import posthog from "posthog-js";
import Script from "next/script";

const POSTHOG_KEY = process.env.NEXT_PUBLIC_POSTHOG_KEY!;
const POSTHOG_HOST = process.env.NEXT_PUBLIC_POSTHOG_HOST!;
const GA4_ID = process.env.NEXT_PUBLIC_GA4_ID!;

export function AnalyticsProvider({ children }: { children: React.ReactNode }) {
    useEffect(() => {
        if (typeof window !== "undefined" && POSTHOG_KEY) {
            posthog.init(POSTHOG_KEY, {
                api_host: POSTHOG_HOST,
                capture_pageview: true,
                capture_pageleave: true,
            });
        }
    }, []);

    return (
        <>
            {GA4_ID && (
                <>
                    <Script
                        src={`https://www.googletagmanager.com/gtag/js?id=${GA4_ID}`}
                        strategy="afterInteractive"
                    />
                    <Script id="ga4-init" strategy="afterInteractive">
                        {`
                            window.dataLayer = window.dataLayer || [];
                            function gtag(){dataLayer.push(arguments);}
                            gtag('js', new Date());
                            gtag('config', '${GA4_ID}');
                        `}
                    </Script>
                </>
            )}
            {children}
        </>
    );
}
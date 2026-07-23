"use client";

import React from "react";

interface GlowCardProps {
    children: React.ReactNode;
    delay?: number;
    className?: string;
}

export const GlowCard = ({ children, delay = 0, className = "" }: GlowCardProps) => {
    return (
        <div
            className={`
        relative rounded-xl backdrop-blur-sm
        border border-gold/40 hover:border-gold/80
        bg-warmBgAccent/50 hover:bg-warmBgAccent/80
        shadow-sm hover:shadow-xl
        transition-all duration-500
        ${className}
      `}
            style={{ transitionDelay: `${delay}s` }}
        >
            <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-rose/10 to-transparent pointer-events-none" />
            {children}
        </div>
    );
};
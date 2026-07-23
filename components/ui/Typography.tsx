import { ReactNode } from "react";

interface TypographyProps {
    children: ReactNode;
    className?: string;
}

export function Eyebrow({ children, className = "" }: TypographyProps) {
    return (
        <p className={`text-sm uppercase tracking-widest text-olive font-semibold ${className}`}>
            {children}
        </p>
    );
}

export function H1({ children, className = "" }: TypographyProps) {
    return (
        <h1 className={`text-7xl md:text-8xl font-serif font-bold tracking-tight ${className}`}>
            {children}
        </h1>
    );
}

export function H2({ children, className = "" }: TypographyProps) {
    return (
        <h2 className={`text-5xl md:text-6xl font-serif font-bold ${className}`}>
            {children}
        </h2>
    );
}

export function Body({ children, className = "" }: TypographyProps) {
    return (
        <p className={`text-lg leading-relaxed font-body text-textMuted ${className}`}>
            {children}
        </p>
    );
}
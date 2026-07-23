import { cn } from "@/lib/utils";
import { HTMLAttributes } from "react";

export function H1({ className, ...props }: HTMLAttributes<HTMLHeadingElement>) {
    return (
        <h1
            className={cn(
                "font-serif text-warmText leading-[1.1] tracking-tight",
                "text-4xl md:text-6xl lg:text-7xl",
                className
            )}
            {...props}
        />
    );
}

export function H2({ className, ...props }: HTMLAttributes<HTMLHeadingElement>) {
    return (
        <h2
            className={cn(
                "font-serif text-warmText leading-tight tracking-tight",
                "text-3xl md:text-4xl lg:text-5xl",
                className
            )}
            {...props}
        />
    );
}

export function Lead({ className, ...props }: HTMLAttributes<HTMLParagraphElement>) {
    return (
        <p
            className={cn(
                "text-muted font-serif text-lg md:text-xl leading-relaxed",
                className
            )}
            {...props}
        />
    );
}

export function Eyebrow({ className, ...props }: HTMLAttributes<HTMLSpanElement>) {
    return (
        <span
            className={cn(
                "uppercase tracking-[0.3em] text-xs text-roseGold/80 font-sans",
                className
            )}
            {...props}
        />
    );
}
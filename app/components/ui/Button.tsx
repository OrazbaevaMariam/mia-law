"use client";

import { ButtonHTMLAttributes, forwardRef } from "react";
import { cn } from "@/shared/lib/utils";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: "primary" | "ghost";
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant = "primary", children, ...props }, ref) => {
        return (
            <button
                ref={ref}
                className={cn(
                    "relative px-8 py-3 rounded-full font-serif text-sm tracking-widest uppercase",
                    "transition-all duration-300 ease-spring",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-roseGold",
                    variant === "primary" &&
                    "bg-gradient-to-r from-[#D4AF37] via-[#C7A06B] to-[#D4AF37] text-[#12121A] hover:shadow-[0_0_35px_rgba(212,175,55,0.4)] hover:-translate-y-0.5",
                    variant === "ghost" &&
                    "border border-[#556B2F]/50 text-warmText hover:border-dustyRose hover:text-dustyRose hover:shadow-[0_0_20px_rgba(216,161,161,0.2)]",
                    className
                )}
                {...props}
            >
                <span className="relative z-10">{children}</span>
            </button>
        );
    }
);

Button.displayName = "Button";
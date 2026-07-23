import React, { ButtonHTMLAttributes, forwardRef } from "react";
import Link from "next/link";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: "primary" | "ghost" | "outline";
    href?: string;
    children: React.ReactNode;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
    ({ variant = "primary", href, className = "", children, ...props }, ref) => {
        const baseStyles =
            "px-6 py-3 rounded-lg font-medium transition-all duration-300 focus-visible:ring-2 focus-visible:ring-offset-2";

        const variants = {
            primary: "bg-gold text-bg hover:bg-rose-gold shadow-lg hover:shadow-xl",
            ghost: "bg-transparent text-warmText hover:text-gold border border-gold/30",
            outline:
                "bg-transparent text-warmText border border-warmText/30 hover:border-gold/60 hover:text-gold",
        };

        const buttonClass = `${baseStyles} ${variants[variant]} ${className}`;

        if (href) {
            return (
                <Link href={href}>
                    <button ref={ref} className={buttonClass} {...props}>
                        {children}
                    </button>
                </Link>
            );
        }

        return (
            <button ref={ref} className={buttonClass} {...props}>
                {children}
            </button>
        );
    }
);

Button.displayName = "Button";

export { Button };
export default Button;
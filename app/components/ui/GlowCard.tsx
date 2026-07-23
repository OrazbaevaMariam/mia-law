"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function GlowCard({
                             children,
                             className,
                             delay = 0,
                         }: {
    children: ReactNode;
    className?: string;
    delay?: number;
}) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 32 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
            whileHover={{ scale: 1.02 }}
            className={cn(
                "relative rounded-2xl border border-[#556B2F]/40 bg-[#12121A]/70",
                "backdrop-blur-md overflow-hidden group",
                "shadow-[0_0_0_rgba(0,0,0,0)] hover:shadow-[0_0_50px_rgba(212,175,55,0.15)]",
                "transition-shadow duration-700",
                className
            )}
        >
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none bg-gradient-to-t from-[#D4AF37]/10 via-transparent to-transparent" />
            {children}
        </motion.div>
    );
}
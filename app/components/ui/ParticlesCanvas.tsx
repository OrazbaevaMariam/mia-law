"use client";

import { useEffect, useRef } from "react";

type Particle = {
    x: number;
    y: number;
    r: number;
    vx: number;
    vy: number;
    o: number;
    hue: "gold" | "rose" | "magic";
};

export function ParticlesCanvas({ density = 40 }: { density?: number }) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const mouse = useRef({ x: 0, y: 0 });

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const reduceMotion = window.matchMedia(
            "(prefers-reduced-motion: reduce)"
        ).matches;
        const count = reduceMotion ? Math.floor(density / 3) : density;

        let width = (canvas.width = window.innerWidth);
        let height = (canvas.height = window.innerHeight);

        const colors: Record<Particle["hue"], string> = {
            gold: "rgba(212,175,55,0.5)",
            rose: "rgba(216,161,161,0.4)",
            magic: "rgba(107,78,255,0.25)",
        };

        const particles: Particle[] = Array.from({ length: count }).map(() => ({
            x: Math.random() * width,
            y: Math.random() * height,
            r: Math.random() * 1.6 + 0.4,
            vx: (Math.random() - 0.5) * 0.15,
            vy: -Math.random() * 0.25 - 0.05,
            o: Math.random() * 0.6 + 0.2,
            hue: (["gold", "rose", "magic"] as const)[
                Math.floor(Math.random() * 3)
                ],
        }));

        const onResize = () => {
            width = canvas.width = window.innerWidth;
            height = canvas.height = window.innerHeight;
        };
        const onMouseMove = (e: MouseEvent) => {
            mouse.current.x = (e.clientX / width - 0.5) * 2;
            mouse.current.y = (e.clientY / height - 0.5) * 2;
        };

        window.addEventListener("resize", onResize);
        if (!reduceMotion) window.addEventListener("mousemove", onMouseMove);

        let raf: number;
        const render = () => {
            ctx.clearRect(0, 0, width, height);
            particles.forEach((p) => {
                p.x += p.vx + mouse.current.x * 0.05;
                p.y += p.vy + mouse.current.y * 0.02;

                if (p.y < -10) {
                    p.y = height + 10;
                    p.x = Math.random() * width;
                }
                if (p.x < -10) p.x = width + 10;
                if (p.x > width + 10) p.x = -10;

                ctx.beginPath();
                ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
                ctx.fillStyle = colors[p.hue];
                ctx.globalAlpha = p.o;
                ctx.fill();
            });
            raf = requestAnimationFrame(render);
        };
        render();

        return () => {
            cancelAnimationFrame(raf);
            window.removeEventListener("resize", onResize);
            window.removeEventListener("mousemove", onMouseMove);
        };
    }, [density]);

    return (
        <canvas
            ref={canvasRef}
            className="pointer-events-none fixed inset-0 z-[2] opacity-70"
            aria-hidden
        />
    );
}
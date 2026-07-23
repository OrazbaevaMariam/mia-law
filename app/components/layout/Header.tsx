// "use client";
//
// import Link from "next/link";
// import Container from "../ui/Container";
//
// export default function Header() {
//     return (
//         <header className="fixed top-0 inset-x-0 z-40">
//             <Container className="flex items-center justify-between py-6">
//                 <Link href="/" className="font-serif text-warm text-xl tracking-wide">
//                     Mia <span className="text-rose-gold">Law</span>
//                 </Link>
//                 <nav className="hidden md:flex items-center gap-8 text-sm uppercase tracking-[0.2em] text-muted">
//                     <Link href="/books" className="hover:text-rose-gold transition-colors">
//                         Книги
//                     </Link>
//                     <Link href="/library" className="hover:text-rose-gold transition-colors">
//                         Библиотека
//                     </Link>
//                     <Link href="/account" className="hover:text-rose-gold transition-colors">
//                         Кабинет
//                     </Link>
//                     <Link
//                         href="/login"
//                         className="px-5 py-2 rounded-full border border-gold/40 text-warm hover:border-rose-gold hover:text-rose-gold transition-all"
//                     >
//                         Войти
//                     </Link>
//                 </nav>
//             </Container>
//         </header>
//     );
// }
"use client";

import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { useState } from "react";
import { motion } from "framer-motion";

const links = [
    { href: "/books", label: "Книги" },
    { href: "/library", label: "Библиотека" },
    { href: "/login", label: "Войти" },
];

export function Header() {
    const [open, setOpen] = useState(false);

    return (
        <header className="fixed top-0 inset-x-0 z-40 backdrop-blur-md bg-[#0B0B0F]/50 border-b border-[#556B2F]/20">
            <Container className="flex items-center justify-between h-20">
                <Link
                    href="/"
                    className="font-serif text-xl tracking-[0.2em] text-warmText hover:text-gold transition-colors"
                >
                    MIA&nbsp;LAW
                </Link>

                <nav className="hidden md:flex gap-10">
                    {links.map((link) => (
                        <Link
                            key={link.href}
                            href={link.href}
                            className="text-sm uppercase tracking-widest text-muted hover:text-dustyRose transition-colors"
                        >
                            {link.label}
                        </Link>
                    ))}
                </nav>

                <button
                    onClick={() => setOpen(!open)}
                    className="md:hidden text-warmText"
                    aria-label="Меню"
                >
                    ☰
                </button>
            </Container>

            {open && (
                <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="md:hidden bg-[#12121A] border-t border-[#556B2F]/20"
                >
                    <div className="flex flex-col p-6 gap-4">
                        {links.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                onClick={() => setOpen(false)}
                                className="text-warmText text-lg font-serif"
                            >
                                {link.label}
                            </Link>
                        ))}
                    </div>
                </motion.div>
            )}
        </header>
    );
}
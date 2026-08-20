"use client";

import { Container } from "@/app/components/ui/Container";
import Link from "next/link";

interface BlogPost {
    id: string;
    title: string;
    excerpt: string;
    date: string;
    slug: string;
}

const blogPosts: BlogPost[] = [
    {
        id: "1",
        title: "Как начать писать романтическое фэнтези",
        excerpt: "Советы о создании миров, героев и магических систем...",
        date: "24 июля 2026",
        slug: "how-to-write-romance-fantasy",
    },
    {
        id: "2",
        title: "За кулисами Mia Law Library",
        excerpt: "История создания платформы и вдохновение для проекта...",
        date: "20 июля 2026",
        slug: "behind-the-scenes",
    },
];

export default function BlogPage() {
    return (
        <Container>
            <div className="py-20">
                <h1 className="text-4xl font-bold mb-2">Блог</h1>
                <p className="text-slate-600 mb-12">
                    Истории, советы и размышления о литературе и творчестве
                </p>

                <div className="space-y-8">
                    {blogPosts.map((post) => (
                        <article
                            key={post.id}
                            className="border-b border-slate-200 pb-8 last:border-b-0"
                        >
                            <Link href={`/blog/${post.slug}`}>
                                <h2 className="text-2xl font-bold hover:text-blue-500 transition mb-2">
                                    {post.title}
                                </h2>
                            </Link>
                            <p className="text-slate-500 text-sm mb-3">{post.date}</p>
                            <p className="text-slate-700">{post.excerpt}</p>
                            <Link
                                href={`/blog/${post.slug}`}
                                className="inline-block mt-4 text-blue-500 hover:underline"
                            >
                                Читать далее →
                            </Link>
                        </article>
                    ))}
                </div>
            </div>
        </Container>
    );
}
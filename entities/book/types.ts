// entities/book/types.ts
export interface Chapter {
    id: string
    title: string
    slug: string
    order_index: number
    content?: string
}

export interface Book {
    id: string
    title: string
    slug: string
    cover_url?: string
    description?: string
    author?: string
}
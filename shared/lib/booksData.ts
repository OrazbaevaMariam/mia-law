// export type Chapter = {
//     id: string;
//     title: string;
//     isFree: boolean;
// };
//
// export type Book = {
//     slug: string;
//     title: string;
//     teaser: string;
//     description: string;
//     cover: string;
//     tags: string[];
//     chapters: Chapter[];
// };
//
// export const books: Book[] = [
//     {
//         slug: "govoryashaya-s-bogami",
//         title: "Говорящая с Богами",
//         teaser: "Она слышала голоса, которых не должна была слышать.",
//         description:
//             "Древний алтарь, забытый ритуал и женщина, чей голос способен пробудить то, что спало веками. История о цене дара и о том, что боги тоже умеют желать.",
//         cover: "/images/covers/book-1.jpg",
//         tags: ["Магия", "Судьба", "Запретное"],
//         chapters: [
//             { id: "1", title: "Голос из тишины", isFree: true },
//             { id: "2", title: "Алтарь забытых имён", isFree: true },
//             { id: "3", title: "Тот, кто ответил", isFree: false },
//             { id: "4", title: "Цена ответа", isFree: false },
//             { id: "5", title: "Слово, что нельзя вернуть", isFree: false },
//         ],
//     },
//     {
//         slug: "zhizn-kak-dar",
//         title: "Жизнь как Дар",
//         teaser: "Он поклялся защищать её ценой собственного света.",
//         description:
//             "Рыцарь, давший клятву, и девушка, что несёт в себе талисман, способный изменить исход войны. Их история — о том, что защищать значит иногда молчать о любви.",
//         cover: "/images/covers/book-2.jpg",
//         tags: ["Клятвы", "Защита", "Свет"],
//         chapters: [
//             { id: "1", title: "Клятва у стен замка", isFree: true },
//             { id: "2", title: "Талисман света", isFree: true },
//             { id: "3", title: "Сад теней", isFree: false },
//             { id: "4", title: "То, что скрыто под доспехом", isFree: false },
//         ],
//     },
//     {
//         slug: "ubedi-menya",
//         title: "Убеди меня",
//         teaser: "Она не хотела верить. Он не собирался отступать.",
//         description:
//             "В коридорах древнего дома, где каждое слово — оружие, разворачивается история сопротивления и притяжения, где цепи однажды становятся светом.",
//         cover: "/images/covers/book-3.jpg",
//         tags: ["Противостояние", "Страсть", "Тьма и свет"],
//         chapters: [
//             { id: "1", title: "Коридор теней", isFree: true },
//             { id: "2", title: "Первое слово несогласия", isFree: true },
//             { id: "3", title: "Цепи из света", isFree: false },
//             { id: "4", title: "То, что убеждает без слов", isFree: false },
//             { id: "5", title: "Последний довод", isFree: false },
//         ],
//     },
//     {
//         slug: "zhizn-kak-obeshanie",
//         title: "Жизнь как Обещание",
//         teaser: "Она обещала ребёнку — что бы ни случилось, она останется.",
//         description:
//             "Руины сада, тёплый свет заката и клятва, которая связывает крепче любой магии — клятва матери.",
//         cover: "/images/covers/book-4.jpg",
//         tags: ["Клятвы", "Семья", "Тепло"],
//         chapters: [
//             { id: "1", title: "Руины сада", isFree: true },
//             { id: "2", title: "Маленькая рука", isFree: true },
//             { id: "3", title: "Обещание в сумерках", isFree: false },
//             { id: "4", title: "Дом света", isFree: false },
//         ],
//     },
// ];
//
// export const getBookBySlug = (slug: string) =>
//     books.find((b) => b.slug === slug);
export type Chapter = {
    id: string;
    title: string;
    isFree: boolean;
};

export type Book = {
    slug: string;
    title: string;
    teaser: string;
    description: string;
    cover: string;
    tags: string[];
    chapters: Chapter[];
};

export const books: Book[] = [
    {
        slug: "govoryashaya-s-bogami",
        title: "Говорящая с Богами",
        teaser: "Она слышала голоса, которых не должна была слышать.",
        description:
            "Древний алтарь, забытый ритуал и женщина, чей голос способен пробудить то, что спало веками. История о цене дара и о том, что боги тоже умеют желать.",
        cover: "https://images.unsplash.com/photo-1543002588-d83ccc5eec21?w=400&h=600&fit=crop",
        tags: ["Магия", "Судьба", "Запретное"],
        chapters: [
            { id: "1", title: "Голос из тишины", isFree: true },
            { id: "2", title: "Алтарь забытых имён", isFree: true },
            { id: "3", title: "Тот, кто ответил", isFree: false },
            { id: "4", title: "Цена ответа", isFree: false },
            { id: "5", title: "Слово, что нельзя вернуть", isFree: false },
        ],
    },
    {
        slug: "zhizn-kak-dar",
        title: "Жизнь как Дар",
        teaser: "Он поклялся защищать её ценой собственного света.",
        description:
            "Рыцарь, давший клятву, и девушка, что несёт в себе талисман, способный изменить исход войны. Их история — о том, что защищать значит иногда молчать о любви.",
        cover: "https://images.unsplash.com/photo-1507842217343-583f20270319?w=400&h=600&fit=crop",
        tags: ["Клятвы", "Защита", "Свет"],
        chapters: [
            { id: "1", title: "Клятва у стен замка", isFree: true },
            { id: "2", title: "Талисман света", isFree: true },
            { id: "3", title: "Сад теней", isFree: false },
            { id: "4", title: "То, что скрыто под доспехом", isFree: false },
        ],
    },
    {
        slug: "ubedi-menya",
        title: "Убеди меня",
        teaser: "Она не хотела верить. Он не собирался отступать.",
        description:
            "В коридорах древнего дома, где каждое слово — оружие, разворачивается история сопротивления и притяжения, где цепи однажды становятся светом.",
        cover: "https://images.unsplash.com/photo-1535083783855-76ae62b2914e?w=400&h=600&fit=crop",
        tags: ["Противостояние", "Страсть", "Тьма и свет"],
        chapters: [
            { id: "1", title: "Коридор теней", isFree: true },
            { id: "2", title: "Первое слово несогласия", isFree: true },
            { id: "3", title: "Цепи из света", isFree: false },
            { id: "4", title: "То, что убеждает без слов", isFree: false },
            { id: "5", title: "Последний довод", isFree: false },
        ],
    },
    {
        slug: "zhizn-kak-obeshanie",
        title: "Жизнь как Обещание",
        teaser: "Она обещала ребёнку — что бы ни случилось, она останется.",
        description:
            "Руины сада, тёплый свет заката и клятва, которая связывает крепче любой магии — клятва матери.",
        cover: "https://images.unsplash.com/photo-1519904981063-b0cf448d479e?w=400&h=600&fit=crop",
        tags: ["Клятвы", "Семья", "Тепло"],
        chapters: [
            { id: "1", title: "Руины сада", isFree: true },
            { id: "2", title: "Маленькая рука", isFree: true },
            { id: "3", title: "Обещание в сумерках", isFree: false },
            { id: "4", title: "Дом света", isFree: false },
        ],
    },
];

export const getBookBySlug = (slug: string) =>
    books.find((b) => b.slug === slug);
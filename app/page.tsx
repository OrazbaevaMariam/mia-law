'use client'

import Hero from '@/app/components/sections/Hero'
import About from '@/app/components/sections/About'
import BooksPreview from '@/app/components/sections/BooksPreview'
import Pricing from '@/app/components/sections/Pricing'
import Blog from '@/app/components/sections/Blog'

export default function Home() {
  return (
    <main className="w-full overflow-hidden">
      <Hero />
      <About />
      <BooksPreview />
      <Pricing />
      <Blog />
    </main>
  )
}

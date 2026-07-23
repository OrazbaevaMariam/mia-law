'use client'

import { Hero } from '@/components/sections/Hero'
import { About } from '@/components/sections/About'
import { BooksPreview } from '@/components/sections/BooksPreview'
import { Pricing } from '@/components/sections/Pricing'
import { Blog } from '@/components/sections/Blog'

export default function Home() {
  return (
    <main>
      <Hero />
      <About />
      <BooksPreview />
      <Pricing />
      <Blog />
    </main>
  )
}

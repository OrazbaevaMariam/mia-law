import { createServerSupabase } from '@/lib/supabase-server'

export default async function ChapterPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  
  const supabase = await createServerSupabase()

  const { data: chapter, error } = await supabase
    .from('chapters')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !chapter) {
    return <div>Chapter not found</div>
  }

  return (
    <div className="p-8">
      <h1>{chapter.title}</h1>
      <div>{chapter.content}</div>
    </div>
  )
}

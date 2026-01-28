import { createClient } from '@/lib/supabase/server'
import { getAllTags } from '@/app/actions/tags'
import { TagManager } from '@/components/tags/tag-manager'
import { TagList } from '@/components/tags/tag-list'

export default async function TagsPage() {
  const supabase = await createClient()

  // Get user and admin status
  const { data: { user } } = await supabase.auth.getUser()
  let isAdmin = false

  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single()
    isAdmin = profile?.is_admin || false
  }

  // Get all tags
  const tags = await getAllTags()

  return (
    <div className="container max-w-6xl mx-auto px-6 pt-12 pb-20">
      <div className="flex items-center justify-between mb-12">
        <div>
          <h1 className="text-4xl font-bold tracking-tight mb-4">
            {isAdmin ? '标签管理' : '所有标签'}
          </h1>
          <p className="text-neutral-500">
            {isAdmin
              ? '管理全站文章标签，支持增删改查。'
              : '通过标签探索更多感兴趣的内容。'}
          </p>
        </div>
      </div>

      {isAdmin ? (
        <TagManager initialTags={tags as any} />
      ) : (
        <TagList tags={tags as any} />
      )}
    </div>
  )
}
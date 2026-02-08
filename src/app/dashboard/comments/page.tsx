import { createClient as createServerClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { CommentManagement } from '@/components/dashboard/comment-management'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default async function CommentsManagementPage() {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/?login=true')
  }

  // Get profile data
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  const isAdmin = profile?.is_admin || false

  if (!isAdmin) {
    redirect('/profile')
  }

  // 获取所有评论（包括待审核和已审核）
  const { data: comments, error } = await supabase
    .from('comments')
    .select(`
      *,
      post:posts(id, title, slug),
      user:profiles(id, display_name, avatar_url, email)
    `)
    .order('created_at', { ascending: false })

  console.log('[Comments Management] Fetched comments:', comments?.length || 0, 'Error:', error)

  return (
    <div className="min-h-screen bg-[#fafafa] dark:bg-[#050505] pb-20">
      <div className="container max-w-6xl mx-auto px-4 pt-6 md:px-6 md:pt-12">
        {/* Header */}
        <div className="mb-8">
          <Button asChild variant="ghost" className="mb-4 -ml-2">
            <Link href="/dashboard" className="flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" />
              返回 Dashboard
            </Link>
          </Button>
          <h1 className="text-3xl font-bold mb-2">评论管理</h1>
          <p className="text-neutral-500">审核和管理所有用户评论</p>
        </div>

        {/* Comment Management Component */}
        <CommentManagement initialComments={comments || []} />
      </div>
    </div>
  )
}

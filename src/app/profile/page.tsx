import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { ProfileTabs } from "@/components/profile/profile-tabs"

export default async function ProfilePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/?login=true')
  }

  // 1. Get Profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  const profileData = {
    display_name: profile?.display_name || "",
    bio: profile?.bio || "",
    website: profile?.website || "",
    avatar_url: profile?.avatar_url || "",
    card_bg: profile?.card_bg || "default",
  }

  // 2. Get Stats
  // Active Days
  const createdAt = new Date(user.created_at)
  const now = new Date()
  const diffTime = Math.abs(now.getTime() - createdAt.getTime())
  const activeDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

  // Comments Count
  const { count: commentsCount } = await supabase
    .from('comments')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)

  // 3. Get Recent Activity (Comments)
  const { data: recentComments } = await supabase
    .from('comments')
    .select('*, posts(title, slug, cover_image, excerpt)')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(5)

  // 4. Get Last Sign In
  const lastSignIn = user.last_sign_in_at ? new Date(user.last_sign_in_at) : new Date()
  const lastActive = lastSignIn.toLocaleDateString('zh-CN', { month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })

  const stats = {
    commentsCount: commentsCount || 0,
    activeDays,
    lastActive,
    joinedDate: createdAt.toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' })
  }

  return (
    <div className="min-h-screen bg-[#fafafa] dark:bg-[#050505] pb-12 md:pb-20">
      <div className="container max-w-4xl mx-auto px-6 pt-8 md:pt-12">
        <ProfileTabs
            user={user}
            profile={profileData}
            stats={stats}
            recentActivity={recentComments || []}
        />
      </div>
    </div>
  )
}

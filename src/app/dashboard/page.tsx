import { createClient as createServerClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import {
  FileText,
  ArrowRight,
  UserCircle,
  Plus
} from 'lucide-react'
import { SignOutButton } from '@/components/auth/sign-out-button'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'

import { DashboardHeader } from '@/components/dashboard/dashboard-header'
import { DataReports } from '@/components/dashboard/data-reports'
import { UserManagementWrapper } from '@/components/dashboard/user-management-wrapper'
import { AnalyticsTabsWrapper } from '@/components/dashboard/analytics-tabs-wrapper'
import { StatsCard } from '@/components/dashboard/stats-card'
import { getAnalyticsData } from '@/lib/analytics-helpers'

export default async function DashboardPage() {
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

  const displayName = profile?.display_name || user.email?.split('@')[0] || '朋友'
  const isAdmin = profile?.is_admin || false

  if (!isAdmin) {
    redirect('/profile')
  }

  // --- Admin Data Fetching ---

  // 1. 获取文章统计信息
  const { count: totalPosts } = await supabase
    .from('posts')
    .select('*', { count: 'exact', head: true })

  // 2. 获取最近修改的文章（包括草稿）
  const { data: posts } = await supabase
    .from('posts')
    .select('*')
    .order('updated_at', { ascending: false })
    .limit(3)
  const recentPosts = posts || []

  // 3. 计算总阅读量 & 获取热门文章
  const { data: allPosts } = await supabase
    .from('posts')
    .select('id, title, view_count')
    .order('view_count', { ascending: false })

  const totalViews = allPosts?.reduce((sum, post) => sum + (post.view_count || 0), 0) || 0
  const topPosts = allPosts?.slice(0, 5) || []

  // 4. 计算评论总数 (全站评论)
  const { count: totalComments } = await supabase
    .from('comments')
    .select('*', { count: 'exact', head: true })

  // 5. 获取用户总数和详细数据
  const { count: totalUsers } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })

  // 6. 获取所有用户详细信息（用于用户管理）
  const { data: allUsers, error: usersError } = await supabase
    .from('profiles')
    .select('id, email, display_name, avatar_url, bio, is_admin, created_at, updated_at')
    .order('created_at', { ascending: false })

  console.log('[Dashboard] Fetched users:', allUsers?.length || 0, 'Error:', usersError)
  if (allUsers && allUsers.length > 0) {
    console.log('[Dashboard] First user sample:', JSON.stringify(allUsers[0]))
  }

  // 获取每个用户的评论数
  const usersWithComments = await Promise.all(
    (allUsers || []).map(async (userProfile) => {
      const { count } = await supabase
        .from('comments')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userProfile.id)

      return {
        ...userProfile,
        last_sign_in_at: userProfile.updated_at, // 使用 updated_at 作为最后活跃时间
        comment_count: count || 0,
      }
    })
  )

  console.log('[Dashboard] Users with comments:', usersWithComments.length)

  // 7. 获取 Analytics 数据（支持多时间范围：7天/30天/全部）
  const [data7d, data30d, dataAll] = await Promise.all([
    getAnalyticsData(supabase, 7),
    getAnalyticsData(supabase, 30),
    getAnalyticsData(supabase, 'all'),
  ])

  // 默认使用 7 天数据用于顶部统计卡片
  const analyticsData = data7d

  const stats = [
    {
      label: '总文章',
      value: totalPosts || 0,
      color: 'text-blue-500',
      trend: analyticsData?.trends?.posts || { value: 0, isPositive: true },
      sparklineData: analyticsData?.sparklineData?.posts,
    },
    {
      label: '总阅读',
      value: totalViews,
      color: 'text-purple-500',
      trend: analyticsData?.trends?.views || { value: 0, isPositive: true },
      sparklineData: analyticsData?.sparklineData?.views,
    },
    {
      label: '总评论',
      value: totalComments || 0,
      color: 'text-green-500',
      trend: analyticsData?.trends?.comments || { value: 0, isPositive: true },
      sparklineData: analyticsData?.sparklineData?.comments,
    },
    {
      label: '注册用户',
      value: totalUsers || 0,
      color: 'text-orange-500',
      trend: analyticsData?.trends?.users || { value: 0, isPositive: true },
      sparklineData: analyticsData?.sparklineData?.users,
    },
  ]

  return (
    <div className="min-h-screen bg-[#fafafa] dark:bg-[#050505] pb-20">
      <div className="container max-w-6xl mx-auto px-4 pt-6 md:px-6 md:pt-12">
        {/* Welcome Section */}
        <DashboardHeader displayName={displayName} isAdmin={isAdmin} />

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6 mb-8 md:mb-12">
          {stats.map((stat) => (
            <StatsCard
              key={stat.label}
              label={stat.label}
              value={stat.value}
              color={stat.color}
              trend={stat.trend}
              sparklineData={stat.sparklineData}
            />
          ))}
        </div>

        {/* Analytics Section with Time Range Selector */}
        <AnalyticsTabsWrapper
          data7d={{
            stats: {
              totalPosts: totalPosts || 0,
              totalViews,
              totalComments: totalComments || 0,
              totalUsers: totalUsers || 0,
            },
            topPosts,
            ...data7d,
          }}
          data30d={{
            stats: {
              totalPosts: totalPosts || 0,
              totalViews,
              totalComments: totalComments || 0,
              totalUsers: totalUsers || 0,
            },
            topPosts,
            ...data30d,
          }}
          dataAll={{
            stats: {
              totalPosts: totalPosts || 0,
              totalViews,
              totalComments: totalComments || 0,
              totalUsers: totalUsers || 0,
            },
            topPosts,
            ...dataAll,
          }}
        />

        {/* User Management Section */}
        <div className="mt-12 mb-8">
          <h2 className="text-xl font-semibold mb-6">用户管理</h2>
          <UserManagementWrapper
            initialUsers={usersWithComments}
            currentUserId={user.id}
          />
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Actions */}
          <div className="lg:col-span-2 space-y-8 min-w-0">
            <section>
              <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                快捷管理
              </h2>
              <div className="grid grid-cols-2 gap-4">
                  <Link href="/post" className="group p-4 md:p-6 rounded-3xl bg-white dark:bg-neutral-900 border border-black/[0.03] dark:border-white/[0.03] hover:border-black/10 dark:hover:border-white/10 transition-all">
                    <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center mb-3 md:mb-4 text-blue-500">
                      <FileText className="w-5 h-5" />
                    </div>
                    <h3 className="font-bold mb-1 md:mb-2 group-hover:translate-x-1 transition-transform text-sm md:text-base">文章管理</h3>
                    <p className="text-xs md:text-sm text-neutral-500 line-clamp-1 md:line-clamp-none">管理所有博客内容。</p>
                  </Link>
                  <Link href="/admin/posts/new" className="group p-4 md:p-6 rounded-3xl bg-white dark:bg-neutral-900 border border-black/[0.03] dark:border-white/[0.03] hover:border-black/10 dark:hover:border-white/10 transition-all">
                    <div className="w-10 h-10 rounded-full bg-purple-500/10 flex items-center justify-center mb-3 md:mb-4 text-purple-500">
                      <Plus className="w-5 h-5" />
                    </div>
                    <h3 className="font-bold mb-1 md:mb-2 group-hover:translate-x-1 transition-transform text-sm md:text-base">发布内容</h3>
                    <p className="text-xs md:text-sm text-neutral-500 line-clamp-1 md:line-clamp-none">开启您的新篇章。</p>
                  </Link>
              </div>
            </section>

            <section>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold">最近修改</h2>
                <Link href="/post" className="text-sm text-neutral-400 hover:text-black dark:hover:text-white transition-colors flex items-center gap-1">
                  查看全部 <ArrowRight className="w-3 h-3" />
                </Link>
              </div>

              <div className="space-y-4">
                {recentPosts && recentPosts.length > 0 ? (
                  recentPosts.map((post) => (
                    <div key={post.id} className="group flex items-center gap-4 p-4 rounded-3xl bg-white dark:bg-neutral-900 border border-black/[0.03] dark:border-white/[0.03] hover:border-black/10 dark:hover:border-white/10 transition-all">
                      <div className="w-16 h-12 shrink-0 rounded-xl bg-neutral-100 dark:bg-neutral-800 overflow-hidden relative">
                        {post.cover_image ? (
                          <img src={post.cover_image} alt={post.title} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-neutral-300">
                            <FileText className="w-6 h-6 opacity-50" />
                          </div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-bold text-sm truncate pr-2">{post.title}</h3>
                          {!post.published && (
                            <span className="shrink-0 px-3 py-1 text-xs font-bold bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400 rounded-full uppercase">
                              草稿
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-neutral-500 truncate">
                          {new Date(post.updated_at).toLocaleDateString('zh-CN')} · {post.excerpt || '暂无摘要'}
                        </p>
                      </div>

                      <Button asChild variant="ghost" size="icon" className="rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                        <Link href={`/admin/posts/${post.id}/edit`}>
                          <ArrowRight className="w-4 h-4" />
                        </Link>
                      </Button>
                    </div>
                  ))
                ) : (
                  <div className="p-12 text-center rounded-3xl border-2 border-dashed border-black/5 dark:border-white/5">
                    <p className="text-sm text-neutral-400">
                      暂无最近发布的文章
                    </p>
                  </div>
                )}
              </div>
            </section>
          </div>

          {/* Sidebar Info */}
          <div className="space-y-8">
            <Card className="border-none bg-black dark:bg-white text-white dark:text-black rounded-3xl overflow-hidden shadow-2xl">
              <CardContent className="p-6 md:p-8">
                <div className="w-16 h-16 rounded-full bg-white/10 dark:bg-black/10 mb-6 overflow-hidden flex items-center justify-center">
                  {profile?.avatar_url ? (
                    <img src={profile.avatar_url} alt={profile.display_name} className="w-full h-full object-cover" />
                  ) : (
                    <UserCircle className="w-10 h-10 opacity-50" />
                  )}
                </div>
                <h3 className="text-xl font-bold mb-2">管理员</h3>
                <div className="space-y-4 mb-8">
                  <div className="opacity-70 text-sm min-w-0">
                    <p className="font-medium">邮箱</p>
                    <p className="truncate">{user.email}</p>
                  </div>
                  <div className="opacity-70 text-sm">
                    <p className="font-medium">权限</p>
                    <p>超级管理员 (Super Admin)</p>
                  </div>
                </div>
                <div className="w-full">
                  <SignOutButton
                    variant="ghost"
                    className="w-full rounded-full bg-white/20 dark:bg-black/20 hover:bg-white/30 dark:hover:bg-black/30 text-white dark:text-black border-none"
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="border-none bg-white dark:bg-neutral-900 rounded-3xl overflow-hidden shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg">
                  写作助手
                </CardTitle>
                <CardDescription>
                  提升写作质量的小贴士。
                </CardDescription>
              </CardHeader>
              <CardContent className="px-6 pb-6 text-sm text-neutral-500">
                <ul className="space-y-4">
                    <li className="flex gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                    <p>保持标题简洁有力，吸引读者点击。</p>
                    </li>
                    <li className="flex gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500 mt-1.5 shrink-0" />
                    <p>定期更新旧文章，保持内容时效性。</p>
                    </li>
                    <li className="flex gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-orange-500 mt-1.5 shrink-0" />
                    <p>善用标签分类，方便内容检索。</p>
                    </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

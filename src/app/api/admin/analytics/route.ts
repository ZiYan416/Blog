import { createClient as createServerClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { subDays, format } from 'date-fns'

export async function GET() {
  try {
    const supabase = await createServerClient()

    // 验证管理员权限
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single()

    if (!profile?.is_admin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // 获取过去 7 天的统计快照
    const last7DaysDate = subDays(new Date(), 6)
    const { data: statsData, error: statsError } = await supabase
      .from('stats_snapshots')
      .select('*')
      .gte('date', last7DaysDate.toISOString().split('T')[0])
      .order('date', { ascending: true })

    if (statsError) throw statsError

    // 格式化为图表数据
    const recentActivity = (statsData || []).map((snapshot) => ({
      date: format(new Date(snapshot.date), 'MM-dd'),
      posts: snapshot.new_posts_today || 0,
      views: snapshot.new_views_today || 0,
      comments: snapshot.new_comments_today || 0,
    }))

    // 获取标签分布
    const { data: posts } = await supabase
      .from('posts')
      .select('tags')
      .eq('published', true)
      .not('tags', 'is', null)

    const tagCounts: Record<string, number> = {}
    posts?.forEach((post) => {
      if (Array.isArray(post.tags)) {
        post.tags.forEach((tag: string) => {
          tagCounts[tag] = (tagCounts[tag] || 0) + 1
        })
      }
    })

    const tagData = Object.entries(tagCounts)
      .map(([name, value]) => ({
        name,
        value,
        color: getColorForTag(name)
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5)

    // 获取高频评论者
    const { data: commentData } = await supabase
      .from('comments')
      .select(`
        user_id,
        created_at,
        profiles!comments_user_id_fkey (
          display_name,
          email
        )
      `)
      .order('created_at', { ascending: false })
      .limit(1000)

    const userCommentCounts: Record<string, {
      count: number
      name: string
      lastComment: string
    }> = {}

    commentData?.forEach((comment: any) => {
      if (!userCommentCounts[comment.user_id]) {
        userCommentCounts[comment.user_id] = {
          count: 0,
          name: comment.profiles?.display_name ||
                comment.profiles?.email?.split('@')[0] ||
                '匿名用户',
          lastComment: new Date(comment.created_at).toLocaleDateString('zh-CN'),
        }
      }
      userCommentCounts[comment.user_id].count++
    })

    const topCommenters = Object.values(userCommentCounts)
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)

    // 计算趋势百分比（对比前 7 天）
    const currentWeekStats = statsData?.slice(-7) || []
    const currentTotal = {
      posts: currentWeekStats.reduce((sum, s) => sum + (s.new_posts_today || 0), 0),
      views: currentWeekStats.reduce((sum, s) => sum + (s.new_views_today || 0), 0),
      comments: currentWeekStats.reduce((sum, s) => sum + (s.new_comments_today || 0), 0),
      users: currentWeekStats.reduce((sum, s) => sum + (s.new_users_today || 0), 0),
    }

    // 获取前一周的数据用于对比
    const prevWeekDate = subDays(new Date(), 13)
    const { data: prevWeekData } = await supabase
      .from('stats_snapshots')
      .select('*')
      .gte('date', prevWeekDate.toISOString().split('T')[0])
      .lt('date', last7DaysDate.toISOString().split('T')[0])
      .order('date', { ascending: true })

    const prevTotal = {
      posts: (prevWeekData || []).reduce((sum, s) => sum + (s.new_posts_today || 0), 0),
      views: (prevWeekData || []).reduce((sum, s) => sum + (s.new_views_today || 0), 0),
      comments: (prevWeekData || []).reduce((sum, s) => sum + (s.new_comments_today || 0), 0),
      users: (prevWeekData || []).reduce((sum, s) => sum + (s.new_users_today || 0), 0),
    }

    const trends = {
      posts: calculateTrend(currentTotal.posts, prevTotal.posts),
      views: calculateTrend(currentTotal.views, prevTotal.views),
      comments: calculateTrend(currentTotal.comments, prevTotal.comments),
      users: calculateTrend(currentTotal.users, prevTotal.users),
    }

    // 获取用户增长数据
    const { data: userGrowthData } = await supabase
      .from('stats_snapshots')
      .select('date, total_users, new_users_today')
      .gte('date', last7DaysDate.toISOString().split('T')[0])
      .order('date', { ascending: true })

    const userGrowth = (userGrowthData || []).map((snapshot) => ({
      date: format(new Date(snapshot.date), 'MM-dd'),
      totalUsers: snapshot.total_users || 0,
      newUsers: snapshot.new_users_today || 0,
    }))

    // 获取评论趋势
    const commentTrend = (statsData || []).map((snapshot) => ({
      date: format(new Date(snapshot.date), 'MM-dd'),
      comments: snapshot.new_comments_today || 0,
    }))

    // 生成 Sparkline 数据（用于顶部统计卡片）
    const sparklineData = {
      posts: currentWeekStats.map(s => s.new_posts_today || 0),
      views: currentWeekStats.map(s => s.new_views_today || 0),
      comments: currentWeekStats.map(s => s.new_comments_today || 0),
      users: currentWeekStats.map(s => s.new_users_today || 0),
    }

    return NextResponse.json({
      recentActivity,
      tagData,
      topCommenters,
      trends,
      userGrowth,
      commentTrend,
      sparklineData,
    })
  } catch (error) {
    console.error('Analytics API error:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}

// 计算趋势百分比
function calculateTrend(current: number, previous: number): {
  value: number
  isPositive: boolean
} {
  if (previous === 0) {
    return { value: current > 0 ? 100 : 0, isPositive: current > 0 }
  }

  const percentChange = ((current - previous) / previous) * 100
  return {
    value: Math.abs(Math.round(percentChange * 10) / 10),
    isPositive: percentChange >= 0,
  }
}

// 为标签分配颜色
function getColorForTag(tagName: string): string {
  const colors = ['#3b82f6', '#10b981', '#8b5cf6', '#f59e0b', '#ef4444']
  const hash = tagName.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
  return colors[hash % colors.length]
}

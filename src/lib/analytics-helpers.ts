import { SupabaseClient } from '@supabase/supabase-js'
import { subDays, format } from 'date-fns'

export async function getAnalyticsData(
  supabase: SupabaseClient,
  days: number | 'all'
) {
  // 计算日期范围
  const endDate = new Date()
  const startDate = days !== 'all' ? subDays(endDate, days - 1) : null

  // 1. 获取统计快照数据
  let statsQuery = supabase
    .from('stats_snapshots')
    .select('*')
    .order('date', { ascending: true })

  // 如果不是"全部"，则添加日期过滤
  if (days !== 'all' && startDate) {
    statsQuery = statsQuery.gte('date', startDate.toISOString().split('T')[0])
    console.log(`[Analytics] Fetching data for ${days} days, startDate: ${startDate.toISOString().split('T')[0]}`)
  } else {
    console.log(`[Analytics] Fetching ALL historical data`)
  }

  const { data: statsData, error: statsError } = await statsQuery

  console.log(`[Analytics] statsData count: ${statsData?.length || 0}`, statsError)

  // 2. 格式化为图表数据 - 添加索引以确保顺序
  const recentActivity = (statsData || []).map((snapshot, index) => ({
    date: format(new Date(snapshot.date), 'MM-dd'),
    posts: snapshot.new_posts_today || 0,
    views: snapshot.new_views_today || 0,
    comments: snapshot.new_comments_today || 0,
    _index: index, // 添加索引确保排序
  }))

  // 3. 获取标签分布（从关系表统计）
  const { data: tagStats } = await supabase
    .from('tags')
    .select('name, post_count')
    .gt('post_count', 0)
    .order('post_count', { ascending: false })
    .limit(5)

  const tagData = (tagStats || []).map((tag, index) => ({
    name: tag.name,
    value: tag.post_count,
    color: ['#3b82f6', '#10b981', '#8b5cf6', '#f59e0b', '#ef4444'][index % 5]
  }))

  // 4. 获取高频评论者（根据时间范围过滤）
  let commentQuery = supabase
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

  if (days !== 'all' && startDate) {
    commentQuery = commentQuery.gte('created_at', startDate.toISOString())
  }

  const { data: commentData } = await commentQuery.limit(10000)

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

  // 5. 计算趋势百分比
  const currentPeriodStats = days === 'all'
    ? statsData?.slice(-30) || [] // 全部时取最后30天作为当前周期
    : statsData || []

  const periodLength = days === 'all' ? 30 : (typeof days === 'number' ? days : 7)

  const currentTotal = {
    posts: currentPeriodStats.reduce((sum, s) => sum + (s.new_posts_today || 0), 0),
    views: currentPeriodStats.reduce((sum, s) => sum + (s.new_views_today || 0), 0),
    comments: currentPeriodStats.reduce((sum, s) => sum + (s.new_comments_today || 0), 0),
    users: currentPeriodStats.reduce((sum, s) => sum + (s.new_users_today || 0), 0),
  }

  // 获取前一个周期的数据用于对比
  const prevStartDate = days === 'all'
    ? subDays(endDate, 60) // 全部时对比前30-60天
    : subDays(endDate, periodLength * 2 - 1)

  const prevEndDate = days === 'all'
    ? subDays(endDate, 30)
    : subDays(endDate, periodLength)

  const { data: prevPeriodData } = await supabase
    .from('stats_snapshots')
    .select('*')
    .gte('date', prevStartDate.toISOString().split('T')[0])
    .lt('date', prevEndDate.toISOString().split('T')[0])
    .order('date', { ascending: true })

  const prevTotal = {
    posts: (prevPeriodData || []).reduce((sum, s) => sum + (s.new_posts_today || 0), 0),
    views: (prevPeriodData || []).reduce((sum, s) => sum + (s.new_views_today || 0), 0),
    comments: (prevPeriodData || []).reduce((sum, s) => sum + (s.new_comments_today || 0), 0),
    users: (prevPeriodData || []).reduce((sum, s) => sum + (s.new_users_today || 0), 0),
  }

  const calculateTrend = (current: number, previous: number) => {
    if (previous === 0) {
      return { value: current > 0 ? 100 : 0, isPositive: current > 0 }
    }
    const percentChange = ((current - previous) / previous) * 100
    return {
      value: Math.abs(Math.round(percentChange * 10) / 10),
      isPositive: percentChange >= 0,
    }
  }

  const trends = {
    posts: calculateTrend(currentTotal.posts, prevTotal.posts),
    views: calculateTrend(currentTotal.views, prevTotal.views),
    comments: calculateTrend(currentTotal.comments, prevTotal.comments),
    users: calculateTrend(currentTotal.users, prevTotal.users),
  }

  // 6. 获取用户增长数据
  let userGrowthQuery = supabase
    .from('stats_snapshots')
    .select('date, total_users, new_users_today')
    .order('date', { ascending: true })

  if (startDate) {
    userGrowthQuery = userGrowthQuery.gte('date', startDate.toISOString().split('T')[0])
  }

  const { data: userGrowthData } = await userGrowthQuery

  const userGrowth = (userGrowthData || []).map((snapshot) => ({
    date: format(new Date(snapshot.date), 'MM-dd'),
    totalUsers: snapshot.total_users || 0,
    newUsers: snapshot.new_users_today || 0,
  }))

  // 7. 获取评论趋势 - 添加索引确保顺序
  const commentTrend = (statsData || []).map((snapshot, index) => ({
    date: format(new Date(snapshot.date), 'MM-dd'),
    comments: snapshot.new_comments_today || 0,
    _index: index, // 添加索引确保排序
  }))

  // 8. 生成 Sparkline 数据（用于顶部统计卡片，始终使用最近7天）
  const last7Days = statsData?.slice(-7) || []
  const sparklineData = {
    posts: last7Days.map(s => s.new_posts_today || 0),
    views: last7Days.map(s => s.new_views_today || 0),
    comments: last7Days.map(s => s.new_comments_today || 0),
    users: last7Days.map(s => s.new_users_today || 0),
  }

  // Debug: 检查实际数据值
  const dataSummary = {
    recentActivityLength: recentActivity.length,
    postsSum: recentActivity.reduce((sum, d) => sum + d.posts, 0),
    viewsSum: recentActivity.reduce((sum, d) => sum + d.views, 0),
    commentsSum: recentActivity.reduce((sum, d) => sum + d.comments, 0),
    sampleDates: recentActivity.slice(0, 3).map(d => d.date),
  }
  console.log(`[Analytics] Data summary for ${days} days:`, JSON.stringify(dataSummary))
  console.log(`[Analytics] First 3 recentActivity items:`, JSON.stringify(recentActivity.slice(0, 3)))

  return {
    recentActivity,
    tagData,
    topCommenters,
    trends,
    userGrowth,
    commentTrend,
    sparklineData,
  }
}

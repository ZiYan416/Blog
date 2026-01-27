import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import {
  FileText,
  BarChart3,
  Settings,
  Plus,
  ArrowRight,
  MessageSquare,
  Users,
  LogOut,
  UserCircle
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Get profile data
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  // Placeholder stats - will be connected to real data in next phase
  const stats = [
    { label: '总文章', value: '12', icon: FileText, color: 'text-blue-500' },
    { label: '总阅读', value: '1.2k', icon: BarChart3, color: 'text-purple-500' },
    { label: '新评论', value: '5', icon: MessageSquare, color: 'text-green-500' },
    { label: '活跃天数', value: '24', icon: Users, color: 'text-orange-500' },
  ]

  const handleSignOut = async () => {
    'use server'
    const supabase = await createClient()
    await supabase.auth.signOut()
    redirect('/login')
  }

  return (
    <div className="min-h-screen bg-[#fafafa] dark:bg-[#050505] pb-20">
      <div className="container max-w-6xl mx-auto px-6 pt-12">
        {/* Welcome Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div>
            <h1 className="text-4xl font-bold tracking-tight mb-2">
              早安, {profile?.display_name || user.email?.split('@')[0]}
            </h1>
            <p className="text-neutral-500">欢迎回到您的创作指挥中心。</p>
          </div>
          <div className="flex items-center gap-3">
            <Button asChild variant="outline" className="rounded-full border-black/10 dark:border-white/10">
              <Link href="/profile">
                <Settings className="w-4 h-4 mr-2" />
                设置
              </Link>
            </Button>
            <Button asChild className="rounded-full bg-black dark:bg-white text-white dark:text-black hover:opacity-90 px-6">
              <Link href="/admin/posts/new">
                <Plus className="w-4 h-4 mr-2" />
                撰写文章
              </Link>
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {stats.map((stat) => (
            <Card key={stat.label} className="border-none shadow-sm bg-white dark:bg-neutral-900 rounded-3xl overflow-hidden group">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-2 rounded-xl bg-black/[0.03] dark:bg-white/[0.03] ${stat.color}`}>
                    <stat.icon className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Live</span>
                </div>
                <div className="text-2xl font-bold mb-1">{stat.value}</div>
                <div className="text-xs text-neutral-500 font-medium">{stat.label}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Actions */}
          <div className="lg:col-span-2 space-y-8">
            <section>
              <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                核心功能
              </h2>
              <div className="grid sm:grid-cols-2 gap-4">
                <Link href="/post" className="group p-6 rounded-3xl bg-white dark:bg-neutral-900 border border-black/[0.03] dark:border-white/[0.03] hover:border-black/10 dark:hover:border-white/10 transition-all">
                  <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center mb-4 text-blue-500">
                    <FileText className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold mb-2 group-hover:translate-x-1 transition-transform">文章管理</h3>
                  <p className="text-sm text-neutral-500">编辑、删除或管理您的所有博客内容。</p>
                </Link>
                <Link href="/admin/posts/new" className="group p-6 rounded-3xl bg-white dark:bg-neutral-900 border border-black/[0.03] dark:border-white/[0.03] hover:border-black/10 dark:hover:border-white/10 transition-all">
                  <div className="w-10 h-10 rounded-full bg-purple-500/10 flex items-center justify-center mb-4 text-purple-500">
                    <Plus className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold mb-2 group-hover:translate-x-1 transition-transform">发布内容</h3>
                  <p className="text-sm text-neutral-500">使用现代编辑器开启您的新篇章。</p>
                </Link>
              </div>
            </section>

            <section>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold">最近发布</h2>
                <Link href="/post" className="text-sm text-neutral-400 hover:text-black dark:hover:text-white transition-colors flex items-center gap-1">
                  查看全部 <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
              <div className="p-12 text-center rounded-3xl border-2 border-dashed border-black/5 dark:border-white/5">
                <p className="text-sm text-neutral-400">暂无最近发布的文章</p>
              </div>
            </section>
          </div>

          {/* Sidebar Info */}
          <div className="space-y-8">
            <Card className="border-none bg-black dark:bg-white text-white dark:text-black rounded-3xl overflow-hidden shadow-2xl">
              <CardContent className="p-8">
                <UserCircle className="w-12 h-12 mb-6 opacity-50" />
                <h3 className="text-xl font-bold mb-2">博主账号</h3>
                <div className="space-y-4 mb-8">
                  <div className="opacity-70 text-sm">
                    <p className="font-medium">邮箱</p>
                    <p className="truncate">{user.email}</p>
                  </div>
                  <div className="opacity-70 text-sm">
                    <p className="font-medium">角色</p>
                    <p>{profile?.is_admin ? '超级管理员' : '普通用户'}</p>
                  </div>
                </div>
                <form action={handleSignOut}>
                  <Button type="submit" variant="ghost" className="w-full rounded-full bg-white/20 dark:bg-black/20 hover:bg-white/30 dark:hover:bg-black/30 text-white dark:text-black border-none">
                    <LogOut className="w-4 h-4 mr-2" />
                    退出登录
                  </Button>
                </form>
              </CardContent>
            </Card>

            <Card className="border-none bg-white dark:bg-neutral-900 rounded-3xl overflow-hidden shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg">系统通知</CardTitle>
                <CardDescription>最近的项目更新与状态。</CardDescription>
              </CardHeader>
              <CardContent className="px-6 pb-6 text-sm text-neutral-500">
                <ul className="space-y-4">
                  <li className="flex gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                    <p>现代简约风 UI 现已全局上线</p>
                  </li>
                  <li className="flex gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500 mt-1.5 shrink-0" />
                    <p>Supabase 数据库同步已开启</p>
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

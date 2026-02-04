'use client'

import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { useToast } from '@/hooks/use-toast'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Github } from "lucide-react"
import { Logo } from "@/components/ui/logo"

interface LoginModalProps {
  children?: React.ReactNode
  redirectTo?: string
}

type AuthMode = 'login' | 'register'

export function LoginModal({ children, redirectTo = '/dashboard' }: LoginModalProps) {
  const supabase = createClient()
  const router = useRouter()
  const { toast } = useToast()

  const [mode, setMode] = useState<AuthMode>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [error, setError] = useState('')

  // Reset state when modal closes or opens
  const handleOpenChange = (open: boolean) => {
    setIsOpen(open)
    if (!open) {
      setError('')
      setMode('login')
      setEmail('')
      setPassword('')
    }
  }

  const toggleMode = () => {
    setMode(mode === 'login' ? 'register' : 'login')
    setError('')
  }

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      if (mode === 'login') {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })

        if (error) throw error

        const { data: { user } } = await supabase.auth.getUser()

        // Get user display name (fallback to email part)
        let displayName = user?.email?.split('@')[0] || '用户'

        // Try to get profile display_name if available
        if (user) {
           const { data: profile } = await supabase
             .from('profiles')
             .select('display_name')
             .eq('id', user.id)
             .single()
           if (profile?.display_name) {
             displayName = profile.display_name
           }
        }

        // Calculate time of day greeting
        const hour = new Date().getHours()
        let greeting = '你好'
        if (hour >= 5 && hour < 12) greeting = '上午好'
        else if (hour >= 12 && hour < 18) greeting = '下午好'
        else if (hour >= 18 || hour < 5) greeting = '晚上好'

        toast({
          title: "登录成功",
          description: `${greeting}，${displayName}`,
        })
        setIsOpen(false)

        // Refresh the current route instead of hard redirect
        // allowing for "seamless" login feeling
        router.refresh()
      } else {
        // Registration logic
        if (password.length < 6) {
          throw new Error("密码长度至少需要6位")
        }

        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback`,
          },
        })

        if (error) throw error

        toast({
          title: "注册成功",
          description: "请检查您的邮箱以验证账号",
        })
        // Usually stay on modal or switch to login mode with a message
        setMode('login')
        setError('验证邮件已发送，请查收后登录')
      }
    } catch (err: any) {
      setError(err.message || "发生意外错误")
    } finally {
      setLoading(false)
    }
  }

  const handleGithubSignIn = async () => {
    setLoading(true)
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'github',
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=${redirectTo}`,
      },
    })

    if (error) {
      setError(error.message)
      setLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      {children && <DialogTrigger asChild>{children}</DialogTrigger>}
      <DialogContent className="sm:max-w-[425px] p-0 overflow-hidden bg-white/80 dark:bg-black/80 backdrop-blur-xl border-black/5 dark:border-white/10 shadow-2xl rounded-3xl gap-0">
        <div className="p-6 md:p-8 pb-6">
          <DialogHeader className="mb-6 space-y-3">
            <div className="mx-auto flex items-center justify-center mb-2">
              <Logo className="w-12 h-12 text-2xl" />
            </div>
            <DialogTitle className="text-2xl font-bold text-center tracking-tight">
              {mode === 'login' ? '欢迎回来' : '创建账号'}
            </DialogTitle>
            <DialogDescription className="text-center text-neutral-500 font-medium">
              {mode === 'login'
                ? '登录以发表评论或管理您的文章'
                : '注册以开启您的创作之旅'}
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-5">
            {/* Social Login */}
            <div className="flex flex-col gap-5 order-last">
              <div className="relative my-2">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-black/5 dark:border-white/5" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-transparent px-2 text-neutral-400 font-medium">
                    或使用 GitHub {mode === 'login' ? '登录' : '注册'}
                  </span>
                </div>
              </div>

              <Button
                type="button"
                className="w-full h-11 rounded-xl bg-black dark:bg-white text-white dark:text-black font-medium hover:opacity-90 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-black/10 dark:shadow-white/10"
                onClick={handleGithubSignIn}
                disabled={loading}
              >
                <Github className="w-5 h-5 mr-2.5" />
                使用 GitHub 继续
              </Button>
            </div>

            {/* Email Form */}
            <form onSubmit={handleAuth} className="space-y-4">
              {error && (
                <div className={cn(
                  "text-sm p-3 rounded-xl text-center font-medium animate-in fade-in zoom-in-95",
                  error.includes('验证')
                    ? "text-green-600 bg-green-50 dark:bg-green-950/30"
                    : "text-red-500 bg-red-50 dark:bg-red-950/30"
                )}>
                  {error}
                </div>
              )}
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="email" className="text-xs font-semibold text-neutral-500 ml-1">邮箱地址</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="h-11 rounded-xl border-black/10 dark:border-white/10 bg-white/50 dark:bg-black/50 focus:bg-white dark:focus:bg-black focus:ring-black/5 dark:focus:ring-white/10 transition-all"
                  />
                </div>
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between ml-1">
                    <Label htmlFor="password" className="text-xs font-semibold text-neutral-500">密码</Label>
                    {mode === 'login' && (
                      <span className="text-xs text-neutral-400 hover:text-black dark:hover:text-white cursor-pointer transition-colors">
                        忘记密码?
                      </span>
                    )}
                  </div>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                    className="h-11 rounded-xl border-black/10 dark:border-white/10 bg-white/50 dark:bg-black/50 focus:bg-white dark:focus:bg-black focus:ring-black/5 dark:focus:ring-white/10 transition-all"
                  />
                  {mode === 'register' && (
                    <p className="text-[10px] text-neutral-400 ml-1">
                      密码至少需要 6 个字符
                    </p>
                  )}
                </div>
              </div>
              <Button
                type="submit"
                variant="outline"
                className="w-full h-11 rounded-xl border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/5 hover:border-black/20 dark:hover:border-white/20 font-medium transition-all"
                disabled={loading}
              >
                {loading
                  ? (mode === 'login' ? '登录中...' : '注册中...')
                  : (mode === 'login' ? '登录' : '创建账号')}
              </Button>
            </form>
          </div>
        </div>

        {/* Footer Toggle */}
        <div className="p-4 bg-black/5 dark:bg-white/5 border-t border-black/5 dark:border-white/5 text-center">
          <p className="text-xs text-neutral-500">
            {mode === 'login' ? '还没有账号？' : '已有账号？'}{' '}
            <span
              className="text-black dark:text-white font-semibold cursor-pointer hover:underline"
              onClick={toggleMode}
            >
              {mode === 'login' ? '立即注册' : '立即登录'}
            </span>
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// Helper to use cn in this file if needed, though we imported it properly now
import { cn } from "@/lib/utils"

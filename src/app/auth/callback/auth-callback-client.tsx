'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useToast } from '@/hooks/use-toast'
import { CheckCircle2 } from 'lucide-react'

interface AuthCallbackClientProps {
  displayName: string
  redirectTo: string
}

export default function AuthCallbackClient({ displayName, redirectTo }: AuthCallbackClientProps) {
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    // Calculate time of day greeting (same as login modal)
    const hour = new Date().getHours()
    let greeting = '你好'
    if (hour >= 5 && hour < 12) greeting = '上午好'
    else if (hour >= 12 && hour < 18) greeting = '下午好'
    else if (hour >= 18 || hour < 5) greeting = '晚上好'

    // Show toast
    toast({
      title: "登录成功",
      description: `${greeting}，${displayName}`,
    })

    // Auto redirect after showing success state briefly
    const timer = setTimeout(() => {
      router.push(redirectTo)
      router.refresh()
    }, 1500)

    return () => clearTimeout(timer)
  }, [displayName, redirectTo, router, toast])

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#fafafa] dark:bg-[#050505] animate-in fade-in duration-500">
      <div className="text-center p-8 max-w-sm w-full">
        <div className="w-20 h-20 bg-black dark:bg-white rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-black/10">
          <CheckCircle2 className="w-10 h-10 text-white dark:text-black animate-in zoom-in duration-500 fill-current" />
        </div>

        <h1 className="text-3xl font-bold tracking-tight mb-3 text-neutral-900 dark:text-neutral-100">
          登录成功
        </h1>
        <p className="text-neutral-500 text-sm leading-relaxed">
          正在为您跳转...
        </p>
      </div>
    </div>
  )
}

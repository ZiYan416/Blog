import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { CheckCircle2, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default async function AuthCallbackPage({
  searchParams,
}: {
  searchParams: { code?: string; error?: string; type?: string }
}) {
  const supabase = await createClient()
  let userEmail = ''

  // Handle OAuth/Email code exchange
  if (searchParams.code) {
    const { data, error } = await supabase.auth.exchangeCodeForSession(searchParams.code)
    if (error) {
      redirect(`/login?error=${encodeURIComponent(error.message)}`)
    }
    userEmail = data.user?.email || ''
  }

  // Handle error display
  if (searchParams.error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fafafa] dark:bg-[#050505]">
        <div className="text-center p-8 max-w-sm">
          <div className="w-16 h-16 bg-red-50 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-6 text-red-500">
            <CheckCircle2 className="w-8 h-8 rotate-45" />
          </div>
          <h1 className="text-2xl font-bold mb-3 text-neutral-900 dark:text-neutral-100">认证失败</h1>
          <p className="text-neutral-500 text-sm mb-8">{searchParams.error}</p>
          <Button asChild variant="outline" className="w-full rounded-full">
            <Link href="/login">重新登录</Link>
          </Button>
        </div>
      </div>
    )
  }

  // Show Success Interface
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#fafafa] dark:bg-[#050505] animate-in fade-in duration-700">
      <div className="text-center p-8 max-w-sm w-full">
        <div className="w-20 h-20 bg-black dark:bg-white rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-black/10">
          <CheckCircle2 className="w-10 h-10 text-white dark:text-black animate-in zoom-in duration-500 delay-300 fill-current" />
        </div>

        <h1 className="text-3xl font-bold tracking-tight mb-3 text-neutral-900 dark:text-neutral-100">
          验证成功
        </h1>
        <p className="text-neutral-500 text-sm mb-10 leading-relaxed">
          您的账号已成功激活。现在您可以返回登录页面并开始创作。
        </p>

        <div className="space-y-3">
          <Button asChild className="w-full h-12 rounded-full bg-black dark:bg-white text-white dark:text-black hover:opacity-90 transition-all font-medium">
            <Link href={`/login?email=${encodeURIComponent(userEmail)}`}>
              返回登录页面
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}

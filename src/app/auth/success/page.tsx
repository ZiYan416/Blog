import AuthSuccessClient from './auth-success-client'
import { getSafeRedirectPath } from '@/lib/auth'

interface SuccessPageProps {
  searchParams: Promise<{ name?: string; next?: string; error?: string }>
}

export default async function AuthSuccessPage({ searchParams }: SuccessPageProps) {
  const params = await searchParams

  // If there's an error
  if (params.error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fafafa] dark:bg-[#050505]">
        <div className="text-center p-8 max-w-sm w-full">
          <h1 className="text-2xl font-bold mb-3 text-red-500">登录失败</h1>
          <p className="text-neutral-500 text-sm">{params.error}</p>
        </div>
      </div>
    )
  }

  const displayName = params.name || '用户'
  const redirectTo = getSafeRedirectPath(params.next)

  return <AuthSuccessClient displayName={displayName} redirectTo={redirectTo} />
}

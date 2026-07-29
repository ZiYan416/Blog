import { NextResponse } from 'next/server'
import { apiError, getErrorMessage } from '@/lib/api-response'
import { getAnalyticsData } from '@/lib/analytics-helpers'
import { AccessError, requireAdmin } from '@/lib/server-auth'
import { createClient as createServerClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const supabase = await createServerClient()

    await requireAdmin(supabase)

    return NextResponse.json(await getAnalyticsData(supabase, 7))
  } catch (error) {
    if (error instanceof AccessError) {
      return apiError(error.message, error.status, error.code)
    }
    console.error('Analytics API error:', error)
    return apiError(getErrorMessage(error), 500, 'ANALYTICS_FAILED')
  }
}

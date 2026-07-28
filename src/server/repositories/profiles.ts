import "server-only"

import { unstable_cache } from "next/cache"
import { createPublicClient } from "@/lib/supabase/public"

async function queryPublicProfile(id: string) {
  const supabase = createPublicClient()
  const { data, error } = await supabase
    .from("public_profiles")
    .select(
      "id, display_name, avatar_url, bio, website, card_bg, enable_tipping, alipay_qr, wechat_qr"
    )
    .eq("id", id)
    .maybeSingle()

  if (error) throw error
  return data
}

export const getPublicProfile = unstable_cache(
  queryPublicProfile,
  ["public-profile"],
  { revalidate: 300, tags: ["profiles"] }
)

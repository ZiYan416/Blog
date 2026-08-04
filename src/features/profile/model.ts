export interface EditableProfile {
  display_name: string
  bio: string
  website: string
  avatar_url: string
  card_bg: string
  alipay_qr: string
  wechat_qr: string
  enable_tipping: boolean
}

export interface ProfileStats {
  commentsCount: number
  activeDays: number
  lastActive?: string
  joinedDate?: string
}

export interface ProfileActivity {
  id: string
  content: string
  created_at: string
  posts: {
    title: string
    public_id: number
    cover_image: string | null
    excerpt: string | null
  } | null
}

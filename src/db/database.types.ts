export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string | null
          display_name: string | null
          avatar_url: string | null
          bio: string | null
          website: string | null
          card_bg: string | null
          is_admin: boolean
          alipay_qr: string | null
          wechat_qr: string | null
          enable_tipping: boolean
          last_sign_in_at: string | null
          created_at: string
          updated_at: string | null
        }
        Insert: {
          id: string
          email?: string | null
          display_name?: string | null
          avatar_url?: string | null
          bio?: string | null
          website?: string | null
          card_bg?: string | null
          is_admin?: boolean
          alipay_qr?: string | null
          wechat_qr?: string | null
          enable_tipping?: boolean
          last_sign_in_at?: string | null
          created_at?: string
          updated_at?: string | null
        }
        Update: {
          email?: string | null
          display_name?: string | null
          avatar_url?: string | null
          bio?: string | null
          website?: string | null
          card_bg?: string | null
          is_admin?: boolean
          alipay_qr?: string | null
          wechat_qr?: string | null
          enable_tipping?: boolean
          last_sign_in_at?: string | null
          created_at?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      posts: {
        Row: {
          id: string
          title: string
          slug: string
          content: string | null
          excerpt: string | null
          cover_image: string | null
          published: boolean
          published_at: string | null
          featured: boolean
          created_at: string
          updated_at: string
          author_id: string | null
          category: string | null
          view_count: number
        }
        Insert: {
          id?: string
          title: string
          slug: string
          content?: string | null
          excerpt?: string | null
          cover_image?: string | null
          published?: boolean
          published_at?: string | null
          featured?: boolean
          created_at?: string
          updated_at?: string
          author_id?: string | null
          category?: string | null
          view_count?: number
        }
        Update: {
          title?: string
          slug?: string
          content?: string | null
          excerpt?: string | null
          cover_image?: string | null
          published?: boolean
          published_at?: string | null
          featured?: boolean
          created_at?: string
          updated_at?: string
          author_id?: string | null
          category?: string | null
          view_count?: number
        }
        Relationships: [
          {
            foreignKeyName: "posts_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      tags: {
        Row: {
          id: string
          name: string
          slug: string
          post_count: number
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          post_count?: number
          created_at?: string
        }
        Update: {
          name?: string
          slug?: string
          post_count?: number
          created_at?: string
        }
        Relationships: []
      }
      post_tags: {
        Row: {
          post_id: string
          tag_id: string
          created_at: string
        }
        Insert: {
          post_id: string
          tag_id: string
          created_at?: string
        }
        Update: {
          post_id?: string
          tag_id?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "post_tags_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "post_tags_tag_id_fkey"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "tags"
            referencedColumns: ["id"]
          },
        ]
      }
      comments: {
        Row: {
          id: string
          post_id: string
          user_id: string
          content: string
          approved: boolean
          parent_id: string | null
          reply_count: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          post_id: string
          user_id: string
          content: string
          approved?: boolean
          parent_id?: string | null
          reply_count?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          post_id?: string
          user_id?: string
          content?: string
          approved?: boolean
          parent_id?: string | null
          reply_count?: number
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "comments_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comments_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "comments"
            referencedColumns: ["id"]
          },
        ]
      }
      stats_snapshots: {
        Row: {
          id: string
          date: string
          total_posts: number
          total_views: number
          total_comments: number
          total_users: number
          new_posts_today: number
          new_views_today: number
          new_comments_today: number
          new_users_today: number
          active_users_today: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          date: string
          total_posts?: number
          total_views?: number
          total_comments?: number
          total_users?: number
          new_posts_today?: number
          new_views_today?: number
          new_comments_today?: number
          new_users_today?: number
          active_users_today?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          date?: string
          total_posts?: number
          total_views?: number
          total_comments?: number
          total_users?: number
          new_posts_today?: number
          new_views_today?: number
          new_comments_today?: number
          new_users_today?: number
          active_users_today?: number
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      public_profiles: {
        Row: {
          id: string
          display_name: string | null
          avatar_url: string | null
          bio: string | null
          website: string | null
          card_bg: string | null
          created_at: string
          alipay_qr: string | null
          wechat_qr: string | null
          enable_tipping: boolean
        }
        Relationships: []
      }
    }
    Functions: {
      calculate_daily_stats: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      create_post_with_tags: {
        Args: {
          p_title: string
          p_slug: string
          p_content: string
          p_excerpt: string
          p_cover_image: string | null
          p_tag_names: string[]
          p_tag_slugs: string[]
          p_category: string | null
          p_published: boolean
        }
        Returns: Database["public"]["Tables"]["posts"]["Row"][]
      }
      increment_post_view: {
        Args: { post_slug: string }
        Returns: number | null
      }
      is_current_user_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      set_user_admin: {
        Args: { target_user_id: string; enabled: boolean }
        Returns: undefined
      }
      sync_post_tag_relations: {
        Args: {
          target_post_id: string
          tag_names: string[]
          tag_slugs: string[]
        }
        Returns: undefined
      }
      update_post_with_tags: {
        Args: {
          p_current_slug: string
          p_title: string
          p_new_slug: string
          p_content: string
          p_excerpt: string
          p_cover_image: string | null
          p_tag_names: string[]
          p_tag_slugs: string[]
          p_category: string | null
          p_published: boolean
        }
        Returns: Database["public"]["Tables"]["posts"]["Row"][]
      }
    }
    Enums: Record<PropertyKey, never>
    CompositeTypes: Record<PropertyKey, never>
  }
}

export type Profile = Database["public"]["Tables"]["profiles"]["Row"]
export type PublicProfile = Database["public"]["Views"]["public_profiles"]["Row"]
export type Post = Database["public"]["Tables"]["posts"]["Row"]
export type Tag = Database["public"]["Tables"]["tags"]["Row"]
export type CommentRow = Database["public"]["Tables"]["comments"]["Row"]

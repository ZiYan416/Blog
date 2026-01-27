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
      posts: {
        Row: {
          id: string
          title: string
          slug: string
          content: string
          excerpt: string
          cover_image: string | null
          published: boolean
          featured: boolean
          created_at: string
          updated_at: string
          author_id: string
          tags: Json
          category: string | null
          view_count: number
        }
        Insert: {
          id?: string
          title?: string
          slug?: string
          content?: string
          excerpt?: string
          cover_image?: string | null
          published?: boolean
          featured?: boolean
          created_at?: string
          updated_at?: string
          author_id?: string
          tags?: Json
          category?: string | null
          view_count?: number
        }
        Update: {
          id?: string
          title?: string
          slug?: string
          content?: string
          excerpt?: string
          cover_image?: string | null
          published?: boolean
          featured?: boolean
          created_at?: string
          updated_at?: string
          author_id?: string
          tags?: Json
          category?: string | null
          view_count?: number
        }
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
          name?: string
          slug?: string
          post_count?: number
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          post_count?: number
          created_at?: string
        }
      }
      comments: {
        Row: {
          id: string
          post_id: string
          content: string
          author_name: string
          author_email: string
          created_at: string
          updated_at: string
          approved: boolean
        }
        Insert: {
          id?: string
          post_id?: string
          content?: string
          author_name?: string
          author_email?: string
          created_at?: string
          updated_at?: string
          approved?: boolean
        }
        Update: {
          id?: string
          post_id?: string
          content?: string
          author_name?: string
          author_email?: string
          created_at?: string
          updated_at?: string
          approved?: boolean
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}

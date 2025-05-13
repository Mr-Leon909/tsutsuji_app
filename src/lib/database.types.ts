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
      users: {
        Row: {
          id: string
          username: string
          birth_date: string
          avatar_url: string | null
          created_at: string
        }
        Insert: {
          id?: string
          username: string
          birth_date: string
          avatar_url?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          username?: string
          birth_date?: string
          avatar_url?: string | null
          created_at?: string
        }
      }
      posts: {
        Row: {
          id: string
          user_id: string
          media_url: string
          is_video: boolean
          caption: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          media_url: string
          is_video: boolean
          caption?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          media_url?: string
          is_video?: boolean
          caption?: string | null
          created_at?: string
        }
      }
      likes: {
        Row: {
          id: string
          post_id: string
          user_id: string
          created_at: string
        }
        Insert: {
          id?: string
          post_id: string
          user_id: string
          created_at?: string
        }
        Update: {
          id?: string
          post_id?: string
          user_id?: string
          created_at?: string
        }
      }
      comments: {
        Row: {
          id: string
          post_id: string
          user_id: string
          content: string
          created_at: string
        }
        Insert: {
          id?: string
          post_id: string
          user_id: string
          content: string
          created_at?: string
        }
        Update: {
          id?: string
          post_id?: string
          user_id?: string
          content?: string
          created_at?: string
        }
      }
      comment_likes: {
        Row: {
          id: string
          comment_id: string
          user_id: string
          created_at: string
        }
        Insert: {
          id?: string
          comment_id: string
          user_id: string
          created_at?: string
        }
        Update: {
          id?: string
          comment_id?: string
          user_id?: string
          created_at?: string
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
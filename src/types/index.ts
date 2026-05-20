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
      categories: {
        Row: {
          id: string
          name: string
          slug: string
          order_index?: number
          created_at?: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          order_index?: number
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          order_index?: number
          created_at?: string
        }
      }
      products: {
        Row: {
          id: string
          name: string
          description: string | null
          price: number
          original_price?: number | null
          stock: number
          images: string[]
          category_id: string | null
          is_featured: boolean
          specs: Json
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          price: number
          original_price?: number | null
          stock: number
          images?: string[]
          category_id?: string | null
          is_featured?: boolean
          specs?: Json
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          price?: number
          original_price?: number | null
          stock?: number
          images?: string[]
          category_id?: string | null
          is_featured?: boolean
          specs?: Json
          created_at?: string
        }
      }
      promo_banners: {
        Row: {
          id: string
          title: string
          subtitle: string | null
          image_url: string
          link_url: string | null
          size: string
          is_active: boolean
          order_index: number
          created_at: string
        }
        Insert: {
          id?: string
          title: string
          subtitle?: string | null
          image_url: string
          link_url?: string | null
          size: string
          is_active?: boolean
          order_index?: number
          created_at?: string
        }
        Update: {
          id?: string
          title?: string
          subtitle?: string | null
          image_url?: string
          link_url?: string | null
          size?: string
          is_active?: boolean
          order_index?: number
          created_at?: string
        }
      }
      orders: {
        Row: {
          id: string
          customer_name: string
          customer_phone: string | null
          total: number
          items: Json
          status: string
          created_at: string
        }
        Insert: {
          id?: string
          customer_name: string
          customer_phone?: string | null
          total: number
          items?: Json
          status?: string
          created_at?: string
        }
        Update: {
          id?: string
          customer_name?: string
          customer_phone?: string | null
          total?: number
          items?: Json
          status?: string
          created_at?: string
        }
      }
      main_banners: {
        Row: {
          id: string
          title: string
          subtitle: string | null
          image_url: string
          button_text: string | null
          button_link: string | null
          is_active: boolean
          order_index: number
          created_at: string
        }
        Insert: {
          id?: string
          title: string
          subtitle?: string | null
          image_url: string
          button_text?: string | null
          button_link?: string | null
          is_active?: boolean
          order_index?: number
          created_at?: string
        }
        Update: {
          id?: string
          title?: string
          subtitle?: string | null
          image_url?: string
          button_text?: string | null
          button_link?: string | null
          is_active?: boolean
          order_index?: number
          created_at?: string
        }
      }
      partner_brands: {
        Row: {
          id: string
          name: string
          logo_url: string
          is_featured: boolean
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          logo_url: string
          is_featured?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          logo_url?: string
          is_featured?: boolean
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

// Helper types for easier imports in components
export type Category = Database['public']['Tables']['categories']['Row']
export type Product = Database['public']['Tables']['products']['Row']
export type Order = Database['public']['Tables']['orders']['Row']
export type MainBanner = Database['public']['Tables']['main_banners']['Row']
export type PromoBanner = Database['public']['Tables']['promo_banners']['Row']
export type PartnerBrand = Database['public']['Tables']['partner_brands']['Row']

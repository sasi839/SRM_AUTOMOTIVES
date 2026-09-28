import { createClient } from '@supabase/supabase-js';

export interface SiteContent {
  id: string;
  business_name: string;
  owner_name?: string | null;
  primary_phone: string;
  secondary_phone?: string | null;
  whatsapp_number?: string | null;
  email?: string | null;
  address?: string | null;
  google_maps_url?: string | null;
  created_at: string;
  updated_at: string;
}

export interface SiteImage {
  id: string;
  section: 'hero' | 'service' | 'gallery';
  title?: string | null;
  subtitle?: string | null;
  category?: string | null;
  image_url: string;
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface AdminUser {
  id: string;
  email: string;
  created_at: string;
}

export interface Database {
  public: {
    Tables: {
      site_content: {
        Row: SiteContent;
        Insert: Partial<SiteContent>;
        Update: Partial<SiteContent>;
        Relationships: [];
      };
      site_images: {
        Row: SiteImage;
        Insert: Partial<SiteImage>;
        Update: Partial<SiteImage>;
        Relationships: [];
      };
      admin_users: {
        Row: AdminUser;
        Insert: Partial<AdminUser>;
        Update: Partial<AdminUser>;
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      is_admin: {
        Args: Record<string, never>;
        Returns: boolean;
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

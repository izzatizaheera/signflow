import { createClient } from "@supabase/supabase-js";

// Check if credentials are present in the environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "";

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

/**
 * Safe client export. Access credentials conditionally or through safe wrappers.
 * Keeps compatibility with standard React, Vite, and Netlify deployments.
 */
export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

/**
 * Simple interface representing the "signs" table schema.
 */
export interface BimSign {
  id: string; // uuid or serial id
  title: string;
  category: string; // 'Basic Conversation' | 'Emergency' | 'Daily Life' | 'Social'
  explanation: string;
  image_url: string; // local fallbacks or superbase storage CDN url
}

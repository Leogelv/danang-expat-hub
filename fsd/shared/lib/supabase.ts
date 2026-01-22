import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_KEY;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Supabase env vars are missing. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.');
}

export const supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
  auth: { persistSession: true, autoRefreshToken: true },
});

export function getSupabaseServer(options: { serviceRole?: boolean } = {}): SupabaseClient {
  const key = options.serviceRole ? supabaseServiceRoleKey : supabaseAnonKey;
  if (!key) {
    throw new Error('Supabase service role key is missing. Set SUPABASE_SERVICE_ROLE_KEY.');
  }
  return createClient(supabaseUrl, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

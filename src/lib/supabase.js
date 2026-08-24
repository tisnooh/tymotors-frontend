import { createClient } from '@supabase/supabase-js';

const url = process.env.REACT_APP_SUPABASE_URL;
const publishableKey = process.env.REACT_APP_SUPABASE_PUBLISHABLE_KEY;

export const isSupabaseConfigured = Boolean(url?.startsWith('https://') && url?.includes('.supabase.co') && publishableKey);

export const supabase = isSupabaseConfigured
  ? createClient(url, publishableKey, {
      auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true, flowType: 'pkce' },
      global: { headers: { 'X-Client-Info': 'tymotors-frontend/2.0' } },
    })
  : null;

export async function getAccessToken() {
  if (!supabase) return null;
  const { data } = await supabase.auth.getSession();
  return data.session?.access_token || null;
}

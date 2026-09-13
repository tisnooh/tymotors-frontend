const url = process.env.REACT_APP_SUPABASE_URL;
const publishableKey = process.env.REACT_APP_SUPABASE_PUBLISHABLE_KEY;

export const isSupabaseConfigured = Boolean(
  url?.startsWith('https://') && url?.includes('.supabase.co') && publishableKey
);

let modulePromise;

export function loadSupabase() {
  if (!modulePromise) modulePromise = import('@/lib/supabase');
  return modulePromise;
}

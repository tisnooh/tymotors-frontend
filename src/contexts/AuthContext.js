import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { isSupabaseConfigured, loadSupabase } from '@/lib/supabaseLoader';
import { setCachedAccessToken } from '@/lib/authSession';

const AuthContext = createContext(null);

async function authClient() {
  const { supabase } = await loadSupabase();
  if (!supabase) throw new Error('Supabase Auth non configuré');
  return supabase.auth;
}

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isSupabaseConfigured) { setLoading(false); return undefined; }
    let mounted = true;
    let subscription;

    const initialize = async () => {
      const auth = await authClient();
      if (!mounted) return;
      const { data } = await auth.getSession();
      if (!mounted) return;
      const initialSession = data.session || null;
      setCachedAccessToken(initialSession?.access_token);
      setSession(initialSession);
      setLoading(false);
      const { data: listener } = auth.onAuthStateChange((_event, nextSession) => {
        setCachedAccessToken(nextSession?.access_token);
        setSession(nextSession);
        setLoading(false);
      });
      subscription = listener.subscription;
    };

    const start = () => initialize().catch(() => { if (mounted) setLoading(false); });
    const idleId = window.requestIdleCallback
      ? window.requestIdleCallback(start, { timeout: 1000 })
      : window.setTimeout(start, 0);

    return () => {
      mounted = false;
      if (window.cancelIdleCallback) window.cancelIdleCallback(idleId);
      else window.clearTimeout(idleId);
      subscription?.unsubscribe();
    };
  }, []);

  const signIn = useCallback(async (email, password) => {
    const auth = await authClient();
    const { data, error } = await auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
  }, []);

  const signUp = useCallback(async ({ email, password, fullName }) => {
    const auth = await authClient();
    const { data, error } = await auth.signUp({
      email, password,
      options: { data: { full_name: fullName }, emailRedirectTo: `${window.location.origin}/auth/confirm` },
    });
    if (error) throw error;
    return data;
  }, []);

  const updatePassword = useCallback(async (password) => {
    const auth = await authClient();
    const { error } = await auth.updateUser({ password });
    if (error) throw error;
  }, []);

  const updateEmail = useCallback(async (email) => {
    const auth = await authClient();
    const { data, error } = await auth.updateUser({ email }, {
      emailRedirectTo: `${window.location.origin}/auth/confirm`,
    });
    if (error) throw error;
    return data;
  }, []);

  const signOut = useCallback(async () => {
    const auth = await authClient();
    const { error } = await auth.signOut();
    if (error) throw error;
  }, []);

  const value = useMemo(() => ({ session, user: session?.user || null, loading, configured: isSupabaseConfigured,
    signIn, signUp, signOut, updatePassword, updateEmail }),
    [session, loading, signIn, signUp, signOut, updatePassword, updateEmail]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}

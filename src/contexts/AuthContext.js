import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { isSupabaseConfigured, supabase } from '@/lib/supabase';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!supabase) { setLoading(false); return undefined; }
    let mounted = true;
    supabase.auth.getSession().then(({ data }) => {
      if (mounted) { setSession(data.session || null); setLoading(false); }
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession); setLoading(false);
    });
    return () => { mounted = false; listener.subscription.unsubscribe(); };
  }, []);

  const signIn = useCallback(async (email, password) => {
    if (!supabase) throw new Error('Supabase Auth non configuré');
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
  }, []);

  const signUp = useCallback(async ({ email, password, fullName }) => {
    if (!supabase) throw new Error('Supabase Auth non configuré');
    const { data, error } = await supabase.auth.signUp({
      email, password,
      options: { data: { full_name: fullName }, emailRedirectTo: `${window.location.origin}/account` },
    });
    if (error) throw error;
    return data;
  }, []);

  const resetPassword = useCallback(async (email) => {
    if (!supabase) throw new Error('Supabase Auth non configuré');
    const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: `${window.location.origin}/auth/reset` });
    if (error) throw error;
  }, []);

  const updatePassword = useCallback(async (password) => {
    if (!supabase) throw new Error('Supabase Auth non configuré');
    const { error } = await supabase.auth.updateUser({ password });
    if (error) throw error;
  }, []);

  const signOut = useCallback(async () => { if (supabase) await supabase.auth.signOut(); }, []);
  const value = useMemo(() => ({ session, user: session?.user || null, loading, configured: isSupabaseConfigured,
    signIn, signUp, signOut, resetPassword, updatePassword }),
    [session, loading, signIn, signUp, signOut, resetPassword, updatePassword]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}

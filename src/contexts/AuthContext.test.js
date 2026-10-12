import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import { AuthProvider, useAuth } from './AuthContext';
import { AuthEmail } from '@/lib/api';
import { loadSupabase } from '@/lib/supabaseLoader';
const mockAuth = { getSession: jest.fn().mockResolvedValue({ data: { session: null } }), onAuthStateChange: jest.fn().mockReturnValue({ data: { subscription: { unsubscribe: jest.fn() } } }), setSession: jest.fn().mockResolvedValue({ data: { session: { access_token: 'fixture' } } }) };
jest.mock('@/lib/supabaseLoader', () => ({ isSupabaseConfigured: true, loadSupabase: jest.fn(async () => ({ supabase: { auth: mockAuth } })) }));
jest.mock('@/lib/api', () => ({ AuthEmail: { login: jest.fn() } }));
function Probe() { const { signIn } = useAuth(); return <button onClick={() => signIn('qa@example.com', 'synthetic')}>Connexion fixture</button>; }
test('connexion passe par la limite API et installe la session Supabase', async () => {
  const tokens = { access_token: 'access_fixture', refresh_token: 'refresh_fixture' };
  global.IS_REACT_ACT_ENVIRONMENT = true;
  loadSupabase.mockResolvedValue({ supabase: { auth: mockAuth } });
  mockAuth.getSession.mockResolvedValue({ data: { session: null } });
  mockAuth.onAuthStateChange.mockReturnValue({ data: { subscription: { unsubscribe: jest.fn() } } });
  mockAuth.setSession.mockResolvedValue({ data: { session: { access_token: 'fixture' } } });
  AuthEmail.login.mockResolvedValue(tokens);
  const host = document.createElement('div'), root = createRoot(host);
  try {
    await act(async () => root.render(<AuthProvider><Probe /></AuthProvider>));
    await act(async () => host.querySelector('button').click());
    expect(mockAuth.setSession).toHaveBeenCalledWith(tokens);
    expect(AuthEmail.login).toHaveBeenCalledWith('qa@example.com', 'synthetic');
  } finally { await act(async () => root.unmount()); }
});

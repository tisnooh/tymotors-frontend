// Browser QA only, bundled exclusively by the dedicated fixture entry.
import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { setCachedAccessToken } from '../src/lib/authSession';
const user = { id: '10000000-0000-4000-8000-000000000001', email: 'admin@example.test' };
export function AuthProvider({ children }) { const location = useLocation(); useEffect(() => { setCachedAccessToken(location.pathname.startsWith('/admin') ? 'admin-test-token' : null); }, [location.pathname]); return children; }
export function useAuth() { const admin = window.location.pathname.startsWith('/admin'); return { configured: true, loading: false, user: admin ? user : null, session: admin ? { user, access_token: 'admin-test-token' } : null, signOut: async () => {}, signIn: async () => {} }; }

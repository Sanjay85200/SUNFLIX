import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import { supabase, isSupabaseConfigured } from '../services/supabase';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [justLoggedIn, setJustLoggedIn] = useState(false);

    const persistSession = useCallback((sessionUser, accessToken) => {
        if (!sessionUser || !accessToken) return;
        localStorage.setItem('token', accessToken);
        localStorage.setItem('user', JSON.stringify(sessionUser));
        setUser(sessionUser);
    }, []);

    const clearSession = useCallback(() => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
        setJustLoggedIn(false);
    }, []);

    useEffect(() => {
        let cancelled = false;

        async function init() {
            if (isSupabaseConfigured && supabase) {
                const {
                    data: { session },
                } = await supabase.auth.getSession();
                if (!cancelled && session?.user) {
                    persistSession(session.user, session.access_token);
                    setLoading(false);
                    return;
                }
            }

            const token = localStorage.getItem('token');
            const storedUser = localStorage.getItem('user');
            if (token && storedUser) {
                try {
                    if (!cancelled) setUser(JSON.parse(storedUser));
                } catch {
                    clearSession();
                }
            }
            if (!cancelled) setLoading(false);
        }

        init();

        if (!isSupabaseConfigured || !supabase) {
            return () => {
                cancelled = true;
            };
        }

        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((event, session) => {
            if (session?.user) {
                persistSession(session.user, session.access_token);
                return;
            }
            if (event === 'SIGNED_OUT') {
                clearSession();
            }
        });

        return () => {
            cancelled = true;
            subscription.unsubscribe();
        };
    }, [persistSession, clearSession]);

    const login = (userData, token) => {
        persistSession(userData, token);
        setJustLoggedIn(true);
    };

    const logout = async () => {
        if (isSupabaseConfigured && supabase) {
            await supabase.auth.signOut().catch(() => {});
        }
        clearSession();
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, loading, justLoggedIn, setJustLoggedIn }}>
            {children}
        </AuthContext.Provider>
    );
};

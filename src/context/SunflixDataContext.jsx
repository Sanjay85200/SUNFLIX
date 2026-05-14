import React, {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState,
} from 'react';
import { useAuth } from './AuthContext';
import { supabase, isSupabaseConfigured } from '../services/supabase';
import { isTvShow } from '../services/api';

const SunflixDataContext = createContext(null);

export const useSunflixData = () => {
    const ctx = useContext(SunflixDataContext);
    if (!ctx) throw new Error('useSunflixData must be used within SunflixDataProvider');
    return ctx;
};

const isDemoUser = (u) => u?.id === 'sunflix-demo';

function storageKeyWatchlist(userId) {
    return `sunflix_watchlist_${userId || 'guest'}`;
}

function storageKeyProfile(userId) {
    return `sunflix_profile_${userId || 'guest'}`;
}

export function SunflixDataProvider({ children }) {
    const { user } = useAuth();
    const [watchlist, setWatchlist] = useState([]);
    const [profile, setProfile] = useState({ sun_coins: 0, xp: 0, display_name: '' });
    const [loading, setLoading] = useState(false);

    const isDemo = isDemoUser(user);
    const uid = user?.id;

    const loadLocal = useCallback(() => {
        if (!uid) {
            setWatchlist([]);
            setProfile({ sun_coins: 0, xp: 0, display_name: '' });
            return;
        }
        try {
            const w = localStorage.getItem(storageKeyWatchlist(uid));
            setWatchlist(w ? JSON.parse(w) : []);
            const p = localStorage.getItem(storageKeyProfile(uid));
            setProfile(
                p
                    ? JSON.parse(p)
                    : {
                          sun_coins: 120,
                          xp: 400,
                          display_name: user?.user_metadata?.name || user?.email || 'Demo pilot',
                      }
            );
        } catch {
            setWatchlist([]);
            setProfile({ sun_coins: 0, xp: 0, display_name: '' });
        }
    }, [uid, user?.email, user?.user_metadata?.name]);

    const persistLocalWatchlist = useCallback(
        (rows) => {
            if (!uid) return;
            localStorage.setItem(storageKeyWatchlist(uid), JSON.stringify(rows));
        },
        [uid]
    );

    const persistLocalProfile = useCallback(
        (p) => {
            if (!uid) return;
            localStorage.setItem(storageKeyProfile(uid), JSON.stringify(p));
        },
        [uid]
    );

    const loadFromSupabase = useCallback(async () => {
        if (!supabase || !uid || isDemo) {
            loadLocal();
            return;
        }
        setLoading(true);
        try {
            const { data: pRow } = await supabase.from('profiles').select('*').eq('id', uid).maybeSingle();
            if (pRow) {
                setProfile({
                    sun_coins: pRow.sun_coins ?? 0,
                    xp: pRow.xp ?? 0,
                    display_name: pRow.display_name || user?.email || '',
                });
            } else {
                await supabase.from('profiles').upsert(
                    {
                        id: uid,
                        email: user?.email,
                        display_name: user?.user_metadata?.name || user?.email?.split('@')[0] || 'Player',
                        updated_at: new Date().toISOString(),
                    },
                    { onConflict: 'id' }
                );
                setProfile({
                    sun_coins: 0,
                    xp: 0,
                    display_name: user?.user_metadata?.name || user?.email || '',
                });
            }

            const { data: wRows, error: wErr } = await supabase
                .from('watchlist')
                .select('*')
                .eq('user_id', uid)
                .order('created_at', { ascending: false });
            if (!wErr) setWatchlist(wRows || []);
        } catch (e) {
            console.warn('[SUNFLIX] Data load:', e);
            loadLocal();
        } finally {
            setLoading(false);
        }
    }, [uid, isDemo, loadLocal, user?.email, user?.user_metadata?.name]);

    useEffect(() => {
        if (!user) {
            setWatchlist([]);
            setProfile({ sun_coins: 0, xp: 0, display_name: '' });
            return;
        }
        loadFromSupabase();
    }, [user, loadFromSupabase]);

    useEffect(() => {
        if (!supabase || !uid || isDemo || !isSupabaseConfigured) return undefined;
        const channel = supabase
            .channel(`wl:${uid}`)
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'watchlist', filter: `user_id=eq.${uid}` },
                () => {
                    loadFromSupabase();
                }
            )
            .subscribe();
        return () => {
            supabase.removeChannel(channel);
        };
    }, [uid, isDemo, loadFromSupabase]);

    const inWatchlist = useCallback(
        (tmdbId, mediaType) =>
            watchlist.some((w) => w.tmdb_id === tmdbId && w.media_type === mediaType),
        [watchlist]
    );

    const bumpRewards = useCallback(
        async (userId) => {
            if (!supabase) return;
            const { data: cur } = await supabase
                .from('profiles')
                .select('sun_coins,xp')
                .eq('id', userId)
                .maybeSingle();
            const coins = (cur?.sun_coins ?? 0) + 5;
            const xp = (cur?.xp ?? 0) + 12;
            await supabase
                .from('profiles')
                .update({ sun_coins: coins, xp, updated_at: new Date().toISOString() })
                .eq('id', userId);
        },
        []
    );

    const addToWatchlist = useCallback(
        async (movie) => {
            if (!user) return;
            const mediaType = isTvShow(movie) ? 'tv' : 'movie';
            if (inWatchlist(movie.id, mediaType)) return;

            const row = {
                tmdb_id: movie.id,
                media_type: mediaType,
                title: movie.title || movie.name,
                poster_path: movie.poster_path || null,
            };

            if (isDemo || !supabase) {
                setWatchlist((prev) => {
                    const next = [{ ...row, id: `local-${Date.now()}`, user_id: uid }, ...prev];
                    persistLocalWatchlist(next);
                    return next;
                });
                setProfile((p) => {
                    const n = { ...p, sun_coins: (p.sun_coins || 0) + 5, xp: (p.xp || 0) + 12 };
                    persistLocalProfile(n);
                    return n;
                });
                return;
            }

            const { error } = await supabase.from('watchlist').insert({ user_id: uid, ...row });
            if (error) {
                console.warn('[SUNFLIX] watchlist insert', error.message);
                return;
            }
            await bumpRewards(uid);
            await loadFromSupabase();
        },
        [
            user,
            uid,
            isDemo,
            supabase,
            persistLocalWatchlist,
            persistLocalProfile,
            loadFromSupabase,
            inWatchlist,
            bumpRewards,
        ]
    );

    const removeFromWatchlist = useCallback(
        async (row) => {
            if (!user) return;
            const { id, tmdb_id: tmdbId, media_type: mediaType } = row;
            if (isDemo || !supabase) {
                setWatchlist((prev) => {
                    const next = prev.filter((x) => x.id !== id);
                    persistLocalWatchlist(next);
                    return next;
                });
                return;
            }
            await supabase.from('watchlist').delete().eq('id', id);
            await loadFromSupabase();
        },
        [user, isDemo, supabase, persistLocalWatchlist, loadFromSupabase]
    );

    const value = useMemo(
        () => ({
            watchlist,
            profile,
            loading,
            inWatchlist,
            addToWatchlist,
            removeFromWatchlist,
            refresh: loadFromSupabase,
        }),
        [watchlist, profile, loading, inWatchlist, addToWatchlist, removeFromWatchlist, loadFromSupabase]
    );

    return <SunflixDataContext.Provider value={value}>{children}</SunflixDataContext.Provider>;
}

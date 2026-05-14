import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { supabase, isSupabaseConfigured } from '../services/supabase';
import { useAuth } from '../context/AuthContext';
import './sunflix-pages.css';

const WatchParty = () => {
    const { user } = useAuth();
    const [rooms, setRooms] = useState([]);
    const [title, setTitle] = useState('');
    const [busy, setBusy] = useState(false);

    const load = async () => {
        if (!isSupabaseConfigured || !supabase) {
            setRooms([
                { id: '1', title: 'Cyberpunk movie night', status: 'live', host: 'void_runner' },
                { id: '2', title: 'Anime premiere squad', status: 'scheduled', host: 'anime_orbit' },
            ]);
            return;
        }
        const { data } = await supabase
            .from('watch_parties')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(20);
        setRooms(data || []);
    };

    useEffect(() => {
        load();
    }, []);

    const createRoom = async (e) => {
        e.preventDefault();
        if (!title.trim() || !user?.id || user.id === 'sunflix-demo') return;
        if (!supabase) return;
        setBusy(true);
        await supabase.from('watch_parties').insert({ host_id: user.id, title: title.trim() });
        setTitle('');
        setBusy(false);
        load();
    };

    return (
        <div className="sunflix-page">
            <header className="sunflix-page__hero">
                <p className="text-xs uppercase tracking-[0.35em] text-fuchsia-400/90 mb-2">Watch with friends</p>
                <h1 className="sunflix-page__title">Sync rooms</h1>
                <p className="sunflix-page__lead">
                    Voice chat, emoji reactions, and synced playback are staged here. Create a lobby with Supabase
                    realtime, or explore mock rooms below in demo mode.
                </p>
            </header>

            {isSupabaseConfigured && supabase && user?.id && user.id !== 'sunflix-demo' && (
                <form onSubmit={createRoom} className="sunflix-glass p-4 mb-8 flex flex-col sm:flex-row gap-3 max-w-xl">
                    <input
                        className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-cyan-400/50"
                        placeholder="Room name — e.g. Blade Runner night"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                    />
                    <button
                        type="submit"
                        disabled={busy}
                        className="px-5 py-2 rounded-lg bg-gradient-to-r from-cyan-600 to-violet-600 text-white text-sm font-semibold disabled:opacity-50"
                    >
                        {busy ? 'Creating…' : 'Create lobby'}
                    </button>
                </form>
            )}

            <div className="sunflix-grid">
                {rooms.map((r, i) => (
                    <motion.div
                        key={r.id}
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="sunflix-glass p-5"
                    >
                        <div className="flex justify-between items-start gap-2">
                            <h2 className="text-white font-medium">{r.title}</h2>
                            <span
                                className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded border ${
                                    r.status === 'live'
                                        ? 'border-emerald-400/50 text-emerald-300'
                                        : 'border-white/20 text-white/50'
                                }`}
                            >
                                {r.status}
                            </span>
                        </div>
                        <p className="text-white/45 text-xs mt-3">
                            Host:{' '}
                            {r.host ||
                                (r.host_id ? `${String(r.host_id).slice(0, 8)}…` : 'community')}
                        </p>
                        <button
                            type="button"
                            className="mt-4 w-full py-2 rounded-lg border border-cyan-500/30 text-cyan-200 text-sm hover:bg-cyan-500/10 transition-colors"
                        >
                            Enter room (UI)
                        </button>
                    </motion.div>
                ))}
            </div>
        </div>
    );
};

export default WatchParty;

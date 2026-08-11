import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { FaUsers, FaComments, FaPlay, FaPaperPlane, FaShareAlt, FaArrowLeft, FaCheck } from 'react-icons/fa';
import { supabase, isSupabaseConfigured } from '../services/supabase';
import { useAuth } from '../context/AuthContext';
import CustomVideoPlayer from '../components/CustomVideoPlayer';
import './sunflix-pages.css';

const WatchParty = () => {
    const { user } = useAuth();
    const [rooms, setRooms] = useState([]);
    const [title, setTitle] = useState('');
    const [busy, setBusy] = useState(false);

    // Active Room State
    const [activeRoom, setActiveRoom] = useState(null);
    const [chatMessages, setChatMessages] = useState([
        { sender: 'System', text: 'Welcome to the Watch Party! Synced playback initialized.', isSystem: true },
        { sender: 'Host', text: 'Hey squad! Starting the movie in 1 minute.', isSystem: false },
    ]);
    const [messageInput, setMessageInput] = useState('');
    const [copied, setCopied] = useState(false);

    const loadRooms = async () => {
        if (!isSupabaseConfigured || !supabase) {
            setRooms([
                { id: 'room-1', title: 'Cyberpunk 2077 Movie Night', status: 'live', host: 'Void_Runner', mediaTitle: 'Cyberpunk Edgerunners' },
                { id: 'room-2', title: 'Anime Premiere Squad', status: 'live', host: 'Anime_Orbit', mediaTitle: 'Demon Slayer' },
                { id: 'room-3', title: 'Sci-Fi Classics Marathon', status: 'scheduled', host: 'Cosmic_Pilot', mediaTitle: 'Interstellar' },
            ]);
            return;
        }
        try {
            const { data } = await supabase
                .from('watch_parties')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(20);
            setRooms(data || []);
        } catch (err) {
            console.warn('[WatchParty] Load error:', err);
        }
    };

    useEffect(() => {
        loadRooms();
    }, []);

    const createRoom = async (e) => {
        e.preventDefault();
        if (!title.trim()) return;
        setBusy(true);

        const newRoomObj = {
            id: `room-${Date.now()}`,
            title: title.trim(),
            status: 'live',
            host: user?.user_metadata?.name || user?.email?.split('@')[0] || 'Demo Host',
            mediaTitle: title.trim()
        };

        if (isSupabaseConfigured && supabase && user?.id && user.id !== 'sunflix-demo') {
            try {
                await supabase.from('watch_parties').insert({ host_id: user.id, title: title.trim() });
            } catch (err) {
                console.error('[WatchParty] Insert error:', err);
            }
        }

        setTitle('');
        setBusy(false);
        setActiveRoom(newRoomObj);
    };

    const handleSendMessage = (e) => {
        e.preventDefault();
        if (!messageInput.trim()) return;
        const senderName = user?.user_metadata?.name || user?.email?.split('@')[0] || 'Member';
        setChatMessages((prev) => [
            ...prev,
            { sender: senderName, text: messageInput.trim(), isSystem: false }
        ]);
        setMessageInput('');
    };

    const handleCopyInvite = () => {
        navigator.clipboard.writeText(window.location.href);
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
    };

    if (activeRoom) {
        return (
            <div className="min-h-screen pt-16 px-4 sm:px-8 max-w-7xl mx-auto flex flex-col space-y-4">
                <div className="flex items-center justify-between py-2 border-b border-white/10">
                    <button
                        onClick={() => setActiveRoom(null)}
                        className="flex items-center gap-2 text-cyan-400 hover:text-cyan-300 text-xs uppercase font-bold tracking-widest"
                    >
                        <FaArrowLeft /> Back to Lobbies
                    </button>

                    <div className="flex items-center gap-3">
                        <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] uppercase font-bold px-2.5 py-0.5 rounded">
                            LIVE PARTY SYNC
                        </span>
                        <button
                            onClick={handleCopyInvite}
                            className="flex items-center gap-1.5 bg-white/10 hover:bg-white/20 border border-white/20 px-3 py-1 rounded text-white text-xs"
                        >
                            {copied ? <><FaCheck className="text-emerald-400" /> Copied!</> : <><FaShareAlt /> Share Link</>}
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-[500px]">
                    {/* Video Player Main Container */}
                    <div className="lg:col-span-2 bg-black rounded-2xl overflow-hidden border border-cyan-500/30 flex flex-col shadow-2xl">
                        <div className="flex-1 relative min-h-[350px] sm:min-h-[450px]">
                            <CustomVideoPlayer
                                title={activeRoom.title}
                                onClose={() => setActiveRoom(null)}
                            />
                        </div>
                    </div>

                    {/* Chat Sidebar & Room Roster */}
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex flex-col justify-between space-y-4 h-[500px]">
                        <div>
                            <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-3">
                                <div>
                                    <h3 className="text-white font-bold text-sm truncate">{activeRoom.title}</h3>
                                    <span className="text-white/40 text-[10px] uppercase font-mono">Host: {activeRoom.host}</span>
                                </div>
                                <span className="flex items-center gap-1 text-cyan-400 text-xs font-bold">
                                    <FaUsers /> 4 Online
                                </span>
                            </div>

                            {/* Chat Feed */}
                            <div className="space-y-2.5 max-h-[340px] overflow-y-auto pr-1 custom-scrollbar">
                                {chatMessages.map((msg, idx) => (
                                    <div key={idx} className={`p-2 rounded-lg text-xs ${msg.isSystem ? 'bg-cyan-500/10 border border-cyan-500/30 text-cyan-200' : 'bg-black/40 border border-white/5 text-white'}`}>
                                        <div className="flex justify-between items-center mb-0.5">
                                            <span className="font-bold text-[11px] text-cyan-300">{msg.sender}</span>
                                        </div>
                                        <p className="text-white/80">{msg.text}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Chat Input Form */}
                        <form onSubmit={handleSendMessage} className="flex gap-2">
                            <input
                                type="text"
                                value={messageInput}
                                onChange={(e) => setMessageInput(e.target.value)}
                                placeholder="Chat with room..."
                                className="flex-1 bg-black/50 border border-white/15 rounded-xl px-3 py-2 text-white text-xs outline-none focus:border-cyan-400"
                            />
                            <button
                                type="submit"
                                className="p-2.5 bg-cyan-400 text-black font-bold rounded-xl hover:bg-cyan-300 transition-colors"
                            >
                                <FaPaperPlane className="text-xs" />
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="sunflix-page pt-16">
            <header className="sunflix-page__hero">
                <p className="text-xs uppercase tracking-[0.35em] text-fuchsia-400/90 mb-2">Watch with friends</p>
                <h1 className="sunflix-page__title">Watch Party Lobbies</h1>
                <p className="sunflix-page__lead">
                    Synchronized playback rooms with live chat, reactions, and invite links. Jump into an active lobby or create your own room below.
                </p>
            </header>

            <form onSubmit={createRoom} className="sunflix-glass p-4 mb-8 flex flex-col sm:flex-row gap-3 max-w-xl">
                <input
                    className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-cyan-400/50"
                    placeholder="Room name — e.g. Cyberpunk Movie Squad"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                />
                <button
                    type="submit"
                    disabled={busy || !title.trim()}
                    className="px-5 py-2 rounded-lg bg-gradient-to-r from-cyan-600 to-violet-600 text-white text-sm font-semibold disabled:opacity-50 hover:opacity-90 transition-opacity"
                >
                    {busy ? 'Creating…' : 'Create Sync Lobby'}
                </button>
            </form>

            <div className="sunflix-grid">
                {rooms.map((r, i) => (
                    <motion.div
                        key={r.id}
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="sunflix-glass p-5 flex flex-col justify-between"
                    >
                        <div>
                            <div className="flex justify-between items-start gap-2 mb-2">
                                <h2 className="text-white font-bold text-base">{r.title}</h2>
                                <span
                                    className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded border ${
                                        r.status === 'live'
                                            ? 'border-emerald-400/50 text-emerald-300 bg-emerald-500/10'
                                            : 'border-white/20 text-white/50'
                                    }`}
                                >
                                    {r.status}
                                </span>
                            </div>
                            <p className="text-white/50 text-xs">Host: {r.host || 'Community Pilot'}</p>
                        </div>
                        <button
                            type="button"
                            onClick={() => setActiveRoom(r)}
                            className="mt-5 w-full py-2 rounded-lg border border-cyan-500/40 bg-cyan-500/10 text-cyan-200 text-sm font-bold hover:bg-cyan-500/30 transition-colors flex items-center justify-center gap-2"
                        >
                            <FaPlay className="text-xs" /> Join Watch Party
                        </button>
                    </motion.div>
                ))}
            </div>
        </div>
    );
};

export default WatchParty;

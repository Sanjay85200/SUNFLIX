import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useSunflixData } from '../context/SunflixDataContext';
import { imageBaseUrl } from '../services/api';
import './sunflix-pages.css';

const Profile = () => {
    const { user } = useAuth();
    const { profile, watchlist, removeFromWatchlist, loading } = useSunflixData();

    return (
        <div className="sunflix-page">
            <header className="sunflix-page__hero">
                <p className="text-xs uppercase tracking-[0.35em] text-cyan-400/90 mb-2">Neural profile</p>
                <h1 className="sunflix-page__title">Command deck</h1>
                <p className="sunflix-page__lead">
                    {user?.email} · {loading ? 'Syncing orbit…' : 'Watchlist & rewards sync when Supabase is configured.'}
                </p>
                <div className="flex flex-wrap gap-3 mt-6">
                    <div className="sunflix-glass px-4 py-3 text-sm">
                        <span className="text-white/50 block text-xs uppercase tracking-wider">SUN Coins</span>
                        <span className="text-cyan-300 font-[Orbitron,sans-serif] text-xl">{profile.sun_coins}</span>
                    </div>
                    <div className="sunflix-glass px-4 py-3 text-sm">
                        <span className="text-white/50 block text-xs uppercase tracking-wider">XP</span>
                        <span className="text-violet-300 font-[Orbitron,sans-serif] text-xl">{profile.xp}</span>
                    </div>
                    <Link
                        to="/rewards"
                        className="sunflix-glass px-4 py-3 text-sm text-cyan-200 hover:text-white transition-colors self-center"
                    >
                        View missions →
                    </Link>
                </div>
            </header>

            <section>
                <h2 className="text-lg font-semibold text-white/90 mb-4 tracking-wide">My watchlist</h2>
                {watchlist.length === 0 ? (
                    <p className="text-white/45 text-sm">Add titles from any row with the + chip on hover.</p>
                ) : (
                    <ul className="sunflix-grid">
                        {watchlist.map((item) => (
                            <motion.li
                                key={item.id}
                                layout
                                className="sunflix-glass overflow-hidden flex gap-3 p-3"
                            >
                                {item.poster_path ? (
                                    <img
                                        src={`${imageBaseUrl}${item.poster_path}`}
                                        alt=""
                                        className="w-14 h-20 object-cover rounded-md shrink-0"
                                    />
                                ) : (
                                    <div className="w-14 h-20 rounded-md bg-white/5 shrink-0" />
                                )}
                                <div className="min-w-0 flex-1 flex flex-col">
                                    <span className="text-white font-medium truncate">{item.title}</span>
                                    <span className="text-white/40 text-xs mt-1 uppercase">{item.media_type}</span>
                                    <button
                                        type="button"
                                        className="mt-auto text-left text-xs text-rose-300/90 hover:text-rose-200"
                                        onClick={() => removeFromWatchlist(item)}
                                    >
                                        Remove
                                    </button>
                                </div>
                            </motion.li>
                        ))}
                    </ul>
                )}
            </section>
        </div>
    );
};

export default Profile;

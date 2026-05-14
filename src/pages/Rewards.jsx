import React from 'react';
import { motion } from 'framer-motion';
import { useSunflixData } from '../context/SunflixDataContext';
import './sunflix-pages.css';

const MISSIONS = [
    { title: 'Daily streak', reward: '+25 coins', desc: 'Stream at least 15 minutes today.' },
    { title: 'Neural review', reward: '+40 XP', desc: 'Leave a short review on a title you finished.' },
    { title: 'Squad invite', reward: '+60 coins', desc: 'Invite a friend who completes signup.' },
    { title: 'Anime orbit', reward: '+30 XP', desc: 'Add 3 anime titles to your watchlist this week.' },
];

const Rewards = () => {
    const { profile } = useSunflixData();

    return (
        <div className="sunflix-page">
            <header className="sunflix-page__hero">
                <p className="text-xs uppercase tracking-[0.35em] text-violet-400/90 mb-2">SUN Rewards</p>
                <h1 className="sunflix-page__title">Missions & loot</h1>
                <p className="sunflix-page__lead">
                    Balance: <strong className="text-cyan-300">{profile.sun_coins}</strong> coins ·{' '}
                    <strong className="text-violet-300">{profile.xp}</strong> XP. Complete missions to unlock neon
                    frames, watch party effects, and UI skins (coming soon).
                </p>
            </header>

            <div className="sunflix-grid">
                {MISSIONS.map((m, i) => (
                    <motion.article
                        key={m.title}
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.06 }}
                        className="sunflix-glass p-5 flex flex-col gap-2"
                    >
                        <span className="text-[10px] uppercase tracking-[0.2em] text-cyan-400/80">{m.reward}</span>
                        <h2 className="text-white font-semibold text-lg">{m.title}</h2>
                        <p className="text-white/55 text-sm leading-relaxed flex-1">{m.desc}</p>
                        <button
                            type="button"
                            className="mt-2 text-xs uppercase tracking-widest py-2 rounded-lg border border-white/15 text-white/70 hover:border-cyan-400/40 hover:text-cyan-100 transition-colors"
                        >
                            Track progress
                        </button>
                    </motion.article>
                ))}
            </div>
        </div>
    );
};

export default Rewards;

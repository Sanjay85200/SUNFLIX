import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FaCoins, FaBolt, FaCheck, FaGift } from 'react-icons/fa';
import { useSunflixData } from '../context/SunflixDataContext';
import './sunflix-pages.css';

const MISSIONS = [
    { id: 'daily', title: 'Daily Streak Check-in', reward: '+25 Coins & 50 XP', desc: 'Log in daily to maintain your neural stream streak.' },
    { id: 'review', title: 'Community Reviewer', reward: '+40 XP', desc: 'Leave a rating and review on any movie or TV show.' },
    { id: 'invite', title: 'Watch Party Host', reward: '+60 Coins', desc: 'Create a watch party lobby and invite 2 friends.' },
    { id: 'anime', title: 'Otaku Explorer', reward: '+30 XP', desc: 'Add 3 anime titles to your watchlist this week.' },
];

const Rewards = () => {
    const { profile, claimDailyCheckin } = useSunflixData();
    const [claimedDaily, setClaimedDaily] = useState(false);

    const handleClaimDaily = () => {
        if (claimedDaily) return;
        claimDailyCheckin();
        setClaimedDaily(true);
    };

    const level = Math.floor((profile.xp || 0) / 100) + 1;
    const currentLvlXp = (profile.xp || 0) % 100;

    return (
        <div className="sunflix-page pt-16">
            <header className="sunflix-page__hero">
                <p className="text-xs uppercase tracking-[0.35em] text-violet-400/90 mb-2">SUN Rewards & Vault</p>
                <h1 className="sunflix-page__title">Missions & Rewards</h1>
                <p className="sunflix-page__lead">
                    Earn SUN Coins and XP by watching, reviewing, and syncing with friends. Unlock premium avatars and badges.
                </p>

                <div className="flex flex-wrap gap-4 mt-6">
                    <div className="sunflix-glass px-5 py-3 text-sm flex items-center gap-3 border border-yellow-500/30">
                        <FaCoins className="text-yellow-400 text-2xl" />
                        <div>
                            <span className="text-white/50 block text-[10px] uppercase font-bold tracking-wider">SUN Coins</span>
                            <span className="text-yellow-300 font-[Orbitron,sans-serif] text-2xl font-bold">{profile.sun_coins}</span>
                        </div>
                    </div>

                    <div className="sunflix-glass px-5 py-3 text-sm flex items-center gap-3 border border-cyan-500/30">
                        <FaBolt className="text-cyan-400 text-2xl" />
                        <div>
                            <span className="text-white/50 block text-[10px] uppercase font-bold tracking-wider">Level {level} Pilot</span>
                            <div className="w-32 bg-white/10 h-2 rounded-full mt-1 overflow-hidden">
                                <div className="bg-cyan-400 h-full transition-all" style={{ width: `${currentLvlXp}%` }} />
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            <div className="sunflix-grid">
                {MISSIONS.map((m, i) => (
                    <motion.article
                        key={m.id}
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.06 }}
                        className="sunflix-glass p-5 flex flex-col justify-between space-y-3"
                    >
                        <div>
                            <div className="flex justify-between items-start mb-2">
                                <span className="text-[10px] uppercase font-bold tracking-widest text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/30">
                                    {m.reward}
                                </span>
                                <FaGift className="text-violet-400 text-lg" />
                            </div>
                            <h2 className="text-white font-bold text-lg">{m.title}</h2>
                            <p className="text-white/60 text-xs leading-relaxed">{m.desc}</p>
                        </div>

                        {m.id === 'daily' ? (
                            <button
                                type="button"
                                onClick={handleClaimDaily}
                                disabled={claimedDaily}
                                className={`w-full py-2.5 rounded-xl font-bold text-xs uppercase tracking-widest transition-all ${
                                    claimedDaily
                                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                                        : 'bg-gradient-to-r from-yellow-500 to-amber-600 text-black shadow-[0_0_15px_rgba(234,179,8,0.4)] hover:brightness-110'
                                }`}
                            >
                                {claimedDaily ? <><FaCheck className="inline mr-1" /> Claimed Today</> : 'Claim Daily Bonus'}
                            </button>
                        ) : (
                            <button
                                type="button"
                                className="w-full py-2.5 rounded-xl border border-white/15 text-white/70 hover:border-cyan-400/50 hover:text-cyan-100 text-xs font-bold uppercase tracking-widest transition-colors"
                            >
                                In Progress
                            </button>
                        )}
                    </motion.article>
                ))}
            </div>
        </div>
    );
};

export default Rewards;

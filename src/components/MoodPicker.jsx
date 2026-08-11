import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FaFire, FaTerminal, FaGhost, FaHeart, FaSmile, FaBrain, FaRocket } from 'react-icons/fa';
import Row from './Row';

const MOODS = [
    { id: 'cyberpunk', label: 'Cyberpunk Dystopia', icon: FaTerminal, color: 'from-cyan-500 to-blue-600', collection: 'sciFiMovies' },
    { id: 'adrenaline', label: 'Adrenaline Rush', icon: FaFire, color: 'from-red-500 to-orange-500', collection: 'actionMovies' },
    { id: 'chill', label: 'Cozy Chill', icon: FaSmile, color: 'from-emerald-400 to-teal-600', collection: 'comedyMovies' },
    { id: 'mindbending', label: 'Mind-Bending', icon: FaBrain, color: 'from-purple-500 to-violet-600', collection: 'topRatedMovies' },
    { id: 'horror', label: 'Late Night Horror', icon: FaGhost, color: 'from-zinc-700 to-black', collection: 'horrorMovies' },
    { id: 'scifi', label: 'Epic Sci-Fi', icon: FaRocket, color: 'from-blue-600 to-indigo-700', collection: 'sciFiMovies' },
    { id: 'romance', label: 'Romantic Spark', icon: FaHeart, color: 'from-pink-500 to-rose-600', collection: 'romanceMovies' },
];

const MoodPicker = ({ onSelectMovie }) => {
    const [activeMood, setActiveMood] = useState(MOODS[0]);

    return (
        <section className="px-4 sm:px-12 my-8">
            <div className="flex items-center justify-between mb-4">
                <div>
                    <span className="text-cyan-400 text-[10px] uppercase font-bold tracking-[0.25em] font-orbitron block">
                        Neural Recommender
                    </span>
                    <h2 className="text-xl sm:text-2xl font-black text-white font-orbitron tracking-wide">
                        What's Your Vibe Today?
                    </h2>
                </div>
            </div>

            {/* Mood Chips Bar */}
            <div className="flex items-center gap-3 overflow-x-auto pb-3 custom-scrollbar">
                {MOODS.map((mood) => {
                    const Icon = mood.icon;
                    const isActive = activeMood.id === mood.id;
                    return (
                        <button
                            key={mood.id}
                            onClick={() => setActiveMood(mood)}
                            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${
                                isActive
                                    ? `bg-gradient-to-r ${mood.color} text-white border-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.3)] scale-105`
                                    : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10 hover:text-white'
                            }`}
                        >
                            <Icon className={isActive ? 'text-white' : 'text-cyan-400'} />
                            <span>{mood.label}</span>
                        </button>
                    );
                })}
            </div>

            {/* Render Row for selected Mood */}
            <div className="mt-2">
                <Row
                    key={`mood-row-${activeMood.id}`}
                    title={`Mood Rail: ${activeMood.label}`}
                    fetchUrl={activeMood.collection}
                    onMovieSelect={onSelectMovie}
                    isLargeRow
                    accent="neon"
                />
            </div>
        </section>
    );
};

export default MoodPicker;

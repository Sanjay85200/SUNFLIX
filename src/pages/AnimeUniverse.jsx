import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Row from '../components/Row';
import VortexCarousel from '../components/VortexCarousel';
import CategoryPills from '../components/CategoryPills';
import requests from '../services/api';
import './AnimeUniverse.css';

const ANIME_CATEGORIES = [
    { id: 'trending', name: 'Trending Anime', fetchUrl: requests.fetchAnimeUniverse },
    { id: 'movies', name: 'Anime Films', fetchUrl: requests.fetchAnimeMovies },
    { id: 'mecha', name: 'Sci-Fi & Mecha', fetchUrl: requests.fetchSciFi },
    { id: 'action', name: 'Action Shonen', fetchUrl: requests.fetchActionMovies },
];

const AnimeUniverse = ({ onMovieSelect }) => {
    const [activeCat, setActiveCat] = useState(ANIME_CATEGORIES[0]);

    return (
        <div className="anime-universe pt-16">
            <motion.header
                className="anime-universe__hero"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7 }}
            >
                <div className="anime-universe__portals" aria-hidden>
                    <span className="anime-universe__portal anime-universe__portal--a" />
                    <span className="anime-universe__portal anime-universe__portal--b" />
                    <span className="anime-universe__portal anime-universe__portal--c" />
                </div>
                <div className="flex items-center justify-center gap-2 mb-2">
                    <span className="bg-pink-500/20 text-pink-300 border border-pink-500/40 text-[10px] uppercase font-bold tracking-widest px-2.5 py-0.5 rounded-full">
                        SUB & DUB AVAILABLE
                    </span>
                    <span className="bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 text-[10px] uppercase font-bold tracking-widest px-2.5 py-0.5 rounded-full">
                        4K NEURAL STREAM
                    </span>
                </div>
                <p className="anime-universe__eyebrow">Dimensional rail · Japanese Animation</p>
                <h1 className="anime-universe__title">Anime Universe</h1>
                <p className="anime-universe__sub">
                    Neon portals, fan orbitals, and holographic rows — premium streams for the otaku wave.
                </p>
            </motion.header>

            <div className="my-6">
                <CategoryPills
                    categories={ANIME_CATEGORIES}
                    activeCategory={activeCat.id}
                    onCategoryChange={setActiveCat}
                    title="Anime Lanes"
                    highlight="Select"
                />
            </div>

            <VortexCarousel
                title="Top Rated Anime Masterpieces"
                fetchUrl={requests.fetchAnimeUniverse}
                onMovieSelect={onMovieSelect}
            />

            <Row
                title="Trending Anime Series"
                fetchUrl={activeCat.fetchUrl}
                onMovieSelect={onMovieSelect}
                isLargeRow
                accent="neon"
            />

            <Row
                title="Anime Feature Films & Classics"
                fetchUrl={requests.fetchAnimeMovies}
                onMovieSelect={onMovieSelect}
                accent="neon"
            />

            <Row
                title="Sci‑Fi & Cyberpunk Anime"
                fetchUrl={requests.fetchSciFi}
                onMovieSelect={onMovieSelect}
                accent="neon"
            />
        </div>
    );
};

export default AnimeUniverse;

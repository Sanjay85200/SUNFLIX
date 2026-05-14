import React from 'react';
import { motion } from 'framer-motion';
import Row from '../components/Row';
import requests from '../services/api';
import './AnimeUniverse.css';

const AnimeUniverse = ({ onMovieSelect }) => {
    return (
        <div className="anime-universe">
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
                <p className="anime-universe__eyebrow">Dimensional rail · Japan animation</p>
                <h1 className="anime-universe__title">Anime Universe</h1>
                <p className="anime-universe__sub">
                    Neon portals, fan orbitals, and holographic rows — a dedicated lane for the youth wave.
                </p>
            </motion.header>

            <Row
                title="Trending Anime Series"
                fetchUrl={requests.fetchAnimeUniverse}
                onMovieSelect={onMovieSelect}
                isLargeRow
                accent="neon"
            />
            <Row
                title="Anime Feature Films"
                fetchUrl={requests.fetchAnimeMovies}
                onMovieSelect={onMovieSelect}
                accent="neon"
            />
            <Row
                title="Sci‑Fi & Mecha Crossover"
                fetchUrl={requests.fetchSciFi}
                onMovieSelect={onMovieSelect}
                accent="neon"
            />
        </div>
    );
};

export default AnimeUniverse;

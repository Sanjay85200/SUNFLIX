import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaPlay, FaInfoCircle, FaStar, FaVolumeMute } from 'react-icons/fa';
import { fetchCollection, enrichMovieForModal } from '../services/api';
import { heroMovies } from '../config/movieCollections';
import { getReleaseYear } from '../utils/dateUtils';
import './Banner.css';

const Banner = ({ onPlayMovie }) => {
    const [movie, setMovie] = useState(null);
    const [playLoading, setPlayLoading] = useState(false);

    useEffect(() => {
        async function fetchData() {
            try {
                const results = await fetchCollection(heroMovies);
                if (results && results.length > 0) {
                    setMovie(results[Math.floor(Math.random() * results.length)]);
                }
            } catch (error) {
                console.error("Error fetching hero content from OMDb:", error);
            }
        }
        fetchData();
    }, []);

    const bannerImage = movie?.poster_path || "";
    const title = movie?.title || movie?.name || "Sunflix Featured";
    const rating = movie?.imdbRating || movie?.vote_average || "8.5";

    return (
        <header className="banner relative overflow-hidden bg-black min-h-[550px] sm:min-h-[650px] flex items-center">
            {/* Background Poster Image with Cinematic Gradient & Blur */}
            <div
                className="banner__bg absolute inset-0 bg-cover bg-center opacity-40 scale-105 blur-sm transition-all duration-1000"
                style={{
                    backgroundImage: bannerImage ? `url("${bannerImage}")` : 'none',
                }}
            />

            {/* Side Poster Highlight for High Impact Hero visual */}
            {bannerImage && (
                <div className="hidden lg:block absolute right-[10%] top-1/2 -translate-y-1/2 z-10 w-64 rounded-2xl overflow-hidden shadow-[0_0_50px_rgba(34,211,238,0.3)] ring-1 ring-white/20">
                    <img src={bannerImage} alt={title} className="w-full h-auto object-cover" />
                </div>
            )}

            {/* Multi-layer gradient overlays */}
            <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-transparent z-1" />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/40 z-1" />
            <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-black to-transparent z-1" />

            {/* Content */}
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="banner__content relative z-10 px-[4%] max-w-2xl"
            >
                {/* Sunflix tag */}
                <div className="flex items-center gap-3 mb-4">
                    <div className="bg-cyan-500/20 border border-cyan-400/40 px-2.5 py-0.5 rounded shadow-[0_0_12px_rgba(34,211,238,0.4)]">
                        <span className="text-cyan-300 font-orbitron font-bold text-xs tracking-wider">SUNFLIX METADATA</span>
                    </div>
                    <span className="text-white/60 font-semibold tracking-[0.3em] text-xs uppercase font-rajdhani">OMDb Featured</span>
                </div>

                <h1 className="banner__title text-3xl sm:text-5xl font-black text-white mb-3 font-orbitron tracking-tight leading-tight">
                    {title}
                </h1>

                {/* Meta info */}
                <div className="flex items-center gap-3 mb-4 flex-wrap">
                    <span className="flex items-center gap-1 text-yellow-400 font-bold text-sm bg-yellow-400/10 px-2 py-0.5 rounded border border-yellow-400/20">
                        <FaStar className="text-xs" /> IMDb {rating}
                    </span>
                    <span className="text-white/60 text-sm font-medium">
                        {getReleaseYear(movie?.release_date || movie?.first_air_date) || '—'}
                    </span>
                    {movie?.rated && (
                        <span className="border border-white/30 px-1.5 py-0.5 rounded text-[11px] text-white/70">{movie.rated}</span>
                    )}
                    {movie?.runtime && (
                        <span className="bg-white/10 px-2 py-0.5 rounded text-[11px] text-white/70 font-medium">{movie.runtime}</span>
                    )}
                    <span className="bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 px-2 py-0.5 rounded text-[11px] font-bold">HD</span>
                </div>

                <p className="banner__description text-white/80 text-sm sm:text-base leading-relaxed line-clamp-3 mb-6">
                    {movie?.overview}
                </p>

                {/* Action Buttons */}
                <div className="flex items-center gap-4 mt-6 flex-wrap">
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        disabled={playLoading || !movie}
                        onClick={async () => {
                            if (!movie || !onPlayMovie) return;
                            setPlayLoading(true);
                            try {
                                onPlayMovie(await enrichMovieForModal(movie));
                            } finally {
                                setPlayLoading(false);
                            }
                        }}
                        className="flex items-center gap-2 bg-white text-black px-6 sm:px-8 py-3 rounded-xl font-bold text-sm sm:text-base hover:bg-cyan-300 transition-all shadow-[0_0_20px_rgba(255,255,255,0.4)] disabled:opacity-60"
                    >
                        <FaPlay className="text-sm" /> {playLoading ? 'Loading…' : 'Watch Now'}
                    </motion.button>
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={async () => {
                            if (!movie || !onPlayMovie) return;
                            onPlayMovie(await enrichMovieForModal(movie));
                        }}
                        className="flex items-center gap-2 bg-white/15 backdrop-blur-md text-white px-6 sm:px-8 py-3 rounded-xl font-bold text-sm sm:text-base hover:bg-white/25 transition-all border border-white/20"
                    >
                        <FaInfoCircle className="text-sm" /> Details
                    </motion.button>
                </div>
            </motion.div>

            {/* Rating badge - bottom right */}
            <div className="absolute bottom-10 right-[4%] flex items-center gap-3 z-10">
                <div className="w-10 h-10 rounded-full border border-white/30 flex items-center justify-center cursor-pointer hover:border-cyan-400 transition-colors bg-black/40 backdrop-blur-md">
                    <FaVolumeMute className="text-white/70 text-sm" />
                </div>
                {movie?.rated && (
                    <div className="bg-black/50 backdrop-blur-md border-l-2 border-cyan-400 px-3 py-1.5 rounded-r">
                        <span className="text-white/90 text-xs font-bold font-rajdhani">{movie.rated}</span>
                    </div>
                )}
            </div>
        </header>
    );
};

export default Banner;

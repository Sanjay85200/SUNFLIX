import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { FaPlay, FaInfoCircle, FaStar, FaVolumeMute } from 'react-icons/fa';
import { requests, imageBaseUrl, enrichMovieForModal } from '../services/api';
import './Banner.css';

const Banner = ({ onPlayMovie }) => {
    const [movie, setMovie] = useState(null);
    const [playLoading, setPlayLoading] = useState(false);

    useEffect(() => {
        async function fetchData() {
            try {
                const request = await axios.get(requests.fetchTrending);
                const results = request.data.results;
                if (results && results.length > 0) {
                    setMovie(results[Math.floor(Math.random() * results.length)]);
                }
            } catch (error) {
                console.error("Error fetching from TMDB:", error);
                setMovie({
                    id: 550,
                    backdrop_path: "/hZ8KnS3S7uYySkvfx79v98pS1v.jpg",
                    title: "Sunflix Premium",
                    overview: "Experience the ultimate cinematic journey with our curated selection of global blockbusters and award-winning originals.",
                });
            }
        }
        fetchData();
    }, []);

    const bannerImage = movie?.backdrop_path ? `${imageBaseUrl}${movie.backdrop_path}` : "";
    const title = movie?.title || movie?.name || movie?.original_name || "Sunflix Featured";
    const rating = movie?.vote_average?.toFixed(1) || "8.5";

    return (
        <header className="banner">
            {/* Background Image */}
            <div
                className="banner__bg"
                style={{
                    backgroundImage: `url("${bannerImage}")`,
                }}
            />

            {/* Multi-layer gradient overlays */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/95 via-black/50 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/30" />
            <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-black to-transparent" />

            {/* Content */}
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.3 }}
                className="banner__content"
            >
                {/* Netflix-style tag */}
                <div className="flex items-center gap-3 mb-4">
                    <div className="bg-netflix-red px-2 py-0.5 rounded">
                        <span className="text-white font-bold text-sm tracking-wider">S</span>
                    </div>
                    <span className="text-white/50 font-semibold tracking-[0.3em] text-xs uppercase">Original Series</span>
                </div>

                <h1 className="banner__title">
                    {title}
                </h1>

                {/* Meta info */}
                <div className="flex items-center gap-3 mb-4 flex-wrap">
                    <span className="flex items-center gap-1 text-green-400 font-bold text-sm">
                        <FaStar className="text-xs" /> {rating}
                    </span>
                    <span className="text-white/50 text-sm">
                        {movie?.release_date?.split('-')[0] || movie?.first_air_date?.split('-')[0] || '—'}
                    </span>
                    <span className="border border-white/30 px-1.5 py-0.5 rounded text-[11px] text-white/60">U/A 16+</span>
                    <span className="bg-white/10 px-2 py-0.5 rounded text-[11px] text-white/70 font-medium">4K Ultra HD</span>
                    <span className="bg-white/10 px-2 py-0.5 rounded text-[11px] text-white/70 font-medium">5.1</span>
                </div>

                <p className="banner__description">
                    {movie?.overview?.length > 200 ? movie.overview.substring(0, 200) + "..." : movie?.overview}
                </p>

                {/* Action Buttons */}
                <div className="flex items-center gap-3 mt-6 flex-wrap">
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
                        className="flex items-center gap-2 bg-white text-black px-5 sm:px-7 py-2 sm:py-2.5 rounded font-bold text-sm sm:text-base hover:bg-white/90 transition-all shadow-xl disabled:opacity-60"
                    >
                        <FaPlay className="text-sm" /> {playLoading ? 'Loading…' : 'Play'}
                    </motion.button>
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="flex items-center gap-2 bg-white/20 backdrop-blur-sm text-white px-5 sm:px-7 py-2 sm:py-2.5 rounded font-bold text-sm sm:text-base hover:bg-white/30 transition-all border border-white/10"
                    >
                        <FaInfoCircle className="text-sm" /> More Info
                    </motion.button>
                </div>
            </motion.div>

            {/* Age rating badge - bottom right */}
            <div className="absolute bottom-32 right-[4%] flex items-center gap-3 z-10">
                <div className="w-10 h-10 rounded-full border border-white/30 flex items-center justify-center cursor-pointer hover:border-white/60 transition-colors bg-black/30 backdrop-blur-sm">
                    <FaVolumeMute className="text-white/60 text-sm" />
                </div>
                <div className="bg-white/10 backdrop-blur-sm border-l-2 border-white/40 px-3 py-1">
                    <span className="text-white/70 text-sm font-medium">16+</span>
                </div>
            </div>
        </header>
    );
};

export default Banner;

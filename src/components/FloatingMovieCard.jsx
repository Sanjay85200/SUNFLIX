import React, { useRef } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { FaPlay, FaStar, FaBookmark, FaRegBookmark } from 'react-icons/fa';
import { imageBaseUrl, isTvShow } from '../services/api';
import { useSunflixData } from '../context/SunflixDataContext';

const FloatingMovieCard = ({ movie, onClick, isLargeRow, accent = 'red' }) => {
    const ref = useRef(null);
    const { addToWatchlist, inWatchlist } = useSunflixData();
    const mediaType = isTvShow(movie) ? 'tv' : 'movie';
    const saved = inWatchlist(movie.id, mediaType);

    const x = useMotionValue(0);
    const y = useMotionValue(0);

    const mouseXSpring = useSpring(x, { stiffness: 200, damping: 20 });
    const mouseYSpring = useSpring(y, { stiffness: 200, damping: 20 });

    const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ['10deg', '-10deg']);
    const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ['-10deg', '10deg']);

    const handleMouseMove = (e) => {
        if (!ref.current) return;
        const rect = ref.current.getBoundingClientRect();
        const xPct = (e.clientX - rect.left) / rect.width - 0.5;
        const yPct = (e.clientY - rect.top) / rect.height - 0.5;
        x.set(xPct);
        y.set(yPct);
    };

    const handleMouseLeave = () => {
        x.set(0);
        y.set(0);
    };

    const posterPath = isLargeRow ? movie.poster_path : movie.backdrop_path || movie.poster_path;
    if (!posterPath) return null;

    const rating = movie.vote_average?.toFixed(1);
    const year = movie.release_date?.split('-')[0] || movie.first_air_date?.split('-')[0];

    const neonRing =
        accent === 'neon'
            ? 'shadow-[0_0_0_1px_rgba(34,211,238,0.15)] group-hover:shadow-[0_0_32px_rgba(34,211,238,0.35),0_0_64px_rgba(168,85,247,0.25)]'
            : 'group-hover:shadow-[0_0_28px_rgba(229,9,20,0.35)]';

    const badgeClass =
        accent === 'neon'
            ? 'bg-gradient-to-r from-cyan-500/90 to-violet-600/90'
            : 'bg-netflix-red/90';

    const bottomGlow =
        accent === 'neon'
            ? 'from-transparent via-cyan-400/80 to-transparent'
            : 'from-transparent via-netflix-red to-transparent';

    return (
        <motion.div
            ref={ref}
            style={{
                rotateX,
                rotateY,
                transformStyle: 'preserve-3d',
            }}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            onClick={() => onClick(movie)}
            whileHover={{ scale: 1.06, z: 40 }}
            transition={{ type: 'spring', stiffness: 320, damping: 22 }}
            className={`relative h-full w-full cursor-pointer rounded-xl overflow-hidden group ring-1 ring-white/5 ${neonRing}`}
        >
            <img
                src={`${imageBaseUrl}${posterPath}`}
                alt={movie.title || movie.name}
                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                loading="lazy"
            />

            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-60 group-hover:opacity-100 transition-opacity duration-500" />

            <div
                style={{ transform: 'translateZ(40px)' }}
                className="absolute top-3 left-3 flex items-center gap-1.5 bg-black/70 backdrop-blur-sm rounded-full px-2.5 py-1 border border-white/10 opacity-0 group-hover:opacity-100 transition-all duration-300"
            >
                <FaStar className="text-yellow-400 text-xs" />
                <span className="text-white text-xs font-bold">{rating}</span>
            </div>

            <div
                style={{ transform: 'translateZ(50px)' }}
                className={`absolute top-3 right-3 backdrop-blur-sm rounded px-2 py-0.5 opacity-0 group-hover:opacity-100 transition-all duration-300 ${badgeClass}`}
            >
                <span className="text-white font-bold text-[10px] tracking-wider">SUNFLIX</span>
            </div>

            <button
                type="button"
                aria-label={saved ? 'In watchlist' : 'Add to watchlist'}
                className="absolute top-3 right-14 z-20 p-2 rounded-full bg-black/60 border border-white/15 text-cyan-300 opacity-0 group-hover:opacity-100 transition-all hover:border-cyan-400/50 hover:scale-105"
                style={{ transform: 'translateZ(55px)' }}
                onClick={(e) => {
                    e.stopPropagation();
                    if (!saved) addToWatchlist(movie);
                }}
            >
                {saved ? <FaBookmark className="text-sm" /> : <FaRegBookmark className="text-sm" />}
            </button>

            <div
                style={{ transform: 'translateZ(30px)' }}
                className="absolute bottom-0 left-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-2 group-hover:translate-y-0"
            >
                <h3 className="text-white font-bold text-sm mb-1 leading-tight line-clamp-2 drop-shadow-lg">
                    {movie.title || movie.name}
                </h3>
                <div className="flex items-center gap-2 text-xs">
                    {year && <span className="text-white/60">{year}</span>}
                    <span
                        className={
                            accent === 'neon'
                                ? 'font-bold bg-cyan-500/15 text-cyan-200 px-1.5 py-0.5 rounded text-[10px] border border-cyan-400/30'
                                : 'text-netflix-red font-bold bg-netflix-red/10 px-1.5 py-0.5 rounded text-[10px]'
                        }
                    >
                        HD
                    </span>
                </div>

                <div className="mt-3 flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-lg hover:bg-white/90 transition-colors">
                        <FaPlay className="text-black text-xs ml-0.5" />
                    </div>
                </div>
            </div>

            <div
                style={{ transform: 'translateZ(60px)' }}
                className="absolute inset-0 pointer-events-none bg-gradient-to-tr from-transparent via-white/5 to-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-700"
            />

            <div
                className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${bottomGlow} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}
            />
        </motion.div>
    );
};

export default FloatingMovieCard;

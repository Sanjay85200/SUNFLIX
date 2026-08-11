import React, { useState, useEffect } from 'react';
import { getReleaseYear } from '../utils/dateUtils';
import { motion } from 'framer-motion';
import { FaPlay, FaPlus, FaThumbsUp, FaStar, FaAward, FaClock, FaCheck, FaUser } from 'react-icons/fa';
import { enrichMovieForModal } from '../services/api';
import { omdbToSunflixFormat, FALLBACK_POSTER } from '../services/omdbAdapter';
import { useAuth } from '../context/AuthContext';
import { useSunflixData } from '../context/SunflixDataContext';
import LoginPromptModal from './LoginPromptModal';
import MovieReviews from './MovieReviews';

const MovieDetail = ({ movie, onClose, onPlay }) => {
    const [details, setDetails] = useState(movie ? (movie.title ? movie : omdbToSunflixFormat(movie)) : null);
    const [loading, setLoading] = useState(true);
    const [isLoginPromptOpen, setIsLoginPromptOpen] = useState(false);
    const [loginMessage, setLoginMessage] = useState('');
    const { user } = useAuth();
    const { addToWatchlist, inWatchlist } = useSunflixData();

    const targetId = movie?.id || movie?.imdbID;
    const isSaved = inWatchlist(targetId, details?.media_type || 'movie');

    const handleProtectedAction = (actionName, successCallback) => {
        if (!user || user.id === 'sunflix-demo') {
            setLoginMessage(`You need to log in to ${actionName}.`);
            setIsLoginPromptOpen(true);
            return false;
        }
        if (successCallback) successCallback();
        return true;
    };

    useEffect(() => {
        if (!movie) {
            setLoading(false);
            return;
        }

        async function loadEnrichedData() {
            setLoading(true);
            try {
                const enriched = await enrichMovieForModal(movie);
                if (enriched) setDetails(enriched);
            } catch (error) {
                console.error("Error enriching details:", error);
            } finally {
                setLoading(false);
            }
        }

        loadEnrichedData();
    }, [movie]);

    if (!movie && !details) return null;

    const poster = details?.poster_path || movie?.poster_path || FALLBACK_POSTER;
    const backdrop = details?.backdrop_path || poster;
    const title = details?.title || movie?.title || movie?.name || 'Untitled';
    const rating = details?.vote_average || details?.imdbRating || movie?.imdbRating || '8.2';

    // Parse cast members from credits or actors string
    const castList = details?.credits?.cast?.slice(0, 6) || (details?.actors ? details.actors.split(',').map((actor, idx) => ({ id: idx, name: actor.trim() })) : []);

    return (
        <div className="text-white bg-gray-950 rounded-2xl overflow-hidden max-w-4xl mx-auto shadow-2xl border border-cyan-500/20 max-h-[88vh] overflow-y-auto custom-scrollbar">
            {/* Hero image header */}
            <div className="relative h-[340px] sm:h-[420px] overflow-hidden bg-black">
                {/* Background image blur effect */}
                <div
                    className="absolute inset-0 bg-cover bg-center opacity-45 blur-sm scale-105"
                    style={{ backgroundImage: `url("${backdrop}")` }}
                />
                
                {/* Dark gradients */}
                <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-950/60 to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-r from-gray-950 via-gray-950/70 to-transparent" />

                {/* Content on hero */}
                <div className="absolute bottom-6 left-6 right-6 flex flex-col sm:flex-row items-end sm:items-center gap-6 z-10">
                    <img
                        src={poster}
                        alt={title}
                        className="w-28 sm:w-36 rounded-xl shadow-[0_0_30px_rgba(0,0,0,0.8)] border border-white/20 object-cover flex-shrink-0"
                        onError={(e) => { e.target.src = FALLBACK_POSTER; }}
                    />

                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                            <span className="bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded">
                                {details?.type || details?.media_type || 'Movie'}
                            </span>
                            {details?.imdbID && (
                                <span className="bg-white/10 text-white/70 text-[10px] font-mono px-2 py-0.5 rounded">
                                    {details.imdbID}
                                </span>
                            )}
                        </div>

                        <h1 className="text-2xl sm:text-4xl font-black mb-3 leading-tight font-orbitron tracking-wide text-white drop-shadow-md">
                            {title}
                        </h1>

                        <div className="flex items-center gap-4 text-xs sm:text-sm text-white/80 mb-4 flex-wrap">
                            <span className="flex items-center gap-1 text-yellow-400 font-bold bg-yellow-400/10 px-2 py-0.5 rounded border border-yellow-400/30">
                                <FaStar /> Rating {rating}
                            </span>
                            {(details?.release_date || details?.first_air_date || movie?.release_date) && <span>{getReleaseYear(details?.release_date || details?.first_air_date || movie?.release_date)}</span>}
                            {details?.runtime && <span><FaClock className="inline mr-1 text-cyan-400"/>{details.runtime}</span>}
                            {details?.rated && <span className="border border-white/30 px-1.5 py-0.5 rounded text-[11px]">{details.rated}</span>}
                        </div>

                        <div className="flex items-center gap-3 flex-wrap">
                            <button
                                onClick={() => onPlay && onPlay(targetId)}
                                className="flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold transition-all text-sm bg-cyan-400 text-black hover:bg-cyan-300 shadow-[0_0_20px_rgba(34,211,238,0.4)]"
                            >
                                <FaPlay /> Watch Stream
                            </button>
                            
                            <button 
                                onClick={() => handleProtectedAction('add to watchlist', () => addToWatchlist(details || movie))}
                                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm transition-all ${
                                    isSaved 
                                        ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300' 
                                        : 'border-white/30 hover:border-white text-white bg-black/40'
                                }`}
                            >
                                {isSaved ? <><FaCheck /> Watchlisted</> : <><FaPlus /> Watchlist</>}
                            </button>

                            <button 
                                onClick={() => handleProtectedAction('like this movie')}
                                className="w-10 h-10 rounded-xl border border-white/30 flex items-center justify-center hover:border-white transition-colors bg-black/40 text-white"
                                title="Like"
                            >
                                <FaThumbsUp />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Details Grid Section */}
            <div className="p-6 sm:p-8 space-y-8">
                {/* Plot Overview */}
                <div>
                    <h3 className="text-cyan-400 text-xs uppercase tracking-widest font-bold font-orbitron mb-2">Synopsis & Storyline</h3>
                    <p className="text-white/85 leading-relaxed text-sm sm:text-base">
                        {details?.overview || 'No overview available.'}
                    </p>
                </div>

                {/* Cast & Characters Section */}
                {castList.length > 0 && (
                    <div>
                        <h3 className="text-cyan-400 text-xs uppercase tracking-widest font-bold font-orbitron mb-3">Top Cast</h3>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
                            {castList.map((castItem, idx) => (
                                <div key={castItem.id || idx} className="bg-white/5 border border-white/10 rounded-xl p-2.5 flex flex-col items-center text-center">
                                    {castItem.profile_path ? (
                                        <img
                                            src={`https://image.tmdb.org/t/p/w185${castItem.profile_path}`}
                                            alt={castItem.name}
                                            className="w-12 h-12 rounded-full object-cover mb-2 border border-cyan-400/30"
                                        />
                                    ) : (
                                        <div className="w-12 h-12 rounded-full bg-cyan-950 border border-cyan-400/30 flex items-center justify-center text-cyan-400 mb-2">
                                            <FaUser className="text-lg" />
                                        </div>
                                    )}
                                    <span className="text-white font-medium text-xs line-clamp-1">{castItem.name}</span>
                                    {castItem.character && (
                                        <span className="text-white/40 text-[10px] line-clamp-1">{castItem.character}</span>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Metadata Cards Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs">
                    {details?.genre && (
                        <div className="bg-white/5 border border-white/10 p-3.5 rounded-xl">
                            <span className="text-white/40 block mb-1 uppercase font-bold text-[10px]">Genre</span>
                            <span className="text-white font-medium">{details.genre}</span>
                        </div>
                    )}

                    {details?.director && (
                        <div className="bg-white/5 border border-white/10 p-3.5 rounded-xl">
                            <span className="text-white/40 block mb-1 uppercase font-bold text-[10px]">Director</span>
                            <span className="text-white font-medium">{details.director}</span>
                        </div>
                    )}

                    {details?.writer && (
                        <div className="bg-white/5 border border-white/10 p-3.5 rounded-xl">
                            <span className="text-white/40 block mb-1 uppercase font-bold text-[10px]">Writer</span>
                            <span className="text-white font-medium">{details.writer}</span>
                        </div>
                    )}

                    {details?.language && (
                        <div className="bg-white/5 border border-white/10 p-3.5 rounded-xl">
                            <span className="text-white/40 block mb-1 uppercase font-bold text-[10px]">Language</span>
                            <span className="text-white font-medium">{details.language}</span>
                        </div>
                    )}

                    {details?.country && (
                        <div className="bg-white/5 border border-white/10 p-3.5 rounded-xl">
                            <span className="text-white/40 block mb-1 uppercase font-bold text-[10px]">Country</span>
                            <span className="text-white font-medium">{details.country}</span>
                        </div>
                    )}

                    {details?.awards && (
                        <div className="bg-white/5 border border-white/10 p-3.5 rounded-xl sm:col-span-2">
                            <span className="text-white/40 block mb-1 uppercase font-bold text-[10px] flex items-center gap-1">
                                <FaAward className="text-yellow-400"/> Awards
                            </span>
                            <span className="text-white font-medium">{details.awards}</span>
                        </div>
                    )}
                </div>

                {/* Ratings & Reviews Section */}
                <MovieReviews tmdbId={targetId} mediaType={details?.media_type || 'movie'} />
            </div>
            
            <LoginPromptModal 
                isOpen={isLoginPromptOpen} 
                onClose={() => setIsLoginPromptOpen(false)} 
                message={loginMessage} 
            />
        </div>
    );
};

export default MovieDetail;

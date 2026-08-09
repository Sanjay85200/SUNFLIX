import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaPlay, FaPlus, FaThumbsUp, FaStar, FaAward, FaFilm, FaClock, FaGlobe, FaCheck } from 'react-icons/fa';
import { getMovieById } from '../services/omdbApi';
import { omdbToSunflixFormat, FALLBACK_POSTER } from '../services/omdbAdapter';
import { useAuth } from '../context/AuthContext';
import { useSunflixData } from '../context/SunflixDataContext';
import LoginPromptModal from './LoginPromptModal';

const MovieDetail = ({ movie, onClose, onPlay }) => {
    const [details, setDetails] = useState(movie ? omdbToSunflixFormat(movie) : null);
    const [loading, setLoading] = useState(true);
    const [isLoginPromptOpen, setIsLoginPromptOpen] = useState(false);
    const [loginMessage, setLoginMessage] = useState('');
    const { user } = useAuth();
    const { addToWatchlist, inWatchlist } = useSunflixData();

    const imdbId = movie?.imdbID || movie?.id;
    const isSaved = inWatchlist(imdbId, details?.media_type || 'movie');

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
        if (!imdbId) {
            setLoading(false);
            return;
        }

        async function fetchFullOmdbDetails() {
            setLoading(true);
            try {
                const data = await getMovieById(imdbId);
                if (data) {
                    setDetails(omdbToSunflixFormat(data));
                }
            } catch (error) {
                console.error("Error fetching OMDb details:", error);
            } finally {
                setLoading(false);
            }
        }

        fetchFullOmdbDetails();
    }, [imdbId]);

    if (!movie && !details) return null;

    const poster = details?.poster_path || movie?.poster_path || FALLBACK_POSTER;
    const title = details?.title || movie?.title || movie?.name || 'Untitled';
    const rating = details?.imdbRating || movie?.imdbRating || 'N/A';

    return (
        <div className="text-white bg-gray-950 rounded-2xl overflow-hidden max-w-4xl mx-auto shadow-2xl border border-cyan-500/20">
            {/* Hero image header */}
            <div className="relative h-[360px] sm:h-[440px] overflow-hidden bg-black">
                {/* Background image blur effect */}
                <div
                    className="absolute inset-0 bg-cover bg-center opacity-40 blur-md scale-110"
                    style={{ backgroundImage: `url("${poster}")` }}
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
                                {details?.type || 'Movie'}
                            </span>
                            {details?.imdbID && (
                                <span className="bg-white/10 text-white/70 text-[10px] font-mono px-2 py-0.5 rounded">
                                    {details.imdbID}
                                </span>
                            )}
                        </div>

                        <h1 className="text-2xl sm:text-4xl font-black mb-3 leading-tight font-orbitron tracking-wide">
                            {title}
                        </h1>

                        <div className="flex items-center gap-4 text-xs sm:text-sm text-white/70 mb-4 flex-wrap">
                            {rating !== 'N/A' && (
                                <span className="flex items-center gap-1 text-yellow-400 font-bold bg-yellow-400/10 px-2 py-0.5 rounded border border-yellow-400/30">
                                    <FaStar /> IMDb {rating}
                                </span>
                            )}
                            {details?.release_date && <span>{details.release_date}</span>}
                            {details?.runtime && <span><FaClock className="inline mr-1 text-cyan-400"/>{details.runtime}</span>}
                            {details?.rated && <span className="border border-white/30 px-1.5 py-0.5 rounded text-[11px]">{details.rated}</span>}
                        </div>

                        <div className="flex items-center gap-3 flex-wrap">
                            <button
                                onClick={() => onPlay && onPlay(imdbId)}
                                className="flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold transition-all text-sm bg-cyan-400 text-black hover:bg-cyan-300 shadow-[0_0_20px_rgba(34,211,238,0.4)]"
                            >
                                <FaPlay /> Watch Now
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
                    <h3 className="text-cyan-400 text-xs uppercase tracking-widest font-bold font-rajdhani mb-2">Plot Overview</h3>
                    <p className="text-white/80 leading-relaxed text-sm sm:text-base">
                        {details?.overview || 'No overview available.'}
                    </p>
                </div>

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

                    {details?.actors && (
                        <div className="bg-white/5 border border-white/10 p-3.5 rounded-xl sm:col-span-2">
                            <span className="text-white/40 block mb-1 uppercase font-bold text-[10px]">Cast / Actors</span>
                            <span className="text-white font-medium">{details.actors}</span>
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

                    {details?.imdbVotes && (
                        <div className="bg-white/5 border border-white/10 p-3.5 rounded-xl">
                            <span className="text-white/40 block mb-1 uppercase font-bold text-[10px]">IMDb Votes</span>
                            <span className="text-white font-medium">{details.imdbVotes}</span>
                        </div>
                    )}

                    {details?.metascore && (
                        <div className="bg-white/5 border border-white/10 p-3.5 rounded-xl">
                            <span className="text-white/40 block mb-1 uppercase font-bold text-[10px]">Metascore</span>
                            <span className="text-green-400 font-bold">{details.metascore} / 100</span>
                        </div>
                    )}

                    {details?.boxOffice && (
                        <div className="bg-white/5 border border-white/10 p-3.5 rounded-xl">
                            <span className="text-white/40 block mb-1 uppercase font-bold text-[10px]">Box Office</span>
                            <span className="text-emerald-400 font-bold">{details.boxOffice}</span>
                        </div>
                    )}

                    {details?.production && (
                        <div className="bg-white/5 border border-white/10 p-3.5 rounded-xl sm:col-span-2">
                            <span className="text-white/40 block mb-1 uppercase font-bold text-[10px]">Production</span>
                            <span className="text-white font-medium">{details.production}</span>
                        </div>
                    )}
                </div>
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

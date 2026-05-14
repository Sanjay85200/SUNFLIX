import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { FaPlay, FaPlus, FaThumbsUp, FaStar } from 'react-icons/fa';
import { imageBaseUrl } from '../services/api';

const API_KEY = "8c4a151fe845b0a2a8be6231a03fed7f";

const MovieDetail = ({ movie, onClose, onPlay }) => {
    const [details, setDetails] = useState(null);
    const [cast, setCast] = useState([]);
    const [similar, setSimilar] = useState([]);

    useEffect(() => {
        if (!movie) return;

        async function fetchMovieData() {
            try {
                const mediaType = movie.media_type === 'tv' ? 'tv' : 'movie';
                const [detailsRes, creditsRes, similarRes] = await Promise.all([
                    axios.get(`https://api.themoviedb.org/3/${mediaType}/${movie.id}?api_key=${API_KEY}`),
                    axios.get(`https://api.themoviedb.org/3/${mediaType}/${movie.id}/credits?api_key=${API_KEY}`),
                    axios.get(`https://api.themoviedb.org/3/${mediaType}/${movie.id}/similar?api_key=${API_KEY}`)
                ]);
                setDetails(detailsRes.data);
                setCast(creditsRes.data.cast?.slice(0, 6) || []);
                setSimilar(similarRes.data.results?.slice(0, 6) || []);
            } catch (error) {
                console.error("Error fetching movie details:", error);
            }
        }
        fetchMovieData();
    }, [movie]);

    if (!movie) return null;

    const rating = movie.vote_average?.toFixed(1) || "N/A";

    return (
        <div className="text-white">
            {/* Hero image */}
            <div className="relative h-[350px] sm:h-[420px]">
                <img
                    src={`${imageBaseUrl}${movie.backdrop_path || movie.poster_path}`}
                    alt={movie.title || movie.name}
                    className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#181818] via-[#181818]/40 to-transparent" />

                {/* Content on hero */}
                <div className="absolute bottom-6 left-6 right-6">
                    <h1 className="text-3xl sm:text-4xl font-bold mb-4 leading-tight">
                        {movie.title || movie.name}
                    </h1>
                    <div className="flex items-center gap-3 flex-wrap">
                        <button
                            onClick={() => onPlay(movie)}
                            className="flex items-center gap-2 bg-white text-black px-6 py-2 rounded font-bold hover:bg-white/90 transition-all text-sm"
                        >
                            <FaPlay /> Play
                        </button>
                        <button className="w-9 h-9 rounded-full border-2 border-white/40 flex items-center justify-center hover:border-white transition-colors bg-black/30">
                            <FaPlus className="text-sm" />
                        </button>
                        <button className="w-9 h-9 rounded-full border-2 border-white/40 flex items-center justify-center hover:border-white transition-colors bg-black/30">
                            <FaThumbsUp className="text-sm" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Details section */}
            <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="md:col-span-2">
                    {/* Meta */}
                    <div className="flex items-center gap-3 text-sm mb-4 flex-wrap">
                        <span className="flex items-center gap-1 text-green-400 font-bold">
                            <FaStar className="text-xs" /> {rating}
                        </span>
                        <span className="text-white/50">{details?.release_date?.split('-')[0] || details?.first_air_date?.split('-')[0]}</span>
                        {details?.runtime && (
                            <span className="text-white/50">{Math.floor(details.runtime / 60)}h {details.runtime % 60}m</span>
                        )}
                        <span className="border border-white/20 px-1.5 py-0.5 text-[10px] rounded text-white/50">HD</span>
                        <span className="border border-white/20 px-1.5 py-0.5 text-[10px] rounded text-white/50">5.1</span>
                    </div>

                    <p className="text-sm text-white/70 leading-relaxed mb-6">
                        {movie.overview}
                    </p>
                </div>

                {/* Sidebar info */}
                <div className="text-sm space-y-3">
                    {cast.length > 0 && (
                        <div>
                            <span className="text-white/40 text-xs">Cast: </span>
                            <span className="text-white/70">{cast.map(c => c.name).join(', ')}</span>
                        </div>
                    )}
                    {details?.genres && (
                        <div>
                            <span className="text-white/40 text-xs">Genres: </span>
                            <span className="text-white/70">{details.genres.map(g => g.name).join(', ')}</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Similar Movies */}
            {similar.length > 0 && (
                <div className="px-6 pb-6">
                    <h3 className="text-lg font-bold mb-4">More Like This</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {similar.map(m => m.backdrop_path && (
                            <div key={m.id} className="relative group cursor-pointer rounded-md overflow-hidden aspect-video bg-[#2a2a2a]">
                                <img
                                    src={`${imageBaseUrl}${m.backdrop_path}`}
                                    alt={m.title || m.name}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                    loading="lazy"
                                />
                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <FaPlay className="text-white text-lg" />
                                </div>
                                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2">
                                    <p className="text-xs text-white/80 line-clamp-1">{m.title || m.name}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default MovieDetail;

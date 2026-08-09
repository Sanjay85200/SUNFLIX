import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import './VortexCarousel.css';
import { enrichMovieForModal, fetchCollection } from '../services/api';
import { omdbToSunflixFormat, FALLBACK_POSTER } from '../services/omdbAdapter';

const VortexCarousel = ({ title, fetchUrl, onMovieSelect }) => {
    const [movies, setMovies] = useState([]);
    const [rotation, setRotation] = useState(0);
    const containerRef = useRef(null);

    useEffect(() => {
        let isMounted = true;
        async function fetchData() {
            try {
                let items = [];
                if (Array.isArray(fetchUrl)) {
                    items = await fetchCollection(fetchUrl);
                } else if (typeof fetchUrl === 'string' && fetchUrl.startsWith('http')) {
                    const request = await axios.get(fetchUrl);
                    items = (request.data.results || request.data.Search || []).map(omdbToSunflixFormat);
                } else if (fetchUrl) {
                    items = await fetchCollection(fetchUrl);
                }
                if (isMounted) setMovies(items.slice(0, 10)); // Limit to 10 for the vortex
            } catch (error) {
                console.error("Vortex fetch error:", error);
            }
        }
        fetchUrl && fetchData();
        return () => { isMounted = false; };
    }, [fetchUrl]);

    const handleWheel = (e) => {
        setRotation(prev => prev + e.deltaY * 0.05);
    };

    return (
        <div className="vortex-section" onWheel={handleWheel} ref={containerRef}>
            <h2 className="vortex-title">{title}</h2>
            <div className="vortex-container">
                <div className="vortex-core"></div>
                <div className="vortex-scene">
                    {movies.map((movie, index) => {
                        const angle = (index / (movies.length || 1)) * 360 + rotation;
                        const translateY = Math.sin((angle * Math.PI) / 180) * 40;
                        const poster = movie.poster_path && movie.poster_path !== 'N/A' ? movie.poster_path : FALLBACK_POSTER;
                        
                        return (
                            <motion.div
                                key={movie.id || movie.imdbID || index}
                                className="vortex-card"
                                animate={{
                                    rotateY: angle,
                                    translateZ: 450,
                                    y: translateY
                                }}
                                transition={{ type: 'spring', damping: 25, stiffness: 80 }}
                                onClick={async () => {
                                    const enriched = await enrichMovieForModal(movie);
                                    onMovieSelect(enriched);
                                }}
                            >
                                <div className="vortex-card-content">
                                    <img 
                                        src={poster} 
                                        alt={movie.title || movie.name}
                                        onError={(e) => { e.target.src = FALLBACK_POSTER; }}
                                    />
                                    <div className="vortex-card-overlay">
                                        <span className="vortex-index">{index + 1}</span>
                                        <h3>{movie.title || movie.name}</h3>
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default VortexCarousel;

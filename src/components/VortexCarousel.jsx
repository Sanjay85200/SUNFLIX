import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import './VortexCarousel.css';
import { imageBaseUrl, enrichMovieForModal } from '../services/api';

const VortexCarousel = ({ title, fetchUrl, onMovieSelect }) => {
    const [movies, setMovies] = useState([]);
    const [rotation, setRotation] = useState(0);
    const containerRef = useRef(null);

    useEffect(() => {
        async function fetchData() {
            try {
                const request = await axios.get(fetchUrl);
                let items = request.data.results || [];
                items = items.slice(0, 10); // Limit to 10 for the vortex
                setMovies(items);
            } catch (error) {
                console.error("Vortex fetch error:", error);
            }
        }
        fetchUrl && fetchData();
    }, [fetchUrl]);

    const handleWheel = (e) => {
        // Limit the speed
        setRotation(prev => prev + e.deltaY * 0.05);
    };

    return (
        <div className="vortex-section" onWheel={handleWheel} ref={containerRef}>
            <h2 className="vortex-title">{title}</h2>
            <div className="vortex-container">
                <div className="vortex-core"></div>
                <div className="vortex-scene">
                    {movies.map((movie, index) => {
                        const angle = (index / movies.length) * 360 + rotation;
                        const translateY = Math.sin((angle * Math.PI) / 180) * 40;
                        
                        return (
                            <motion.div
                                key={movie.id}
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
                                    <img src={`${imageBaseUrl}${movie.poster_path}`} alt={movie.title || movie.name} />
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

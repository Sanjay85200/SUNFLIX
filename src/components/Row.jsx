import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, FreeMode } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/free-mode';
import './Row.css';
import FloatingMovieCard from './FloatingMovieCard';
import { motion } from 'framer-motion';
import { enrichMovieForModal } from '../services/api';

const Row = ({ title, fetchUrl, onMovieSelect, moviesData, isLargeRow = false, accent = 'red' }) => {
    const [movies, setMovies] = useState([]);

    useEffect(() => {
        if (moviesData) {
            setMovies(moviesData);
            return;
        }

        async function fetchData() {
            try {
                const request = await axios.get(fetchUrl);
                setMovies(request.data.results || []);
            } catch (error) {
                console.error("Error fetching from TMDB:", error);
            }
        }
        fetchUrl && fetchData();
    }, [fetchUrl, moviesData]);

    const handleClick = async (movie) => {
        if (!onMovieSelect) return;
        const enriched = await enrichMovieForModal(movie);
        onMovieSelect(enriched);
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
            className={`row px-[4%] py-8 relative w-full max-w-[100vw] overflow-x-clip overflow-y-visible ${accent === 'neon' ? 'row--neon' : ''}`}
        >
            <h2 className="text-white text-xl font-bold mb-4 font-inter tracking-wide flex items-center gap-3">
                <span
                    className={
                        accent === 'neon'
                            ? 'w-1 h-6 rounded-full bg-gradient-to-b from-cyan-400 to-violet-500 shadow-[0_0_14px_rgba(34,211,238,0.55)]'
                            : 'w-1 h-6 bg-netflix-red rounded-full shadow-[0_0_12px_rgba(229,9,20,0.6)]'
                    }
                />
                {title}
            </h2>

            <div className="row__container overflow-visible">
                <Swiper
                    modules={[Navigation, FreeMode]}
                    grabCursor={true}
                    freeMode={{ enabled: true, sticky: false }}
                    slidesPerView={'auto'}
                    spaceBetween={isLargeRow ? 16 : 12}
                    navigation={true}
                    className="swiper-container !overflow-visible !py-4"
                    breakpoints={{
                        320: { slidesPerView: isLargeRow ? 2 : 3, spaceBetween: 8 },
                        480: { slidesPerView: isLargeRow ? 3 : 4, spaceBetween: 10 },
                        768: { slidesPerView: isLargeRow ? 4 : 5, spaceBetween: 12 },
                        1024: { slidesPerView: isLargeRow ? 5 : 6, spaceBetween: 14 },
                        1440: { slidesPerView: isLargeRow ? 6 : 7, spaceBetween: 16 }
                    }}
                >
                    {movies.map((movie) => (
                        <SwiperSlide
                            key={movie.id}
                            className="!h-auto"
                            style={{ perspective: "1200px" }}
                        >
                            <div className={isLargeRow ? "h-[300px] sm:h-[360px]" : "h-[160px] sm:h-[180px]"}>
                                <FloatingMovieCard
                                    movie={movie}
                                    isLargeRow={isLargeRow}
                                    onClick={handleClick}
                                    accent={accent}
                                />
                            </div>
                        </SwiperSlide>
                    ))}
                </Swiper>
            </div>
        </motion.div>
    );
};

export default Row;

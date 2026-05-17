import React, { useState, useEffect } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, FreeMode } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/free-mode';
import './Row.css';
import FloatingMovieCard from './FloatingMovieCard';
import { motion } from 'framer-motion';
import { supabase, isSupabaseConfigured } from '../services/supabase';

const CreatorVideosRow = ({ onMovieSelect }) => {
    const [videos, setVideos] = useState([]);

    useEffect(() => {
        async function fetchCreatorVideos() {
            if (!isSupabaseConfigured || !supabase) return;
            try {
                const { data, error } = await supabase
                    .from('creator_videos')
                    .select('*')
                    .order('created_at', { ascending: false })
                    .limit(20);
                
                if (error) throw error;
                
                // Map the data so it works seamlessly with FloatingMovieCard
                const mappedVideos = data.map(v => ({
                    ...v,
                    poster_path: v.thumbnail_url,
                    backdrop_path: v.thumbnail_url,
                    vote_average: v.likes > 0 ? 5.0 : 0, // Mock rating based on likes
                    release_date: v.created_at
                }));

                setVideos(mappedVideos);
            } catch (error) {
                console.error("Error fetching creator videos:", error);
            }
        }
        fetchCreatorVideos();
    }, []);

    const handleClick = (video) => {
        if (!onMovieSelect) return;
        // Skip enrichMovieForModal since it's not a TMDB movie
        onMovieSelect(video);
    };

    if (videos.length === 0) return null;

    return (
        <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
            className="row px-[4%] py-8 relative w-full max-w-[100vw] overflow-x-clip overflow-y-visible row--neon"
        >
            <h2 className="text-white text-xl font-bold mb-4 font-inter tracking-wide flex items-center gap-3">
                <span className="w-1 h-6 rounded-full bg-gradient-to-b from-cyan-400 to-violet-500 shadow-[0_0_14px_rgba(34,211,238,0.55)]" />
                Creator Spotlight
                <span className="ml-2 text-[10px] uppercase tracking-widest font-orbitron text-cyan-400 border border-cyan-500/30 px-2 py-0.5 rounded bg-cyan-500/10">Originals</span>
            </h2>

            <div className="row__container overflow-visible">
                <Swiper
                    modules={[Navigation, FreeMode]}
                    navigation
                    freeMode={true}
                    grabCursor={true}
                    spaceBetween={16}
                    slidesPerView="auto"
                    className="overflow-visible!"
                >
                    {videos.map((video) => (
                        <SwiperSlide key={video.id} className="!w-[160px] sm:!w-[200px] md:!w-[240px] lg:!w-[280px]">
                            <div className="h-[240px] sm:h-[300px] md:h-[360px] lg:h-[420px] py-4">
                                <FloatingMovieCard
                                    movie={video}
                                    onClick={handleClick}
                                    isLargeRow={true}
                                    accent="neon"
                                />
                            </div>
                        </SwiperSlide>
                    ))}
                </Swiper>
            </div>
        </motion.div>
    );
};

export default CreatorVideosRow;

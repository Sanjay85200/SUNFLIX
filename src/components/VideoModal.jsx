import React, { useEffect, useState } from 'react';
import './VideoModal.css';
import { FaTimes } from 'react-icons/fa';
import MovieDetail from './MovieDetail';
import { isTvShow } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../services/supabase';

const VideoModal = ({ movie, videoId, title, onClose }) => {
    // If it's a creator video with a direct URL, go straight to player
    const [view, setView] = useState(movie?.video_url ? 'player' : 'detail');
    const [activeTrailerKey, setActiveTrailerKey] = useState(null);
    const { user } = useAuth();

    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = 'auto';
        };
    }, []);

    useEffect(() => {
        const handleEsc = (event) => {
            if (event.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [onClose]);

    useEffect(() => {
        if (view === 'player' && user && user.id !== 'sunflix-demo' && movie) {
            const recordHistory = async () => {
                try {
                    await supabase.from('watch_history').insert({
                        user_id: user.id,
                        tmdb_id: movie.video_url ? null : movie.id,
                        creator_video_id: movie.video_url ? movie.id : null,
                        media_type: movie.video_url ? 'creator_video' : (isTvShow(movie) ? 'tv' : 'movie'),
                        title: movie.title || movie.name
                    });
                } catch (err) {
                    console.error("Error recording history", err);
                }
            };
            recordHistory();
        }
    }, [view, user, movie]);

    if (!movie && !videoId) return null;

    const handlePlayTrailer = (key) => {
        setActiveTrailerKey(key);
        setView('player');
    };

    let playerContent = null;
    if (movie?.video_url) {
        playerContent = (
            <video 
                src={movie.video_url} 
                controls 
                autoPlay 
                className="w-full h-full object-contain bg-black" 
            />
        );
    } else {
        const ytId = activeTrailerKey || videoId;
        if (ytId) {
            playerContent = (
                <iframe
                    className="videoModal__player"
                    src={`https://www.youtube.com/embed/${ytId}?autoplay=1&rel=0`}
                    title={title || movie?.title || movie?.name}
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                />
            );
        } else {
            playerContent = (
                <div className="videoModal__player flex items-center justify-center text-white/70 p-8 text-center bg-black/80">
                    <p className="font-orbitron tracking-widest uppercase">No Official Media Available</p>
                </div>
            );
        }
    }

    return (
        <div className="videoModal" onClick={onClose}>
            <div className="videoModal__content" onClick={(e) => e.stopPropagation()}>
                <button type="button" className="videoModal__close" onClick={onClose}>
                    <FaTimes />
                </button>

                {view === 'player' ? (
                    <div className="flex flex-col h-full">
                        <div className="videoModal__playerWrapper flex-1 relative bg-black">
                            {playerContent}
                        </div>
                        {/* Only show "Back to Details" if it's a TMDB movie */}
                        {!movie?.video_url && (
                            <div className="p-4 flex justify-center bg-black/90">
                                <button
                                    type="button"
                                    onClick={() => setView('detail')}
                                    className="text-white/50 hover:text-white transition-colors text-sm font-medium tracking-wider uppercase"
                                >
                                    ← Back to Details
                                </button>
                            </div>
                        )}
                    </div>
                ) : (
                    <MovieDetail movie={movie} onClose={onClose} onPlay={handlePlayTrailer} />
                )}
            </div>
        </div>
    );
};

export default VideoModal;

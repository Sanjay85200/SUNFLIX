import React, { useEffect, useState } from 'react';
import './VideoModal.css';
import { FaTimes } from 'react-icons/fa';
import MovieDetail from './MovieDetail';
import { isTvShow } from '../services/api';

const VideoModal = ({ movie, videoId, title, onClose }) => {
    const [view, setView] = useState('detail');

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

    if (!movie && !videoId) return null;

    const isTv = isTvShow(movie);
    const embedUrl = movie?.id
        ? isTv
            ? `https://vidsrc.me/embed/tv?tmdb=${movie.id}`
            : `https://vidsrc.me/embed/movie?tmdb=${movie.id}`
        : videoId
          ? `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&mute=1`
          : '';

    return (
        <div className="videoModal" onClick={onClose}>
            <div className="videoModal__content" onClick={(e) => e.stopPropagation()}>
                <button type="button" className="videoModal__close" onClick={onClose}>
                    <FaTimes />
                </button>

                {view === 'player' ? (
                    <div>
                        <div className="videoModal__playerWrapper">
                            {embedUrl ? (
                                <iframe
                                    className="videoModal__player"
                                    src={embedUrl}
                                    title={title}
                                    frameBorder="0"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                />
                            ) : (
                                <div className="videoModal__player flex items-center justify-center text-white/70 p-8 text-center">
                                    No embed URL available for this title.
                                </div>
                            )}
                        </div>
                        <div className="p-4 flex justify-center">
                            <button
                                type="button"
                                onClick={() => setView('detail')}
                                className="text-white/50 hover:text-white transition-colors text-sm font-medium tracking-wider uppercase"
                            >
                                ← Back to Details
                            </button>
                        </div>
                    </div>
                ) : (
                    <MovieDetail movie={movie} onClose={onClose} onPlay={() => setView('player')} />
                )}
            </div>
        </div>
    );
};

export default VideoModal;

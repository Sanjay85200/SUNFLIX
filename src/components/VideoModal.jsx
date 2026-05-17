import React, { useEffect, useState } from 'react';
import './VideoModal.css';
import { FaTimes, FaHeart, FaComment, FaUserPlus, FaUserCheck } from 'react-icons/fa';
import MovieDetail from './MovieDetail';
import { isTvShow } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../services/supabase';
import { likeCreatorVideo, checkIsFollowing, followCreator } from '../services/creatorApi';
import VideoComments from './VideoComments';
import LoginPromptModal from './LoginPromptModal';

const VideoModal = ({ movie, videoId, title, onClose }) => {
    const [view, setView] = useState(movie?.video_url ? 'player' : 'detail');
    const [activeTrailerKey, setActiveTrailerKey] = useState(null);
    const [isCommentsOpen, setIsCommentsOpen] = useState(false);
    const [isLoginPromptOpen, setIsLoginPromptOpen] = useState(false);
    const [loginMessage, setLoginMessage] = useState('');
    const [likes, setLikes] = useState(movie?.likes || 0);
    const [hasLiked, setHasLiked] = useState(false);
    const [isFollowing, setIsFollowing] = useState(false);
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

    useEffect(() => {
        if (movie?.video_url && user && user.id !== 'sunflix-demo') {
            checkIsFollowing(movie.creator_id, user.id).then(setIsFollowing);
        }
    }, [movie, user]);

    const handleProtectedAction = (actionName, actionFn) => {
        if (!user || user.id === 'sunflix-demo') {
            setLoginMessage(`You must sign in to ${actionName}.`);
            setIsLoginPromptOpen(true);
            return;
        }
        actionFn();
    };

    const handleLike = (e) => {
        e.stopPropagation();
        handleProtectedAction('like this video', async () => {
            if (hasLiked) return;
            setLikes(prev => prev + 1);
            setHasLiked(true);
            await likeCreatorVideo(movie.id);
        });
    };

    const handleFollow = (e) => {
        e.stopPropagation();
        handleProtectedAction('follow creators', async () => {
            if (isFollowing) return;
            setIsFollowing(true);
            try {
                await followCreator(movie.creator_id, user.id);
            } catch (err) {
                console.error("Follow error", err);
                setIsFollowing(false);
            }
        });
    };

    if (!movie && !videoId) return null;

    const handlePlayTrailer = (key) => {
        setActiveTrailerKey(key);
        setView('player');
    };

    let playerContent = null;
    if (movie?.video_url) {
        playerContent = (
            <div className="relative w-full h-full bg-black group overflow-hidden">
                <video 
                    src={movie.video_url} 
                    controls 
                    autoPlay 
                    className="w-full h-full object-contain" 
                />
                
                {/* Social Overlay */}
                <div className="absolute right-4 bottom-24 flex flex-col gap-6 z-30 pointer-events-none group-hover:opacity-100 opacity-0 md:opacity-100 transition-opacity">
                    <button onClick={handleLike} className="pointer-events-auto flex flex-col items-center gap-1 group/btn">
                        <div className={`p-3 rounded-full bg-black/40 backdrop-blur-md border ${hasLiked ? 'border-red-500/50 text-red-500' : 'border-white/20 text-white'} transition-all hover:scale-110`}>
                            <FaHeart className="text-xl" />
                        </div>
                        <span className="text-white text-xs font-bold drop-shadow-md">{likes}</span>
                    </button>
                    
                    <button onClick={(e) => { e.stopPropagation(); setIsCommentsOpen(true); }} className="pointer-events-auto flex flex-col items-center gap-1 group/btn">
                        <div className="p-3 rounded-full bg-black/40 backdrop-blur-md border border-white/20 text-white transition-all hover:scale-110 hover:border-cyan-400">
                            <FaComment className="text-xl" />
                        </div>
                        <span className="text-white text-xs font-bold drop-shadow-md">Reply</span>
                    </button>
                </div>
                
                {/* Info Overlay */}
                <div className="absolute left-4 bottom-20 z-30 pointer-events-none max-w-[70%] group-hover:opacity-100 opacity-0 md:opacity-100 transition-opacity">
                    <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-white font-bold text-lg drop-shadow-md">@{movie.creator_name || 'Creator'}</h3>
                        <button 
                            onClick={handleFollow} 
                            disabled={isFollowing}
                            className={`pointer-events-auto px-3 py-1 text-xs font-bold rounded-full border transition-all ${isFollowing ? 'border-white/30 text-white/50 bg-black/30' : 'border-cyan-500 text-cyan-400 bg-cyan-500/10 hover:bg-cyan-500/30'}`}
                        >
                            {isFollowing ? <><FaUserCheck className="inline mr-1" /> Following</> : <><FaUserPlus className="inline mr-1" /> Follow</>}
                        </button>
                    </div>
                    <p className="text-white/80 text-sm drop-shadow-md line-clamp-2">{movie.description}</p>
                </div>
                
                <VideoComments 
                    videoId={movie.id} 
                    isOpen={isCommentsOpen} 
                    onClose={() => setIsCommentsOpen(false)}
                    onLoginPrompt={(msg) => {
                        setLoginMessage(`You must sign in to ${msg}.`);
                        setIsLoginPromptOpen(true);
                    }}
                />
            </div>
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
            
            <LoginPromptModal 
                isOpen={isLoginPromptOpen} 
                onClose={() => setIsLoginPromptOpen(false)} 
                message={loginMessage} 
            />
        </div>
    );
};

export default VideoModal;

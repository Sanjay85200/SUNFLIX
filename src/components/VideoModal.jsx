import React, { useEffect, useState } from 'react';
import './VideoModal.css';
import { FaTimes, FaHeart, FaComment, FaUserPlus, FaUserCheck } from 'react-icons/fa';
import MovieDetail from './MovieDetail';
import CustomVideoPlayer from './CustomVideoPlayer';
import { isTvShow } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../services/supabase';
import { likeCreatorVideo, checkIsFollowing, followCreator } from '../services/creatorApi';
import VideoComments from './VideoComments';
import LoginPromptModal from './LoginPromptModal';

const VideoModal = ({ movie, videoId, title, onClose }) => {
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
        if (user && user.id !== 'sunflix-demo' && movie) {
            const recordHistory = async () => {
                try {
                    await supabase.from('watch_history').insert({
                        user_id: user.id,
                        tmdb_id: movie.video_url ? null : String(movie.id || movie.imdbID),
                        creator_video_id: movie.video_url ? movie.id : null,
                        media_type: movie.video_url ? 'creator_video' : (isTvShow(movie) ? 'tv' : 'movie'),
                        title: movie.title || movie.name
                    });
                } catch (err) {
                    console.error("Error recording watch history:", err);
                }
            };
            recordHistory();
        }
    }, [user, movie]);

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

    return (
        <div className="videoModal" onClick={onClose}>
            <div className="videoModal__content max-w-5xl w-full mx-auto my-4 sm:my-8 rounded-2xl overflow-hidden shadow-2xl border border-cyan-500/20 bg-gray-950 flex flex-col max-h-[92vh]" onClick={(e) => e.stopPropagation()}>
                {/* Modal Top Floating Header */}
                <div className="bg-black/90 px-4 py-3 border-b border-white/10 flex items-center justify-between z-50 shrink-0">
                    <div className="flex items-center gap-3 truncate">
                        <span className="bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 text-[10px] uppercase font-bold tracking-widest px-2.5 py-0.5 rounded font-orbitron">
                            SUNFLIX CINEMA
                        </span>
                        <h2 className="text-white font-bold text-sm sm:text-base font-orbitron truncate max-w-[280px] sm:max-w-md">
                            {title || movie?.title || movie?.name}
                        </h2>
                    </div>

                    <button
                        type="button"
                        className="text-white/70 hover:text-white p-2 rounded-full bg-white/10 hover:bg-white/20 transition-all"
                        onClick={onClose}
                        aria-label="Close modal"
                    >
                        <FaTimes className="text-lg" />
                    </button>
                </div>

                {/* Modal Scrollable Body: Prominent Top Player + Details Below */}
                <div className="flex-1 overflow-y-auto custom-scrollbar bg-gray-950">
                    {/* Prominent Top Video Player Section */}
                    <div className="w-full relative bg-black shadow-2xl overflow-hidden border-b border-white/10 aspect-video max-h-[60vh] sm:max-h-[65vh]">
                        <CustomVideoPlayer
                            movie={movie}
                            videoId={videoId}
                            title={title || movie?.title || movie?.name}
                            onClose={onClose}
                        />

                        {movie?.video_url && (
                            <>
                                {/* Social Overlay for Creator Videos */}
                                <div className="absolute right-4 bottom-24 flex flex-col gap-6 z-30 pointer-events-none opacity-90 transition-opacity">
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
                                <div className="absolute left-4 bottom-20 z-30 pointer-events-none max-w-[70%] opacity-90 transition-opacity">
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
                            </>
                        )}
                    </div>

                    {/* Movie Information & User Reviews Below Video Player */}
                    <div className="p-2 sm:p-4">
                        <MovieDetail movie={movie} onClose={onClose} />
                    </div>
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

export default VideoModal;

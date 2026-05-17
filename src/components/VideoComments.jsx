import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTimes, FaPaperPlane, FaUserCircle } from 'react-icons/fa';
import { getComments, addComment } from '../services/creatorApi';
import { useAuth } from '../context/AuthContext';

const VideoComments = ({ videoId, isOpen, onClose, onLoginPrompt }) => {
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { user } = useAuth();

    useEffect(() => {
        if (isOpen && videoId) {
            loadComments();
        }
    }, [isOpen, videoId]);

    const loadComments = async () => {
        const data = await getComments(videoId);
        setComments(data);
    };

    const handlePostComment = async (e) => {
        e.preventDefault();
        
        if (!user || user.id === 'sunflix-demo') {
            onLoginPrompt('post a comment');
            return;
        }

        if (!newComment.trim()) return;

        setIsLoading(true);
        try {
            const authorName = user.user_metadata?.name || 'Neural Pilot';
            await addComment(videoId, user.id, newComment.trim(), authorName);
            setNewComment('');
            await loadComments();
        } catch (error) {
            console.error("Failed to post comment", error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 z-40 bg-black/40 backdrop-blur-[2px]"
                    />
                    
                    <motion.div
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                        className="absolute top-0 right-0 bottom-0 w-full md:w-[400px] z-50 bg-black/80 backdrop-blur-xl border-l border-white/10 flex flex-col shadow-[-20px_0_40px_rgba(0,0,0,0.5)]"
                    >
                        <div className="flex items-center justify-between p-4 border-b border-white/10">
                            <h3 className="text-white font-orbitron font-bold tracking-wider">Comments <span className="text-cyan-400 text-sm">({comments.length})</span></h3>
                            <button onClick={onClose} className="text-white/50 hover:text-white transition-colors p-2">
                                <FaTimes />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
                            {comments.length === 0 ? (
                                <div className="text-center text-white/40 mt-10 font-rajdhani">
                                    No transmission received yet. Be the first to comment.
                                </div>
                            ) : (
                                comments.map(comment => (
                                    <div key={comment.id} className="flex gap-3">
                                        <div className="mt-1 text-cyan-500/50">
                                            <FaUserCircle className="text-2xl" />
                                        </div>
                                        <div className="flex-1 bg-white/5 rounded-lg p-3 border border-white/5">
                                            <div className="flex items-center justify-between mb-1">
                                                <span className="text-cyan-300 font-bold text-sm">{comment.author_name}</span>
                                                <span className="text-white/30 text-xs">
                                                    {new Date(comment.created_at).toLocaleDateString()}
                                                </span>
                                            </div>
                                            <p className="text-white/80 text-sm leading-relaxed">{comment.content}</p>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        <div className="p-4 border-t border-white/10 bg-black/50">
                            <form onSubmit={handlePostComment} className="flex gap-2">
                                <input
                                    type="text"
                                    value={newComment}
                                    onChange={(e) => setNewComment(e.target.value)}
                                    placeholder="Transmit a message..."
                                    className="flex-1 bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-cyan-500/50 transition-colors"
                                />
                                <button 
                                    type="submit" 
                                    disabled={isLoading || !newComment.trim()}
                                    className="bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 disabled:hover:bg-cyan-500 text-black p-3 rounded-lg transition-colors flex items-center justify-center"
                                >
                                    <FaPaperPlane />
                                </button>
                            </form>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default VideoComments;

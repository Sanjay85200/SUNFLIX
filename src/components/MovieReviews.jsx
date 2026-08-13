import React, { useState, useEffect } from 'react';
import { FaStar, FaUserCircle, FaPaperPlane } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import { supabase, isSupabaseConfigured } from '../services/supabase';

const MovieReviews = ({ tmdbId, mediaType = 'movie' }) => {
    const { user } = useAuth();
    const [reviews, setReviews] = useState([]);
    const [rating, setRating] = useState(5);
    const [hoverRating, setHoverRating] = useState(0);
    const [reviewText, setReviewText] = useState('');
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (!tmdbId) return;

        const loadReviews = async () => {
            if (isSupabaseConfigured && supabase) {
                try {
                    const { data } = await supabase
                        .from('movie_reviews')
                        .select('*')
                        .eq('tmdb_id', String(tmdbId))
                        .order('created_at', { ascending: false });
                    setReviews(data || []);
                    return;
                } catch (err) {
                    console.warn('[MovieReviews] Load error:', err);
                }
            }

            // Fallback default sample reviews
            setReviews([
                {
                    id: 'rev-1',
                    user_name: 'CyberStreamer_99',
                    rating: 5,
                    review_text: 'An absolute visual masterpiece! The soundtrack and atmospheric lighting are incredible.',
                    created_at: new Date(Date.now() - 86400000).toISOString()
                },
                {
                    id: 'rev-2',
                    user_name: 'NeoVanguard',
                    rating: 4,
                    review_text: 'Pacing was smooth and the climax delivers. High quality SUNFLIX stream!',
                    created_at: new Date(Date.now() - 172800000).toISOString()
                }
            ]);
        };

        loadReviews();
    }, [tmdbId]);

    const handleSubmitReview = async (e) => {
        e.preventDefault();
        if (!reviewText.trim()) return;

        const userName = user?.user_metadata?.name || (typeof user?.email === 'string' ? user.email.split('@')[0] : 'SUNFLIX Pilot');
        const newReview = {
            id: `local-${Date.now()}`,
            user_id: user?.id || 'demo-user',
            user_name: userName,
            tmdb_id: String(tmdbId),
            media_type: mediaType,
            rating: rating,
            review_text: reviewText.trim(),
            created_at: new Date().toISOString()
        };

        setSubmitting(true);

        if (isSupabaseConfigured && supabase && user && user.id !== 'sunflix-demo') {
            try {
                await supabase.from('movie_reviews').insert({
                    user_id: user.id,
                    user_name: userName,
                    tmdb_id: String(tmdbId),
                    media_type: mediaType,
                    rating: rating,
                    review_text: reviewText.trim()
                });
            } catch (err) {
                console.error('[MovieReviews] Insert error:', err);
            }
        }

        setReviews((prev) => [newReview, ...prev]);
        setReviewText('');
        setSubmitting(false);
    };

    return (
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mt-8 space-y-6">
            <div className="flex items-center justify-between">
                <h3 className="text-cyan-400 text-xs font-bold uppercase tracking-widest font-orbitron">
                    Community Reviews & Ratings
                </h3>
                <span className="text-white/50 text-xs">{reviews.length} reviews</span>
            </div>

            {/* Review Input Form */}
            <form onSubmit={handleSubmitReview} className="bg-black/40 p-4 rounded-xl border border-white/10 space-y-3">
                <div className="flex items-center justify-between">
                    <span className="text-white/70 text-xs">Your Rating:</span>
                    <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <button
                                key={star}
                                type="button"
                                onClick={() => setRating(star)}
                                onMouseEnter={() => setHoverRating(star)}
                                onMouseLeave={() => setHoverRating(0)}
                                className="text-lg transition-transform hover:scale-125 focus:outline-none"
                            >
                                <FaStar
                                    className={(hoverRating || rating) >= star ? 'text-yellow-400' : 'text-gray-600'}
                                />
                            </button>
                        ))}
                    </div>
                </div>

                <div className="flex gap-2">
                    <input
                        type="text"
                        value={reviewText}
                        onChange={(e) => setReviewText(e.target.value)}
                        placeholder="Write a short review or thought..."
                        className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-xs outline-none focus:border-cyan-400/50"
                    />
                    <button
                        type="submit"
                        disabled={submitting || !reviewText.trim()}
                        className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-violet-600 rounded-xl text-white text-xs font-bold flex items-center gap-2 hover:opacity-90 disabled:opacity-50"
                    >
                        <FaPaperPlane /> Post
                    </button>
                </div>
            </form>

            {/* Review List */}
            <div className="space-y-3 max-h-64 overflow-y-auto pr-1 custom-scrollbar">
                {reviews.map((rev) => (
                    <div key={rev.id} className="bg-black/30 border border-white/5 p-3 rounded-xl space-y-1.5">
                        <div className="flex items-center justify-between text-xs">
                            <div className="flex items-center gap-2">
                                <FaUserCircle className="text-cyan-400 text-sm" />
                                <span className="text-white font-medium">{rev.user_name}</span>
                            </div>
                            <div className="flex items-center gap-1 text-yellow-400 text-xs">
                                <FaStar />
                                <span>{rev.rating}/5</span>
                            </div>
                        </div>
                        <p className="text-white/80 text-xs leading-relaxed">{rev.review_text}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default MovieReviews;

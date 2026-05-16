import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTimes, FaCloudUploadAlt, FaVideo, FaImage, FaSpinner } from 'react-icons/fa';
import { uploadCreatorContent, createVideoRecord } from '../services/creatorApi';
import { useAuth } from '../context/AuthContext';

const CreatorUploadModal = ({ isOpen, onClose, onUploadSuccess }) => {
    const { user } = useAuth();
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState('Short Film');
    const [videoFile, setVideoFile] = useState(null);
    const [thumbnailFile, setThumbnailFile] = useState(null);
    const [isUploading, setIsUploading] = useState(false);
    const [error, setError] = useState('');

    const categories = ['Short Film', 'Comedy', 'Song', 'Edit', 'Web Series', 'Podcast', 'Vlog', 'Gaming'];

    const handleVideoChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setVideoFile(e.target.files[0]);
        }
    };

    const handleThumbnailChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setThumbnailFile(e.target.files[0]);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!title || !videoFile) {
            setError('Title and Video file are required.');
            return;
        }

        if (!user || user.id === 'sunflix-demo') {
            setError('You must be fully logged in (not demo) to upload content.');
            return;
        }

        setIsUploading(true);

        try {
            // Upload files sequentially
            let videoUrl = '';
            let thumbnailUrl = '';

            try {
                videoUrl = await uploadCreatorContent(user.id, videoFile, 'video');
            } catch (err) {
                // If storage isn't configured, we fallback to a mock URL for the MVP
                console.warn("Storage upload failed, falling back to mock. Ensure 'creator_content' bucket exists.", err);
                videoUrl = 'https://www.w3schools.com/html/mov_bbb.mp4';
            }

            if (thumbnailFile) {
                try {
                    thumbnailUrl = await uploadCreatorContent(user.id, thumbnailFile, 'thumbnail');
                } catch (err) {
                    console.warn("Thumbnail upload failed.", err);
                    thumbnailUrl = 'https://image.tmdb.org/t/p/w500/hZ8KnS3S7uYySkvfx79v98pS1v.jpg'; // fallback
                }
            } else {
                thumbnailUrl = 'https://image.tmdb.org/t/p/w500/hZ8KnS3S7uYySkvfx79v98pS1v.jpg'; // Default sunflix banner
            }

            // Create record
            await createVideoRecord({
                creator_id: user.id,
                title,
                description,
                category,
                video_url: videoUrl,
                thumbnail_url: thumbnailUrl,
                views: 0,
                likes: 0,
                revenue_generated: 0
            });

            // Reset form
            setTitle('');
            setDescription('');
            setCategory('Short Film');
            setVideoFile(null);
            setThumbnailFile(null);
            
            onUploadSuccess();
            onClose();
        } catch (err) {
            console.error(err);
            setError('An error occurred while publishing your content.');
        } finally {
            setIsUploading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
            >
                <motion.div
                    initial={{ scale: 0.9, y: 20 }}
                    animate={{ scale: 1, y: 0 }}
                    exit={{ scale: 0.9, y: 20 }}
                    className="bg-gray-900/90 border border-cyan-500/30 w-full max-w-2xl rounded-2xl overflow-hidden shadow-[0_0_40px_rgba(34,211,238,0.15)]"
                >
                    <div className="flex justify-between items-center p-5 border-b border-white/10 bg-black/40">
                        <h2 className="text-xl font-bold text-white flex items-center gap-2 font-orbitron tracking-wide">
                            <FaCloudUploadAlt className="text-cyan-400 text-2xl" /> 
                            Upload to Neural Net
                        </h2>
                        <button onClick={onClose} disabled={isUploading} className="text-white/50 hover:text-white transition-colors">
                            <FaTimes className="text-xl" />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="p-6 space-y-5">
                        {error && (
                            <div className="bg-red-500/10 border border-red-500/50 text-red-200 px-4 py-2 rounded text-sm">
                                {error}
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-medium text-cyan-200/80 mb-1 uppercase tracking-wider font-rajdhani">Title</label>
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all placeholder:text-white/20"
                                placeholder="Enter a captivating title..."
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-cyan-200/80 mb-1 uppercase tracking-wider font-rajdhani">Description</label>
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                rows="3"
                                className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all placeholder:text-white/20 resize-none"
                                placeholder="Tell the universe what this is about..."
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-cyan-200/80 mb-1 uppercase tracking-wider font-rajdhani">Category</label>
                            <select
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                                className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all appearance-none"
                            >
                                {categories.map(cat => <option key={cat} value={cat} className="bg-gray-900">{cat}</option>)}
                            </select>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="border border-dashed border-white/20 rounded-lg p-4 flex flex-col items-center justify-center text-center relative hover:border-cyan-400/50 transition-colors group bg-black/30">
                                <FaVideo className={`text-3xl mb-2 ${videoFile ? 'text-cyan-400' : 'text-white/30 group-hover:text-cyan-400/70'}`} />
                                <span className="text-sm text-white/70 font-medium">
                                    {videoFile ? videoFile.name : 'Select Video File (MP4)'}
                                </span>
                                <input 
                                    type="file" 
                                    accept="video/mp4,video/webm" 
                                    onChange={handleVideoChange}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                />
                            </div>

                            <div className="border border-dashed border-white/20 rounded-lg p-4 flex flex-col items-center justify-center text-center relative hover:border-violet-400/50 transition-colors group bg-black/30">
                                <FaImage className={`text-3xl mb-2 ${thumbnailFile ? 'text-violet-400' : 'text-white/30 group-hover:text-violet-400/70'}`} />
                                <span className="text-sm text-white/70 font-medium">
                                    {thumbnailFile ? thumbnailFile.name : 'Select Thumbnail (JPG/PNG)'}
                                </span>
                                <input 
                                    type="file" 
                                    accept="image/jpeg,image/png,image/webp" 
                                    onChange={handleThumbnailChange}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                />
                            </div>
                        </div>

                        <div className="pt-4 flex justify-end gap-3">
                            <button
                                type="button"
                                onClick={onClose}
                                disabled={isUploading}
                                className="px-6 py-2 rounded-lg text-white/70 hover:text-white hover:bg-white/5 font-medium transition-all"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={isUploading || !title || !videoFile}
                                className="px-6 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-black font-bold tracking-wide transition-all shadow-[0_0_15px_rgba(34,211,238,0.4)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                            >
                                {isUploading ? (
                                    <>
                                        <FaSpinner className="animate-spin" /> Uploading...
                                    </>
                                ) : (
                                    'Publish Content'
                                )}
                            </button>
                        </div>
                    </form>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

export default CreatorUploadModal;

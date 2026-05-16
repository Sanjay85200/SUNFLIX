import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getCreatorStats, getCreatorVideos, deleteVideoRecord } from '../services/creatorApi';
import CreatorUploadModal from '../components/CreatorUploadModal';
import { FaCloudUploadAlt, FaEye, FaHeart, FaDollarSign, FaTrash, FaPlay } from 'react-icons/fa';
import { motion } from 'framer-motion';
import './sunflix-pages.css';

const CreatorDashboard = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState({ totalViews: 0, totalLikes: 0, totalRevenue: 0 });
    const [videos, setVideos] = useState([]);
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
    const [loading, setLoading] = useState(true);

    const loadDashboardData = async () => {
        if (!user || user.id === 'sunflix-demo') {
            setLoading(false);
            return;
        }
        setLoading(true);
        const [dashboardStats, userVideos] = await Promise.all([
            getCreatorStats(user.id),
            getCreatorVideos(user.id)
        ]);
        setStats(dashboardStats);
        setVideos(userVideos);
        setLoading(false);
    };

    useEffect(() => {
        loadDashboardData();
        // eslint-disable-next-line
    }, [user]);

    const handleDelete = async (videoId) => {
        if (window.confirm('Are you sure you want to delete this video?')) {
            await deleteVideoRecord(videoId);
            loadDashboardData();
        }
    };

    if (loading) {
        return (
            <div className="sunflix-page flex items-center justify-center">
                <div className="animate-spin text-cyan-400 text-4xl"><FaCloudUploadAlt /></div>
            </div>
        );
    }

    if (!user || user.id === 'sunflix-demo') {
        return (
            <div className="sunflix-page flex flex-col items-center justify-center text-center p-4">
                <h2 className="text-3xl font-bold text-white mb-4">Creator Studio</h2>
                <p className="text-white/60 mb-8 max-w-md">You need a registered Sunflix account to upload content and access the Creator Studio.</p>
            </div>
        );
    }

    return (
        <div className="sunflix-page pb-20">
            <header className="sunflix-page__hero flex flex-col md:flex-row justify-between items-center gap-6">
                <div>
                    <h1 className="sunflix-page__title text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-violet-500">Creator Studio</h1>
                    <p className="sunflix-page__lead">Manage your content, track analytics, and monitor your 30% revenue share.</p>
                </div>
                <motion.button 
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setIsUploadModalOpen(true)}
                    className="flex items-center gap-2 bg-cyan-500 hover:bg-cyan-400 text-black px-6 py-3 rounded-lg font-bold shadow-[0_0_20px_rgba(34,211,238,0.4)] transition-all"
                >
                    <FaCloudUploadAlt className="text-xl" /> Upload Content
                </motion.button>
            </header>

            <div className="px-[4%] max-w-7xl mx-auto mt-8">
                {/* Stats Ribbon */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                    <div className="sunflix-glass p-6 rounded-xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-20 group-hover:opacity-40 transition-opacity">
                            <FaEye className="text-6xl text-cyan-400" />
                        </div>
                        <h3 className="text-white/60 font-medium text-sm tracking-wider uppercase mb-2">Total Views</h3>
                        <p className="text-4xl font-bold text-white font-rajdhani">{stats.totalViews.toLocaleString()}</p>
                    </div>
                    
                    <div className="sunflix-glass p-6 rounded-xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-20 group-hover:opacity-40 transition-opacity">
                            <FaHeart className="text-6xl text-red-500" />
                        </div>
                        <h3 className="text-white/60 font-medium text-sm tracking-wider uppercase mb-2">Total Likes</h3>
                        <p className="text-4xl font-bold text-white font-rajdhani">{stats.totalLikes.toLocaleString()}</p>
                    </div>

                    <div className="sunflix-glass p-6 rounded-xl relative overflow-hidden group border-cyan-500/30">
                        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-violet-500/5" />
                        <div className="absolute top-0 right-0 p-4 opacity-20 group-hover:opacity-40 transition-opacity">
                            <FaDollarSign className="text-6xl text-green-400" />
                        </div>
                        <h3 className="text-white/60 font-medium text-sm tracking-wider uppercase mb-2 relative z-10">Revenue (Your 30% Cut)</h3>
                        <p className="text-4xl font-bold text-green-400 font-rajdhani relative z-10">${stats.totalRevenue.toFixed(2)}</p>
                    </div>
                </div>

                {/* Content Library */}
                <h2 className="text-2xl font-bold text-white mb-6 border-b border-white/10 pb-4">Your Content Library</h2>
                
                {videos.length === 0 ? (
                    <div className="text-center py-20 sunflix-glass rounded-xl border-dashed border-white/20">
                        <FaCloudUploadAlt className="text-6xl text-white/20 mx-auto mb-4" />
                        <h3 className="text-xl font-medium text-white mb-2">No content uploaded yet</h3>
                        <p className="text-white/50 mb-6">Share your short films, songs, or podcasts with the universe.</p>
                        <button onClick={() => setIsUploadModalOpen(true)} className="text-cyan-400 hover:text-cyan-300 font-medium underline">
                            Upload your first video
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {videos.map(video => (
                            <div key={video.id} className="sunflix-glass rounded-xl overflow-hidden group hover:border-cyan-500/50 transition-colors">
                                <div className="relative aspect-video bg-black">
                                    <img src={video.thumbnail_url} alt={video.title} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40 backdrop-blur-sm">
                                        <FaPlay className="text-3xl text-white drop-shadow-lg" />
                                    </div>
                                    <div className="absolute top-2 right-2 bg-black/70 backdrop-blur px-2 py-1 rounded text-xs font-bold text-white border border-white/10">
                                        {video.category}
                                    </div>
                                </div>
                                <div className="p-4">
                                    <h3 className="text-white font-bold text-lg mb-1 truncate">{video.title}</h3>
                                    <p className="text-white/50 text-sm line-clamp-2 mb-4 h-10">{video.description || 'No description provided.'}</p>
                                    
                                    <div className="flex items-center justify-between text-sm border-t border-white/10 pt-3">
                                        <div className="flex gap-4 text-white/70">
                                            <span className="flex items-center gap-1"><FaEye className="text-cyan-400" /> {video.views}</span>
                                            <span className="flex items-center gap-1"><FaHeart className="text-red-400" /> {video.likes}</span>
                                        </div>
                                        <button 
                                            onClick={() => handleDelete(video.id)}
                                            className="text-white/40 hover:text-red-500 transition-colors"
                                            title="Delete Video"
                                        >
                                            <FaTrash />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <CreatorUploadModal 
                isOpen={isUploadModalOpen} 
                onClose={() => setIsUploadModalOpen(false)} 
                onUploadSuccess={loadDashboardData}
            />
        </div>
    );
};

export default CreatorDashboard;

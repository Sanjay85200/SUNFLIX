import React from 'react';
import { useUpload } from '../context/UploadContext';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTimes, FaCloudUploadAlt, FaSpinner, FaCheckCircle, FaExclamationCircle } from 'react-icons/fa';

const GlobalUploadProgress = () => {
    const { activeUploads, cancelUpload } = useUpload();
    const uploadsList = Object.values(activeUploads);

    if (uploadsList.length === 0) return null;

    return (
        <div className="fixed bottom-6 right-6 z-[200] flex flex-col gap-4 max-w-sm w-full pointer-events-none">
            <AnimatePresence>
                {uploadsList.map(upload => (
                    <motion.div
                        key={upload.id}
                        initial={{ opacity: 0, x: 50, scale: 0.9 }}
                        animate={{ opacity: 1, x: 0, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        className="bg-black/90 backdrop-blur-xl border border-cyan-500/30 rounded-xl p-4 shadow-[0_0_30px_rgba(34,211,238,0.2)] pointer-events-auto flex flex-col gap-3"
                    >
                        <div className="flex justify-between items-start">
                            <div className="flex items-center gap-2 text-cyan-400 font-orbitron font-bold truncate pr-4">
                                {upload.status === 'completed' ? (
                                    <FaCheckCircle className="text-green-400 flex-shrink-0" />
                                ) : upload.status === 'error' ? (
                                    <FaExclamationCircle className="text-red-400 flex-shrink-0" />
                                ) : (
                                    <FaCloudUploadAlt className="animate-pulse flex-shrink-0" />
                                )}
                                <span className="truncate">{upload.title}</span>
                            </div>
                            
                            {/* Cancel Button */}
                            {['uploading_video', 'uploading_thumbnail'].includes(upload.status) && (
                                <button 
                                    onClick={() => cancelUpload(upload.id)}
                                    className="text-white/50 hover:text-red-400 transition-colors p-1"
                                    title="Cancel Upload"
                                >
                                    <FaTimes />
                                </button>
                            )}
                        </div>

                        {['uploading_video', 'uploading_thumbnail'].includes(upload.status) && (
                            <>
                                <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
                                    <div 
                                        className="bg-cyan-500 h-2 rounded-full shadow-[0_0_10px_rgba(34,211,238,0.8)] transition-all duration-300" 
                                        style={{ width: `${Math.max(upload.progress, 2)}%` }} 
                                    />
                                </div>
                                <div className="flex justify-between text-xs text-white/60 font-rajdhani uppercase tracking-wider font-bold">
                                    <span>{upload.speed} MB/s</span>
                                    <span>{Math.round(upload.progress)}%</span>
                                    <span>ETA: {Math.ceil(upload.eta)}s</span>
                                </div>
                            </>
                        )}

                        {upload.status === 'processing' && (
                            <div className="flex items-center gap-2 text-yellow-400 text-sm font-rajdhani uppercase font-bold tracking-wider">
                                <FaSpinner className="animate-spin" /> Processing Media...
                            </div>
                        )}
                        
                        {upload.status === 'completed' && (
                            <div className="text-green-400 text-sm font-rajdhani uppercase font-bold tracking-wider">
                                Upload Successful!
                            </div>
                        )}

                        {upload.status === 'error' && (
                            <div className="text-red-400 text-xs font-rajdhani truncate">
                                Error: {upload.error}
                            </div>
                        )}
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>
    );
};

export default GlobalUploadProgress;

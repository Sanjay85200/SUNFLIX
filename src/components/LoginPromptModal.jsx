import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTimes, FaLock } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const LoginPromptModal = ({ isOpen, onClose, message }) => {
    const navigate = useNavigate();

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
                onClick={onClose}
            >
                <motion.div
                    initial={{ scale: 0.9, y: 20 }}
                    animate={{ scale: 1, y: 0 }}
                    exit={{ scale: 0.9, y: 20 }}
                    className="bg-gray-900/90 border border-cyan-500/30 w-full max-w-sm rounded-2xl overflow-hidden shadow-[0_0_40px_rgba(34,211,238,0.15)] text-center p-8"
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="flex justify-center mb-4">
                        <div className="p-4 rounded-full bg-cyan-500/20 text-cyan-400">
                            <FaLock className="text-3xl" />
                        </div>
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-2 font-orbitron tracking-wide">
                        Access Restricted
                    </h2>
                    <p className="text-white/60 mb-6">
                        {message || "You need to log in to perform this action."}
                    </p>

                    <div className="flex flex-col gap-3">
                        <button
                            onClick={() => {
                                onClose();
                                navigate('/login');
                            }}
                            className="w-full bg-cyan-500 hover:bg-cyan-400 text-black font-bold py-3 rounded-lg transition-colors shadow-[0_0_15px_rgba(34,211,238,0.4)]"
                        >
                            Sign In / Sign Up
                        </button>
                        <button
                            onClick={onClose}
                            className="w-full bg-white/5 hover:bg-white/10 text-white font-medium py-3 rounded-lg transition-colors border border-white/10"
                        >
                            Not Now
                        </button>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

export default LoginPromptModal;

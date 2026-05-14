import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTimes, FaRobot, FaPaperPlane, FaMicrophone } from 'react-icons/fa';
import './AIAssistant.css';

const QUICK_PROMPTS = [
    'Suggest the best thriller anime',
    'Recommend an emotional movie for tonight',
    'Telugu sci‑fi worth the hype?',
    'Mood: rainy cyberpunk night',
];

const SUN_CAPABILITIES = [
    'Poster synth',
    'Anime avatar',
    'Subtitle AI',
    'Trailer remix',
    'Wallpapers',
    'Voice search',
];

const AIAssistant = ({ isOpen, onClose }) => {
    const [messages, setMessages] = useState([
        {
            role: 'ai',
            content:
                'SUN AI online. I fuse your orbit — watch history, moods, and genres — to steer you toward the perfect session. Try a quick prompt or tap a chip; live Gemini / OpenAI wiring lands when you add API keys server-side.',
        },
    ]);
    const [input, setInput] = useState('');

    const pushAiMessage = useCallback((text) => {
        setMessages((prev) => [...prev, { role: 'ai', content: text }]);
    }, []);

    const handleSend = (textOverride) => {
        const text = (textOverride ?? input).trim();
        if (!text) return;

        setMessages((prev) => [...prev, { role: 'user', content: text }]);
        setInput('');

        setTimeout(() => {
            pushAiMessage(
                `Locked on “${text}”. Demo mode: wire this drawer to your Supabase watch graph + a Gemini or OpenAI route, and I will rank titles with explanations, trailers, and mood tags in real time.`
            );
        }, 650);
    };

    const startVoice = () => {
        const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SR) {
            pushAiMessage('Voice capture needs browser support (Chrome / Edge). Text prompts still work.');
            return;
        }
        const rec = new SR();
        rec.lang = 'en-US';
        rec.onresult = (e) => {
            const said = e.results[0][0].transcript;
            if (said) handleSend(said);
        };
        rec.onerror = () => pushAiMessage('Voice link interrupted. Try again or type your command.');
        rec.start();
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        className="ai-overlay"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                    />
                    <motion.div
                        className="ai-drawer"
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'spring', damping: 26, stiffness: 220 }}
                    >
                        <div className="ai-header">
                            <div className="ai-header-title">
                                <FaRobot className="ai-icon" />
                                <div>
                                    <h2>SUN AI</h2>
                                    <p className="ai-subheader">Personal neural curator · text + voice</p>
                                </div>
                            </div>
                            <button type="button" className="ai-close-btn" onClick={onClose} aria-label="Close SUN AI">
                                <FaTimes />
                            </button>
                        </div>

                        <div className="ai-capabilities" aria-label="AI capabilities">
                            {SUN_CAPABILITIES.map((cap) => (
                                <span key={cap} className="ai-cap-pill">
                                    {cap}
                                </span>
                            ))}
                        </div>

                        <div className="ai-quick">
                            {QUICK_PROMPTS.map((q) => (
                                <button key={q} type="button" className="ai-chip" onClick={() => handleSend(q)}>
                                    {q}
                                </button>
                            ))}
                        </div>

                        <div className="ai-chat-area">
                            {messages.map((msg, index) => (
                                <div key={index} className={`ai-message ${msg.role === 'ai' ? 'ai-msg' : 'user-msg'}`}>
                                    {msg.content}
                                </div>
                            ))}
                        </div>

                        <div className="ai-input-area">
                            <button type="button" className="ai-voice-btn" onClick={startVoice} title="Voice command">
                                <FaMicrophone />
                            </button>
                            <input
                                type="text"
                                placeholder="Command SUN AI…"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                            />
                            <button type="button" onClick={() => handleSend()} className="ai-send-btn" aria-label="Send">
                                <FaPaperPlane />
                            </button>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default AIAssistant;

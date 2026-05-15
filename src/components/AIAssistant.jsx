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
                'SUN AI online. I fuse your orbit — watch history, moods, and genres — to steer you toward the perfect session. How can I help you today?',
        },
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const pushAiMessage = useCallback((text) => {
        setMessages((prev) => [...prev, { role: 'ai', content: text }]);
    }, []);

    const handleSend = async (textOverride) => {
        const text = (textOverride ?? input).trim();
        if (!text || isLoading) return;

        const newMessages = [...messages, { role: 'user', content: text }];
        setMessages(newMessages);
        setInput('');
        setIsLoading(true);

        try {
            const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${import.meta.env.VITE_GROQ_API_KEY}`
                },
                body: JSON.stringify({
                    model: 'llama-3.1-8b-instant',
                    messages: [
                        {
                            role: 'system',
                            content: 'You are SUN AI, a cinematic movie curator for SUNFLIX. Recommend movies/shows based on mood and genre. Keep answers concise, engaging, and cinematic. Do not use markdown like asterisks or bolding, just plain text.'
                        },
                        ...newMessages.map(m => ({ role: m.role === 'ai' ? 'assistant' : 'user', content: m.content }))
                    ],
                    temperature: 0.7,
                    max_tokens: 256
                })
            });

            if (!response.ok) throw new Error('API Error');

            const data = await response.json();
            const aiResponse = data.choices[0].message.content;
            pushAiMessage(aiResponse);
        } catch (error) {
            console.error('SUN AI error:', error);
            pushAiMessage('I am currently experiencing interference. Please try again later.');
        } finally {
            setIsLoading(false);
        }
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
                            {isLoading && (
                                <div className="ai-message ai-msg">
                                    <div className="typing-indicator">
                                        <span></span><span></span><span></span>
                                    </div>
                                </div>
                            )}
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

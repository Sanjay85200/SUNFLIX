import React from 'react';
import { motion } from 'framer-motion';
import './CommunityFeedStrip.css';

const FEED_ITEMS = [
    { id: 1, user: 'neo_stream', action: 'started a Watch Party', title: 'Blade Runner 2049', live: true, emoji: '🎬' },
    { id: 2, user: 'telugu_cinephile', action: 'rated 5★', title: 'RRR', live: false, emoji: '✨' },
    { id: 3, user: 'void_runner', action: 'unlocked Neon Frame', title: 'SUN Coins reward', live: true, emoji: '💠' },
    { id: 4, user: 'anime_orbit', action: 'joined Fandom', title: 'Cyber Souls Guild', live: true, emoji: '🌀' },
    { id: 5, user: 'sun_ai', action: 'recommended mood: midnight sci‑fi', title: 'AI Pick', live: false, emoji: '🤖' },
    { id: 6, user: 'party_alpha', action: 'voice room live', title: 'Horror Night', live: true, emoji: '🎙️' },
];

const CommunityFeedStrip = () => {
    return (
        <section className="community-feed px-[4%] py-6 relative z-[1]">
            <div className="community-feed__header">
                <span className="community-feed__pulse" aria-hidden />
                <h2 className="community-feed__title">Live universe feed</h2>
                <span className="community-feed__tag">Community</span>
            </div>
            <div className="community-feed__track">
                {FEED_ITEMS.map((item, i) => (
                    <motion.article
                        key={item.id}
                        initial={{ opacity: 0, x: 24 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: i * 0.06, duration: 0.45 }}
                        className="community-feed__card glass"
                    >
                        <span className="community-feed__emoji" aria-hidden>{item.emoji}</span>
                        <div className="community-feed__body">
                            <p className="community-feed__user">@{item.user}</p>
                            <p className="community-feed__action">{item.action}</p>
                            <p className="community-feed__title-ref">{item.title}</p>
                        </div>
                        {item.live && <span className="community-feed__live">LIVE</span>}
                    </motion.article>
                ))}
            </div>
        </section>
    );
};

export default CommunityFeedStrip;

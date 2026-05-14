import React, { useEffect, useState, useRef } from 'react';
import './SunflixDrop.css';

/**
 * Boot splash — CSS + timers only (no GSAP) for maximum compatibility.
 */
const SunflixDrop = ({ onComplete }) => {
    const [logoActive, setLogoActive] = useState(false);
    const [fadeOut, setFadeOut] = useState(false);
    const finishedRef = useRef(false);

    useEffect(() => {
        const audio = new Audio('/netflix_notifications.mp3');
        audio.volume = 0.22;
        audio.play().catch(() => {});

        const tLogo = window.setTimeout(() => setLogoActive(true), 80);
        const tFade = window.setTimeout(() => setFadeOut(true), 2200);
        const tDone = window.setTimeout(() => {
            if (finishedRef.current) return;
            finishedRef.current = true;
            onComplete?.();
        }, 3000);

        return () => {
            window.clearTimeout(tLogo);
            window.clearTimeout(tFade);
            window.clearTimeout(tDone);
        };
    }, [onComplete]);

    return (
        <div
            className={`sunflix-drop-container ${fadeOut ? 'sunflix-drop-container--out' : ''}`}
            role="presentation"
        >
            <div className="sunflix-drop__grid" aria-hidden />
            <div className="sunflix-drop__scanlines" aria-hidden />
            <div className="sunflix-drop__particles" aria-hidden />
            <div className={`sunflix-logo-animation ${logoActive ? 'sunflix-logo-animation--in' : ''}`}>
                <span className="sunflix-logo-animation__core">SUNFLIX</span>
                <span className="sunflix-logo-animation__ghost" aria-hidden>
                    SUNFLIX
                </span>
            </div>
            <p className="sunflix-drop__tagline">Neural cinema · AI universe</p>
        </div>
    );
};

export default SunflixDrop;

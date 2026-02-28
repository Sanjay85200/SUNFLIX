import React, { useEffect, useState } from 'react';
import './SunflixDrop.css';

const SunflixDrop = ({ onComplete }) => {
    const [animationStep, setAnimationStep] = useState(0);

    useEffect(() => {
        // Play notification sound
        const audio = new Audio('/netflix_notifications.mp3');
        audio.play().catch(e => console.log("Audio play failed:", e));

        // Animation sequence
        const timer1 = setTimeout(() => setAnimationStep(1), 100); // Start zoom
        const timer2 = setTimeout(() => setAnimationStep(2), 2000); // Start fade out
        const timer3 = setTimeout(() => onComplete(), 2800); // Remove component

        return () => {
            clearTimeout(timer1);
            clearTimeout(timer2);
            clearTimeout(timer3);
        };
    }, [onComplete]);

    return (
        <div className={`sunflix-drop-container ${animationStep === 2 ? 'fade-out' : ''}`}>
            <div className={`sunflix-logo-animation ${animationStep >= 1 ? 'zoom-in' : ''}`}>
                SUNFLIX
            </div>
        </div>
    );
};

export default SunflixDrop;

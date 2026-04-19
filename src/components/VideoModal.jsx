import React, { useEffect } from 'react';
import './VideoModal.css';
import { FaTimes } from 'react-icons/fa';

const VideoModal = ({ videoId, title, onClose }) => {
    // Disable scrolling on body when modal is open
    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = 'auto';
        };
    }, []);

    // Close on escape key
    useEffect(() => {
        const handleEsc = (event) => {
            if (event.keyCode === 27) onClose();
        };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [onClose]);

    if (!videoId) return null;

    return (
        <div className="videoModal" onClick={onClose}>
            <div className="videoModal__content" onClick={(e) => e.stopPropagation()}>
                <button className="videoModal__close" onClick={onClose}>
                    <FaTimes />
                </button>
                
                <div className="videoModal__playerWrapper">
                    <iframe
                        className="videoModal__player"
                        src={`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&showinfo=0&mute=0`}
                        title={title}
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                    ></iframe>
                </div>

                <div className="videoModal__info">
                    <h2>{title}</h2>
                    <p>Playing in 4K Ultra HD • SUNFLIX Premium</p>
                </div>
            </div>
        </div>
    );
};

export default VideoModal;

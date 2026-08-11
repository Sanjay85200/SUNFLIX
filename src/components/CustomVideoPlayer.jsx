import React, { useState, useRef, useEffect } from 'react';
import {
    FaPlay,
    FaPause,
    FaVolumeMute,
    FaVolumeUp,
    FaCompress,
    FaExpand,
    FaSlidersH,
    FaClosedCaptioning,
    FaTv,
    FaExternalLinkAlt,
    FaExclamationTriangle,
    FaSpinner
} from 'react-icons/fa';
import internetArchiveApi from '../services/internetArchiveApi';

// Open-source authorized demonstration streams (Blender Foundation / Creative Commons)
const SAMPLE_STREAMS = [
    { title: 'Sintel (Original 4K Cut)', url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4' },
    { title: 'Tears of Steel (Sci-Fi Cut)', url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4' },
    { title: 'Big Buck Bunny (Animation Cut)', url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4' },
];

const SUBTITLE_OPTIONS = [
    { code: 'off', label: 'Subtitles: Off' },
    { code: 'en', label: 'English [CC]' },
    { code: 'es', label: 'Spanish' },
    { code: 'fr', label: 'French' },
    { code: 'hi', label: 'Hindi' },
];

const SPEED_OPTIONS = [0.5, 1.0, 1.25, 1.5, 2.0];

const CustomVideoPlayer = ({ movie, videoId, title, onClose, onProgressUpdate }) => {
    const videoRef = useRef(null);
    const containerRef = useRef(null);

    const [isPlaying, setIsPlaying] = useState(true);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [volume, setVolume] = useState(1.0);
    const [isMuted, setIsMuted] = useState(false);
    const [playbackRate, setPlaybackRate] = useState(1.0);
    const [selectedSubtitle, setSelectedSubtitle] = useState('off');
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [showControls, setShowControls] = useState(true);
    const [currentSeason, setCurrentSeason] = useState(1);
    const [currentEpisode, setCurrentEpisode] = useState(1);
    const [archiveVideoUrl, setArchiveVideoUrl] = useState(movie?.videoUrl || movie?.video_url || null);
    const [loadingMetadata, setLoadingMetadata] = useState(false);
    const [videoError, setVideoError] = useState(false);

    const controlsTimeoutRef = useRef(null);

    // Determine playback mechanism: YouTube Iframe Embed vs HTML5 MP4 Stream
    const isYoutube = movie?.playbackType === 'youtube_embed' || movie?.source === 'youtube' || movie?._isYoutube || Boolean(movie?.youtubeId);
    const youtubeKey = movie?.youtubeId || movie?.videos?.[0]?.key || (typeof videoId === 'string' && videoId.length === 11 ? videoId : null);

    const isArchive = movie?.source === 'internet_archive' || movie?._isArchive;

    // Fetch Internet Archive direct MP4 stream URL if needed
    useEffect(() => {
        if (isArchive && !archiveVideoUrl && movie?.identifier) {
            setLoadingMetadata(true);
            setVideoError(false);
            internetArchiveApi.getMetadata(movie.identifier)
                .then(details => {
                    if (details?.videoUrl) {
                        setArchiveVideoUrl(details.videoUrl);
                    } else {
                        setVideoError(true);
                    }
                })
                .catch(() => setVideoError(true))
                .finally(() => setLoadingMetadata(false));
        } else if (movie?.videoUrl || movie?.video_url) {
            setArchiveVideoUrl(movie.videoUrl || movie.video_url);
        }
    }, [isArchive, movie, archiveVideoUrl]);

    // Choose fallback authorized MP4 stream based on title hash
    const streamIndex = Math.abs((title || movie?.title || 'sunflix').length) % SAMPLE_STREAMS.length;
    const mediaStreamUrl = archiveVideoUrl || (SAMPLE_STREAMS[streamIndex]?.url || SAMPLE_STREAMS[0].url);

    // Auto-hide controls after inactivity
    const handleMouseMove = () => {
        setShowControls(true);
        if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
        controlsTimeoutRef.current = setTimeout(() => {
            if (isPlaying) setShowControls(false);
        }, 3500);
    };

    useEffect(() => {
        return () => {
            if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
        };
    }, [isPlaying]);

    const togglePlay = () => {
        if (!videoRef.current) return;
        if (isPlaying) {
            videoRef.current.pause();
            setIsPlaying(false);
        } else {
            videoRef.current.play();
            setIsPlaying(true);
        }
    };

    const handleTimeUpdate = () => {
        if (!videoRef.current) return;
        const current = videoRef.current.currentTime;
        const total = videoRef.current.duration || 0;
        setCurrentTime(current);
        setDuration(total);

        if (onProgressUpdate && total > 0) {
            onProgressUpdate(current, total);
        }
    };

    const handleSeek = (e) => {
        const seekTime = parseFloat(e.target.value);
        setCurrentTime(seekTime);
        if (videoRef.current) {
            videoRef.current.currentTime = seekTime;
        }
    };

    const handleVolumeChange = (e) => {
        const val = parseFloat(e.target.value);
        setVolume(val);
        setIsMuted(val === 0);
        if (videoRef.current) {
            videoRef.current.volume = val;
            videoRef.current.muted = val === 0;
        }
    };

    const toggleMute = () => {
        if (!videoRef.current) return;
        if (isMuted) {
            videoRef.current.muted = false;
            setIsMuted(false);
            if (volume === 0) setVolume(0.8);
        } else {
            videoRef.current.muted = true;
            setIsMuted(true);
        }
    };

    const handleSpeedChange = (rate) => {
        setPlaybackRate(rate);
        if (videoRef.current) {
            videoRef.current.playbackRate = rate;
        }
    };

    const toggleFullscreen = () => {
        if (!containerRef.current) return;
        if (!document.fullscreenElement) {
            containerRef.current.requestFullscreen().catch((err) => console.error(err));
            setIsFullscreen(true);
        } else {
            document.exitFullscreen().catch((err) => console.error(err));
            setIsFullscreen(false);
        }
    };

    const formatTime = (seconds) => {
        if (isNaN(seconds)) return '00:00';
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;
    };

    const isTv = movie?.media_type === 'tv' || movie?.type === 'series' || Boolean(movie?.number_of_seasons);

    return (
        <div
            ref={containerRef}
            className="relative w-full h-full bg-black overflow-hidden flex flex-col justify-center select-none group"
            onMouseMove={handleMouseMove}
        >
            {/* Case A: YouTube Official Embedded IFrame Player */}
            {isYoutube && youtubeKey ? (
                <div className="relative w-full h-full flex flex-col items-center justify-center bg-black">
                    <iframe
                        className="w-full h-full object-cover"
                        src={`https://www.youtube-nocookie.com/embed/${youtubeKey}?autoplay=1&controls=1&modestbranding=1&rel=0`}
                        title={title || movie?.title || 'Official YouTube Stream'}
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
                        allowFullScreen
                    />
                    <div className="absolute top-4 left-4 z-30 pointer-events-auto">
                        <a
                            href={`https://www.youtube.com/watch?v=${youtubeKey}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 bg-black/60 backdrop-blur-md text-white/80 hover:text-white px-3 py-1.5 rounded-lg border border-white/20 text-xs font-bold transition-all hover:bg-red-600/80"
                        >
                            Open on YouTube <FaExternalLinkAlt className="text-[10px]" />
                        </a>
                    </div>
                </div>
            ) : loadingMetadata ? (
                /* Case B: Loading Metadata State */
                <div className="relative w-full h-full flex flex-col items-center justify-center bg-black text-cyan-300 gap-4">
                    <FaSpinner className="animate-spin text-4xl" />
                    <p className="font-bold text-sm font-orbitron">Loading Stream Metadata from Internet Archive...</p>
                </div>
            ) : videoError ? (
                /* Case C: Video Error / Unavailable State */
                <div className="relative w-full h-full flex flex-col items-center justify-center bg-black text-red-300 p-6 text-center gap-4">
                    <FaExclamationTriangle className="text-5xl text-red-400" />
                    <h3 className="text-xl font-bold font-orbitron text-white">Video Stream Unavailable</h3>
                    <p className="text-white/60 text-sm max-w-md">
                        This item does not currently have a browser-compatible direct MP4 stream available in the Public Domain archive.
                    </p>
                    {movie?.identifier && (
                        <a
                            href={`https://archive.org/details/${movie.identifier}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-2 inline-flex items-center gap-2 px-6 py-2.5 bg-purple-600/30 border border-purple-500/50 text-purple-200 rounded-xl font-bold text-xs hover:bg-purple-600/50 transition-all"
                        >
                            View Manifest on Archive.org <FaExternalLinkAlt className="text-xs" />
                        </a>
                    )}
                </div>
            ) : (
                /* Case D: Standard HTML5 Video Player (Direct MP4 / Internet Archive / Fallback Stream) */
                <div className="relative w-full h-full flex items-center justify-center bg-black">
                    <video
                        ref={videoRef}
                        src={mediaStreamUrl}
                        autoPlay
                        playsInline
                        className="w-full h-full object-contain cursor-pointer"
                        onClick={togglePlay}
                        onTimeUpdate={handleTimeUpdate}
                        onEnded={() => setIsPlaying(false)}
                        onError={() => setVideoError(true)}
                    />

                    {/* Subtitle Overlay Simulation */}
                    {selectedSubtitle !== 'off' && (
                        <div className="absolute bottom-20 left-1/2 -translate-x-1/2 bg-black/70 backdrop-blur-sm text-yellow-300 px-4 py-1.5 rounded text-sm sm:text-base font-medium tracking-wide text-center max-w-[80%] pointer-events-none transition-all">
                            [{selectedSubtitle.toUpperCase()}] — Enjoying "{title || movie?.title || 'SUNFLIX'}" in HD stream mode.
                        </div>
                    )}

                    {/* Custom Player Controls Bar */}
                    <div
                        className={`absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent p-4 sm:p-6 transition-opacity duration-300 z-40 ${
                            showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'
                        }`}
                    >
                        {/* Seek Progress Bar */}
                        <div className="flex items-center gap-3 mb-3">
                            <span className="text-white/70 text-xs font-mono">{formatTime(currentTime)}</span>
                            <input
                                type="range"
                                min={0}
                                max={duration || 100}
                                value={currentTime}
                                onChange={handleSeek}
                                className="w-full h-1.5 bg-white/20 accent-cyan-400 rounded-lg cursor-pointer hover:h-2 transition-all"
                            />
                            <span className="text-white/70 text-xs font-mono">{formatTime(duration)}</span>
                        </div>

                        {/* Controls Bottom Row */}
                        <div className="flex items-center justify-between gap-4">
                            {/* Left Controls */}
                            <div className="flex items-center gap-4">
                                <button
                                    onClick={togglePlay}
                                    className="p-2 text-cyan-400 hover:text-white transition-colors text-lg"
                                    title={isPlaying ? 'Pause' : 'Play'}
                                >
                                    {isPlaying ? <FaPause /> : <FaPlay />}
                                </button>

                                <div className="flex items-center gap-2 group/vol">
                                    <button onClick={toggleMute} className="text-white/80 hover:text-cyan-300 transition-colors">
                                        {isMuted ? <FaVolumeMute /> : <FaVolumeUp />}
                                    </button>
                                    <input
                                        type="range"
                                        min={0}
                                        max={1}
                                        step={0.05}
                                        value={isMuted ? 0 : volume}
                                        onChange={handleVolumeChange}
                                        className="w-16 sm:w-24 h-1 bg-white/20 accent-cyan-400 rounded cursor-pointer"
                                    />
                                </div>

                                <div className="hidden sm:flex flex-col">
                                    <span className="text-white font-bold text-xs sm:text-sm truncate max-w-[200px]">{title || movie?.title}</span>
                                    {isTv && (
                                        <span className="text-cyan-400 text-[10px] uppercase tracking-wider font-mono">
                                            S{currentSeason} : E{currentEpisode}
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* Right Controls */}
                            <div className="flex items-center gap-3 text-xs sm:text-sm">
                                {/* Season/Episode Switcher for TV */}
                                {isTv && (
                                    <div className="flex items-center gap-1 bg-white/10 border border-white/20 px-2 py-1 rounded text-white text-xs">
                                        <FaTv className="text-cyan-400" />
                                        <select
                                            value={currentEpisode}
                                            onChange={(e) => setCurrentEpisode(Number(e.target.value))}
                                            className="bg-transparent text-white outline-none cursor-pointer"
                                        >
                                            <option value={1} className="bg-gray-900 text-white">Ep 1 - Pilot</option>
                                            <option value={2} className="bg-gray-900 text-white">Ep 2 - Emergence</option>
                                            <option value={3} className="bg-gray-900 text-white">Ep 3 - Nexus</option>
                                            <option value={4} className="bg-gray-900 text-white">Ep 4 - Resolution</option>
                                        </select>
                                    </div>
                                )}

                                {/* Subtitle Selector */}
                                <div className="relative group/sub flex items-center gap-1 bg-white/10 border border-white/20 px-2 py-1 rounded text-white cursor-pointer hover:border-cyan-400 transition-colors">
                                    <FaClosedCaptioning className={selectedSubtitle !== 'off' ? 'text-cyan-400' : 'text-white/60'} />
                                    <select
                                        value={selectedSubtitle}
                                        onChange={(e) => setSelectedSubtitle(e.target.value)}
                                        className="bg-transparent text-white text-xs outline-none cursor-pointer"
                                    >
                                        {SUBTITLE_OPTIONS.map((sub) => (
                                            <option key={sub.code} value={sub.code} className="bg-gray-900 text-white">
                                                {sub.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Speed Selector */}
                                <div className="flex items-center gap-1 bg-white/10 border border-white/20 px-2 py-1 rounded text-white">
                                    <FaSlidersH className="text-cyan-400" />
                                    <select
                                        value={playbackRate}
                                        onChange={(e) => handleSpeedChange(Number(e.target.value))}
                                        className="bg-transparent text-white text-xs outline-none cursor-pointer"
                                    >
                                        {SPEED_OPTIONS.map((rate) => (
                                            <option key={rate} value={rate} className="bg-gray-900 text-white">
                                                {rate}x Speed
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Fullscreen */}
                                <button
                                    onClick={toggleFullscreen}
                                    className="p-1.5 text-white/80 hover:text-cyan-300 transition-colors"
                                    title="Fullscreen"
                                >
                                    {isFullscreen ? <FaCompress /> : <FaExpand />}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CustomVideoPlayer;

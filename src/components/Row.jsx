import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import './Row.css';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';

const Row = ({ title, fetchUrl, isLargeRow = false }) => {
    const [movies, setMovies] = useState([]);
    const [trailerUrl, setTrailerUrl] = useState("");
    const rowRef = useRef(null);

    useEffect(() => {
        async function fetchData() {
            try {
                const request = await axios.get(fetchUrl);
                let items = request.data.items || [];
                
                // Filter results checking titles for "full movie" or "hd"
                items = items.filter(movie => {
                    const titleLower = movie.snippet?.title?.toLowerCase() || "";
                    // Only display items that have videoId and highres thumbnails
                    const hasValidImage = movie.snippet?.thumbnails?.high?.url;
                    const hasVideoId = movie.id?.videoId;
                    return hasValidImage && hasVideoId && (titleLower.includes("full movie") || titleLower.includes("hd"));
                });

                setMovies(items);
            } catch (error) {
                console.error("Error fetching from YouTube:", error);
                const titleLower = title.toLowerCase();
                let fallbackItems = [];

                if (titleLower.includes("telugu")) {
                    fallbackItems = [
                        { id: { videoId: "9qCXv-O3c8o" }, snippet: { title: "Baahubali: The Beginning (Telugu) Full Movie HD", thumbnails: { high: { url: "https://images.unsplash.com/photo-1596727147705-611529eb4bf7?q=80&w=600&auto=format&fit=crop" } } } },
                        { id: { videoId: "W98pXvUa7g4" }, snippet: { title: "Pushpa The Rise - Telugu Action Full Movie", thumbnails: { high: { url: "https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?q=80&w=600&auto=format&fit=crop" } } } },
                        { id: { videoId: "jfKfPfyJRdk" }, snippet: { title: "Ala Vaikunthapurramuloo Full Movie HD", thumbnails: { high: { url: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=600&auto=format&fit=crop" } } } },
                        { id: { videoId: "3jz48VPTzT8" }, snippet: { title: "RRR - Full Telugu Blockbuster HD", thumbnails: { high: { url: "https://images.unsplash.com/photo-1580130601254-05fa235ae8cb?q=80&w=600&auto=format&fit=crop" } } } },
                        { id: { videoId: "jNQXAC9IVRw" }, snippet: { title: "KGF Chapter 1 (Telugu Dub) Full HD", thumbnails: { high: { url: "https://images.unsplash.com/photo-1616530940355-351fabd9524b?q=80&w=600&auto=format&fit=crop" } } } },
                        { id: { videoId: "tVlcKp3bWH8" }, snippet: { title: "Arjun Reddy Full Telugu Movie", thumbnails: { high: { url: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=600&auto=format&fit=crop" } } } }
                    ];
                } else if (titleLower.includes("hindi")) {
                    fallbackItems = [
                        { id: { videoId: "dQw4w9WgXcQ" }, snippet: { title: "Dangal - Hindi Full Movie HD", thumbnails: { high: { url: "https://images.unsplash.com/photo-1518676590629-3dcbd9c5a5c9?q=80&w=600&auto=format&fit=crop" } } } },
                        { id: { videoId: "jfKfPfyJRdk" }, snippet: { title: "3 Idiots - Hindi Comedy Full Movie", thumbnails: { high: { url: "https://images.unsplash.com/photo-1524985069026-dd778a71c7b4?q=80&w=600&auto=format&fit=crop" } } } },
                        { id: { videoId: "3jz48VPTzT8" }, snippet: { title: "Sholay Classic Full Movie HD", thumbnails: { high: { url: "https://images.unsplash.com/photo-1542204165-65bf26472b9b?q=80&w=600&auto=format&fit=crop" } } } },
                        { id: { videoId: "jNQXAC9IVRw" }, snippet: { title: "Lagaan Hindi Full Movie", thumbnails: { high: { url: "https://images.unsplash.com/photo-1509281373149-e957c6296406?q=80&w=600&auto=format&fit=crop" } } } },
                        { id: { videoId: "kJQP7kiw5Fk" }, snippet: { title: "PK Bollywood Blockbuster HD", thumbnails: { high: { url: "https://images.unsplash.com/photo-1440404653325-ab127d49abc1?q=80&w=600&auto=format&fit=crop" } } } },
                        { id: { videoId: "tVlcKp3bWH8" }, snippet: { title: "Gully Boy Hindi Movie Full", thumbnails: { high: { url: "https://images.unsplash.com/photo-1520004434532-6d5ebcb6524b?q=80&w=600&auto=format&fit=crop" } } } }
                    ];
                } else {
                    fallbackItems = [
                        { id: { videoId: "dQw4w9WgXcQ" }, snippet: { title: "Inception Full Movie English HD", thumbnails: { high: { url: "https://images.unsplash.com/photo-1478720568477-152d9b164e26?q=80&w=600&auto=format&fit=crop" } } } },
                        { id: { videoId: "jfKfPfyJRdk" }, snippet: { title: "The Dark Knight Action Full Movie HD", thumbnails: { high: { url: "https://images.unsplash.com/photo-1497124401559-3e75ec2ed794?q=80&w=600&auto=format&fit=crop" } } } },
                        { id: { videoId: "3jz48VPTzT8" }, snippet: { title: "Interstellar Free Sci-Fi Movie", thumbnails: { high: { url: "https://images.unsplash.com/photo-1462331940025-496dfbfc7564?q=80&w=600&auto=format&fit=crop" } } } },
                        { id: { videoId: "jNQXAC9IVRw" }, snippet: { title: "Avengers: Endgame English HD", thumbnails: { high: { url: "https://images.unsplash.com/photo-1533134486753-c833f0ed4866?q=80&w=600&auto=format&fit=crop" } } } },
                        { id: { videoId: "kJQP7kiw5Fk" }, snippet: { title: "The Matrix Action Full Movie", thumbnails: { high: { url: "https://images.unsplash.com/photo-1510070009289-b5bc34383727?q=80&w=600&auto=format&fit=crop" } } } },
                        { id: { videoId: "tVlcKp3bWH8" }, snippet: { title: "Titanic Romance English Full Movie", thumbnails: { high: { url: "https://images.unsplash.com/photo-1515634928627-2a4e0dae3ddf?q=80&w=600&auto=format&fit=crop" } } } }
                    ];
                }
                setMovies(fallbackItems);
            }
        }
        fetchData();
    }, [fetchUrl]);

    const scroll = (direction) => {
        const { current } = rowRef;
        if (direction === 'left') {
            current.scrollLeft -= window.innerWidth - 100;
        } else {
            current.scrollLeft += window.innerWidth - 100;
        }
    };

    const handleClick = (movie) => {
        if (trailerUrl === movie.id.videoId) {
            setTrailerUrl(""); // Toggle off
        } else {
            setTrailerUrl(movie.id.videoId);
        }
    };

    return (
        <div className="row">
            <h2 className="row__title">{title}</h2>

            <div className="row__container">
                <div className="row__arrow left" onClick={() => scroll('left')}>
                    <FaChevronLeft className="arrow__icon" />
                </div>

                <div className="row__posters" ref={rowRef}>
                    {movies.map((movie) => {
                        const thumbnailUrl = movie.snippet?.thumbnails?.high?.url;
                        const title = movie.snippet?.title;
                        const videoId = movie.id?.videoId;

                        return (
                            <div key={videoId} className={`row__posterWrapper ${isLargeRow && 'row__posterLargeWrapper'}`} onClick={() => handleClick(movie)}>
                                <img
                                    className={`row__poster ${isLargeRow && 'row__posterLarge'}`}
                                    src={thumbnailUrl}
                                    alt={title}
                                />
                                <p className="row__posterTitle">{title}</p>
                            </div>
                        );
                    })}
                </div>

                <div className="row__arrow right" onClick={() => scroll('right')}>
                    <FaChevronRight className="arrow__icon" />
                </div>
            </div>
            
            {trailerUrl && (
                <div className="row__player">
                    <iframe 
                        width="100%" 
                        height="450" 
                        src={`https://www.youtube.com/embed/${trailerUrl}?autoplay=1`}
                        title="YouTube video player" 
                        frameBorder="0" 
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                        allowFullScreen>
                    </iframe>
                </div>
            )}
        </div>
    );
};

export default Row;

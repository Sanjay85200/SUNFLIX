import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Banner.css';
import { FaPlay, FaPlus } from 'react-icons/fa';
import { requests } from '../services/api';

const Banner = ({ onPlayMovie }) => {
    const [movie, setMovie] = useState(null);

    useEffect(() => {
        async function fetchData() {
            try {
                // Fetch the featured movies (Netflix-like) from YouTube
                const request = await axios.get(requests.fetchFeaturedMovie);
                const items = request.data.items;
                if (items && items.length > 0) {
                    setMovie(items[Math.floor(Math.random() * items.length)]);
                }
            } catch (error) {
                console.error("Error fetching from YouTube:", error);
                setMovie({
                    id: { videoId: "3jz48VPTzT8" },
                    snippet: {
                        title: "SUNFLIX PREMIUM MOVIE",
                        description: "Due to high network traffic, live API quotas have been reached. You are currently viewing emergency cache data. Enjoy this premium experience seamlessly.",
                        thumbnails: { maxres: { url: "https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?q=80&w=2070&auto=format&fit=crop" } },
                        channelTitle: "SUNFLIX Originals"
                    }
                });
            }
        }
        fetchData();
    }, []);

    function truncate(str, n) {
        return str?.length > n ? str.substr(0, n - 1) + '...' : str;
    }

    const bannerImage = movie?.snippet?.thumbnails?.maxres?.url || movie?.snippet?.thumbnails?.high?.url || "";
    const title = movie?.snippet?.title || "SUNFLIX Featured Movie";
    const overview = movie?.snippet?.description || "Enjoy endless cinematic entertainment.";

    return (
        <header
            className="banner"
            style={{
                backgroundSize: 'cover',
                backgroundImage: `linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.2), #111), url("${bannerImage}")`,
                backgroundPosition: 'top center',
            }}
        >
            <div className="banner__contents">
                <div className="banner__type">
                    <span className="banner__n">N</span>
                    <span className="banner__series">FEATURED</span>
                </div>

                <h1 className="banner__title">
                    {title}
                </h1>

                <div className="banner__metadata">
                    <span className="match">98% Match</span>
                    <span className="banner__year">New</span>
                    <span className="rating">U/A</span>
                    <span className="duration">Long</span>
                    <span className="banner__top10">
                        <span className="top10__box">TOP<br />10</span>
                        <span className="top10__text">#1 in Movies Today</span>
                    </span>
                </div>

                <h1 className="banner__description">
                    {truncate(overview, 160)}
                </h1>

                <div className="banner__buttons">
                    {/* Optionally, one could trigger YouTube player here as well */}
                    <button className="banner__button banner__button--play" onClick={() => {
                        if (movie?.id?.videoId && onPlayMovie) {
                            onPlayMovie({
                                videoId: movie.id.videoId,
                                title: movie.snippet.title
                            });
                        }
                    }}>
                        <FaPlay /> Play
                    </button>
                    <button className="banner__button banner__button--list">
                        <FaPlus /> My List
                    </button>
                </div>

                <div className="banner__cast">
                    <span>Channel: {movie?.snippet?.channelTitle}</span>
                </div>
            </div>

            <div className="banner--fadeBottom" />
        </header>
    );
};

export default Banner;

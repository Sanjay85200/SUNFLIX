import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Banner.css';
import { FaPlay, FaPlus } from 'react-icons/fa';
import { requests } from '../services/api';

const Banner = () => {
    const [movie, setMovie] = useState(null);

    useEffect(() => {
        async function fetchData() {
            try {
                const request = await axios.get(requests.fetchFeaturedMovie);
                setMovie(request.data);
            } catch (error) {
                console.error("Error fetching from OMDB:", error);
            }
        }
        fetchData();
    }, []);

    function truncate(str, n) {
        return str?.length > n ? str.substr(0, n - 1) + '...' : str;
    }

    return (
        <header
            className="banner"
            style={{
                backgroundSize: 'cover',
                // Using high-res poster from OMDB, though Netflix banners are usually backdrops. 
                // We'll apply a heavy overlay to make it look cinematic.
                backgroundImage: `linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.2), #111), url("${movie?.Poster}")`,
                backgroundPosition: 'top center',
            }}
        >
            <div className="banner__contents">
                <div className="banner__type">
                    <span className="banner__n">N</span>
                    <span className="banner__series">MOVIE</span>
                </div>

                <h1 className="banner__title">
                    {movie?.Title}
                </h1>

                <div className="banner__metadata">
                    <span className="match">{movie?.imdbRating ? `${Math.floor(movie.imdbRating * 10)}% Match` : '98% Match'}</span>
                    <span className="banner__year">{movie?.Year}</span>
                    <span className="rating">{movie?.Rated}</span>
                    <span className="duration">{movie?.Runtime}</span>
                    <span className="banner__top10">
                        <span className="top10__box">TOP<br />10</span>
                        <span className="top10__text">#1 in Movies Today</span>
                    </span>
                </div>

                <h1 className="banner__description">
                    {truncate(movie?.Plot, 160)}
                </h1>

                <div className="banner__buttons">
                    <button className="banner__button banner__button--play">
                        <FaPlay /> Play
                    </button>
                    <button className="banner__button banner__button--list">
                        <FaPlus /> My List
                    </button>
                </div>

                <div className="banner__cast">
                    <span>Starring: {movie?.Actors}</span>
                </div>
            </div>

            <div className="banner--fadeBottom" />
        </header>
    );
};

export default Banner;

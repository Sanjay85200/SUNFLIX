import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import './Row.css';
import { FaChevronLeft, FaChevronRight, FaPlay, FaPlus, FaThumbsUp, FaChevronDown } from 'react-icons/fa';

const Row = ({ title, fetchUrl, isLargeRow = false }) => {
    const [movies, setMovies] = useState([]);
    const rowRef = useRef(null);

    useEffect(() => {
        async function fetchData() {
            try {
                const request = await axios.get(fetchUrl);
                // OMDB search returns results in the 'Search' property
                setMovies(request.data.Search || []);
            } catch (error) {
                console.error("Error fetching from OMDB:", error);
            }
        }
        fetchData();
    }, [fetchUrl]);

    const scroll = (direction) => {
        const { current } = rowRef;
        if (direction === 'left') {
            current.scrollLeft -= 500;
        } else {
            current.scrollLeft += 500;
        }
    };

    const getRandomMatch = () => Math.floor(Math.random() * (99 - 85 + 1) + 85);
    const getRating = () => ['18+', '16+', '13+', '7+', 'U/A'][Math.floor(Math.random() * 5)];

    return (
        <div className="row">
            <h2 className="row__title">{title}</h2>

            <div className="row__container">
                <FaChevronLeft className="row__arrow left" onClick={() => scroll('left')} />

                <div className="row__posters" ref={rowRef}>
                    {movies.map((movie) => (
                        (movie.Poster && movie.Poster !== "N/A") && (
                            <div key={movie.imdbID} className="row__posterWrapper">
                                <img
                                    className={`row__poster ${isLargeRow && 'row__posterLarge'}`}
                                    src={movie.Poster}
                                    alt={movie.Title}
                                />
                                <div className="row__itemInfo">
                                    <div className="itemInfo__icons">
                                        <div className="icons__left">
                                            <FaPlay className="icon__circle play" />
                                            <FaPlus className="icon__circle" />
                                            <FaThumbsUp className="icon__circle" />
                                        </div>
                                        <FaChevronDown className="icon__circle more" />
                                    </div>

                                    <div className="itemInfo__top">
                                        <span className="match">{getRandomMatch()}% Match</span>
                                        <span className="rating">{getRating()}</span>
                                        <span className="duration">2h 15m</span>
                                        <span className="hd">HD</span>
                                    </div>

                                    <p className="row__movieName">
                                        {movie.Title}
                                    </p>

                                    <div className="genres">
                                        <span>{movie.Year}</span>
                                        <span className="dot">•</span>
                                        <span>{movie.Type.toUpperCase()}</span>
                                    </div>
                                </div>
                            </div>
                        )
                    ))}
                </div>

                <FaChevronRight className="row__arrow right" onClick={() => scroll('right')} />
            </div>
        </div>
    );
};

export default Row;

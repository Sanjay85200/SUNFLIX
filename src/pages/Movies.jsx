import React, { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import Banner from '../components/Banner';
import Row from '../components/Row';
import CategoryPills from '../components/CategoryPills';
import VortexCarousel from '../components/VortexCarousel';
import MoodPicker from '../components/MoodPicker';
import './sunflix-pages.css';

const MOVIE_GENRES = [
    { id: 'all', name: 'All Movies', fetchUrl: 'trendingMovies' },
    { id: 'telugu', name: 'Telugu Movies', fetchUrl: 'teluguMovies' },
    { id: 'hindi', name: 'Hindi Movies', fetchUrl: 'hindiMovies' },
    { id: 'english', name: 'English Movies', fetchUrl: 'englishMovies' },
    { id: 'action', name: 'Action', fetchUrl: 'actionMovies' },
    { id: 'scifi', name: 'Sci-Fi', fetchUrl: 'sciFiMovies' },
    { id: 'comedy', name: 'Comedy', fetchUrl: 'comedyMovies' },
    { id: 'horror', name: 'Horror', fetchUrl: 'horrorMovies' },
    { id: 'romance', name: 'Romance', fetchUrl: 'romanceMovies' },
    { id: 'tamil', name: 'Tamil', fetchUrl: 'tamilMovies' },
    { id: 'malayalam', name: 'Malayalam', fetchUrl: 'malayalamMovies' },
    { id: 'kannada', name: 'Kannada', fetchUrl: 'kannadaMovies' },
];

const Movies = () => {
    const { onMovieSelect } = useOutletContext() || {};
    const [activeGenre, setActiveGenre] = useState(MOVIE_GENRES[0]);

    return (
        <div className="movies-page pt-16">
            <Banner onPlayMovie={onMovieSelect} />
            
            <MoodPicker onSelectMovie={onMovieSelect} />

            <div className="my-6">
                <CategoryPills
                    categories={MOVIE_GENRES}
                    activeCategory={activeGenre.id}
                    onCategoryChange={setActiveGenre}
                    title="Movie Hub"
                    highlight="Genres"
                />
            </div>

            {activeGenre.id !== 'all' ? (
                <Row
                    key={`movie-genre-${activeGenre.id}`}
                    title={`${activeGenre.name} Movies`}
                    fetchUrl={activeGenre.fetchUrl}
                    onMovieSelect={onMovieSelect}
                    isLargeRow
                    accent="neon"
                />
            ) : (
                <>
                    <Row
                        title="Trending Movies"
                        fetchUrl="trendingMovies"
                        onMovieSelect={onMovieSelect}
                        isLargeRow
                        accent="neon"
                    />

                    <VortexCarousel
                        title="IMDb Top Rated Cinema"
                        fetchUrl="topRatedMovies"
                        onMovieSelect={onMovieSelect}
                    />

                    <Row
                        title="Internet Archive Public Domain Movies"
                        fetchUrl="fetchArchiveMovies"
                        onMovieSelect={onMovieSelect}
                        accent="neon"
                    />

                    <Row
                        title="YouTube Free Full Movies"
                        fetchUrl="fetchYoutubeMovies"
                        onMovieSelect={onMovieSelect}
                        accent="neon"
                    />

                    <Row
                        title="YouTube Official Cinema & Trailers"
                        fetchUrl="fetchYoutubeOfficial"
                        onMovieSelect={onMovieSelect}
                        accent="neon"
                    />

                    <Row
                        title="Action & Cyber blockbusters"
                        fetchUrl="actionMovies"
                        onMovieSelect={onMovieSelect}
                        accent="neon"
                    />

                    <Row
                        title="Sci-Fi & Cosmic Horizons"
                        fetchUrl="sciFiMovies"
                        onMovieSelect={onMovieSelect}
                    />

                    <Row
                        title="Horror & Thrillers"
                        fetchUrl="horrorMovies"
                        onMovieSelect={onMovieSelect}
                    />

                    <Row
                        title="Comedy Highlights"
                        fetchUrl="comedyMovies"
                        onMovieSelect={onMovieSelect}
                    />
                </>
            )}
        </div>
    );
};

export default Movies;

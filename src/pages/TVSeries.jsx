import React, { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import Banner from '../components/Banner';
import Row from '../components/Row';
import CategoryPills from '../components/CategoryPills';
import VortexCarousel from '../components/VortexCarousel';
import './sunflix-pages.css';

const TV_GENRES = [
    { id: 'all', name: 'All TV Series', fetchUrl: 'popularTvShows' },
    { id: 'drama', name: 'Drama', fetchUrl: 'popularTvShows' },
    { id: 'scifi', name: 'Sci-Fi & Fantasy', fetchUrl: 'sciFiMovies' },
    { id: 'crime', name: 'Crime & Mystery', fetchUrl: 'topRatedMovies' },
    { id: 'comedy', name: 'TV Comedy', fetchUrl: 'comedyMovies' },
];

const TVSeries = () => {
    const { onMovieSelect } = useOutletContext() || {};
    const [activeGenre, setActiveGenre] = useState(TV_GENRES[0]);

    return (
        <div className="tv-series-page pt-16">
            <Banner onPlayMovie={onMovieSelect} type="tv" />

            <div className="my-6">
                <CategoryPills
                    categories={TV_GENRES}
                    activeCategory={activeGenre.id}
                    onCategoryChange={setActiveGenre}
                    title="TV Universe"
                    highlight="Browse"
                />
            </div>

            {activeGenre.id !== 'all' ? (
                <Row
                    key={`tv-genre-${activeGenre.id}`}
                    title={`${activeGenre.name} Series`}
                    fetchUrl={activeGenre.fetchUrl}
                    onMovieSelect={onMovieSelect}
                    isLargeRow
                    accent="neon"
                />
            ) : (
                <>
                    <Row
                        title="Popular TV Shows"
                        fetchUrl="popularTvShows"
                        onMovieSelect={onMovieSelect}
                        isLargeRow
                        accent="neon"
                    />

                    <Row
                        title="YouTube TV & Web Series"
                        fetchUrl="fetchYoutubeSeries"
                        onMovieSelect={onMovieSelect}
                        accent="neon"
                    />

                    <VortexCarousel
                        title="Critically Acclaimed TV Series"
                        fetchUrl="topRatedMovies"
                        onMovieSelect={onMovieSelect}
                    />

                    <Row
                        title="Sci-Fi & Fantasy Series"
                        fetchUrl="sciFiMovies"
                        onMovieSelect={onMovieSelect}
                        accent="neon"
                    />

                    <Row
                        title="Binge-Worthy Hits"
                        fetchUrl="trendingMovies"
                        onMovieSelect={onMovieSelect}
                    />
                </>
            )}
        </div>
    );
};

export default TVSeries;

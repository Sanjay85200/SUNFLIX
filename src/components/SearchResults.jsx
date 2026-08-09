import React, { useState, useEffect, useCallback } from 'react';
import { searchMovies, getMovieById } from '../services/omdbApi';
import { omdbToSunflixFormat, FALLBACK_POSTER } from '../services/omdbAdapter';
import FloatingMovieCard from './FloatingMovieCard';
import { FaSearch, FaFilter, FaChevronLeft, FaChevronRight, FaExclamationCircle } from 'react-icons/fa';

const SearchResults = ({ query, onMovieSelect }) => {
    const [results, setResults] = useState([]);
    const [totalResults, setTotalResults] = useState(0);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [typeFilter, setTypeFilter] = useState(''); // '', 'movie', 'series', 'episode'
    const [yearFilter, setYearFilter] = useState('');
    const [error, setError] = useState(null);

    const performSearch = useCallback(async () => {
        if (!query || !query.trim()) {
            setResults([]);
            setTotalResults(0);
            return;
        }

        setLoading(true);
        setError(null);

        try {
            // Check if query is an IMDb ID (e.g. tt1234567)
            if (/^tt\d+$/i.test(query.trim())) {
                const singleDoc = await getMovieById(query.trim());
                if (singleDoc) {
                    const formatted = omdbToSunflixFormat(singleDoc);
                    setResults([formatted]);
                    setTotalResults(1);
                } else {
                    setResults([]);
                    setTotalResults(0);
                }
                setLoading(false);
                return;
            }

            const data = await searchMovies(query.trim(), typeFilter, yearFilter, page);
            
            if (data.results && data.results.length > 0) {
                // Enrich each item with detail data
                const enriched = await Promise.all(
                    data.results.map(async (item) => {
                        const detail = await getMovieById(item.imdbID);
                        return omdbToSunflixFormat(detail || item);
                    })
                );
                setResults(enriched.filter(Boolean));
                setTotalResults(data.totalResults);
            } else {
                setResults([]);
                setTotalResults(0);
            }
        } catch (err) {
            console.error("Search error:", err);
            setError("Failed to fetch search results from OMDb API. Please check network or API key.");
            setResults([]);
            setTotalResults(0);
        } finally {
            setLoading(false);
        }
    }, [query, typeFilter, yearFilter, page]);

    useEffect(() => {
        setPage(1); // Reset page on query or filter change
    }, [query, typeFilter, yearFilter]);

    useEffect(() => {
        performSearch();
    }, [performSearch]);

    const totalPages = Math.ceil(totalResults / 10);

    const moviesList = results.filter(r => r.type === 'movie');
    const seriesList = results.filter(r => r.type === 'series' || r.type === 'episode');

    return (
        <div className="search-results-container px-[4%] py-8 min-h-screen text-white">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 border-b border-white/10 pb-6">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold font-orbitron flex items-center gap-3">
                        <FaSearch className="text-cyan-400 text-xl" />
                        Search Results
                    </h1>
                    {query && (
                        <p className="text-white/60 text-sm mt-1">
                            Showing results for <span className="text-cyan-300 font-bold">&quot;{query}&quot;</span>
                            {totalResults > 0 && ` (${totalResults} matches found)`}
                        </p>
                    )}
                </div>

                {/* Filters */}
                <div className="flex flex-wrap items-center gap-3">
                    <div className="flex items-center gap-2 bg-white/5 border border-white/10 px-3 py-1.5 rounded-xl text-xs">
                        <FaFilter className="text-cyan-400" />
                        <span className="text-white/60 font-bold uppercase tracking-wider">Type:</span>
                        <select
                            value={typeFilter}
                            onChange={(e) => setTypeFilter(e.target.value)}
                            className="bg-transparent text-white outline-none font-bold cursor-pointer"
                        >
                            <option value="" className="bg-gray-900 text-white">All Types</option>
                            <option value="movie" className="bg-gray-900 text-white">Movies</option>
                            <option value="series" className="bg-gray-900 text-white">Series</option>
                            <option value="episode" className="bg-gray-900 text-white">Episodes</option>
                        </select>
                    </div>

                    <div className="flex items-center gap-2 bg-white/5 border border-white/10 px-3 py-1.5 rounded-xl text-xs">
                        <span className="text-white/60 font-bold uppercase tracking-wider">Year:</span>
                        <input
                            type="number"
                            placeholder="e.g. 2023"
                            value={yearFilter}
                            onChange={(e) => setYearFilter(e.target.value)}
                            className="bg-transparent text-white outline-none w-20 text-xs placeholder:text-white/30"
                        />
                    </div>
                </div>
            </div>

            {/* Error state */}
            {error && (
                <div className="bg-red-500/10 border border-red-500/40 p-6 rounded-2xl text-center text-red-300 my-8 flex flex-col items-center justify-center gap-3">
                    <FaExclamationCircle className="text-3xl text-red-400" />
                    <p className="font-bold">{error}</p>
                </div>
            )}

            {/* Loading Skeleton */}
            {loading ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(i => (
                        <div key={i} className="animate-pulse bg-white/5 rounded-xl h-64 border border-white/10" />
                    ))}
                </div>
            ) : results.length === 0 ? (
                /* Empty state */
                <div className="text-center py-20 bg-white/5 border border-white/10 rounded-2xl my-8">
                    <FaSearch className="text-5xl text-cyan-400/40 mx-auto mb-4 animate-bounce" />
                    <h3 className="text-xl font-bold text-white mb-2">No Movies or Shows Found</h3>
                    <p className="text-white/60 text-sm max-w-md mx-auto">
                        We couldn&apos;t find anything matching &quot;{query}&quot;. Try adjusting your keywords, checking for typos, or removing filters.
                    </p>
                </div>
            ) : (
                /* Results Display */
                <div className="space-y-10">
                    {/* Movies Section if both types exist */}
                    {typeFilter === '' && moviesList.length > 0 && seriesList.length > 0 ? (
                        <>
                            {moviesList.length > 0 && (
                                <div>
                                    <h2 className="text-xl font-bold text-cyan-400 mb-4 border-l-4 border-cyan-400 pl-3">
                                        Movies ({moviesList.length})
                                    </h2>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                                        {moviesList.map(item => (
                                            <div key={item.imdbID || item.id} className="h-72">
                                                <FloatingMovieCard movie={item} onClick={onMovieSelect} accent="neon" />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {seriesList.length > 0 && (
                                <div>
                                    <h2 className="text-xl font-bold text-violet-400 mb-4 border-l-4 border-violet-400 pl-3">
                                        TV Shows & Episodes ({seriesList.length})
                                    </h2>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                                        {seriesList.map(item => (
                                            <div key={item.imdbID || item.id} className="h-72">
                                                <FloatingMovieCard movie={item} onClick={onMovieSelect} accent="neon" />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                            {results.map(item => (
                                <div key={item.imdbID || item.id} className="h-72">
                                    <FloatingMovieCard movie={item} onClick={onMovieSelect} accent="neon" />
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex items-center justify-center gap-4 pt-8">
                            <button
                                onClick={() => setPage(p => Math.max(p - 1, 1))}
                                disabled={page === 1}
                                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed font-bold text-xs uppercase"
                            >
                                <FaChevronLeft /> Previous
                            </button>
                            <span className="text-xs text-white/70 font-mono">
                                Page <strong className="text-cyan-300">{page}</strong> of {totalPages}
                            </span>
                            <button
                                onClick={() => setPage(p => Math.min(p + 1, totalPages))}
                                disabled={page >= totalPages}
                                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed font-bold text-xs uppercase"
                            >
                                Next <FaChevronRight />
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default SearchResults;

import React, { useState, useEffect, useCallback } from 'react';
import { searchContent } from '../services/mediaApi';
import FloatingMovieCard from './FloatingMovieCard';
import { FaSearch, FaFilter, FaExclamationCircle, FaYoutube, FaArchive, FaFilm, FaTv } from 'react-icons/fa';

const SearchResults = ({ query, onMovieSelect }) => {
    const [results, setResults] = useState([]);
    const [totalResults, setTotalResults] = useState(0);
    const [sourcesCount, setSourcesCount] = useState({ cinema: 0, archive: 0, youtube: 0 });
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [activeSourceTab, setActiveSourceTab] = useState('all'); // 'all', 'cinema', 'youtube', 'archive'
    const [typeFilter, setTypeFilter] = useState('');
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
            const data = await searchContent(query.trim(), typeFilter, page);
            setResults(data.results || []);
            setTotalResults(data.totalResults || 0);
            setSourcesCount(data.sourcesCount || { cinema: 0, archive: 0, youtube: 0 });
        } catch (err) {
            console.error("Search error:", err);
            setError("Failed to fetch search results. Please check your network connection.");
            setResults([]);
            setTotalResults(0);
        } finally {
            setLoading(false);
        }
    }, [query, typeFilter, page]);

    useEffect(() => {
        setPage(1);
        setActiveSourceTab('all');
    }, [query, typeFilter]);

    useEffect(() => {
        performSearch();
    }, [performSearch]);

    // Filter results based on source tab selection
    const filteredResults = results.filter(item => {
        if (activeSourceTab === 'cinema') {
            return item.source !== 'youtube' && item.source !== 'internet_archive';
        }
        if (activeSourceTab === 'youtube') {
            return item.source === 'youtube' || item._isYoutube;
        }
        if (activeSourceTab === 'archive') {
            return item.source === 'internet_archive' || item._isArchive;
        }
        return true;
    });

    return (
        <div className="search-results-container px-[4%] py-8 min-h-screen text-white">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 border-b border-white/10 pb-6">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold font-orbitron flex items-center gap-3">
                        <FaSearch className="text-cyan-400 text-xl" />
                        Multi-Source Search
                    </h1>
                    {query && (
                        <p className="text-white/60 text-sm mt-1">
                            Showing unified search for <span className="text-cyan-300 font-bold">&quot;{query}&quot;</span>
                            {totalResults > 0 && ` (${filteredResults.length} matches)`}
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
                            <option value="" className="bg-gray-900 text-white">All Content</option>
                            <option value="movie" className="bg-gray-900 text-white">Movies</option>
                            <option value="series" className="bg-gray-900 text-white">TV Series</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Content Source Filter Tabs */}
            <div className="flex items-center gap-2 mb-8 overflow-x-auto pb-2 custom-scrollbar">
                <button
                    onClick={() => setActiveSourceTab('all')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap border ${
                        activeSourceTab === 'all'
                            ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400/50 shadow-[0_0_15px_rgba(34,211,238,0.2)]'
                            : 'bg-white/5 text-white/60 border-white/10 hover:text-white'
                    }`}
                >
                    <FaFilm className="text-xs" /> All Sources ({results.length})
                </button>
                <button
                    onClick={() => setActiveSourceTab('cinema')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap border ${
                        activeSourceTab === 'cinema'
                            ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400/50 shadow-[0_0_15px_rgba(34,211,238,0.2)]'
                            : 'bg-white/5 text-white/60 border-white/10 hover:text-white'
                    }`}
                >
                    <FaTv className="text-xs text-cyan-400" /> Sunflix Movies ({sourcesCount.cinema || results.filter(r => r.source !== 'youtube' && r.source !== 'internet_archive').length})
                </button>
                <button
                    onClick={() => setActiveSourceTab('youtube')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap border ${
                        activeSourceTab === 'youtube'
                            ? 'bg-red-600/20 text-red-300 border-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.2)]'
                            : 'bg-white/5 text-white/60 border-white/10 hover:text-white'
                    }`}
                >
                    <FaYoutube className="text-xs text-red-500" /> YouTube Official ({sourcesCount.youtube || results.filter(r => r.source === 'youtube' || r._isYoutube).length})
                </button>
                <button
                    onClick={() => setActiveSourceTab('archive')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap border ${
                        activeSourceTab === 'archive'
                            ? 'bg-purple-600/20 text-purple-300 border-purple-500/50 shadow-[0_0_15px_rgba(168,85,247,0.2)]'
                            : 'bg-white/5 text-white/60 border-white/10 hover:text-white'
                    }`}
                >
                    <FaArchive className="text-xs text-purple-400" /> Internet Archive ({sourcesCount.archive || results.filter(r => r.source === 'internet_archive' || r._isArchive).length})
                </button>
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
            ) : filteredResults.length === 0 ? (
                /* Empty state */
                <div className="text-center py-20 bg-white/5 border border-white/10 rounded-2xl my-8">
                    <FaSearch className="text-5xl text-cyan-400/40 mx-auto mb-4 animate-bounce" />
                    <h3 className="text-xl font-bold text-white mb-2">No Matches Found</h3>
                    <p className="text-white/60 text-sm max-w-md mx-auto">
                        We couldn&apos;t find anything matching &quot;{query}&quot; in the selected source filter. Try selecting &quot;All Sources&quot; or adjusting your search terms.
                    </p>
                </div>
            ) : (
                /* Results Grid */
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {filteredResults.map(item => (
                        <div key={item.imdbID || item.id || item.youtubeId} className="h-72">
                            <FloatingMovieCard movie={item} onClick={onMovieSelect} accent="neon" />
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default SearchResults;

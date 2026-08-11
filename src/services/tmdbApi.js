/**
 * TMDB API v3 Service for SUNFLIX
 * Provides movie, TV show, anime, cast, video trailer, and season metadata.
 * Includes caching, timeout protection, and request deduplication.
 */

import { normalizeReleaseDate } from '../utils/dateUtils';

const TMDB_API_KEY = import.meta.env.VITE_TMDB_API_KEY?.trim();
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

export const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p/w500';
export const TMDB_BACKDROP_BASE = 'https://image.tmdb.org/t/p/original';

const CACHE_TTL = 12 * 60 * 60 * 1000; // 12 hours
const FETCH_TIMEOUT_MS = 3500; // 3.5 second timeout for fast fallback
const memoryCache = new Map();
const pendingRequests = new Map();

function getFromCache(key) {
    try {
        const cached = localStorage.getItem(`tmdb_${key}`);
        if (!cached) return null;
        const { data, timestamp } = JSON.parse(cached);
        if (Date.now() - timestamp > CACHE_TTL) {
            localStorage.removeItem(`tmdb_${key}`);
            return null;
        }
        return data;
    } catch {
        return null;
    }
}

function saveToCache(key, data) {
    try {
        localStorage.setItem(`tmdb_${key}`, JSON.stringify({
            data,
            timestamp: Date.now()
        }));
    } catch {
        try {
            const keys = Object.keys(localStorage).filter(k => k.startsWith('tmdb_'));
            keys.slice(0, 20).forEach(k => localStorage.removeItem(k));
        } catch { /* ignore */ }
    }
}

async function tmdbFetch(endpoint, params = {}) {
    if (!TMDB_API_KEY) {
        return null;
    }

    const queryParams = new URLSearchParams({
        api_key: TMDB_API_KEY,
        ...params
    }).toString();

    const cacheKey = `${endpoint}?${queryParams}`;

    if (memoryCache.has(cacheKey)) return memoryCache.get(cacheKey);

    const cached = getFromCache(cacheKey);
    if (cached) {
        memoryCache.set(cacheKey, cached);
        return cached;
    }

    if (pendingRequests.has(cacheKey)) {
        return pendingRequests.get(cacheKey);
    }

    const fetchPromise = (async () => {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

        try {
            const url = `${TMDB_BASE_URL}${endpoint}?${queryParams}`;
            const response = await fetch(url, { signal: controller.signal });
            clearTimeout(timeoutId);
            if (!response.ok) {
                console.warn(`[TMDB] HTTP ${response.status} for ${endpoint}`);
                return null;
            }
            const data = await response.json();
            memoryCache.set(cacheKey, data);
            saveToCache(cacheKey, data);
            return data;
        } catch (error) {
            clearTimeout(timeoutId);
            console.warn(`[TMDB] fetch network timeout/error for ${endpoint}:`, error?.message || error);
            return null;
        } finally {
            pendingRequests.delete(cacheKey);
        }
    })();

    pendingRequests.set(cacheKey, fetchPromise);
    return fetchPromise;
}



export function tmdbToSunflixFormat(item, mediaTypeOverride = null) {
    if (!item) return null;

    const mediaType = mediaTypeOverride || item.media_type || (item.first_air_date || item.name ? 'tv' : 'movie');
    const title = item.title || item.name || item.original_title || item.original_name || 'Untitled';

    const poster = item.poster_path
        ? `${TMDB_IMAGE_BASE}${item.poster_path}`
        : (item.poster_url || item.Poster || 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=1000&auto=format&fit=crop');

    const backdrop = item.backdrop_path
        ? `${TMDB_BACKDROP_BASE}${item.backdrop_path}`
        : poster;

    const voteAvg = item.vote_average ? item.vote_average.toFixed(1) : (item.imdbRating || '8.1');

    return {
        id: item.id || item.imdbID,
        imdbID: item.imdb_id || item.imdbID || String(item.id),
        tmdbId: item.id,
        title: title,
        name: title,
        poster_path: poster,
        backdrop_path: backdrop,
        vote_average: parseFloat(voteAvg) || 8.0,
        imdbRating: String(voteAvg),
        release_date: normalizeReleaseDate(item.release_date || item.first_air_date || item.Year) || '',
        first_air_date: normalizeReleaseDate(item.first_air_date || item.release_date) || '',
        overview: item.overview || item.Plot || 'No synopsis available for this title.',
        media_type: mediaType,
        type: mediaType === 'tv' ? 'series' : 'movie',
        genre_ids: item.genre_ids || [],
        genres: item.genres ? item.genres.map(g => g.name).join(', ') : '',
        runtime: item.runtime ? `${item.runtime} min` : (item.episode_run_time?.[0] ? `${item.episode_run_time[0]} min/ep` : ''),
        tagline: item.tagline || '',
        status: item.status || '',
        number_of_seasons: item.number_of_seasons || 1,
        number_of_episodes: item.number_of_episodes || 0,
        credits: item.credits || null,
        videos: item.videos?.results || [],
        recommendations: item.recommendations?.results || [],
        _isTmdb: true
    };
}

export const tmdbApi = {
    isConfigured: Boolean(TMDB_API_KEY),

    getTrending: async (mediaType = 'all', timeWindow = 'week') => {
        const data = await tmdbFetch(`/trending/${mediaType}/${timeWindow}`);
        if (!data?.results) return [];
        return data.results.map(item => tmdbToSunflixFormat(item)).filter(Boolean);
    },

    getPopularMovies: async (page = 1) => {
        const data = await tmdbFetch('/movie/popular', { page: String(page) });
        if (!data?.results) return [];
        return data.results.map(item => tmdbToSunflixFormat(item, 'movie')).filter(Boolean);
    },

    getTopRatedMovies: async (page = 1) => {
        const data = await tmdbFetch('/movie/top_rated', { page: String(page) });
        if (!data?.results) return [];
        return data.results.map(item => tmdbToSunflixFormat(item, 'movie')).filter(Boolean);
    },

    getUpcomingMovies: async (page = 1) => {
        const data = await tmdbFetch('/movie/upcoming', { page: String(page) });
        if (!data?.results) return [];
        return data.results.map(item => tmdbToSunflixFormat(item, 'movie')).filter(Boolean);
    },

    getMoviesByGenre: async (genreId, page = 1) => {
        const data = await tmdbFetch('/discover/movie', {
            with_genres: String(genreId),
            sort_by: 'popularity.desc',
            page: String(page)
        });
        if (!data?.results) return [];
        return data.results.map(item => tmdbToSunflixFormat(item, 'movie')).filter(Boolean);
    },

    getPopularTv: async (page = 1) => {
        const data = await tmdbFetch('/tv/popular', { page: String(page) });
        if (!data?.results) return [];
        return data.results.map(item => tmdbToSunflixFormat(item, 'tv')).filter(Boolean);
    },

    getTopRatedTv: async (page = 1) => {
        const data = await tmdbFetch('/tv/top_rated', { page: String(page) });
        if (!data?.results) return [];
        return data.results.map(item => tmdbToSunflixFormat(item, 'tv')).filter(Boolean);
    },

    getTvByGenre: async (genreId, page = 1) => {
        const data = await tmdbFetch('/discover/tv', {
            with_genres: String(genreId),
            sort_by: 'popularity.desc',
            page: String(page)
        });
        if (!data?.results) return [];
        return data.results.map(item => tmdbToSunflixFormat(item, 'tv')).filter(Boolean);
    },

    getAnime: async (page = 1) => {
        const data = await tmdbFetch('/discover/tv', {
            with_genres: '16', // Animation
            with_original_language: 'ja',
            sort_by: 'popularity.desc',
            page: String(page)
        });
        if (!data?.results) return [];
        return data.results.map(item => tmdbToSunflixFormat(item, 'tv')).filter(Boolean);
    },

    getMediaDetails: async (id, mediaType = 'movie') => {
        if (!id) return null;
        const endpoint = `/${mediaType}/${id}`;
        const data = await tmdbFetch(endpoint, {
            append_to_response: 'credits,videos,recommendations,similar'
        });
        if (!data) return null;
        return tmdbToSunflixFormat(data, mediaType);
    },

    getTvSeasonDetails: async (tvId, seasonNumber = 1) => {
        const data = await tmdbFetch(`/tv/${tvId}/season/${seasonNumber}`);
        return data || null;
    },

    search: async (query, page = 1) => {
        if (!query) return { results: [], totalResults: 0 };
        const data = await tmdbFetch('/search/multi', {
            query: query.trim(),
            page: String(page)
        });
        if (!data?.results) return { results: [], totalResults: 0 };
        const items = data.results
            .filter(i => i.media_type === 'movie' || i.media_type === 'tv')
            .map(item => tmdbToSunflixFormat(item));
        return {
            results: items,
            totalResults: data.total_results || items.length
        };
    }
};

export default tmdbApi;

/**
 * OMDb API Service — Centralized API layer for SUNFLIX
 * Handles all OMDb requests with caching, deduplication, and error handling.
 */

const OMDB_API_KEY = import.meta.env.VITE_OMDB_API_KEY;
const OMDB_BASE = 'https://www.omdbapi.com/';
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours

// In-memory cache for current session
const memoryCache = new Map();

// In-flight request deduplication
const pendingRequests = new Map();

/**
 * Get cached data from localStorage
 */
function getFromCache(key) {
    try {
        const cached = localStorage.getItem(`omdb_${key}`);
        if (!cached) return null;
        const { data, timestamp } = JSON.parse(cached);
        if (Date.now() - timestamp > CACHE_TTL) {
            localStorage.removeItem(`omdb_${key}`);
            return null;
        }
        return data;
    } catch {
        return null;
    }
}

/**
 * Save data to localStorage cache
 */
function saveToCache(key, data) {
    try {
        localStorage.setItem(`omdb_${key}`, JSON.stringify({
            data,
            timestamp: Date.now()
        }));
    } catch {
        // Storage full — clear old entries
        clearOldCache();
    }
}

/**
 * Clear expired cache entries
 */
function clearOldCache() {
    try {
        const keys = Object.keys(localStorage).filter(k => k.startsWith('omdb_'));
        keys.forEach(key => {
            try {
                const { timestamp } = JSON.parse(localStorage.getItem(key));
                if (Date.now() - timestamp > CACHE_TTL) {
                    localStorage.removeItem(key);
                }
            } catch {
                localStorage.removeItem(key);
            }
        });
    } catch { /* ignore */ }
}

/**
 * Core fetch function with caching and deduplication
 */
async function omdbFetch(params) {
    if (!OMDB_API_KEY) {
        console.error('OMDb API key is missing. Set VITE_OMDB_API_KEY in your .env file.');
        return null;
    }

    const queryString = new URLSearchParams({ ...params, apikey: OMDB_API_KEY }).toString();
    const cacheKey = queryString;

    // Check memory cache first
    if (memoryCache.has(cacheKey)) return memoryCache.get(cacheKey);

    // Check localStorage cache
    const cached = getFromCache(cacheKey);
    if (cached) {
        memoryCache.set(cacheKey, cached);
        return cached;
    }

    // Deduplicate in-flight requests
    if (pendingRequests.has(cacheKey)) {
        return pendingRequests.get(cacheKey);
    }

    const fetchPromise = (async () => {
        try {
            const response = await fetch(`${OMDB_BASE}?${queryString}`);
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            const data = await response.json();

            if (data.Response === 'False') {
                console.warn('OMDb API Error:', data.Error);
                return null;
            }

            memoryCache.set(cacheKey, data);
            saveToCache(cacheKey, data);
            return data;
        } catch (error) {
            console.error('OMDb fetch error:', error);
            return null;
        } finally {
            pendingRequests.delete(cacheKey);
        }
    })();

    pendingRequests.set(cacheKey, fetchPromise);
    return fetchPromise;
}

// --- Public API ---

/**
 * Search movies/series by query
 * @param {string} query - Search term
 * @param {string} type - 'movie', 'series', or 'episode'
 * @param {string} year - Year of release
 * @param {number} page - Page number (1-indexed)
 * @returns {Promise<{results: Array, totalResults: number}>}
 */
export async function searchMovies(query, type = '', year = '', page = 1) {
    const params = { s: query, page: String(page) };
    if (type) params.type = type;
    if (year) params.y = year;

    const data = await omdbFetch(params);
    if (!data || !data.Search) return { results: [], totalResults: 0 };

    return {
        results: data.Search,
        totalResults: parseInt(data.totalResults, 10) || 0
    };
}

/**
 * Get full movie/series details by IMDb ID
 * @param {string} imdbId - IMDb ID (e.g., 'tt1375666')
 * @returns {Promise<Object|null>}
 */
export async function getMovieById(imdbId) {
    if (!imdbId) return null;
    return omdbFetch({ i: imdbId, plot: 'full' });
}

/**
 * Get movie details by title
 * @param {string} title - Movie title
 * @param {string} year - Optional year
 * @returns {Promise<Object|null>}
 */
export async function getMovieByTitle(title, year = '') {
    const params = { t: title, plot: 'full' };
    if (year) params.y = year;
    return omdbFetch(params);
}

/**
 * Batch fetch multiple movies by IMDb IDs
 * Uses Promise.allSettled for resilience
 * @param {string[]} imdbIds - Array of IMDb IDs
 * @returns {Promise<Object[]>}
 */
export async function getMultipleMovies(imdbIds) {
    if (!imdbIds || imdbIds.length === 0) return [];

    const results = await Promise.allSettled(
        imdbIds.map(id => getMovieById(id))
    );

    return results
        .filter(r => r.status === 'fulfilled' && r.value)
        .map(r => r.value);
}

/**
 * Debounce utility for search
 */
export function createDebouncedSearch(callback, delay = 400) {
    let timer;
    return (...args) => {
        clearTimeout(timer);
        timer = setTimeout(() => callback(...args), delay);
    };
}

/**
 * Clear all OMDb caches
 */
export function clearAllCache() {
    memoryCache.clear();
    const keys = Object.keys(localStorage).filter(k => k.startsWith('omdb_'));
    keys.forEach(k => localStorage.removeItem(k));
}

export default {
    searchMovies,
    getMovieById,
    getMovieByTitle,
    getMultipleMovies,
    createDebouncedSearch,
    clearAllCache
};

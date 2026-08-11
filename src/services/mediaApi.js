/**
 * Unified Media API Service for SUNFLIX
 * Orchestrates TMDB, OMDb, and collection fallback data seamlessly.
 */

import tmdbApi, { tmdbToSunflixFormat } from './tmdbApi';
import { getMovieById, getMultipleMovies, searchMovies } from './omdbApi';
import { omdbToSunflixFormat } from './omdbAdapter';
import allCollections from '../config/movieCollections';

export async function fetchCollection(collectionKeyOrArray) {
    // 1. Check if array of IDs or key in allCollections
    let ids = Array.isArray(collectionKeyOrArray) ? collectionKeyOrArray : (allCollections[collectionKeyOrArray] || []);

    // If string was passed but wasn't in allCollections, map special keys to TMDB calls
    if (typeof collectionKeyOrArray === 'string' && tmdbApi.isConfigured) {
        try {
            switch (collectionKeyOrArray) {
                case 'trendingMovies':
                case 'fetchTrending':
                    return await tmdbApi.getTrending('movie');
                case 'popularTvShows':
                case 'fetchNetflixOriginals':
                    return await tmdbApi.getPopularTv();
                case 'topRatedMovies':
                case 'fetchTopRated':
                    return await tmdbApi.getTopRatedMovies();
                case 'upcomingMovies':
                    return await tmdbApi.getUpcomingMovies();
                case 'actionMovies':
                case 'fetchActionMovies':
                    return await tmdbApi.getMoviesByGenre(28); // Action
                case 'comedyMovies':
                case 'fetchComedyMovies':
                    return await tmdbApi.getMoviesByGenre(35); // Comedy
                case 'horrorMovies':
                case 'fetchHorrorMovies':
                    return await tmdbApi.getMoviesByGenre(27); // Horror
                case 'romanceMovies':
                case 'fetchRomanceMovies':
                    return await tmdbApi.getMoviesByGenre(10749); // Romance
                case 'sciFiMovies':
                case 'fetchSciFi':
                    return await tmdbApi.getMoviesByGenre(878); // Sci-Fi
                case 'animationMovies':
                case 'fetchAnimeUniverse':
                case 'fetchAnimeMovies':
                    return await tmdbApi.getAnime();
                case 'heroMovies':
                case 'fetchFeaturedMovie':
                    return await tmdbApi.getTrending('all', 'day');
                default:
                    break;
            }
        } catch (err) {
            console.warn(`[mediaApi] TMDB error for ${collectionKeyOrArray}, falling back to OMDb`, err);
        }
    }

    // 2. Fallback to OMDb array fetch
    if (!ids || ids.length === 0) return [];
    try {
        const omdbResults = await getMultipleMovies(ids);
        return omdbResults.map(omdbToSunflixFormat).filter(Boolean);
    } catch (err) {
        console.error('[mediaApi] OMDb fetch error:', err);
        return [];
    }
}

export async function searchContent(query, type = '', page = 1) {
    if (!query || query.trim() === '') return { results: [], totalResults: 0 };

    if (tmdbApi.isConfigured) {
        try {
            const tmdbRes = await tmdbApi.search(query, page);
            if (tmdbRes.results && tmdbRes.results.length > 0) {
                return tmdbRes;
            }
        } catch (err) {
            console.warn('[mediaApi] TMDB search error, trying OMDb fallback', err);
        }
    }

    // OMDb Search Fallback
    try {
        const omdbRes = await searchMovies(query, type, '', page);
        const detailedList = await Promise.all(
            omdbRes.results.map(async (item) => {
                const detail = await getMovieById(item.imdbID);
                return omdbToSunflixFormat(detail || item);
            })
        );
        return {
            results: detailedList.filter(Boolean),
            totalResults: omdbRes.totalResults
        };
    } catch (err) {
        console.error('[mediaApi] OMDb search error:', err);
        return { results: [], totalResults: 0 };
    }
}

export async function enrichMovieDetails(movie) {
    if (!movie) return null;

    const mediaType = movie.media_type || (movie.first_air_date || movie.name ? 'tv' : 'movie');
    const id = movie.tmdbId || movie.id || movie.imdbID;

    if (tmdbApi.isConfigured && id && String(id).match(/^\d+$/)) {
        try {
            const fullDetails = await tmdbApi.getMediaDetails(id, mediaType);
            if (fullDetails) return fullDetails;
        } catch (err) {
            console.warn('[mediaApi] TMDB detail error:', err);
        }
    }

    const imdbId = movie.imdbID || movie.id;
    if (imdbId) {
        try {
            const omdbDetails = await getMovieById(imdbId);
            if (omdbDetails) return omdbToSunflixFormat(omdbDetails);
        } catch (err) {
            console.warn('[mediaApi] OMDb detail error:', err);
        }
    }

    return movie;
}

export default {
    fetchCollection,
    searchContent,
    enrichMovieDetails,
    tmdbApi
};

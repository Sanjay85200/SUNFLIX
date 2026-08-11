/**
 * Unified Media API Service for SUNFLIX
 * Orchestrates TMDB, OMDb, and fallback catalog data seamlessly.
 */

import tmdbApi, { tmdbToSunflixFormat } from './tmdbApi';
import { getMovieById, getMultipleMovies, searchMovies } from './omdbApi';
import { omdbToSunflixFormat } from './omdbAdapter';
import allCollections from '../config/movieCollections';
import { getFallbackCatalog, FALLBACK_MOVIES } from '../config/fallbackCatalog';

export async function fetchCollection(collectionKeyOrArray) {
    let ids = Array.isArray(collectionKeyOrArray) ? collectionKeyOrArray : (allCollections[collectionKeyOrArray] || []);
    const keyString = typeof collectionKeyOrArray === 'string' ? collectionKeyOrArray : null;

    // 1. Try TMDB if configured
    if (tmdbApi.isConfigured) {
        try {
            let tmdbResults = [];
            
            if (keyString) {
                switch (keyString) {
                    case 'trendingMovies':
                    case 'fetchTrending':
                        tmdbResults = await tmdbApi.getTrending('movie');
                        break;
                    case 'popularTvShows':
                    case 'fetchNetflixOriginals':
                        tmdbResults = await tmdbApi.getPopularTv();
                        break;
                    case 'topRatedMovies':
                    case 'fetchTopRated':
                        tmdbResults = await tmdbApi.getTopRatedMovies();
                        break;
                    case 'upcomingMovies':
                        tmdbResults = await tmdbApi.getUpcomingMovies();
                        break;
                    case 'actionMovies':
                    case 'fetchActionMovies':
                        tmdbResults = await tmdbApi.getMoviesByGenre(28); // Action
                        break;
                    case 'comedyMovies':
                    case 'fetchComedyMovies':
                        tmdbResults = await tmdbApi.getMoviesByGenre(35); // Comedy
                        break;
                    case 'horrorMovies':
                    case 'fetchHorrorMovies':
                        tmdbResults = await tmdbApi.getMoviesByGenre(27); // Horror
                        break;
                    case 'romanceMovies':
                    case 'fetchRomanceMovies':
                        tmdbResults = await tmdbApi.getMoviesByGenre(10749); // Romance
                        break;
                    case 'sciFiMovies':
                    case 'fetchSciFi':
                        tmdbResults = await tmdbApi.getMoviesByGenre(878); // Sci-Fi
                        break;
                    case 'animationMovies':
                    case 'fetchAnimeUniverse':
                    case 'fetchAnimeMovies':
                        tmdbResults = await tmdbApi.getAnime();
                        break;
                    case 'heroMovies':
                    case 'fetchFeaturedMovie':
                        tmdbResults = await tmdbApi.getTrending('all', 'day');
                        break;
                    default:
                        tmdbResults = await tmdbApi.getTrending('movie');
                        break;
                }
            } else if (Array.isArray(collectionKeyOrArray)) {
                // If passed an array of IMDb IDs from allCollections
                if (collectionKeyOrArray === allCollections.popularTvShows) {
                    tmdbResults = await tmdbApi.getPopularTv();
                } else if (collectionKeyOrArray === allCollections.topRatedMovies) {
                    tmdbResults = await tmdbApi.getTopRatedMovies();
                } else if (collectionKeyOrArray === allCollections.actionMovies) {
                    tmdbResults = await tmdbApi.getMoviesByGenre(28);
                } else if (collectionKeyOrArray === allCollections.sciFiMovies) {
                    tmdbResults = await tmdbApi.getMoviesByGenre(878);
                } else if (collectionKeyOrArray === allCollections.comedyMovies) {
                    tmdbResults = await tmdbApi.getMoviesByGenre(35);
                } else if (collectionKeyOrArray === allCollections.horrorMovies) {
                    tmdbResults = await tmdbApi.getMoviesByGenre(27);
                } else if (collectionKeyOrArray === allCollections.animationMovies) {
                    tmdbResults = await tmdbApi.getAnime();
                } else {
                    tmdbResults = await tmdbApi.getTrending('movie');
                }
            }

            if (tmdbResults && tmdbResults.length > 0) {
                return tmdbResults;
            }
        } catch (err) {
            console.warn(`[mediaApi] TMDB error for ${collectionKeyOrArray}, trying OMDb fallback`, err);
        }
    }

    // 2. Fallback to OMDb array fetch
    if (ids && ids.length > 0) {
        try {
            const omdbResults = await getMultipleMovies(ids);
            const formatted = omdbResults.map(omdbToSunflixFormat).filter(Boolean);
            if (formatted.length > 0) return formatted;
        } catch (err) {
            console.warn('[mediaApi] OMDb fetch error:', err);
        }
    }

    // 3. Guaranteed Fallback Catalog (Ensures UI never renders blank)
    return getFallbackCatalog(collectionKeyOrArray);
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
        if (omdbRes.results && omdbRes.results.length > 0) {
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
        }
    } catch (err) {
        console.warn('[mediaApi] OMDb search error:', err);
    }

    // Fallback search filter from catalog
    const filteredFallback = FALLBACK_MOVIES.filter(m =>
        m.title.toLowerCase().includes(query.toLowerCase()) ||
        m.genre.toLowerCase().includes(query.toLowerCase())
    );
    return {
        results: filteredFallback.length > 0 ? filteredFallback : FALLBACK_MOVIES.slice(0, 4),
        totalResults: filteredFallback.length > 0 ? filteredFallback.length : 4
    };
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

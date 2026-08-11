/**
 * Unified Media API Service for SUNFLIX
 * Orchestrates TMDB, OMDb, Internet Archive API, YouTube Data API, and fallback catalog data.
 */

import tmdbApi, { tmdbToSunflixFormat } from './tmdbApi';
import { getMovieById, getMultipleMovies, searchMovies } from './omdbApi';
import { omdbToSunflixFormat } from './omdbAdapter';
import internetArchiveApi from './internetArchiveApi';
import youtubeApi from './youtubeApi';
import allCollections from '../config/movieCollections';
import { getFallbackCatalog, FALLBACK_MOVIES } from '../config/fallbackCatalog';

export async function fetchCollection(collectionKeyOrArray) {
    let ids = Array.isArray(collectionKeyOrArray) ? collectionKeyOrArray : (allCollections[collectionKeyOrArray] || []);
    const keyString = typeof collectionKeyOrArray === 'string' ? collectionKeyOrArray : null;

    // Internet Archive Special Collections
    if (keyString === 'archiveMovies' || keyString === 'fetchArchiveMovies') {
        return await internetArchiveApi.getPopularMovies();
    }

    // YouTube Official Content Collections
    if (keyString === 'youtubeOfficial' || keyString === 'fetchYoutubeOfficial') {
        return await youtubeApi.getOfficialContent();
    }
    if (keyString === 'youtubeMovies' || keyString === 'fetchYoutubeMovies') {
        return await youtubeApi.getOfficialMovies();
    }
    if (keyString === 'youtubeSeries' || keyString === 'fetchYoutubeSeries') {
        return await youtubeApi.getOfficialSeries();
    }
    if (keyString === 'youtubeAnime' || keyString === 'fetchYoutubeAnime') {
        return await youtubeApi.getOfficialAnime();
    }
    if (keyString === 'youtubeDocumentaries' || keyString === 'fetchYoutubeDocumentaries') {
        return await youtubeApi.getOfficialDocumentaries();
    }

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

/**
 * Unified Multi-Source Search Across TMDB, OMDb, Internet Archive, and YouTube
 */
export async function searchContent(query, type = '', page = 1) {
    if (!query || query.trim() === '') return { results: [], totalResults: 0, sourcesCount: {} };

    // Execute queries across all legal content sources in parallel
    const [tmdbResult, archiveResult, youtubeResult] = await Promise.allSettled([
        // Source 1: TMDB / OMDb
        (async () => {
            if (tmdbApi.isConfigured) {
                try {
                    const tmdbRes = await tmdbApi.search(query, page);
                    if (tmdbRes.results && tmdbRes.results.length > 0) return tmdbRes.results;
                } catch { /* ignore */ }
            }
            try {
                const omdbRes = await searchMovies(query, type, '', page);
                if (omdbRes.results && omdbRes.results.length > 0) {
                    const detailedList = await Promise.all(
                        omdbRes.results.map(async (item) => {
                            const detail = await getMovieById(item.imdbID);
                            return omdbToSunflixFormat(detail || item);
                        })
                    );
                    return detailedList.filter(Boolean);
                }
            } catch { /* ignore */ }
            return [];
        })(),

        // Source 2: Internet Archive Public API
        internetArchiveApi.search(query, page).then(res => res.results || []).catch(() => []),

        // Source 3: Official YouTube Data API v3
        youtubeApi.search(query).then(res => res.results || []).catch(() => [])
    ]);

    const cinemaResults = tmdbResult.status === 'fulfilled' ? tmdbResult.value : [];
    const archiveResults = archiveResult.status === 'fulfilled' ? archiveResult.value : [];
    const youtubeResults = youtubeResult.status === 'fulfilled' ? youtubeResult.value : [];

    // Tag sources explicitly for Unified Content Model
    const taggedCinema = cinemaResults.map(item => ({ ...item, source: item.source || 'tmdb', playbackType: item.playbackType || 'direct_video' }));
    const taggedArchive = archiveResults.map(item => ({ ...item, source: 'internet_archive', playbackType: 'direct_video' }));
    const taggedYoutube = youtubeResults.map(item => ({ ...item, source: 'youtube', playbackType: 'youtube_embed' }));

    // Interleave search results smoothly
    const combined = [];
    const maxLength = Math.max(taggedCinema.length, taggedArchive.length, taggedYoutube.length);
    for (let i = 0; i < maxLength; i++) {
        if (taggedCinema[i]) combined.push(taggedCinema[i]);
        if (taggedYoutube[i]) combined.push(taggedYoutube[i]);
        if (taggedArchive[i]) combined.push(taggedArchive[i]);
    }

    // Fallback search filter if all remote APIs returned empty
    let finalResults = combined;
    if (finalResults.length === 0) {
        const filteredFallback = FALLBACK_MOVIES.filter(m =>
            m.title.toLowerCase().includes(query.toLowerCase()) ||
            m.genre.toLowerCase().includes(query.toLowerCase())
        );
        finalResults = filteredFallback.length > 0 ? filteredFallback : FALLBACK_MOVIES.slice(0, 6);
    }

    return {
        results: finalResults,
        totalResults: finalResults.length,
        sourcesCount: {
            cinema: taggedCinema.length,
            archive: taggedArchive.length,
            youtube: taggedYoutube.length
        }
    };
}

export async function enrichMovieDetails(movie) {
    if (!movie) return null;

    // Handle Internet Archive item metadata lookup
    if (movie.source === 'internet_archive' || movie.identifier || (movie.id && String(movie.id).startsWith('archive_'))) {
        const identifier = movie.identifier || movie.sourceId || String(movie.id).replace(/^archive_/, '');
        const archiveDetails = await internetArchiveApi.getMetadata(identifier);
        if (archiveDetails) return { ...movie, ...archiveDetails };
    }

    // Handle YouTube video items
    if (movie.source === 'youtube' || movie.youtubeId || (movie.id && String(movie.id).startsWith('yt_'))) {
        return {
            ...movie,
            playbackType: 'youtube_embed',
            youtubeId: movie.youtubeId || movie.sourceId || String(movie.id).replace(/^yt_/, '')
        };
    }

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
    tmdbApi,
    internetArchiveApi,
    youtubeApi
};

/**
 * SUNFLIX Primary Media API Service (Powered by OMDb)
 * Replaces TMDB integration with OMDb metadata while maintaining component compatibility.
 */

import { searchMovies, getMovieById, getMultipleMovies } from './omdbApi';
import { omdbToSunflixFormat, isTvShow as adapterIsTvShow, FALLBACK_POSTER } from './omdbAdapter';
import allCollections from '../config/movieCollections';

export const imageBaseUrl = ''; // OMDb returns full poster URLs

export const isTvShow = adapterIsTvShow;

/**
 * Fetch collection of movies by IMDb IDs array or collection key
 * @param {string[]|string} collection - Array of IMDb IDs or key in allCollections
 * @returns {Promise<Array>} Array of normalized movie objects
 */
export async function fetchCollection(collection) {
    const ids = Array.isArray(collection) ? collection : (allCollections[collection] || []);
    if (!ids || ids.length === 0) return [];
    
    const omdbResults = await getMultipleMovies(ids);
    return omdbResults.map(omdbToSunflixFormat).filter(Boolean);
}

/**
 * Helper to fetch a search query and return formatted SUNFLIX movies
 */
export async function searchContent(query, type = '', page = 1) {
    const data = await searchMovies(query, type, '', page);
    const detailedList = await Promise.all(
        data.results.map(async (item) => {
            const detail = await getMovieById(item.imdbID);
            return omdbToSunflixFormat(detail || item);
        })
    );
    return {
        results: detailedList,
        totalResults: data.totalResults
    };
}

/**
 * Enrich movie for detail modals (fetches full OMDb details if not already present)
 */
export async function enrichMovieForModal(movie) {
    if (!movie) return null;
    const imdbId = movie.imdbID || movie.id;
    if (!imdbId) return movie;

    // Fetch full plot and details from OMDb
    const fullDetails = await getMovieById(imdbId);
    if (!fullDetails) return omdbToSunflixFormat(movie);

    return omdbToSunflixFormat(fullDetails);
}

// Collection requests object mapped to collection keys for backward compatibility
export const requests = {
    fetchTrending: allCollections.trendingMovies,
    fetchNetflixOriginals: allCollections.popularTvShows,
    fetchTopRated: allCollections.topRatedMovies,
    fetchActionMovies: allCollections.actionMovies,
    fetchComedyMovies: allCollections.comedyMovies,
    fetchHorrorMovies: allCollections.horrorMovies,
    fetchRomanceMovies: allCollections.romanceMovies,
    fetchDocumentaries: allCollections.animationMovies,
    fetchSearch: (query) => query,
    fetchFeaturedMovie: allCollections.heroMovies,
    fetchAIPicks: allCollections.topRatedMovies,
    fetchAnimeUniverse: allCollections.animationMovies,
    fetchAnimeMovies: allCollections.animationMovies,
    fetchTelugu: allCollections.teluguMovies,
    fetchSciFi: allCollections.sciFiMovies,
    fetchThriller: allCollections.thrillerMovies,
    fetchGamingContent: allCollections.actionMovies,
};

export const languageRequests = {
    fetchEnglish: allCollections.englishMovies,
    fetchHindi: allCollections.hindiMovies,
    fetchTelugu: allCollections.teluguMovies,
    fetchTamil: allCollections.tamilMovies,
    fetchJapanese: allCollections.animationMovies,
    fetchKorean: allCollections.topRatedMovies,
    fetchSpanish: allCollections.romanceMovies,
};

export default requests;

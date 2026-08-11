/**
 * SUNFLIX Primary Media API Service
 * Integrates TMDB API v3 and OMDb API metadata seamlessly.
 */

import { fetchCollection as mediaFetchCollection, searchContent as mediaSearchContent, enrichMovieDetails } from './mediaApi';
import { isTvShow as adapterIsTvShow, FALLBACK_POSTER } from './omdbAdapter';
import allCollections from '../config/movieCollections';

export const imageBaseUrl = ''; // Poster & Backdrop URLs are pre-formatted
export const isTvShow = adapterIsTvShow;

export async function fetchCollection(collection) {
    return mediaFetchCollection(collection);
}

export async function searchContent(query, type = '', page = 1) {
    return mediaSearchContent(query, type, page);
}

export async function enrichMovieForModal(movie) {
    return enrichMovieDetails(movie);
}

export const requests = {
    fetchTrending: 'trendingMovies',
    fetchNetflixOriginals: 'popularTvShows',
    fetchTopRated: 'topRatedMovies',
    fetchActionMovies: 'actionMovies',
    fetchComedyMovies: 'comedyMovies',
    fetchHorrorMovies: 'horrorMovies',
    fetchRomanceMovies: 'romanceMovies',
    fetchDocumentaries: 'animationMovies',
    fetchSearch: (query) => query,
    fetchFeaturedMovie: 'heroMovies',
    fetchAIPicks: 'topRatedMovies',
    fetchAnimeUniverse: 'animationMovies',
    fetchAnimeMovies: 'animationMovies',
    fetchTelugu: allCollections.teluguMovies,
    fetchSciFi: 'sciFiMovies',
    fetchThriller: allCollections.thrillerMovies,
    fetchGamingContent: 'actionMovies',
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

import axios from 'axios';

const API_KEY = import.meta.env.VITE_TMDB_API_KEY || '8c4a151fe845b0a2a8be6231a03fed7f';
const BASE_URL = 'https://api.themoviedb.org/3';

export const requests = {
    fetchTrending: `${BASE_URL}/trending/all/week?api_key=${API_KEY}&language=en-US`,
    fetchNetflixOriginals: `${BASE_URL}/discover/tv?api_key=${API_KEY}&with_networks=213`,
    fetchTopRated: `${BASE_URL}/movie/top_rated?api_key=${API_KEY}&language=en-US`,
    fetchActionMovies: `${BASE_URL}/discover/movie?api_key=${API_KEY}&with_genres=28`,
    fetchComedyMovies: `${BASE_URL}/discover/movie?api_key=${API_KEY}&with_genres=35`,
    fetchHorrorMovies: `${BASE_URL}/discover/movie?api_key=${API_KEY}&with_genres=27`,
    fetchRomanceMovies: `${BASE_URL}/discover/movie?api_key=${API_KEY}&with_genres=10749`,
    fetchDocumentaries: `${BASE_URL}/discover/movie?api_key=${API_KEY}&with_genres=99`,
    fetchSearch: (query) =>
        `${BASE_URL}/search/movie?api_key=${API_KEY}&query=${encodeURIComponent(query)}`,
    fetchFeaturedMovie: `${BASE_URL}/trending/all/week?api_key=${API_KEY}&language=en-US`,
    fetchAIPicks: `${BASE_URL}/discover/movie?api_key=${API_KEY}&language=en-US&sort_by=vote_average.desc&vote_count.gte=800&vote_average.gte=7.5&include_adult=false`,
    fetchAnimeUniverse: `${BASE_URL}/discover/tv?api_key=${API_KEY}&language=en-US&with_genres=16&with_original_language=ja&sort_by=popularity.desc`,
    fetchAnimeMovies: `${BASE_URL}/discover/movie?api_key=${API_KEY}&language=en-US&with_genres=16&with_original_language=ja&sort_by=popularity.desc`,
    fetchTelugu: `${BASE_URL}/discover/movie?api_key=${API_KEY}&language=en-US&with_original_language=te&sort_by=popularity.desc`,
    fetchSciFi: `${BASE_URL}/discover/movie?api_key=${API_KEY}&language=en-US&with_genres=878&sort_by=popularity.desc`,
    fetchThriller: `${BASE_URL}/discover/movie?api_key=${API_KEY}&language=en-US&with_genres=53&sort_by=popularity.desc`,
    fetchGamingContent: `${BASE_URL}/discover/movie?api_key=${API_KEY}&language=en-US&with_keywords=239722&sort_by=popularity.desc`,
};

export const imageBaseUrl = 'https://image.tmdb.org/t/p/original/';

/** TMDB trending “all” includes media_type; discover rows infer from shape */
export function isTvShow(movie) {
    if (!movie) return false;
    if (movie.media_type === 'tv') return true;
    if (movie.media_type === 'movie') return false;
    return Boolean(movie.name && !movie.title);
}

export async function fetchTrailerYoutubeKey(movie) {
    const id = movie?.id;
    if (!id) return null;
    const tv = isTvShow(movie);
    const endpoint = tv ? `${BASE_URL}/tv/${id}/videos` : `${BASE_URL}/movie/${id}/videos`;
    const { data } = await axios.get(`${endpoint}?api_key=${API_KEY}`);
    const results = data.results || [];
    const clip =
        results.find((r) => r.site === 'YouTube' && (r.type === 'Trailer' || r.type === 'Teaser')) ||
        results.find((r) => r.site === 'YouTube');
    return clip?.key || null;
}

/** Merge trailer key + display title for modals */
export async function enrichMovieForModal(movie) {
    if (!movie) return null;
    let videoId = null;
    try {
        videoId = await fetchTrailerYoutubeKey(movie);
    } catch (e) {
        console.warn('TMDB videos lookup failed:', e?.message || e);
    }
    return {
        ...movie,
        videoId,
        title: movie.title || movie.name,
    };
}

export default requests;

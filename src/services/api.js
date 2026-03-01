import axios from 'axios';

const OMDB_API_KEY = "99fa872f";
const OMDB_BASE_URL = "https://www.omdbapi.com/";

export const requests = {
    // OMDB Search Endpoints (Simulating Netflix categories)
    fetchTrending: `${OMDB_BASE_URL}?s=Popular&type=movie&apikey=${OMDB_API_KEY}`,
    fetchNetflixOriginals: `${OMDB_BASE_URL}?s=Netflix&apikey=${OMDB_API_KEY}`,
    fetchTopRated: `${OMDB_BASE_URL}?s=Best&type=movie&apikey=${OMDB_API_KEY}`,
    fetchActionMovies: `${OMDB_BASE_URL}?s=Action&type=movie&apikey=${OMDB_API_KEY}`,
    fetchComedyMovies: `${OMDB_BASE_URL}?s=Comedy&type=movie&apikey=${OMDB_API_KEY}`,
    fetchHorrorMovies: `${OMDB_BASE_URL}?s=Horror&type=movie&apikey=${OMDB_API_KEY}`,
    fetchRomanceMovies: `${OMDB_BASE_URL}?s=Romance&type=movie&apikey=${OMDB_API_KEY}`,
    fetchDocumentaries: `${OMDB_BASE_URL}?s=Documentary&type=movie&apikey=${OMDB_API_KEY}`,

    // OMDB Specific Movie Endpoint
    fetchFeaturedMovie: `${OMDB_BASE_URL}?i=tt3896198&apikey=${OMDB_API_KEY}`,
    fetchSunflixMovies: `/api/movies`
};

// Placeholder as imageBaseUrl is no longer needed for OMDB (OMDB provides full URLs)
export const imageBaseUrl = "";

export default requests;

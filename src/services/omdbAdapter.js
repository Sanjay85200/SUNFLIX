/**
 * Adapter to transform OMDb API responses into SUNFLIX component format.
 * Ensures backward compatibility with existing components expecting TMDB-like properties.
 */

import { normalizeReleaseDate } from '../utils/dateUtils';

// Fallback high quality poster when poster is missing or "N/A"
export const FALLBACK_POSTER = 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=1000&auto=format&fit=crop';

/**
 * Transform an OMDb item (from search or detail) to SUNFLIX movie format
 * @param {Object} item - OMDb raw item
 * @returns {Object} SUNFLIX normalized movie object
 */
export function omdbToSunflixFormat(item) {
    if (!item) return null;

    const poster = (item.Poster && item.Poster !== 'N/A') ? item.Poster : FALLBACK_POSTER;
    const isTv = item.Type === 'series' || item.Type === 'episode';
    const ratingNum = parseFloat(item.imdbRating) || 0;

    return {
        id: item.imdbID || item.id,
        imdbID: item.imdbID || item.id,
        title: item.Title || item.title || 'Untitled',
        name: item.Title || item.name || 'Untitled',
        poster_path: poster,
        backdrop_path: poster, // OMDb doesn't supply backdrop images; poster is used with CSS gradient effects
        vote_average: ratingNum,
        imdbRating: item.imdbRating || 'N/A',
        release_date: normalizeReleaseDate(item.Released || item.Year || item.release_date) || '',
        first_air_date: normalizeReleaseDate(item.Released || item.Year || item.first_air_date) || '',
        overview: item.Plot && item.Plot !== 'N/A' ? item.Plot : (item.overview || 'No plot description available.'),
        media_type: isTv ? 'tv' : 'movie',
        type: item.Type || (isTv ? 'series' : 'movie'),

        // Detailed fields
        rated: item.Rated !== 'N/A' ? item.Rated : 'NR',
        runtime: item.Runtime !== 'N/A' ? item.Runtime : '',
        genre: item.Genre !== 'N/A' ? item.Genre : '',
        director: item.Director !== 'N/A' ? item.Director : '',
        writer: item.Writer !== 'N/A' ? item.Writer : '',
        actors: item.Actors !== 'N/A' ? item.Actors : '',
        language: item.Language !== 'N/A' ? item.Language : '',
        country: item.Country !== 'N/A' ? item.Country : '',
        awards: item.Awards !== 'N/A' ? item.Awards : '',
        metascore: item.Metascore !== 'N/A' ? item.Metascore : '',
        imdbVotes: item.imdbVotes !== 'N/A' ? item.imdbVotes : '',
        boxOffice: item.BoxOffice !== 'N/A' ? item.BoxOffice : '',
        production: item.Production !== 'N/A' ? item.Production : '',

        // Flag to identify OMDb format
        _isOmdb: true
    };
}

export function isTvShow(movie) {
    if (!movie) return false;
    if (movie.media_type === 'tv' || movie.type === 'series') return true;
    return Boolean(movie.name && !movie.title);
}

export default {
    omdbToSunflixFormat,
    isTvShow,
    FALLBACK_POSTER
};

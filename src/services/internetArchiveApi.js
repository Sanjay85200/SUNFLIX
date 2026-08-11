/**
 * Internet Archive Public API Service for SUNFLIX
 * Fetches public domain movies, animation, and video streams.
 * No API key required.
 */

import { normalizeReleaseDate } from '../utils/dateUtils';

const ARCHIVE_SEARCH_BASE = 'https://archive.org/advancedsearch.php';
const ARCHIVE_METADATA_BASE = 'https://archive.org/metadata';

const CACHE_TTL = 12 * 60 * 60 * 1000; // 12 hours
const FETCH_TIMEOUT_MS = 5000; // 5s timeout
const memoryCache = new Map();

function getFromCache(key) {
    try {
        const cached = localStorage.getItem(`archive_${key}`);
        if (!cached) return null;
        const { data, timestamp } = JSON.parse(cached);
        if (Date.now() - timestamp > CACHE_TTL) {
            localStorage.removeItem(`archive_${key}`);
            return null;
        }
        return data;
    } catch {
        return null;
    }
}

function saveToCache(key, data) {
    try {
        localStorage.setItem(`archive_${key}`, JSON.stringify({
            data,
            timestamp: Date.now()
        }));
    } catch { /* storage full fallback */ }
}

export function archiveToSunflixFormat(item, mp4FileName = null) {
    if (!item || !item.identifier) return null;

    const identifier = item.identifier;
    const title = item.title || identifier;
    const poster = `https://archive.org/services/img/${identifier}`;
    const videoUrl = mp4FileName
        ? `https://archive.org/download/${identifier}/${encodeURIComponent(mp4FileName)}`
        : null;

    const description = typeof item.description === 'string'
        ? item.description.replace(/<[^>]*>?/gm, '').trim()
        : 'Public domain media from the Internet Archive.';

    const yearStr = item.year ? String(item.year) : (item.publicdate ? String(item.publicdate).slice(0, 4) : 'Classic');
    const releaseDateStr = normalizeReleaseDate(item.publicdate || item.year || yearStr);

    return {
        id: `archive_${identifier}`,
        imdbID: `archive_${identifier}`,
        identifier: identifier,
        title: title,
        name: title,
        description: description,
        overview: description,
        poster_path: poster,
        backdrop_path: poster,
        vote_average: 8.5,
        imdbRating: '8.5',
        year: yearStr,
        release_date: releaseDateStr,
        media_type: 'movie',
        type: 'movie',
        source: 'internet_archive',
        sourceId: identifier,
        playbackType: 'direct_video',
        videoUrl: videoUrl,
        license: 'Public Domain / Creative Commons',
        _isArchive: true
    };
}

export const internetArchiveApi = {
    /**
     * Search Internet Archive for movies and videos
     */
    search: async (query, page = 1) => {
        if (!query || !query.trim()) return { results: [], totalResults: 0 };

        const cacheKey = `search_${query}_${page}`;
        if (memoryCache.has(cacheKey)) return memoryCache.get(cacheKey);

        const cached = getFromCache(cacheKey);
        if (cached) return cached;

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

        try {
            const params = new URLSearchParams();
            params.append('q', `(mediatype:(movies OR etree OR animation)) AND (${query.trim()})`);
            params.append('fl[]', 'identifier,title,description,year,mediatype,publicdate,downloads');
            params.append('sort[]', 'downloads desc');
            params.append('rows', '20');
            params.append('page', String(page));
            params.append('output', 'json');

            const res = await fetch(`${ARCHIVE_SEARCH_BASE}?${params.toString()}`, { signal: controller.signal });
            clearTimeout(timeoutId);

            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const data = await res.json();
            const docs = data.response?.docs || [];

            const formatted = docs.map(doc => archiveToSunflixFormat(doc)).filter(Boolean);
            const result = {
                results: formatted,
                totalResults: data.response?.numFound || formatted.length
            };

            memoryCache.set(cacheKey, result);
            saveToCache(cacheKey, result);
            return result;
        } catch (err) {
            clearTimeout(timeoutId);
            console.warn('[InternetArchive] Search error:', err?.message || err);
            return { results: [], totalResults: 0 };
        }
    },

    /**
     * Fetch complete metadata and select compatible MP4 video file
     */
    getMetadata: async (identifier) => {
        if (!identifier) return null;
        const cleanId = identifier.replace(/^archive_/, '');

        const cacheKey = `meta_${cleanId}`;
        if (memoryCache.has(cacheKey)) return memoryCache.get(cacheKey);

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

        try {
            const res = await fetch(`${ARCHIVE_METADATA_BASE}/${cleanId}`, { signal: controller.signal });
            clearTimeout(timeoutId);

            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const data = await res.json();

            const files = data.files || [];
            // Find browser-compatible MP4 file
            const mp4File = files.find(f =>
                f.name &&
                f.name.endsWith('.mp4') &&
                !f.name.includes('_thumb') &&
                (f.format?.includes('MPEG4') || f.format?.includes('h.264') || f.format?.includes('512Kb') || f.size > 1000000)
            ) || files.find(f => f.name && f.name.endsWith('.mp4'));

            const formatted = archiveToSunflixFormat(
                { ...data.metadata, identifier: cleanId },
                mp4File?.name || null
            );

            if (formatted) {
                memoryCache.set(cacheKey, formatted);
                saveToCache(cacheKey, formatted);
            }
            return formatted;
        } catch (err) {
            clearTimeout(timeoutId);
            console.warn('[InternetArchive] Metadata error:', err?.message || err);
            return null;
        }
    },

    /**
     * Fetch curated popular public domain feature films
     */
    getPopularMovies: async () => {
        const result = await internetArchiveApi.search('feature_films AND (night of the living dead OR charlie chaplin OR metropolis OR sherlock holmes)');
        if (result.results && result.results.length > 0) return result.results;

        // Fallback static items if network search yields empty
        return [
            {
                id: 'archive_night_of_the_living_dead',
                imdbID: 'archive_night_of_the_living_dead',
                identifier: 'night_of_the_living_dead',
                title: 'Night of the Living Dead (1968)',
                name: 'Night of the Living Dead (1968)',
                description: 'A ragtag group of Pennsylvanians barricade themselves in an old farmhouse to remain safe from a horde of flesh-eating ghouls.',
                overview: 'A ragtag group of Pennsylvanians barricade themselves in an old farmhouse to remain safe from a horde of flesh-eating ghouls.',
                poster_path: 'https://archive.org/services/img/night_of_the_living_dead',
                backdrop_path: 'https://archive.org/services/img/night_of_the_living_dead',
                vote_average: 8.8,
                imdbRating: '8.8',
                year: '1968',
                release_date: '1968',
                media_type: 'movie',
                type: 'movie',
                source: 'internet_archive',
                sourceId: 'night_of_the_living_dead',
                playbackType: 'direct_video',
                videoUrl: 'https://archive.org/download/night_of_the_living_dead/night_of_the_living_dead.mp4',
                license: 'Public Domain',
                _isArchive: true
            },
            {
                id: 'archive_the_general_1926',
                imdbID: 'archive_the_general_1926',
                identifier: 'the_general_1926',
                title: 'Buster Keaton: The General (1926)',
                name: 'Buster Keaton: The General (1926)',
                description: 'When Union spies steal an engineer\'s beloved locomotive, he pursues it single-handedly through enemy lines.',
                overview: 'When Union spies steal an engineer\'s beloved locomotive, he pursues it single-handedly through enemy lines.',
                poster_path: 'https://archive.org/services/img/the_general_1926',
                backdrop_path: 'https://archive.org/services/img/the_general_1926',
                vote_average: 8.9,
                imdbRating: '8.9',
                year: '1926',
                release_date: '1926',
                media_type: 'movie',
                type: 'movie',
                source: 'internet_archive',
                sourceId: 'the_general_1926',
                playbackType: 'direct_video',
                videoUrl: 'https://archive.org/download/the_general_1926/the_general_1926_512kb.mp4',
                license: 'Public Domain',
                _isArchive: true
            }
        ];
    }
};

export default internetArchiveApi;

/**
 * Official YouTube Data API v3 Service for SUNFLIX
 * Handles authorized video searching, duration retrieval, error handling, and YouTube embed format mapping.
 * Accesses API key securely via import.meta.env.VITE_YOUTUBE_API_KEY.
 */

const YOUTUBE_SEARCH_BASE = 'https://www.googleapis.com/youtube/v3/search';
const YOUTUBE_VIDEOS_BASE = 'https://www.googleapis.com/youtube/v3/videos';

const CACHE_TTL = 6 * 60 * 60 * 1000; // 6 hours
const FETCH_TIMEOUT_MS = 4000; // 4s timeout
const memoryCache = new Map();

function getApiKey() {
    return import.meta.env.VITE_YOUTUBE_API_KEY?.trim() || '';
}

function isApiKeyValid() {
    const key = getApiKey();
    return Boolean(
        key &&
        key !== 'YOUR_YOUTUBE_API_KEY_HERE' &&
        key !== 'PASTE_MY_NEW_YOUTUBE_API_KEY_HERE' &&
        key.length > 10
    );
}

/**
 * Mask API key for safe logging (e.g. AIza...AlEU)
 */
function maskApiKey(key) {
    if (!key || key.length < 8) return '****';
    return `${key.slice(0, 4)}...${key.slice(-4)}`;
}

function getFromCache(key) {
    try {
        const cached = localStorage.getItem(`yt_${key}`);
        if (!cached) return null;
        const { data, timestamp } = JSON.parse(cached);
        if (Date.now() - timestamp > CACHE_TTL) {
            localStorage.removeItem(`yt_${key}`);
            return null;
        }
        return data;
    } catch {
        return null;
    }
}

function saveToCache(key, data) {
    try {
        localStorage.setItem(`yt_${key}`, JSON.stringify({
            data,
            timestamp: Date.now()
        }));
    } catch { /* storage full fallback */ }
}

/**
 * Format ISO 8601 duration string (PT1H30M15S -> 1h 30m)
 */
function parseIsoDuration(durationStr) {
    if (!durationStr) return '';
    const match = durationStr.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
    if (!match) return '';
    const hours = match[1] ? `${match[1]}h ` : '';
    const mins = match[2] ? `${match[2]}m` : '';
    return (hours + mins).trim() || 'Clip';
}

/**
 * Convert YouTube snippet to Unified SUNFLIX Content Model
 */
export function youtubeToSunflixFormat(item, duration = '') {
    if (!item || !item.id?.videoId) return null;

    const videoId = item.id.videoId;
    const snippet = item.snippet || {};
    const title = snippet.title ? snippet.title.replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&amp;/g, '&') : 'Untitled Video';
    const thumbnail = snippet.thumbnails?.high?.url || snippet.thumbnails?.medium?.url || snippet.thumbnails?.default?.url;
    const publishedYear = snippet.publishedAt ? String(snippet.publishedAt).slice(0, 4) : '2024';

    return {
        id: `yt_${videoId}`,
        imdbID: `yt_${videoId}`,
        youtubeId: videoId,
        title: title,
        name: title,
        description: snippet.description || `Official video upload by ${snippet.channelTitle || 'YouTube Channel'}.`,
        overview: snippet.description || `Official video upload by ${snippet.channelTitle || 'YouTube Channel'}.`,
        poster_path: thumbnail,
        backdrop_path: thumbnail,
        vote_average: 8.6,
        imdbRating: '8.6',
        year: publishedYear,
        release_date: publishedYear,
        runtime: duration || '',
        media_type: 'movie',
        type: 'movie',
        source: 'youtube',
        sourceId: videoId,
        playbackType: 'youtube_embed',
        channelTitle: snippet.channelTitle || 'Official Channel',
        _isYoutube: true
    };
}

export const youtubeApi = {
    get isConfigured() {
        return isApiKeyValid();
    },

    /**
     * Search official YouTube embeddable & syndicated videos
     */
    search: async (query, pageToken = '') => {
        if (!query || !query.trim()) return { results: [], totalResults: 0, nextPageToken: null, error: null };
        
        const apiKey = getApiKey();
        if (!isApiKeyValid()) {
            console.warn('[YouTube API] VITE_YOUTUBE_API_KEY is not configured or using default placeholder.');
            return { results: [], totalResults: 0, nextPageToken: null, error: 'API Key not configured' };
        }

        const cacheKey = `search_${query}_${pageToken}`;
        if (memoryCache.has(cacheKey)) return memoryCache.get(cacheKey);

        const cached = getFromCache(cacheKey);
        if (cached) return cached;

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

        try {
            const params = new URLSearchParams({
                key: apiKey,
                part: 'snippet',
                type: 'video',
                q: query.trim(),
                videoEmbeddable: 'true',
                videoSyndicated: 'true',
                maxResults: '15'
            });

            if (pageToken) params.append('pageToken', pageToken);

            const res = await fetch(`${YOUTUBE_SEARCH_BASE}?${params.toString()}`, { signal: controller.signal });
            clearTimeout(timeoutId);

            if (!res.ok) {
                const errData = await res.json().catch(() => ({}));
                const reason = errData.error?.errors?.[0]?.reason || errData.error?.message || res.statusText;
                
                let userFriendlyError = 'YouTube search error';
                if (res.status === 403) {
                    if (reason.includes('quota')) {
                        userFriendlyError = 'YouTube API daily quota exceeded.';
                    } else if (reason.includes('key') || reason.includes('API key')) {
                        userFriendlyError = 'Invalid YouTube API key.';
                    } else {
                        userFriendlyError = 'YouTube API access forbidden or restricted.';
                    }
                } else if (res.status === 400) {
                    userFriendlyError = 'Invalid YouTube request format.';
                }

                console.warn(`[YouTube API] HTTP ${res.status} (${maskApiKey(apiKey)}): ${userFriendlyError}`);
                return { results: [], totalResults: 0, nextPageToken: null, error: userFriendlyError };
            }

            const data = await res.json();
            const items = data.items || [];
            const videoIds = items.map(i => i.id?.videoId).filter(Boolean).join(',');

            let durationMap = {};
            if (videoIds) {
                durationMap = await youtubeApi.getVideoDurations(videoIds);
            }

            const formatted = items
                .map(item => youtubeToSunflixFormat(item, durationMap[item.id?.videoId] || ''))
                .filter(Boolean);

            const result = {
                results: formatted,
                totalResults: data.pageInfo?.totalResults || formatted.length,
                nextPageToken: data.nextPageToken || null,
                error: null
            };

            memoryCache.set(cacheKey, result);
            saveToCache(cacheKey, result);
            return result;
        } catch (err) {
            clearTimeout(timeoutId);
            const errMsg = err?.name === 'AbortError' ? 'YouTube request timed out.' : 'Network connection error.';
            console.warn('[YouTube API] Fetch error:', errMsg);
            return { results: [], totalResults: 0, nextPageToken: null, error: errMsg };
        }
    },

    /**
     * Retrieve contentDetails (duration) for YouTube videos
     */
    getVideoDurations: async (videoIds) => {
        const apiKey = getApiKey();
        if (!videoIds || !isApiKeyValid()) return {};
        try {
            const params = new URLSearchParams({
                key: apiKey,
                part: 'contentDetails',
                id: videoIds
            });
            const res = await fetch(`${YOUTUBE_VIDEOS_BASE}?${params.toString()}`);
            if (!res.ok) return {};
            const data = await res.json();
            const map = {};
            (data.items || []).forEach(item => {
                map[item.id] = parseIsoDuration(item.contentDetails?.duration);
            });
            return map;
        } catch {
            return {};
        }
    },

    /**
     * Fetch curated official YouTube movie/anime clips
     */
    getOfficialContent: async (topic = 'Official Anime Trailer HD') => {
        const res = await youtubeApi.search(topic);
        if (res.results && res.results.length > 0) return res.results;

        // Static fallback YouTube video entries
        return [
            {
                id: 'yt_cqGjhVJWtEg',
                imdbID: 'yt_cqGjhVJWtEg',
                youtubeId: 'cqGjhVJWtEg',
                title: 'SPIDER-MAN: ACROSS THE SPIDER-VERSE - Official Trailer',
                name: 'SPIDER-MAN: ACROSS THE SPIDER-VERSE - Official Trailer',
                description: 'Official Trailer for Spider-Man: Across the Spider-Verse.',
                overview: 'Official Trailer for Spider-Man: Across the Spider-Verse.',
                poster_path: 'https://images.unsplash.com/photo-1635805737707-575885ab0820?q=80&w=800&auto=format&fit=crop',
                backdrop_path: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?q=80&w=1200&auto=format&fit=crop',
                vote_average: 8.9,
                imdbRating: '8.9',
                year: '2023',
                release_date: '2023',
                runtime: '2m 30s',
                media_type: 'movie',
                type: 'movie',
                source: 'youtube',
                sourceId: 'cqGjhVJWtEg',
                playbackType: 'youtube_embed',
                channelTitle: 'Sony Pictures Entertainment',
                _isYoutube: true
            },
            {
                id: 'yt_Way9Dexny3w',
                imdbID: 'yt_Way9Dexny3w',
                youtubeId: 'Way9Dexny3w',
                title: 'DUNE: PART TWO - Official Movie Trailer',
                name: 'DUNE: PART TWO - Official Movie Trailer',
                description: 'Official Trailer for Dune: Part Two.',
                overview: 'Official Trailer for Dune: Part Two.',
                poster_path: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=800&auto=format&fit=crop',
                backdrop_path: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?q=80&w=1200&auto=format&fit=crop',
                vote_average: 8.8,
                imdbRating: '8.8',
                year: '2024',
                release_date: '2024',
                runtime: '3m 02s',
                media_type: 'movie',
                type: 'movie',
                source: 'youtube',
                sourceId: 'Way9Dexny3w',
                playbackType: 'youtube_embed',
                channelTitle: 'Warner Bros. Pictures',
                _isYoutube: true
            }
        ];
    }
};

export default youtubeApi;

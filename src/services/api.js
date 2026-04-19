import axios from 'axios';

const YOUTUBE_API_KEY = import.meta.env.VITE_YOUTUBE_API_KEY || "AIzaSyBWhXJ9G-gz_8sIjnpsOXDLA1j5K4nAlEU";
const YOUTUBE_BASE_URL = "https://www.googleapis.com/youtube/v3/search";

// Base parameters to find full movies
const baseParams = `&part=snippet&type=video&videoDuration=long&maxResults=15&key=${YOUTUBE_API_KEY}`;

export const requests = {
    // English Genres
    fetchEnglishAction: `${YOUTUBE_BASE_URL}?q=free+full+movie+english+action+official+channel+hd${baseParams}`,
    fetchEnglishComedy: `${YOUTUBE_BASE_URL}?q=free+full+movie+english+comedy+official+channel+hd${baseParams}`,
    fetchEnglishRomance: `${YOUTUBE_BASE_URL}?q=free+full+movie+english+romance+official+channel+hd${baseParams}`,
    
    // Hindi Genres
    fetchHindiAction: `${YOUTUBE_BASE_URL}?q=hindi+action+full+movie+official+channel+hd${baseParams}`,
    fetchHindiComedy: `${YOUTUBE_BASE_URL}?q=hindi+comedy+full+movie+official+channel+hd${baseParams}`,
    fetchHindiRomance: `${YOUTUBE_BASE_URL}?q=hindi+romance+full+movie+official+channel+hd${baseParams}`,
    
    // Telugu
    fetchTeluguMovies: `${YOUTUBE_BASE_URL}?q=telugu+full+movie+official+channel+hd${baseParams}`,
    fetchTeluguAction: `${YOUTUBE_BASE_URL}?q=telugu+action+full+movie+official+channel+hd${baseParams}`,
    
    // Documentaries
    fetchDocumentaries: `${YOUTUBE_BASE_URL}?q=free+full+documentary+movie+hd${baseParams}`,

    // Banner featured (Trending / Netflix-like)
    fetchFeaturedMovie: `${YOUTUBE_BASE_URL}?q=official+full+movie+trailer+hd${baseParams}`,

    // Search
    fetchSearch: (query) => `${YOUTUBE_BASE_URL}?q=${encodeURIComponent(query + " free full movie")}${baseParams}`,
};

export const imageBaseUrl = ""; // No longer needed
export default requests;

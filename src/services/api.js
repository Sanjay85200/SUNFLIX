import axios from 'axios';

const YOUTUBE_API_KEY = "AIzaSyBWhXJ9G-gz_8sIjnpsOXDLA1j5K4nAlEU";
const YOUTUBE_BASE_URL = "https://www.googleapis.com/youtube/v3/search";

// Base parameters to find full movies
const baseParams = `&part=snippet&type=video&videoDuration=long&maxResults=15&key=${YOUTUBE_API_KEY}`;

export const requests = {
    // English Genres
    fetchEnglishAction: `${YOUTUBE_BASE_URL}?q=free+full+movie+english+action${baseParams}`,
    fetchEnglishComedy: `${YOUTUBE_BASE_URL}?q=free+full+movie+english+comedy${baseParams}`,
    fetchEnglishRomance: `${YOUTUBE_BASE_URL}?q=free+full+movie+english+romance${baseParams}`,
    
    // Hindi Genres
    fetchHindiAction: `${YOUTUBE_BASE_URL}?q=hindi+action+full+movie${baseParams}`,
    fetchHindiComedy: `${YOUTUBE_BASE_URL}?q=hindi+comedy+full+movie${baseParams}`,
    fetchHindiRomance: `${YOUTUBE_BASE_URL}?q=hindi+romance+full+movie${baseParams}`,
    
    // Telugu
    fetchTeluguMovies: `${YOUTUBE_BASE_URL}?q=telugu+full+movie${baseParams}`,
    fetchTeluguAction: `${YOUTUBE_BASE_URL}?q=telugu+action+full+movie${baseParams}`,
    
    // Documentaries
    fetchDocumentaries: `${YOUTUBE_BASE_URL}?q=free+full+documentary+movie${baseParams}`,

    // Banner featured (Trending / Netflix-like)
    fetchFeaturedMovie: `${YOUTUBE_BASE_URL}?q=netflix+official+free+full+movie${baseParams}`,
};

export const imageBaseUrl = ""; // No longer needed
export default requests;

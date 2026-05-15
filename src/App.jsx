import React, { useState, useEffect, useMemo } from 'react';
/**
 * SUNFLIX — Vite + React shell: cyberpunk UI, TMDB rails, Supabase-ready data.
 */
import axios from 'axios';
import {
    BrowserRouter as Router,
    Routes,
    Route,
    Navigate,
    Outlet,
    useLocation,
    useOutletContext,
} from 'react-router-dom';
import './App.css';
import Navbar from './components/Navbar';
import Banner from './components/Banner';
import Row from './components/Row';
import requests, { languageRequests } from './services/api';
import Login from './pages/Login';
import Signup from './pages/Signup';
import AnimeUniverse from './pages/AnimeUniverse';
import Profile from './pages/Profile';
import Rewards from './pages/Rewards';
import WatchParty from './pages/WatchParty';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SunflixDataProvider } from './context/SunflixDataContext';
import AIAssistant from './components/AIAssistant';
import SunflixDrop from './components/SunflixDrop';
import VideoModal from './components/VideoModal';
import VortexCarousel from './components/VortexCarousel';
import ParticleBackground from './components/ParticleBackground';
import CategoryPills from './components/CategoryPills';
import CommunityFeedStrip from './components/CommunityFeedStrip';

const ProtectedRoute = ({ children }) => {
    const { user, loading } = useAuth();
    if (loading) {
        return (
            <div
                className="min-h-screen bg-black flex items-center justify-center text-cyan-300/80 tracking-[0.35em] text-xs uppercase"
                style={{ fontFamily: 'Orbitron, sans-serif' }}
            >
                Syncing
            </div>
        );
    }
    // Auth check removed to allow public access
    return children;
};

const categories = [
    { id: 28, name: 'Action', fetchUrl: requests.fetchActionMovies },
    { id: 35, name: 'Comedy', fetchUrl: requests.fetchComedyMovies },
    { id: 27, name: 'Horror', fetchUrl: requests.fetchHorrorMovies },
    { id: 10749, name: 'Romance', fetchUrl: requests.fetchRomanceMovies },
];

const languages = [
    { id: 'en', name: 'English', fetchUrl: languageRequests.fetchEnglish },
    { id: 'hi', name: 'Hindi', fetchUrl: languageRequests.fetchHindi },
    { id: 'te', name: 'Telugu', fetchUrl: languageRequests.fetchTelugu },
    { id: 'ta', name: 'Tamil', fetchUrl: languageRequests.fetchTamil },
    { id: 'ja', name: 'Japanese', fetchUrl: languageRequests.fetchJapanese },
    { id: 'ko', name: 'Korean', fetchUrl: languageRequests.fetchKorean },
    { id: 'es', name: 'Spanish', fetchUrl: languageRequests.fetchSpanish },
];

function HomePage() {
    const { onMovieSelect } = useOutletContext();
    const [activeCategory, setActiveCategory] = useState(categories[0]);
    const [activeLanguage, setActiveLanguage] = useState(languages[0]);

    return (
        <>
            <Banner onPlayMovie={onMovieSelect} />
            <VortexCarousel title="SUNFLIX ORIGINALS" fetchUrl={requests.fetchNetflixOriginals} onMovieSelect={onMovieSelect} />
            <CommunityFeedStrip />

            <Row title="Trending Now" fetchUrl={requests.fetchTrending} onMovieSelect={onMovieSelect} accent="neon" />
            <Row title="SUN AI Curated Picks" fetchUrl={requests.fetchAIPicks} onMovieSelect={onMovieSelect} isLargeRow accent="neon" />
            <Row title="Anime Universe" fetchUrl={requests.fetchAnimeUniverse} onMovieSelect={onMovieSelect} isLargeRow accent="neon" />
            <Row title="Telugu Spotlight" fetchUrl={requests.fetchTelugu} onMovieSelect={onMovieSelect} accent="neon" />
            <Row title="Sci‑Fi Frontier" fetchUrl={requests.fetchSciFi} onMovieSelect={onMovieSelect} accent="neon" />
            <Row title="Horror After Dark" fetchUrl={requests.fetchHorrorMovies} onMovieSelect={onMovieSelect} />
            <Row title="Gaming & Adaptations" fetchUrl={requests.fetchGamingContent} onMovieSelect={onMovieSelect} accent="neon" />
            <Row title="Thriller Pulse" fetchUrl={requests.fetchThriller} onMovieSelect={onMovieSelect} />

            <CategoryPills categories={categories} activeCategory={activeCategory.id} onCategoryChange={setActiveCategory} title="Categories" highlight="Explore" />
            <Row
                key={`cat-${activeCategory.id}`}
                title={`${activeCategory.name} Highlights`}
                fetchUrl={activeCategory.fetchUrl}
                onMovieSelect={onMovieSelect}
                isLargeRow
            />

            <CategoryPills categories={languages} activeCategory={activeLanguage.id} onCategoryChange={setActiveLanguage} title="Languages" highlight="Select" />
            <Row
                key={`lang-${activeLanguage.id}`}
                title={`${activeLanguage.name} Cinema`}
                fetchUrl={activeLanguage.fetchUrl}
                onMovieSelect={onMovieSelect}
                accent="neon"
            />

            <Row title="Top Rated" fetchUrl={requests.fetchTopRated} onMovieSelect={onMovieSelect} />
            <Row title="Action Movies" fetchUrl={requests.fetchActionMovies} onMovieSelect={onMovieSelect} />
            <Row title="Comedy Movies" fetchUrl={requests.fetchComedyMovies} onMovieSelect={onMovieSelect} />
            <Row title="Romance Movies" fetchUrl={requests.fetchRomanceMovies} onMovieSelect={onMovieSelect} />
            <Row title="Documentaries" fetchUrl={requests.fetchDocumentaries} onMovieSelect={onMovieSelect} />
        </>
    );
}

function AnimePage() {
    const { onMovieSelect } = useOutletContext();
    return <AnimeUniverse onMovieSelect={onMovieSelect} />;
}

function SearchResultsView({ searchTitle, isLoadingSearch, searchResults, onMovieSelect }) {
    return (
        <div className="search-results">
            <div className="search-results__header">
                <p>
                    Showing results for: <span>&quot;{searchTitle}&quot;</span>
                </p>
            </div>
            {isLoadingSearch ? (
                <div className="no-results">Searching...</div>
            ) : searchResults.length > 0 ? (
                <Row title="Search Results" moviesData={searchResults} onMovieSelect={onMovieSelect} isLargeRow accent="neon" />
            ) : (
                <div className="no-results">
                    No movies found for &quot;{searchTitle}&quot;. Try another search.
                </div>
            )}
        </div>
    );
}

function AppShell() {
    const { justLoggedIn, setJustLoggedIn } = useAuth();
    const location = useLocation();
    const [showSplash, setShowSplash] = useState(false);
    const [selectedMovie, setSelectedMovie] = useState(null);
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const [searchTitle, setSearchTitle] = useState('');
    const [isLoadingSearch, setIsLoadingSearch] = useState(false);
    const [isAIOpen, setIsAIOpen] = useState(false);

    useEffect(() => {
        if (location.pathname !== '/') {
            setShowSplash(false);
            return;
        }
        let needSplash = false;
        try {
            needSplash = justLoggedIn || !sessionStorage.getItem('sunflix_boot');
        } catch {
            needSplash = true;
        }
        setShowSplash(needSplash);
    }, [location.pathname, justLoggedIn]);

    const handleSplashComplete = () => {
        try {
            sessionStorage.setItem('sunflix_boot', '1');
        } catch {
            /* ignore */
        }
        setShowSplash(false);
        setJustLoggedIn(false);
    };

    const handleSearch = async (query) => {
        if (!query || query.trim() === '') {
            setIsSearching(false);
            setSearchResults([]);
            setSearchTitle('');
            return;
        }
        setIsSearching(true);
        setIsLoadingSearch(true);
        setSearchTitle(query);
        try {
            const response = await axios.get(requests.fetchSearch(query));
            setSearchResults(response.data.results || []);
        } catch (error) {
            console.error('Search error:', error);
            setSearchResults([]);
        } finally {
            setIsLoadingSearch(false);
        }
    };

    const clearSearch = () => {
        setIsSearching(false);
        setSearchResults([]);
        setSearchTitle('');
    };

    const outletContext = useMemo(
        () => ({
            onMovieSelect: setSelectedMovie,
        }),
        []
    );

    return (
        <>
            {showSplash && <SunflixDrop onComplete={handleSplashComplete} />}
            <div className="app">
                <ParticleBackground />
                <Navbar
                    onSearch={handleSearch}
                    onClearSearch={clearSearch}
                    onToggleAI={() => setIsAIOpen((v) => !v)}
                />

                {isSearching ? (
                    <SearchResultsView
                        searchTitle={searchTitle}
                        isLoadingSearch={isLoadingSearch}
                        searchResults={searchResults}
                        onMovieSelect={setSelectedMovie}
                    />
                ) : (
                    <Outlet context={outletContext} />
                )}

                <footer className="footer">
                    <p>&copy; 2026 SUNFLIX. Neural streaming universe.</p>
                </footer>

                {selectedMovie && (
                    <VideoModal
                        movie={selectedMovie}
                        videoId={selectedMovie.videoId}
                        title={selectedMovie.title}
                        onClose={() => setSelectedMovie(null)}
                    />
                )}
            </div>
            <AIAssistant isOpen={isAIOpen} onClose={() => setIsAIOpen(false)} />
        </>
    );
}

function AppContent() {
    return (
        <Router>
            <Routes>
                <Route path="/login" element={<Navigate to="/" replace />} />
                <Route path="/signup" element={<Navigate to="/" replace />} />
                <Route
                    path="/"
                    element={
                        <ProtectedRoute>
                            <AppShell />
                        </ProtectedRoute>
                    }
                >
                    <Route index element={<HomePage />} />
                    <Route path="anime" element={<AnimePage />} />
                    <Route path="profile" element={<Profile />} />
                    <Route path="rewards" element={<Rewards />} />
                    <Route path="watch-party" element={<WatchParty />} />
                </Route>
            </Routes>
        </Router>
    );
}

function App() {
    return (
        <AuthProvider>
            <SunflixDataProvider>
                <AppContent />
            </SunflixDataProvider>
        </AuthProvider>
    );
}

export default App;

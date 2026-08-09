import React, { useState, useEffect, useMemo } from 'react';
/**
 * Sunflix — Vite + React shell: cyberpunk UI, OMDb rails, Supabase-ready data.
 */
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
import allCollections from './config/movieCollections';
import Login from './pages/Login';
import AnimeUniverse from './pages/AnimeUniverse';
import Profile from './pages/Profile';
import Rewards from './pages/Rewards';
import WatchParty from './pages/WatchParty';
import CreatorDashboard from './pages/CreatorDashboard';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SunflixDataProvider } from './context/SunflixDataContext';
import { UploadProvider } from './context/UploadContext';
import GlobalUploadProgress from './components/GlobalUploadProgress';
import AIAssistant from './components/AIAssistant';
import SunflixDrop from './components/SunflixDrop';
import VideoModal from './components/VideoModal';
import VortexCarousel from './components/VortexCarousel';
import ParticleBackground from './components/ParticleBackground';
import CategoryPills from './components/CategoryPills';
import CommunityFeedStrip from './components/CommunityFeedStrip';
import SEOMeta from './components/SEOMeta';
import CreatorVideosRow from './components/CreatorVideosRow';
import SearchResults from './components/SearchResults';

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
    if (!user || user.id === 'sunflix-demo') {
        return <Navigate to="/login" replace />;
    }
    return children;
};

const categories = [
    { id: 'action', name: 'Action', fetchUrl: allCollections.actionMovies },
    { id: 'comedy', name: 'Comedy', fetchUrl: allCollections.comedyMovies },
    { id: 'horror', name: 'Horror', fetchUrl: allCollections.horrorMovies },
    { id: 'romance', name: 'Romance', fetchUrl: allCollections.romanceMovies },
    { id: 'scifi', name: 'Sci-Fi', fetchUrl: allCollections.sciFiMovies },
    { id: 'animation', name: 'Animation', fetchUrl: allCollections.animationMovies },
];

const languages = [
    { id: 'en', name: 'English', fetchUrl: allCollections.englishMovies },
    { id: 'hi', name: 'Hindi', fetchUrl: allCollections.hindiMovies },
    { id: 'te', name: 'Telugu', fetchUrl: allCollections.teluguMovies },
    { id: 'ta', name: 'Tamil', fetchUrl: allCollections.tamilMovies },
];

function HomePage() {
    const { onMovieSelect } = useOutletContext();
    const [activeCategory, setActiveCategory] = useState(categories[0]);
    const [activeLanguage, setActiveLanguage] = useState(languages[0]);

    return (
        <>
            <Banner onPlayMovie={onMovieSelect} />
            <CreatorVideosRow onMovieSelect={onMovieSelect} />
            <VortexCarousel title="Popular TV Series" fetchUrl={allCollections.popularTvShows} onMovieSelect={onMovieSelect} />
            <CommunityFeedStrip />

            <Row title="Trending Movies" fetchUrl={allCollections.trendingMovies} onMovieSelect={onMovieSelect} accent="neon" />
            <Row title="IMDb Top Rated" fetchUrl={allCollections.topRatedMovies} onMovieSelect={onMovieSelect} isLargeRow accent="neon" />
            <Row title="Action Blockbusters" fetchUrl={allCollections.actionMovies} onMovieSelect={onMovieSelect} accent="neon" />
            <Row title="Telugu Cinema Spotlight" fetchUrl={allCollections.teluguMovies} onMovieSelect={onMovieSelect} accent="neon" />
            <Row title="Sci-Fi Frontier" fetchUrl={allCollections.sciFiMovies} onMovieSelect={onMovieSelect} accent="neon" />
            <Row title="Hindi Hits" fetchUrl={allCollections.hindiMovies} onMovieSelect={onMovieSelect} />
            <Row title="Horror After Dark" fetchUrl={allCollections.horrorMovies} onMovieSelect={onMovieSelect} />
            <Row title="Tamil Cinema" fetchUrl={allCollections.tamilMovies} onMovieSelect={onMovieSelect} accent="neon" />
            <Row title="Animation Hits" fetchUrl={allCollections.animationMovies} onMovieSelect={onMovieSelect} />

            <CategoryPills categories={categories} activeCategory={activeCategory.id} onCategoryChange={setActiveCategory} title="Categories" highlight="Explore" />
            <Row
                key={`cat-${activeCategory.id}`}
                title={`${activeCategory.name} Selection`}
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
        </>
    );
}

function AnimePage() {
    const { onMovieSelect } = useOutletContext();
    return <AnimeUniverse onMovieSelect={onMovieSelect} />;
}

function AppShell() {
    const { justLoggedIn, setJustLoggedIn } = useAuth();
    const location = useLocation();
    const [showSplash, setShowSplash] = useState(false);
    const [selectedMovie, setSelectedMovie] = useState(null);
    const [isSearching, setIsSearching] = useState(false);
    const [searchTitle, setSearchTitle] = useState('');
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

    const handleSearch = (query) => {
        if (!query || query.trim() === '') {
            setIsSearching(false);
            setSearchTitle('');
            return;
        }
        setIsSearching(true);
        setSearchTitle(query.trim());
    };

    const clearSearch = () => {
        setIsSearching(false);
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
                    <SearchResults
                        query={searchTitle}
                        onMovieSelect={setSelectedMovie}
                    />
                ) : (
                    <Outlet context={outletContext} />
                )}

                <footer className="footer">
                    <p>&copy; 2026 Sunflix. Neural streaming universe powered by OMDb.</p>
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
            <SEOMeta />
            <GlobalUploadProgress />
            <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Navigate to="/login" replace />} />
                <Route path="/" element={<AppShell />}>
                    <Route index element={<HomePage />} />
                    <Route path="anime" element={<AnimePage />} />
                    <Route path="profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                    <Route path="rewards" element={<ProtectedRoute><Rewards /></ProtectedRoute>} />
                    <Route path="watch-party" element={<ProtectedRoute><WatchParty /></ProtectedRoute>} />
                    <Route path="creator" element={<ProtectedRoute><CreatorDashboard /></ProtectedRoute>} />
                </Route>
            </Routes>
        </Router>
    );
}

function App() {
    return (
        <AuthProvider>
            <SunflixDataProvider>
                <UploadProvider>
                    <AppContent />
                </UploadProvider>
            </SunflixDataProvider>
        </AuthProvider>
    );
}

export default App;

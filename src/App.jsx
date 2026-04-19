import React from 'react';
import axios from 'axios';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import Navbar from './components/Navbar';
import Banner from './components/Banner';
import Row from './components/Row';
import requests from './services/api';
import Login from './pages/Login';
import Signup from './pages/Signup';
import { AuthProvider, useAuth } from './context/AuthContext';

const ProtectedRoute = ({ children }) => {
    const { user, loading } = useAuth();

    if (loading) return null;
    if (!user) return <Navigate to="/login" />;

    return children;
};

import SunflixDrop from './components/SunflixDrop';
import VideoModal from './components/VideoModal';

function AppContent() {
    const { justLoggedIn, setJustLoggedIn } = useAuth();
    const [showDrop, setShowDrop] = React.useState(false);
    const [selectedMovie, setSelectedMovie] = React.useState(null);
    const [searchResults, setSearchResults] = React.useState([]);
    const [isSearching, setIsSearching] = React.useState(false);
    const [searchTitle, setSearchTitle] = React.useState("");

    const handleSearch = async (query) => {
        if (!query || query.trim() === "") {
            setIsSearching(false);
            setSearchResults([]);
            setSearchTitle("");
            return;
        }

        setIsSearching(true);
        setSearchTitle(query);
        try {
            const response = await axios.get(requests.fetchSearch(query));
            setSearchResults(response.data.items || []);
        } catch (error) {
            console.error("Search error:", error);
            // Optional: Filter local categories for matches as fallback
            setSearchResults([]); 
        }
    };

    const clearSearch = () => {
        setIsSearching(false);
        setSearchResults([]);
        setSearchTitle("");
    };

    React.useEffect(() => {
        if (justLoggedIn) {
            setShowDrop(true);
        }
    }, [justLoggedIn]);

    const handleDropComplete = () => {
        setShowDrop(false);
        setJustLoggedIn(false);
    };

    return (
        <Router>
            {showDrop && <SunflixDrop onComplete={handleDropComplete} />}
            <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                <Route
                    path="/"
                    element={
                        <ProtectedRoute>
                            <div className="app">
                                <Navbar onSearch={handleSearch} onClearSearch={clearSearch} />
                                {isSearching ? (
                                    <div className="search-results">
                                        <div className="search-results__header">
                                            <p>Showing results for: <span>"{searchTitle}"</span></p>
                                        </div>
                                        <Row 
                                            title="Search Results" 
                                            moviesData={searchResults} 
                                            onMovieSelect={setSelectedMovie} 
                                            isLargeRow 
                                        />
                                    </div>
                                ) : (
                                    <>
                                        <Banner onPlayMovie={setSelectedMovie} />
                                        <Row title="SUNFLIX ORIGINALS" fetchUrl={requests.fetchFeaturedMovie} onMovieSelect={setSelectedMovie} isLargeRow />
                                        <Row title="English Action Movies" fetchUrl={requests.fetchEnglishAction} onMovieSelect={setSelectedMovie} />
                                        <Row title="English Comedy Movies" fetchUrl={requests.fetchEnglishComedy} onMovieSelect={setSelectedMovie} />
                                        <Row title="English Romance Movies" fetchUrl={requests.fetchEnglishRomance} onMovieSelect={setSelectedMovie} />
                                        <Row title="Hindi Action Movies" fetchUrl={requests.fetchHindiAction} onMovieSelect={setSelectedMovie} />
                                        <Row title="Hindi Comedy Movies" fetchUrl={requests.fetchHindiComedy} onMovieSelect={setSelectedMovie} />
                                        <Row title="Hindi Romance Movies" fetchUrl={requests.fetchHindiRomance} onMovieSelect={setSelectedMovie} />
                                        <Row title="Telugu Hits" fetchUrl={requests.fetchTeluguMovies} onMovieSelect={setSelectedMovie} />
                                        <Row title="Telugu Action" fetchUrl={requests.fetchTeluguAction} onMovieSelect={setSelectedMovie} />
                                        <Row title="Documentaries" fetchUrl={requests.fetchDocumentaries} onMovieSelect={setSelectedMovie} />
                                    </>
                                )}

                                {selectedMovie && (
                                    <VideoModal 
                                        videoId={selectedMovie.videoId} 
                                        title={selectedMovie.title} 
                                        onClose={() => setSelectedMovie(null)} 
                                    />
                                )}

                                <footer className="footer">
                                    <p>&copy; 2024 SUNFLIX. All Rights Reserved.</p>
                                </footer>
                            </div>
                        </ProtectedRoute>
                    }
                />
            </Routes>
        </Router>
    );
}

function App() {
    return (
        <AuthProvider>
            <AppContent />
        </AuthProvider>
    );
}

export default App;

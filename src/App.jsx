import React from 'react';
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

function AppContent() {
    const { justLoggedIn, setJustLoggedIn } = useAuth();
    const [showDrop, setShowDrop] = React.useState(false);

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
                                <Navbar />
                                <Banner />
                                <Row title="SUNFLIX ORIGINALS" fetchUrl={requests.fetchFeaturedMovie} isLargeRow />
                                <Row title="English Action Movies" fetchUrl={requests.fetchEnglishAction} />
                                <Row title="English Comedy Movies" fetchUrl={requests.fetchEnglishComedy} />
                                <Row title="English Romance Movies" fetchUrl={requests.fetchEnglishRomance} />
                                <Row title="Hindi Action Movies" fetchUrl={requests.fetchHindiAction} />
                                <Row title="Hindi Comedy Movies" fetchUrl={requests.fetchHindiComedy} />
                                <Row title="Hindi Romance Movies" fetchUrl={requests.fetchHindiRomance} />
                                <Row title="Telugu Hits" fetchUrl={requests.fetchTeluguMovies} />
                                <Row title="Telugu Action" fetchUrl={requests.fetchTeluguAction} />
                                <Row title="Documentaries" fetchUrl={requests.fetchDocumentaries} />

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

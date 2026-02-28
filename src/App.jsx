import React from 'react';
import './App.css';
import Row from './components/Row';
import Banner from './components/Banner';
import Navbar from './components/Navbar';
import { requests } from './services/api';

function App() {
    return (
        <div className="app">
            <Navbar />
            <Banner />

            <Row
                title="SUNFLIX ORIGINALS"
                fetchUrl={requests.fetchNetflixOriginals}
                isLargeRow={true}
            />
            <Row title="Trending Now" fetchUrl={requests.fetchTrending} />
            <Row title="Top Rated" fetchUrl={requests.fetchTopRated} />
            <Row title="Action Movies" fetchUrl={requests.fetchActionMovies} />
            <Row title="Comedy Movies" fetchUrl={requests.fetchComedyMovies} />
            <Row title="Horror Movies" fetchUrl={requests.fetchHorrorMovies} />
            <Row title="Romance Movies" fetchUrl={requests.fetchRomanceMovies} />
            <Row title="Documentaries" fetchUrl={requests.fetchDocumentaries} />

            <footer className="footer">
                <p>&copy; 2026 SUNFLIX - Netflix Clone by Antigravity</p>
            </footer>
        </div>
    );
}

export default App;

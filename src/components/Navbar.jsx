import React, { useState, useEffect } from 'react';
import './Navbar.css';
import { FaSearch, FaGift, FaBell } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';

const Navbar = ({ onSearch, onClearSearch }) => {
    const [show, handleShow] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const { logout } = useAuth();

    useEffect(() => {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 100) {
                handleShow(true);
            } else handleShow(false);
        });
        return () => {
            window.removeEventListener('scroll', null);
        };
    }, []);

    const handleHomeClick = () => {
        setSearchQuery("");
        setIsSearchOpen(false);
        if (onClearSearch) onClearSearch();
    };

    return (
        <div className={`nav ${show && 'nav__black'}`}>
            <h1 className="nav__logo" onClick={handleHomeClick}>SUNFLIX</h1>

            <div className="nav__links">
                <span onClick={handleHomeClick} className="nav__link--active">Home</span>
                <span>TV Shows</span>
                <span>Movies</span>
                <span>Latest</span>
                <span>My List</span>
            </div>

            <div className="nav__right">
                <div className={`nav__search ${isSearchOpen && 'nav__search--open'}`}>
                    <FaSearch className="nav__icon" onClick={() => {
                        if (isSearchOpen && searchQuery) {
                            onSearch(searchQuery);
                        } else {
                            setIsSearchOpen(!isSearchOpen);
                        }
                    }} />
                    <input
                        className="nav__searchInput"
                        type="text"
                        placeholder="Search Movies..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                onSearch(searchQuery);
                            }
                        }}
                        onBlur={() => !searchQuery && setIsSearchOpen(false)}
                    />
                </div>
                <span className="nav__kids">CHILDREN</span>
                <FaGift className="nav__icon nav__icon--hide" />
                <FaBell className="nav__icon" />
                <div className="nav__avatar__container">
                    <img
                        className="nav__avatar"
                        src="https://upload.wikimedia.org/wikipedia/commons/0/0b/Netflix-avatar.png"
                        alt="User"
                    />
                    <div className="nav__dropdown">
                        <button onClick={logout}>Sign Out of Sunflix</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Navbar;

import React, { useState, useEffect } from 'react';
import './Navbar.css';
import { FaSearch, FaGift, FaBell } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
    const [show, handleShow] = useState(false);
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

    return (
        <div className={`nav ${show && 'nav__black'}`}>
            <h1 className="nav__logo">SUNFLIX</h1>

            <div className="nav__links">
                <span>Home</span>
                <span>TV Shows</span>
                <span>Movies</span>
                <span>New & Popular</span>
                <span>My List</span>
            </div>

            <div className="nav__right">
                <FaSearch className="nav__icon" />
                <span className="nav__kids">Children</span>
                <FaGift className="nav__icon" />
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

import React, { useState, useEffect } from 'react';
import './Navbar.css';
import { FaSearch, FaBell, FaGift } from 'react-icons/fa';

const Navbar = () => {
    const [show, handleShow] = useState(false);

    const transitionNavbar = () => {
        if (window.scrollY > 100) {
            handleShow(true);
        } else {
            handleShow(false);
        }
    };

    useEffect(() => {
        window.addEventListener('scroll', transitionNavbar);
        return () => window.removeEventListener('scroll', transitionNavbar);
    }, []);

    return (
        <nav className={`nav ${show && 'nav__black'}`}>
            <div className="nav__contents">
                <div className="nav__left">
                    <h1 className="nav__logo">SUNFLIX</h1>
                    <ul className="nav__links">
                        <li>Home</li>
                        <li>TV Shows</li>
                        <li>Movies</li>
                        <li>New & Popular</li>
                        <li>My List</li>
                    </ul>
                </div>
                <div className="nav__right">
                    <FaSearch className="nav__icon" />
                    <span className="nav__link">KIDS</span>
                    <FaGift className="nav__icon" />
                    <FaBell className="nav__icon" />
                    <img
                        className="nav__avatar"
                        src="https://upload.wikimedia.org/wikipedia/commons/0/0b/Netflix-avatar.png"
                        alt="User Avatar"
                    />
                </div>
            </div>
        </nav>
    );
};

export default Navbar;

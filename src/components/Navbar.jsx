import React, { useState, useEffect } from 'react';
import { Link, NavLink } from 'react-router-dom';
import './Navbar.css';
import {
    FaSearch,
    FaBell,
    FaRobot,
    FaUserCircle,
    FaTimes,
    FaMicrophone,
    FaBars,
    FaCloudUploadAlt,
} from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

const Navbar = ({ onSearch, onClearSearch, onToggleAI }) => {
    const [scrolled, setScrolled] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);
    const { logout } = useAuth();

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 50);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        document.body.style.overflow = mobileOpen ? 'hidden' : '';
        return () => {
            document.body.style.overflow = '';
        };
    }, [mobileOpen]);

    const handleHomeClick = () => {
        setSearchQuery('');
        setIsSearchOpen(false);
        setMobileOpen(false);
        if (onClearSearch) onClearSearch();
    };

    const handleSearchSubmit = () => {
        if (searchQuery.trim()) {
            onSearch(searchQuery);
            setMobileOpen(false);
        }
    };

    const navClass = ({ isActive }) => `nav-link${isActive ? ' nav-link--active' : ''}`;

    const navLinks = (
        <>
            <NavLink to="/" end className={navClass} onClick={handleHomeClick}>
                Home
            </NavLink>
            <NavLink to="/anime" className={navClass} onClick={() => setMobileOpen(false)}>
                Anime
            </NavLink>
            <NavLink to="/watch-party" className={navClass} onClick={() => setMobileOpen(false)}>
                Watch Party
            </NavLink>
            <NavLink to="/rewards" className={navClass} onClick={() => setMobileOpen(false)}>
                Rewards
            </NavLink>
            <NavLink to="/profile" className={navClass} onClick={() => setMobileOpen(false)}>
                Profile
            </NavLink>
            <NavLink to="/creator" className={navClass} onClick={() => setMobileOpen(false)}>
                Creator Studio
            </NavLink>
        </>
    );

    return (
        <nav className={`navbar ${scrolled ? 'navbar--scrolled' : ''}`}>
            <div className="navbar__inner">
                <div className="flex items-center gap-4 lg:gap-10 min-w-0">
                    <button
                        type="button"
                        className="lg:hidden p-2 text-white/80 hover:text-cyan-300 shrink-0"
                        aria-label="Open menu"
                        onClick={() => setMobileOpen(true)}
                    >
                        <FaBars className="text-lg" />
                    </button>

                    <motion.div whileHover={{ scale: 1.03 }} className="min-w-0">
                        <Link to="/" className="navbar__logo truncate" onClick={handleHomeClick}>
                            SUNFLIX
                        </Link>
                    </motion.div>

                    <div className="hidden lg:flex items-center gap-6 text-sm font-medium text-white/70">
                        {navLinks}
                    </div>
                </div>

                <div className="flex items-center gap-3 sm:gap-5 shrink-0">
                    <div className={`navbar__search ${isSearchOpen ? 'navbar__search--open' : ''}`}>
                        <FaSearch
                            className="text-white/70 cursor-pointer hover:text-cyan-300 transition-colors text-sm flex-shrink-0"
                            onClick={() => {
                                if (isSearchOpen && searchQuery.trim()) {
                                    handleSearchSubmit();
                                } else {
                                    setIsSearchOpen(!isSearchOpen);
                                }
                            }}
                        />
                        {isSearchOpen && (
                            <>
                                <input
                                    className="bg-transparent border-none outline-none text-white text-sm w-full min-w-0 placeholder:text-white/30"
                                    type="text"
                                    placeholder="Search titles…"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleSearchSubmit()}
                                    autoFocus
                                />
                                <FaTimes
                                    className="text-white/40 cursor-pointer hover:text-white transition-colors text-xs flex-shrink-0"
                                    onClick={() => {
                                        setSearchQuery('');
                                        setIsSearchOpen(false);
                                        onClearSearch && onClearSearch();
                                    }}
                                />
                            </>
                        )}
                    </div>

                    <motion.div
                        whileHover={{ y: -1 }}
                        className="hidden sm:flex items-center gap-1.5 text-white/40 text-xs uppercase tracking-widest cursor-default"
                        title="Voice search (SUN AI)"
                    >
                        <FaMicrophone className="text-cyan-400/80" />
                    </motion.div>

                    <motion.div
                        whileHover={{ y: -1 }}
                        className="flex items-center gap-1.5 cursor-pointer group"
                        onClick={onToggleAI}
                    >
                        <div className="p-1.5 rounded bg-gradient-to-br from-cyan-500/90 to-violet-600/90 shadow-[0_0_14px_rgba(34,211,238,0.35)] group-hover:shadow-[0_0_22px_rgba(168,85,247,0.45)] transition-all border border-white/10">
                            <FaRobot className="text-white text-sm" />
                        </div>
                        <span className="hidden md:inline text-[10px] uppercase tracking-[0.2em] text-cyan-200/80 font-[Rajdhani,sans-serif]">
                            SUN AI
                        </span>
                    </motion.div>

                    <FaBell className="hidden sm:block text-white/60 text-lg cursor-pointer hover:text-cyan-300 transition-colors" />

                    <div className="relative group">
                        <div className="w-8 h-8 rounded overflow-hidden border border-transparent group-hover:border-cyan-400/50 transition-colors cursor-pointer ring-1 ring-white/10">
                            <img
                                className="w-full h-full object-cover"
                                src="https://upload.wikimedia.org/wikipedia/commons/0/0b/Netflix-avatar.png"
                                alt="User"
                            />
                        </div>
                        <div className="navbar__dropdown">
                            <Link
                                to="/profile"
                                className="block px-4 py-2.5 border-b border-white/5 text-white text-xs hover:bg-white/5"
                                onClick={() => setMobileOpen(false)}
                            >
                                <span className="flex items-center gap-3">
                                    <FaUserCircle className="text-cyan-400/50 text-sm" />
                                    Profile & watchlist
                                </span>
                            </Link>
                            <Link
                                to="/creator"
                                className="block px-4 py-2.5 border-b border-white/5 text-white text-xs hover:bg-white/5"
                                onClick={() => setMobileOpen(false)}
                            >
                                <span className="flex items-center gap-3">
                                    <FaCloudUploadAlt className="text-violet-400/50 text-sm" />
                                    Creator Studio
                                </span>
                            </Link>
                            <button
                                type="button"
                                onClick={() => {
                                    setMobileOpen(false);
                                    logout();
                                }}
                                className="w-full text-left px-4 py-2.5 text-white/60 hover:text-white hover:bg-white/5 text-xs transition-colors"
                            >
                                Sign out
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <AnimatePresence>
                {mobileOpen && (
                    <>
                        <motion.button
                            type="button"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="navbar__drawer-backdrop lg:hidden"
                            aria-label="Close menu"
                            onClick={() => setMobileOpen(false)}
                        />
                        <motion.div
                            initial={{ x: '-100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '-100%' }}
                            transition={{ type: 'spring', damping: 28, stiffness: 280 }}
                            className="navbar__drawer lg:hidden"
                        >
                            <div className="navbar__drawer-head">
                                <span className="text-cyan-300/90 text-xs tracking-[0.25em] uppercase">Navigate</span>
                                <button
                                    type="button"
                                    className="text-white/60 p-2"
                                    aria-label="Close"
                                    onClick={() => setMobileOpen(false)}
                                >
                                    <FaTimes />
                                </button>
                            </div>
                            <div className="navbar__drawer-links">{navLinks}</div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </nav>
    );
};

export default Navbar;

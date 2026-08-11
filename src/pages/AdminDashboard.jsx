import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
    FaUsers,
    FaFilm,
    FaCoins,
    FaChartLine,
    FaShieldAlt,
    FaTrash,
    FaPlus,
    FaCheckCircle,
    FaStar,
    FaBroadcastTower,
} from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import './sunflix-pages.css';

const MOCK_USERS = [
    { id: 'usr-1', email: 'sanflixer@sunflix.app', name: 'Sanjay Kalisetti', role: 'Admin', status: 'Active', joined: '2026-08-01' },
    { id: 'usr-2', email: 'neo_runner@sunflix.app', name: 'Neo Runner', role: 'Creator', status: 'Active', joined: '2026-08-05' },
    { id: 'usr-3', email: 'cyber_fan@sunflix.app', name: 'Cyber Fan', role: 'User', status: 'Active', joined: '2026-08-08' },
    { id: 'usr-4', email: 'guest_pilot@sunflix.app', name: 'Guest Pilot', role: 'User', status: 'Active', joined: '2026-08-10' },
];

const MOCK_BANNERS = [
    { id: 'b-1', title: 'Blade Runner 2049', type: 'Movie', status: 'Active', rating: '8.7' },
    { id: 'b-2', title: 'Cyberpunk Edgerunners', type: 'TV Series', status: 'Active', rating: '8.9' },
    { id: 'b-3', title: 'Dune: Part Two', type: 'Movie', status: 'Inactive', rating: '8.6' },
];

const AdminDashboard = () => {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState('analytics');
    const [usersList, setUsersList] = useState(MOCK_USERS);
    const [bannersList, setBannersList] = useState(MOCK_BANNERS);

    // New Banner Form State
    const [bannerTitle, setBannerTitle] = useState('');
    const [bannerType, setBannerType] = useState('movie');

    const handleRoleChange = (userId, newRole) => {
        setUsersList((prev) =>
            prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
        );
    };

    const handleAddBanner = (e) => {
        e.preventDefault();
        if (!bannerTitle.trim()) return;
        const newBanner = {
            id: `b-${Date.now()}`,
            title: bannerTitle.trim(),
            type: bannerType === 'movie' ? 'Movie' : 'TV Series',
            status: 'Active',
            rating: '8.5'
        };
        setBannersList((prev) => [newBanner, ...prev]);
        setBannerTitle('');
    };

    const handleDeleteBanner = (id) => {
        setBannersList((prev) => prev.filter((b) => b.id !== id));
    };

    return (
        <div className="sunflix-page pt-16">
            <header className="sunflix-page__hero">
                <div className="flex items-center gap-2 text-cyan-400 mb-2">
                    <FaShieldAlt className="text-lg" />
                    <span className="text-xs uppercase tracking-[0.35em] font-bold font-orbitron">
                        System Control Deck
                    </span>
                </div>
                <h1 className="sunflix-page__title">Admin Command Dashboard</h1>
                <p className="sunflix-page__lead">
                    Manage registered users, feature custom hero banners, moderate creator content, and monitor OTT performance.
                </p>
            </header>

            {/* Admin Tabs */}
            <div className="flex items-center gap-2 border-b border-white/10 mb-8 overflow-x-auto pb-2 custom-scrollbar">
                {[
                    { id: 'analytics', label: 'Analytics & Overview', icon: FaChartLine },
                    { id: 'users', label: 'User Management', icon: FaUsers },
                    { id: 'banners', label: 'Hero Banners & Spotlight', icon: FaFilm },
                ].map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all whitespace-nowrap ${
                                isActive
                                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.2)]'
                                    : 'text-white/60 hover:text-white hover:bg-white/5'
                            }`}
                        >
                            <Icon /> {tab.label}
                        </button>
                    );
                })}
            </div>

            {/* Analytics Tab */}
            {activeTab === 'analytics' && (
                <div className="space-y-8">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="sunflix-glass p-5 flex items-center gap-4">
                            <div className="p-3 bg-cyan-500/20 text-cyan-300 rounded-xl text-2xl">
                                <FaUsers />
                            </div>
                            <div>
                                <span className="text-white/50 block text-[10px] uppercase font-bold tracking-wider">Total Users</span>
                                <span className="text-white text-2xl font-bold font-orbitron">1,482</span>
                            </div>
                        </div>

                        <div className="sunflix-glass p-5 flex items-center gap-4">
                            <div className="p-3 bg-emerald-500/20 text-emerald-300 rounded-xl text-2xl">
                                <FaBroadcastTower />
                            </div>
                            <div>
                                <span className="text-white/50 block text-[10px] uppercase font-bold tracking-wider">Active Streams</span>
                                <span className="text-emerald-300 text-2xl font-bold font-orbitron">329</span>
                            </div>
                        </div>

                        <div className="sunflix-glass p-5 flex items-center gap-4">
                            <div className="p-3 bg-purple-500/20 text-purple-300 rounded-xl text-2xl">
                                <FaFilm />
                            </div>
                            <div>
                                <span className="text-white/50 block text-[10px] uppercase font-bold tracking-wider">Content Library</span>
                                <span className="text-purple-300 text-2xl font-bold font-orbitron">10,000+</span>
                            </div>
                        </div>

                        <div className="sunflix-glass p-5 flex items-center gap-4">
                            <div className="p-3 bg-yellow-500/20 text-yellow-300 rounded-xl text-2xl">
                                <FaCoins />
                            </div>
                            <div>
                                <span className="text-white/50 block text-[10px] uppercase font-bold tracking-wider">SUN Coins Awarded</span>
                                <span className="text-yellow-300 text-2xl font-bold font-orbitron">48,250</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Users Tab */}
            {activeTab === 'users' && (
                <div className="sunflix-glass p-6 overflow-x-auto">
                    <h3 className="text-white font-bold text-base mb-4 font-orbitron">Registered User Roster</h3>
                    <table className="w-full text-left text-xs text-white/80">
                        <thead className="text-[10px] uppercase tracking-wider text-cyan-400 border-b border-white/10">
                            <tr>
                                <th className="pb-3">User</th>
                                <th className="pb-3">Role</th>
                                <th className="pb-3">Status</th>
                                <th className="pb-3">Joined Date</th>
                                <th className="pb-3 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {usersList.map((u) => (
                                <tr key={u.id}>
                                    <td className="py-3 font-medium text-white">{u.name} <span className="text-white/40 font-mono text-[10px]">({u.email})</span></td>
                                    <td className="py-3">
                                        <select
                                            value={u.role}
                                            onChange={(e) => handleRoleChange(u.id, e.target.value)}
                                            className="bg-black/60 border border-white/20 rounded px-2 py-1 text-white text-xs outline-none cursor-pointer"
                                        >
                                            <option value="User">User</option>
                                            <option value="Creator">Creator</option>
                                            <option value="Admin">Admin</option>
                                        </select>
                                    </td>
                                    <td className="py-3">
                                        <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] uppercase px-2 py-0.5 rounded font-bold">
                                            {u.status}
                                        </span>
                                    </td>
                                    <td className="py-3 text-white/50">{u.joined}</td>
                                    <td className="py-3 text-right">
                                        <button className="text-cyan-400 hover:text-cyan-300 font-bold">Edit</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Banners Tab */}
            {activeTab === 'banners' && (
                <div className="space-y-6">
                    {/* Form */}
                    <form onSubmit={handleAddBanner} className="sunflix-glass p-5 flex flex-col sm:flex-row gap-3 max-w-2xl">
                        <input
                            type="text"
                            placeholder="Spotlight Movie / TV Title..."
                            value={bannerTitle}
                            onChange={(e) => setBannerTitle(e.target.value)}
                            className="flex-1 bg-black/50 border border-white/15 rounded-xl px-3 py-2 text-white text-xs outline-none focus:border-cyan-400"
                        />
                        <select
                            value={bannerType}
                            onChange={(e) => setBannerType(e.target.value)}
                            className="bg-black/60 border border-white/20 rounded-xl px-3 py-2 text-white text-xs outline-none cursor-pointer"
                        >
                            <option value="movie">Movie</option>
                            <option value="tv">TV Series</option>
                        </select>
                        <button
                            type="submit"
                            disabled={!bannerTitle.trim()}
                            className="px-5 py-2 rounded-xl bg-cyan-400 text-black font-bold text-xs uppercase tracking-wider hover:bg-cyan-300 transition-colors flex items-center justify-center gap-1.5"
                        >
                            <FaPlus /> Add Spotlight
                        </button>
                    </form>

                    {/* Banners List */}
                    <div className="sunflix-glass p-6">
                        <h3 className="text-white font-bold text-base mb-4 font-orbitron">Active Hero Banners</h3>
                        <div className="space-y-3">
                            {bannersList.map((b) => (
                                <div key={b.id} className="bg-black/40 border border-white/10 p-4 rounded-xl flex items-center justify-between">
                                    <div>
                                        <h4 className="text-white font-bold text-sm">{b.title}</h4>
                                        <span className="text-white/40 text-xs">{b.type} · Rating {b.rating}</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded border ${b.status === 'Active' ? 'border-emerald-500/40 text-emerald-300 bg-emerald-500/10' : 'border-white/20 text-white/40'}`}>
                                            {b.status}
                                        </span>
                                        <button
                                            onClick={() => handleDeleteBanner(b.id)}
                                            className="text-red-400 hover:text-red-300 p-2"
                                            title="Delete Banner"
                                        >
                                            <FaTrash />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;

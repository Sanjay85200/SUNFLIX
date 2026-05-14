import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import authApi from '../services/authApi';
import { useAuth } from '../context/AuthContext';
import './Signup.css';

const Signup = () => {
    const [formData, setFormData] = useState({
        name: '',
        mobile: '',
        email: '',
        password: '',
    });
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const { login } = useAuth();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const data = await authApi.signup(formData);
            if (data?.session?.access_token && data?.user) {
                login(data.user, data.session.access_token);
                navigate('/');
                return;
            }
            navigate('/login');
        } catch (err) {
            setError(err.message || 'Signup failed');
        }
    };

    return (
        <div className="signup-page">
            <div className="signup-overlay">
                <nav className="signup-nav">
                    <h1 className="logo">SUNFLIX</h1>
                </nav>
                <div className="signup-body">
                    <div className="signup-form-container">
                        <h1>Sign Up</h1>
                        {error && <div className="error-message">{error}</div>}
                        {import.meta.env.VITE_AUTH_DEMO === 'true' && (
                            <p className="text-xs text-cyan-200/80 mb-3 font-[Rajdhani,sans-serif]">
                                Signup needs Supabase. For a quick tour use demo login on the sign-in page.
                            </p>
                        )}
                        <form onSubmit={handleSubmit}>
                            <input
                                type="text"
                                name="name"
                                placeholder="Full Name"
                                value={formData.name}
                                onChange={handleChange}
                                required
                            />
                            <input
                                type="text"
                                name="mobile"
                                placeholder="Mobile Number"
                                value={formData.mobile}
                                onChange={handleChange}
                                required
                            />
                            <input
                                type="email"
                                name="email"
                                placeholder="Email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                            />
                            <input
                                type="password"
                                name="password"
                                placeholder="Password"
                                value={formData.password}
                                onChange={handleChange}
                                required
                            />
                            <button type="submit" className="signup-button">Sign Up</button>
                        </form>
                        <div className="signup-footer">
                            <span className="already">Already have an account? </span>
                            <Link to="/login" className="login-link">Sign in now.</Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Signup;

import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import authApi from '../services/authApi';
import { useAuth } from '../context/AuthContext';
import './Login.css';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const { login } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await authApi.login({ email, password });
            login(response.data.user, response.data.token);
            navigate('/');
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed');
        }
    };

    return (
        <div className="login-page">
            <div className="login-overlay">
                <nav className="login-nav">
                    <h1 className="logo">SUNFLIX</h1>
                </nav>
                <div className="login-body">
                    <div className="login-form-container">
                        <h1>Sign In</h1>
                        {error && <div className="error-message">{error}</div>}
                        <form onSubmit={handleSubmit}>
                            <input
                                type="email"
                                placeholder="Email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                            <input
                                type="password"
                                placeholder="Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                            <button type="submit" className="login-button">Sign In</button>
                        </form>
                        <div className="login-footer">
                            <span className="new-to">New to Sunflix? </span>
                            <Link to="/signup" className="signup-link">Sign up now.</Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;

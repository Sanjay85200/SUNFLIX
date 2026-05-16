import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import authApi from '../services/authApi';
import { useAuth } from '../context/AuthContext';
import './Login.css';

const Login = () => {
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { login } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccessMessage('');
        setLoading(true);
        try {
            // Dev override
            if (email === 'demo@sunflix.app') {
                const response = await authApi.login({ email, password: 'demo' });
                login(response.data.user, response.data.token);
                navigate('/');
                return;
            }

            await authApi.loginWithOtp(email);
            setSuccessMessage('Secure link sent! Check your email to enter the neural net.');
        } catch (err) {
            setError(err.message || 'Login failed');
        } finally {
            setLoading(false);
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
                        <h1>Enter the Neural Net</h1>
                        {error && <div className="error-message">{error}</div>}
                        {successMessage && (
                            <div className="bg-cyan-500/20 border border-cyan-500/50 text-cyan-200 px-4 py-3 rounded mb-4 text-sm font-medium">
                                {successMessage}
                            </div>
                        )}
                        {import.meta.env.DEV && (
                            <p className="text-xs text-cyan-200/75 mb-3 font-[Rajdhani,sans-serif]">
                                Quick start: <strong>demo@sunflix.app</strong> bypasses OTP in dev mode.
                            </p>
                        )}
                        <form onSubmit={handleSubmit}>
                            <input
                                type="email"
                                placeholder="Enter your email address"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                            <button type="submit" className="login-button" disabled={loading}>
                                {loading ? 'Transmitting...' : 'Send Magic Link'}
                            </button>
                        </form>
                        <div className="login-footer">
                            <span className="new-to">Sign In / Sign Up via secure Magic Link. </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;

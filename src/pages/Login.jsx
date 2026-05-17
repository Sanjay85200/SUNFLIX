import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import authApi from '../services/authApi';
import { useAuth } from '../context/AuthContext';
import './Login.css';

const Login = () => {
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [isOtpSent, setIsOtpSent] = useState(false);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { login } = useAuth();

    const handleSendOtp = async (e) => {
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
            setIsOtpSent(true);
            setSuccessMessage('Your verification code has been sent to your email.');
        } catch (err) {
            setError(err.message || 'Failed to send code');
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOtp = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const result = await authApi.verifyOtp({ email, otp });
            if (result.data?.token && result.data?.user) {
                login(result.data.user, result.data.token);
                navigate('/');
            } else {
                setError('Verification failed. Please try again.');
            }
        } catch (err) {
            setError(err.message || 'Invalid code');
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
                        <h1>{isOtpSent ? 'Verify Access Code' : 'Enter the Neural Net'}</h1>
                        {error && <div className="error-message">{error}</div>}
                        {successMessage && (
                            <div className="bg-cyan-500/20 border border-cyan-500/50 text-cyan-200 px-4 py-3 rounded mb-4 text-sm font-medium">
                                {successMessage}
                            </div>
                        )}
                        {import.meta.env.DEV && !isOtpSent && (
                            <p className="text-xs text-cyan-200/75 mb-3 font-[Rajdhani,sans-serif]">
                                Quick start: <strong>demo@sunflix.app</strong> bypasses OTP in dev mode.
                            </p>
                        )}
                        
                        {!isOtpSent ? (
                            <form onSubmit={handleSendOtp}>
                                <input
                                    type="email"
                                    placeholder="Enter your email address"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                                <button type="submit" className="login-button" disabled={loading}>
                                    {loading ? 'Transmitting...' : 'Send Access Code'}
                                </button>
                            </form>
                        ) : (
                            <form onSubmit={handleVerifyOtp}>
                                <input
                                    type="text"
                                    placeholder="Enter Verification Code"
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value)}
                                    maxLength={8}
                                    required
                                    className="text-center tracking-[0.5em] font-bold text-lg"
                                />
                                <button type="submit" className="login-button" disabled={loading}>
                                    {loading ? 'Verifying...' : 'Verify & Enter'}
                                </button>
                                <button 
                                    type="button" 
                                    onClick={() => { setIsOtpSent(false); setSuccessMessage(''); setOtp(''); }}
                                    className="w-full mt-4 text-white/50 hover:text-white transition-colors text-sm"
                                >
                                    ← Change Email Address
                                </button>
                            </form>
                        )}
                        
                        <div className="login-footer">
                            <span className="new-to">Sign In / Sign Up securely via Email.</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;

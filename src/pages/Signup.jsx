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
    const [isOtpSent, setIsOtpSent] = useState(false);
    const [otp, setOtp] = useState('');
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
            } else if (data?.user) {
                // Email confirmation is required, session is null
                setIsOtpSent(true);
                setError('');
                return;
            }
            navigate('/login');
        } catch (err) {
            setError(err.message || 'Signup failed');
        }
    };

    const handleVerifyOtp = async (e) => {
        e.preventDefault();
        try {
            const result = await authApi.verifyOtp({ email: formData.email, otp });
            if (result.data?.token && result.data?.user) {
                login(result.data.user, result.data.token);
                navigate('/');
            } else {
                setError('Verification failed. Please try again.');
            }
        } catch (err) {
            setError(err.message || 'Invalid OTP');
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
                        <h1>{isOtpSent ? 'Verify Email' : 'Sign Up'}</h1>
                        {error && <div className="error-message">{error}</div>}
                        {import.meta.env.VITE_AUTH_DEMO === 'true' && !isOtpSent && (
                            <p className="text-xs text-cyan-200/80 mb-3 font-[Rajdhani,sans-serif]">
                                Signup needs Supabase. For a quick tour use demo login on the sign-in page.
                            </p>
                        )}
                        {!isOtpSent ? (
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
                        ) : (
                            <form onSubmit={handleVerifyOtp} className="otp-form">
                                <p className="otp-instruction">
                                    We've sent a 6-digit verification code to <br />
                                    <strong>{formData.email}</strong>
                                </p>
                                <input
                                    type="text"
                                    name="otp"
                                    placeholder="Enter 6-Digit OTP"
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value)}
                                    maxLength={6}
                                    required
                                />
                                <button type="submit" className="signup-button">Verify & Sign In</button>
                            </form>
                        )}
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

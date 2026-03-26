import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import './Auth.css'; 

const ForgotPassword = () => {
    const [step, setStep] = useState(1); // 1: Request OTP, 2: Reset Password
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [message, setMessage] = useState({ type: '', text: '' });
    const [loading, setLoading] = useState(false);

    const handleSendOTP = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage({ type: '', text: '' });
        try {
            await api.post('forgot-password/', { email });
            setStep(2);
            setMessage({ type: 'success', text: 'OTP sent to your email!' });
        } catch (err) {
            setMessage({ type: 'error', text: err.response?.data?.error || 'Email not found.' });
        } finally {
            setLoading(false);
        }
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.post('reset-password-confirm/', { email, otp, password: newPassword });
            setMessage({ type: 'success', text: 'Password reset successful! Redirecting...' });
            setTimeout(() => window.location.href = '/login', 2000);
        } catch (err) {
            setMessage({ type: 'error', text: 'Invalid OTP or request failed.' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-body">
            <div className="auth-container">
                <div className="auth-header">
                    <h2>{step === 1 ? 'Forgot Password' : 'Reset Password'}</h2>
                    <p>
                        {step === 1 
                            ? 'Enter your registered email to receive an OTP' 
                            : 'Enter the code sent to your email and your new password'}
                    </p>
                </div>

                {message.text && (
                    <div className={`status-msg ${message.type === 'success' ? 'success' : 'error'}`}>
                        {message.text}
                    </div>
                )}

                {step === 1 ? (
                    <form onSubmit={handleSendOTP}>
                        <div className="input-group">
                            <label>Email Address</label>
                            <input 
                                type="email" 
                                placeholder="name@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required 
                            />
                        </div>
                        <button type="submit" className="auth-btn" disabled={loading}>
                            {loading ? 'Sending...' : 'Send OTP'}
                        </button>
                    </form>
                ) : (
                    <form onSubmit={handleResetPassword}>
                        <div className="input-group">
                            <label>OTP Code</label>
                            <input 
                                type="text" 
                                placeholder="Enter 4-digit code"
                                value={otp}
                                onChange={(e) => setOtp(e.target.value)}
                                required 
                            />
                        </div>
                        <div className="input-group">
                            <label>New Password</label>
                            <input 
                                type="password" 
                                placeholder="Enter new password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                required 
                            />
                        </div>
                        <button type="submit" className="auth-btn" disabled={loading}>
                            {loading ? 'Updating...' : 'Update Password'}
                        </button>
                    </form>
                )}

                <div className="auth-footer">
                    <Link to="/login" className="back-link">
                        Back to Login
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;
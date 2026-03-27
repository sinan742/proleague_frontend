import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api';
import './Auth.css'; 
import { toast } from 'react-toastify'; // 1. Import toast

const ForgotPassword = () => {
    const navigate = useNavigate()
    
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
        // Sending the reset data to your Django backend
        await api.post('reset-password-confirm/', { 
            email, 
            otp, 
            password: newPassword 
        });

        // 1. Success Notification
        toast.success('Password reset successful! Redirecting to login...');
        navigate()

        // 2. Smooth Redirect after 2 seconds
        setTimeout(() => {
            navigate('/login');
        }, 2000);

    } catch (err) {
        // 3. Error Notification
        // Pulls the specific error message from Django if it exists
        const errorMsg = err.response?.data?.error || 'Invalid OTP or request failed.';
        toast.error(errorMsg);
        
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
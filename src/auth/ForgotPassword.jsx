import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api';
import './Auth.css'; 
import { toast } from 'react-toastify';

const ForgotPassword = () => {
    const navigate = useNavigate();
    
    const [step, setStep] = useState(1); // 1: Request OTP, 2: Reset Password
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [errors, setErrors] = useState({}); // Field specific validation
    const [loading, setLoading] = useState(false);

    // Strict Email Regex
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    // Password Regex (Min 6 chars, 1 number, 1 special char)
    const passwordRegex = /^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{6,}$/;

    const handleSendOTP = async (e) => {
        e.preventDefault();
        setErrors({});

        // Frontend Validation
        if (!email.trim()) {
            setErrors({ email: "Email is required" });
            return;
        } else if (!emailRegex.test(email)) {
            setErrors({ email: "Please enter a valid email address" });
            return;
        }

        setLoading(true);
        try {
            await api.post('forgot-password/', { email: email.trim() });
            setStep(2);
            toast.success('OTP sent to your email!');
        } catch (err) {
            const errorMsg = err.response?.data?.error || 'Email not found.';
            setErrors({ email: errorMsg });
            toast.error(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();
        setErrors({});

        // Frontend Validation
        let tempErrors = {};
        if (!otp.trim()) tempErrors.otp = "OTP is required";
        
        if (!newPassword) {
            tempErrors.password = "New password is required";
        } else if (!passwordRegex.test(newPassword)) {
            tempErrors.password = "Min 6 chars, 1 number & 1 special char required";
        }

        if (Object.keys(tempErrors).length > 0) {
            setErrors(tempErrors);
            return;
        }

        setLoading(true);
        try {
            await api.post('reset-password-confirm/', { 
                email: email.trim(), 
                otp: otp.trim(), 
                password: newPassword 
            });

            toast.success('Password reset successful! Redirecting...');

            // Smooth Redirect after 2 seconds
            setTimeout(() => {
                navigate('/login');
            }, 2000);

        } catch (err) {
            const errorMsg = err.response?.data?.error || 'Invalid OTP or request failed.';
            toast.error(errorMsg);
            if (errorMsg.toLowerCase().includes('otp')) setErrors({ otp: errorMsg });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-body">
            <div className="auth-container">
                <div className="auth-header">
                    <h2>{step === 1 ? 'Forgot Password' : 'Reset Password'}</h2>
                    <p className="auth-subtitle">
                        {step === 1 
                            ? 'Enter your registered email to receive an OTP' 
                            : 'Enter the code sent to your email and your new password'}
                    </p>
                </div>

                {step === 1 ? (
                    <form onSubmit={handleSendOTP} noValidate>
                        <div className="input-group">
                            <input 
                                className={errors.email ? 'input-error' : ''}
                                type="email" 
                                placeholder="Email Address"
                                value={email}
                                onChange={(e) => {
                                    setEmail(e.target.value);
                                    if (errors.email) setErrors({});
                                }}
                            />
                            {errors.email && <span className="error-text">{errors.email}</span>}
                        </div>
                        <button type="submit" className="auth-btn" disabled={loading}>
                            {loading ? 'Sending...' : 'Send OTP'}
                        </button>
                    </form>
                ) : (
                    <form onSubmit={handleResetPassword} noValidate>
                        <div className="input-group">
                            <input 
                                className={errors.otp ? 'input-error' : ''}
                                type="text" 
                                placeholder="Enter 4-digit OTP"
                                value={otp}
                                onChange={(e) => {
                                    setOtp(e.target.value);
                                    if (errors.otp) setErrors({});
                                }}
                            />
                            {errors.otp && <span className="error-text">{errors.otp}</span>}
                        </div>
                        <div className="input-group">
                            <input 
                                className={errors.password ? 'input-error' : ''}
                                type="password" 
                                placeholder="New Password"
                                value={newPassword}
                                onChange={(e) => {
                                    setNewPassword(e.target.value);
                                    if (errors.password) setErrors({});
                                }}
                            />
                            {errors.password && <span className="error-text">{errors.password}</span>}
                        </div>
                        <button type="submit" className="auth-btn" disabled={loading}>
                            {loading ? 'Updating...' : 'Update Password'}
                        </button>
                    </form>
                )}

                <div className="auth-footer">
                    <p>Remembered your password? <span onClick={() => navigate('/login')}>Login</span></p>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;
import React, { useState, useEffect } from 'react';
import api from '../api';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify'; // Import toast
import './Auth.css';

const VerifyOTP = () => {
    const [otp, setOtp] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const email = localStorage.getItem('email_to_verify');

    useEffect(() => {
        if (!email) {
            navigate('/login');
        }
    }, [email, navigate]);

    const handleVerify = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.post('verify-otp/', { email, otp });
            
            // 1. Success Toast
            toast.success("Email verified successfully! You can now login.");
            
            // 2. Cleanup and Redirect
            localStorage.removeItem('email_to_verify');
            navigate('/login'); 
        } catch (err) {
            // 3. Error Toast
            const errorMsg = err.response?.data?.error || "Invalid or expired OTP. Please try again.";
            toast.error(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-body">
            <div className="auth-container">
                <div className="auth-header">
                    <h2>Verify <span>Email</span></h2>
                    <p>Enter the 6-digit code sent to:<br/><strong>{email}</strong></p>
                </div>

                <form onSubmit={handleVerify}>
                    <div className="input-group">
                        <input 
                            type="text" 
                            maxLength="6"
                            placeholder="000000"
                            value={otp}
                            onChange={e => setOtp(e.target.value)}
                            className="otp-input-field"
                            style={{ 
                                textAlign: 'center', 
                                letterSpacing: '8px', 
                                fontSize: '1.8rem',
                                fontWeight: 'bold'
                            }}
                            required 
                        />
                    </div>
                    <button type="submit" className="auth-btn" disabled={loading}>
                        {loading ? "Verifying..." : "Verify & Activate Account"}
                    </button>
                </form>

                <div className="auth-footer">
                    <p>Didn't get a code? <span onClick={() => navigate('/register')} style={{color: '#007bff', cursor: 'pointer'}}>Try registering again</span></p>
                </div>
            </div>
        </div>
    );
};

export default VerifyOTP;
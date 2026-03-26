import React, { useState, useEffect } from 'react';
import api from '../api';
import { useNavigate } from 'react-router-dom';
import './Auth.css';

const VerifyOTP = () => {
    const [otp, setOtp] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const email = localStorage.getItem('email_to_verify');

    useEffect(() => {
        if (!email) navigate('/login');
    }, [email, navigate]);

    const handleVerify = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.post('verify-otp/', { email, otp });
            localStorage.removeItem('email_to_verify');
            navigate('/login'); // Success Redirect
        } catch (err) {
            alert("Invalid OTP");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-body">
            <div className="auth-container">
                <h2>Verify Email</h2>
                <p>Code sent to: <strong>{email}</strong></p>
                <form onSubmit={handleVerify}>
                    <input 
                        type="text" 
                        maxLength="6"
                        placeholder="000000"
                        onChange={e => setOtp(e.target.value)}
                        style={{ textAlign: 'center', letterSpacing: '8px', fontSize: '1.5rem' }}
                        required 
                    />
                    <button type="submit" disabled={loading}>
                        {loading ? "Verifying..." : "Verify & Login"}
                    </button>
                </form>
            </div>
        </div>
    );
};
export default VerifyOTP;
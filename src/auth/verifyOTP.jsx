import React, { useState, useEffect } from 'react';
import api from '../api';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import './Auth.css';

const VerifyOTP = () => {
    const [otp, setOtp] = useState('');
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [resending, setResending] = useState(false);
    const navigate = useNavigate();
    
    const email = localStorage.getItem('email_to_verify');

    useEffect(() => {
        if (!email) {
            navigate('/login');
        }
    }, [email, navigate]);

    const handleVerify = async (e) => {
        // Prevent page refresh
        if (e) e.preventDefault();
        setErrors({});

        // Frontend Validation
        if (!otp.trim()) {
            setErrors({ otp: "OTP is required" });
            return;
        } else if (otp.length < 4) {
            setErrors({ otp: "Enter the full code" });
            return;
        }

        setLoading(true);
        try {
            await api.post('verify-otp/', { email, otp });
            
            toast.success("Account activated! You can now login.");
            
            // Cleanup and Redirect
            localStorage.removeItem('email_to_verify');
            navigate('/login'); 
        } catch (err) {
            const errorMsg = err.response?.data?.error || "Invalid or expired OTP.";
            setErrors({ otp: errorMsg });
            toast.error(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    const handleResend = async () => {
        setResending(true);
        try {
            // Adjust endpoint to match your backend resend logic
            await api.post('resend-otp/', { email });
            toast.info("A new OTP has been sent to your email.");
        } catch (err) {
            toast.error("Failed to resend OTP. Please try again later.");
        } finally {
            setResending(false);
        }
    };

    return (
        <div className="auth-body">
            <div className="auth-container">
                <div className="auth-header">
                    <h2>Verify <span>Account</span></h2>
                    <span className="auth-subtitle">
                        Enter the code sent to:<br/>
                        <strong style={{ color: '#58a6ff' }}>{email}</strong>
                    </span>
                </div>

                <form onSubmit={handleVerify} noValidate>
                    <div className="input-group">
                        <input 
                            className={errors.otp ? 'input-error' : ''}
                            type="text" 
                            maxLength="6"
                            placeholder="000000"
                            value={otp}
                            onChange={e => {
                                setOtp(e.target.value.replace(/\D/g, '')); // Only allow numbers
                                if (errors.otp) setErrors({});
                            }}
                            style={{ 
                                textAlign: 'center', 
                                letterSpacing: '8px', 
                                fontSize: '1.8rem',
                                fontWeight: 'bold',
                                background: '#0d1117'
                            }}
                        />
                        {errors.otp && <span className="error-text" style={{ textAlign: 'center' }}>{errors.otp}</span>}
                    </div>

                    <button type="submit" className="auth-btn" disabled={loading}>
                        {loading ? "Verifying..." : "Activate Account"}
                    </button>
                </form>

                <div className="auth-footer">
                    <p>
                        Didn't get a code? {' '}
                        <span 
                            onClick={handleResend} 
                            style={{ color: '#58a6ff', cursor: 'pointer', fontWeight: 'bold' }}
                        >
                            {resending ? "Sending..." : "Resend OTP"}
                        </span>
                    </p>
                    <p style={{ marginTop: '10px', fontSize: '0.8rem' }}>
                        Wrong email? <span onClick={() => navigate('/register')} style={{ cursor: 'pointer' }}>Change it here</span>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default VerifyOTP;
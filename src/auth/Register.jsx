import React, { useState } from 'react';
import api from '../api';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify'; // Import toast
import './Auth.css';

const Register = () => {
    const [formData, setFormData] = useState({ username: '', email: '', password: '' });
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.post('register/', formData);
            
            // 1. Save the email for the verification step
            localStorage.setItem('email_to_verify', formData.email);
            
            // 2. Success Toast
            toast.success("OTP sent to your email!");
            
            // 3. Redirect
            navigate('/verify-otp');
        } catch (err) {
            // Check for specific backend errors (e.g., user already exists)
            const errorMsg = err.response?.data?.error || err.response?.data?.message || "Registration Failed";
            toast.error(errorMsg);
            console.error(err.response?.data);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-body">
            <div className="auth-container">
                <h2>Join <span>ProLeague</span></h2>
                <form onSubmit={handleSubmit}>
                    <div className="input-group">
                        <input 
                            type="text" 
                            placeholder="Username" 
                            onChange={e => setFormData({...formData, username: e.target.value})} 
                            required 
                        />
                    </div>
                    <div className="input-group">
                        <input 
                            type="email" 
                            placeholder="Email" 
                            onChange={e => setFormData({...formData, email: e.target.value})} 
                            required 
                        />
                    </div>
                    <div className="input-group">
                        <input 
                            type="password" 
                            placeholder="Password" 
                            onChange={e => setFormData({...formData, password: e.target.value})} 
                            required 
                        />
                    </div>
                    <button type="submit" className="auth-btn" disabled={loading}>
                        {loading ? "Sending OTP..." : "Create Account"}
                    </button>
                </form>
                <p className="auth-switch">
                    Already have an account? 
                    <span onClick={() => navigate('/login')}> Login here</span>
                </p>
            </div>
        </div>
    );
};

export default Register;
import React, { useState } from 'react';
import api from '../api';
import { useNavigate } from 'react-router-dom';
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
            
            // 1. SAVE the email to localStorage (VerifyOTP needs this)
            localStorage.setItem('email_to_verify', formData.email);
            
            // 2. Redirect immediately
            navigate('/verify-otp');
        } catch (err) {
            console.error(err.response?.data);
            alert("Registration Failed: " + JSON.stringify(err.response?.data || "Server Error"));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-body">
            <div className="auth-container">
                <h2>Join ProLeague</h2>
                <form onSubmit={handleSubmit}>
                    <input 
                        type="text" 
                        placeholder="Username" 
                        onChange={e => setFormData({...formData, username: e.target.value})} 
                        required 
                    />
                    <input 
                        type="email" 
                        placeholder="Email" 
                        onChange={e => setFormData({...formData, email: e.target.value})} 
                        required 
                    />
                    <input 
                        type="password" 
                        placeholder="Password" 
                        onChange={e => setFormData({...formData, password: e.target.value})} 
                        required 
                    />
                    <button type="submit" disabled={loading}>
                        {loading ? "Sending OTP..." : "Create Account"}
                    </button>
                </form>
                <p>Already have an account? <span onClick={() => navigate('/login')} style={{cursor:'pointer', color:'#007bff'}}>Login here</span></p>
            </div>
        </div>
    );
};

export default Register;
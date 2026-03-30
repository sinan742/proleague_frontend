import React, { useState } from 'react';
import api from '../api';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import './Auth.css';

const Register = () => {
    const [formData, setFormData] = useState({
        username: '', email: '', password: '', confirmPassword: ''
    });
    
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    // REGEX: Minimum 6 characters, at least 1 number, 1 special char
    const passwordRegex = /^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{6,}$/;
    
    // STRICT EMAIL REGEX: Ensures name@domain.extension format
    const strictEmailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    const validateForm = () => {
        let tempErrors = {};
        
        // Username Validation
        if (!formData.username.trim()) tempErrors.username = "Username is required";
        
        // Email Validation (Strict)
        if (!formData.email.trim()) {
            tempErrors.email = "Email is required";
        } else if (!strictEmailRegex.test(formData.email)) {
            tempErrors.email = "Please enter a valid email address";
        }
        
        // Password Validation
        if (!formData.password) {
            tempErrors.password = "Password is required";
        } else if (!passwordRegex.test(formData.password)) {
            tempErrors.password = "Min 6 chars, 1 number & 1 special char required";
        }

        // Confirm Password Validation
        if (formData.confirmPassword !== formData.password) {
            tempErrors.confirmPassword = "Passwords do not match";
        }

        setErrors(tempErrors);
        return Object.keys(tempErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        setLoading(true);
        try {
            await api.post('register/', {
                username: formData.username,
                email: formData.email,
                password: formData.password
            });
            
            localStorage.setItem('email_to_verify', formData.email);
            toast.success("Registration Successful! Verify OTP.");
            navigate('/verify-otp');
        } catch (err) {
            if (err.response && err.response.status === 400) {
                const serverErr = err.response.data;
                // Capture "Already Taken" errors from Django
                setErrors({
                    username: serverErr.username ? "Username already taken" : "",
                    email: serverErr.email ? "Email already registered" : ""
                });
            } else {
                toast.error("Something went wrong. Please try again.");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-body">
            <div className="auth-container">
                <h2>Join <span>ProLeague</span></h2>
                <span className="auth-subtitle">Create your account to start playing</span>
                
                <form onSubmit={handleSubmit} noValidate>
                    {/* Username Group */}
                    <div className="input-group">
                        <input 
                            className={errors.username ? 'input-error' : ''}
                            type="text" 
                            placeholder="Username" 
                            value={formData.username}
                            onChange={e => {
                                setFormData({...formData, username: e.target.value});
                                if(errors.username) setErrors({...errors, username: ""});
                            }} 
                        />
                        {errors.username && <span className="error-text">{errors.username}</span>}
                    </div>

                    {/* Email Group */}
                    <div className="input-group">
                        <input 
                            className={errors.email ? 'input-error' : ''}
                            type="email" 
                            placeholder="Email Address" 
                            value={formData.email}
                            onChange={e => {
                                setFormData({...formData, email: e.target.value});
                                if(errors.email) setErrors({...errors, email: ""});
                            }} 
                        />
                        {errors.email && <span className="error-text">{errors.email}</span>}
                    </div>

                    {/* Password Group */}
                    <div className="input-group">
                        <input 
                            className={errors.password ? 'input-error' : ''}
                            type="password" 
                            placeholder="Password (Min 6 chars, 1#, 1@)" 
                            value={formData.password}
                            onChange={e => {
                                setFormData({...formData, password: e.target.value});
                                if(errors.password) setErrors({...errors, password: ""});
                            }} 
                        />
                        {errors.password && <span className="error-text">{errors.password}</span>}
                    </div>

                    {/* Confirm Password Group */}
                    <div className="input-group">
                        <input 
                            className={errors.confirmPassword ? 'input-error' : ''}
                            type="password" 
                            placeholder="Confirm Password" 
                            value={formData.confirmPassword}
                            onChange={e => {
                                setFormData({...formData, confirmPassword: e.target.value});
                                if(errors.confirmPassword) setErrors({...errors, confirmPassword: ""});
                            }} 
                        />
                        {errors.confirmPassword && <span className="error-text">{errors.confirmPassword}</span>}
                    </div>

                    <button type="submit" className="auth-btn" disabled={loading}>
                        {loading ? "Creating Account..." : "Create Account"}
                    </button>
                </form>

                <div className="auth-footer">
                    Already a member? <span onClick={() => navigate('/login')}>Login here</span>
                </div>
            </div>
        </div>
    );
};

export default Register;
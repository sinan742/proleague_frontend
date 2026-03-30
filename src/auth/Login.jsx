import React, { useState } from 'react';
import api from '../api'; 
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import './Auth.css';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errors, setErrors] = useState({}); 
    const [loading, setLoading] = useState(false);
    
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        if (e) e.preventDefault();
        
        setErrors({}); 
        
        // Frontend Validation
        let tempErrors = {};
        if (!email.trim()) tempErrors.email = "Email is required";
        if (!password) tempErrors.password = "Password is required";

        if (Object.keys(tempErrors).length > 0) {
            setErrors(tempErrors);
            return;
        }

        setLoading(true);

        try {
            const response = await api.post('login/', { 
                email: email.trim(), 
                password: password 
            });
            
            const { is_admin } = response.data; 
            localStorage.setItem('is_admin', is_admin.toString());

            toast.success("Login successful!");

            if (is_admin) navigate('/admin-dashboard');
            else navigate('/'); 

        } catch (err) {
            if (err.response) {
                const status = err.response.status;
                const serverError = err.response.data.error || "Login failed";

                if (status === 404) {
                    setErrors({ email: serverError });
                    toast.error(serverError); // Toast for Email not found
                } else if (status === 401) {
                    setErrors({ password: serverError });
                    toast.error(serverError); // Toast for Incorrect Password
                } else {
                    toast.error(serverError);
                }
            } else {
                toast.error("Server connection failed.");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-body">
            <div className="auth-container">
                <h2>ProLeague <span>Login</span></h2>
                <span className="auth-subtitle">Athlete Authentication</span>
                
                <form noValidate>
                    {/* Email Field */}
                    <div className="input-group">
                        <input 
                            className={errors.email ? 'input-error' : ''}
                            type="email" 
                            placeholder="Email Address" 
                            value={email}
                            onChange={(e) => {
                                setEmail(e.target.value);
                                if (errors.email) setErrors(prev => ({ ...prev, email: "" }));
                            }} 
                        />
                        {errors.email && <span className="error-text">{errors.email}</span>}
                    </div>

                    {/* Password Field */}
                    <div className="input-group">
                        <input 
                            className={errors.password ? 'input-error' : ''}
                            type="password" 
                            placeholder="Password" 
                            value={password}
                            onChange={(e) => {
                                setPassword(e.target.value);
                                if (errors.password) setErrors(prev => ({ ...prev, password: "" }));
                            }} 
                        />
                        {errors.password && <span className="error-text">{errors.password}</span>}
                        
                        
                    </div>

                    <button 
                        type="button" 
                        className="auth-btn" 
                        disabled={loading}
                        onClick={handleLogin}
                    >
                        {loading ? "Checking..." : "Sign In"}
                    </button>
                </form>
                
                <div className="auth-footer">
                    <p>New to ProLeague? <span onClick={() => navigate('/register')}>Join Now</span></p>
                    <p>forgot password? <span onClick={() => navigate('/forgot-password')}>reset</span></p>

                </div>
                
            </div>
        </div>
    );
};

export default Login;
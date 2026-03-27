import React, { useState } from 'react';
import api from '../api'; 
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie'; 
import { toast } from 'react-toastify'; // 1. Import toast
import './Auth.css';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await api.post('login/', { email, password });
            
            const { access, is_admin } = response.data; 

            // Save Token to Cookies
            Cookies.set('access_token', access, { 
                expires: 1, 
                secure: true, 
                sameSite: 'strict' 
            });

            // Save Admin Status
            localStorage.setItem('is_admin', is_admin.toString());

            // 2. Success Toast
            toast.success(`Welcome back! ${is_admin ? 'Admin Access Granted.' : ''}`);

            // 3. Redirect using navigate for a better UX (or replace if you must refresh state)
            if (is_admin === true) {
                navigate('/admin-dashboard');
            } else {
                navigate('/'); 
            }

        } catch (err) {
            // 4. Error Toast
            const errorMsg = err.response?.data?.error || "Login failed. Check your credentials.";
            toast.error(errorMsg);
            console.error(err.response?.data);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-body">
            <div className="auth-container">
                <h2>ProLeague <span>Login</span></h2>
                
                <form onSubmit={handleLogin}>
                    <div className="input-group">
                        <input 
                            type="email" 
                            placeholder="Email" 
                            value={email}
                            onChange={(e) => setEmail(e.target.value)} 
                            required 
                        />
                    </div>
                    <div className="input-group">
                        <input 
                            type="password" 
                            placeholder="Password" 
                            value={password}
                            onChange={(e) => setPassword(e.target.value)} 
                            required 
                        />
                    </div>
                    <button type="submit" className="auth-btn" disabled={loading}>
                        {loading ? "Checking..." : "Sign In"}
                    </button>
                </form>
                
                <div className="auth-links">
                    <p>New to ProLeague? <span onClick={() => navigate('/register')} className="link-text">Create an account</span></p>
                    <p>Forgot password? <span onClick={() => navigate('/forgot-password')} className="link-text">Reset here</span></p>
                </div>
            </div>
        </div>
    );
};

export default Login;
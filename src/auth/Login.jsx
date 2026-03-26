import React, { useState } from 'react';
import api from '../api'; 
import { useNavigate } from 'react-router-dom';
import './Auth.css'; // Using the same CSS as Register

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            // 1. Send login request
            const response = await api.post('login/', { email, password });
            
            // 2. Extract admin status
            const isAdmin = response.data.is_admin; 

            // 3. Save for UI persistence (Navbar etc)
            localStorage.setItem('is_admin', isAdmin.toString());

            // 4. Redirect Logic based on role
            if (isAdmin === true) {
                navigate('/admin-dashboard'); 
            } else {
                navigate('/home'); 
            }

        } catch (err) {
            setError(err.response?.data?.error || "Login failed. Check credentials.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-body">
            <div className="auth-container">
                <h2>ProLeague Login</h2>
                
                {error && <p className="error-message" style={{ color: '#d9534f', backgroundColor: '#f9dfde', padding: '10px', borderRadius: '4px', fontSize: '13px' }}>{error}</p>}
                
                <form onSubmit={handleLogin}>
                    <input 
                        type="email" 
                        placeholder="Email" 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)} 
                        required 
                    />
                    <input 
                        type="password" 
                        placeholder="Password" 
                        value={password}
                        onChange={(e) => setPassword(e.target.value)} 
                        required 
                    />
                    <button type="submit" disabled={loading}>
                        {loading ? "Checking..." : "Sign In"}
                    </button>
                </form>
                
                <p>New to ProLeague? <span onClick={() => navigate('/register')} style={{color: '#007bff', cursor: 'pointer', fontWeight: 'bold'}}>Create an account</span></p>
                <p>Forgotpassword? <span onClick={() => navigate('/forgot-password')} style={{color: '#007bff', cursor: 'pointer', fontWeight: 'bold'}}>ForgotPassword</span></p>
                
                
            </div>
        </div>
    );
};

export default Login;
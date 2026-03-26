import React, { useState, useEffect } from 'react';
import api from '../api';
import './Profile.css';

const Profile = () => {
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        points: 0,
        role: ''
    });
    const [message, setMessage] = useState({ type: '', text: '' });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadProfile = async () => {
            try {
                const res = await api.get('profile/');
                setFormData({
                    username: res.data.username,
                    email: res.data.email,
                    points: res.data.points,
                    role: res.data.role
                });
            } catch (err) {
                setMessage({ type: 'error', text: 'Failed to load profile.' });
            } finally {
                setLoading(false);
            }
        };
        loadProfile();
    }, []);

    const handleUpdate = async (e) => {
        e.preventDefault();
        setMessage({ type: '', text: '' });
        try {
            await api.put('profile/', {
                username: formData.username,
                email: formData.email
            });
            setMessage({ type: 'success', text: 'Profile updated successfully!' });
        } catch (err) {
            setMessage({ type: 'error', text: 'Update failed. Username might be taken.' });
        }
    };

    if (loading) return <div className="loader">Loading...</div>;

    return (
        <div className="auth-body">
            <div className="auth-container profile-card">
                <h2>Account Settings</h2>
                
                {/* Points Summary Section */}
                <div className="profile-stats">
                    <div className="stat-item">
                        <label>Total Rewards</label>
                        <p className="points-text">🪙 {formData.points} Points</p>
                    </div>
                    <div className="stat-item">
                        <label>Account Type</label>
                        <p className="role-text">{formData.role}</p>
                    </div>
                </div>

                {message.text && (
                    <p className={message.type === 'success' ? 'status-success' : 'status-error'}>
                        {message.text}
                    </p>
                )}

                <form onSubmit={handleUpdate}>
                    <div className="input-group">
                        <label>Username</label>
                        <input 
                            type="text" 
                            value={formData.username} 
                            onChange={(e) => setFormData({...formData, username: e.target.value})}
                            required
                        />
                    </div>

                    <div className="input-group">
                        <label>Email Address</label>
                        <input 
                            type="email" 
                            value={formData.email} 
                            onChange={(e) => setFormData({...formData, email: e.target.value})}
                            required
                        />
                    </div>

                    <button type="submit" className="auth-btn">Save Changes</button>
                </form>
            </div>
        </div>
    );
};

export default Profile;
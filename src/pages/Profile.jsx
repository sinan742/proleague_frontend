import React, { useState, useEffect } from 'react';
import api from '../api';
import { toast } from 'react-toastify';
import './Profile.css';

const Profile = () => {
    const [userData, setUserData] = useState(null);
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
    });
    const [imageFile, setImageFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);

    useEffect(() => {
        api.get('profile/')
            .then(res => {
                setUserData(res.data);
                setFormData({ 
                    username: res.data.username, 
                    email: res.data.email, 
                    password: '' 
                });
                setPreview(res.data.profile_image);
                setFetching(false);
            })
            .catch(() => {
                toast.error("Access Denied. Please log in.");
                setFetching(false);
            });
    }, []);

    const handleUpdate = async (e) => {
        e.preventDefault();
        setLoading(true);

        const data = new FormData();
        data.append('username', formData.username);
        data.append('email', formData.email);
        if (formData.password) data.append('password', formData.password);
        if (imageFile) data.append('profile_image', imageFile);

        try {
            const res = await api.put('profile/', data, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            toast.success("Profile Synced with League!");
            setPreview(res.data.profile_image);
            setFormData(prev => ({ ...prev, password: '' }));
        } catch (err) {
            toast.error("Failed to update profile.");
        } finally {
            setLoading(false);
        }
    };

    if (fetching) return <div className="lp-loading-screen">SYNCING LEAGUE DATA...</div>;

    return (
        <div className="lp-body-wrapper">
            <div className="lp-profile-card">
                <h2 className="lp-title"> <span>Profile</span></h2>

                <div className="lp-stats-container">
                    <div className="lp-stat-box">
                        <span className="lp-stat-label">League Role</span>
                        <p className="lp-role-val">{userData?.role || 'Player'}</p>
                    </div>
                    <div className="lp-stat-box">
                        <span className="lp-stat-label">Current Points</span>
                        <p className="lp-points-val">{userData?.points || 0} PTS</p>
                    </div>
                </div>

                <form onSubmit={handleUpdate}>
                    <div className="lp-image-group">
                        <label htmlFor="lp-avatar-upload">
                            <img 
                                src={preview || '/default-avatar.png'} 
                                alt="Athlete" 
                                className="lp-avatar-preview" 
                            />
                        </label>
                        <input 
                            id="lp-avatar-upload"
                            type="file" 
                            accept="image/*" 
                            style={{ display: 'none' }}
                            onChange={(e) => {
                                const file = e.target.files[0];
                                if (file) {
                                    setImageFile(file);
                                    setPreview(URL.createObjectURL(file));
                                }
                            }} 
                        />
                        <p style={{ color: '#94a3b8', fontSize: '0.7rem', marginTop: '10px' }}>
                            Tap image to change avatar
                        </p>
                    </div>

                    <div className="lp-input-field-group">
                        <label>Username</label>
                        <input 
                            type="text" 
                            value={formData.username} 
                            onChange={e => setFormData({...formData, username: e.target.value})} 
                        />
                    </div>

                    <div className="lp-input-field-group">
                        <label>Registered Email</label>
                        <input 
                            type="email" 
                            value={formData.email} 
                            onChange={e => setFormData({...formData, email: e.target.value})} 
                        />
                    </div>

                    <div className="lp-input-field-group">
                        <label>Security (New Password)</label>
                        <input 
                            type="password" 
                            placeholder="Keep empty to leave unchanged"
                            value={formData.password} 
                            onChange={e => setFormData({...formData, password: e.target.value})} 
                        />
                    </div>

                    <button type="submit" className="lp-submit-btn" disabled={loading}>
                        {loading ? "Updating..." : "Update Profile"}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Profile;
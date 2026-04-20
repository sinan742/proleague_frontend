import React, { useState, useEffect } from 'react';
import api from '../api';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import './Profile.css';
import FootballLoader from '../FootballLoader';

const Profile = () => {
    const navigate = useNavigate();
    const [userData, setUserData] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [notifEnabled, setNotifEnabled] = useState(true);
    const [formData, setFormData] = useState({ username: '', email: '', password: '' });
    const [errors, setErrors] = useState({});
    const [imageFile, setImageFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);

    const strictEmailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    const passwordRegex = /^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{6,}$/;

    useEffect(() => {
        api.get('profile/')
            .then(res => {
                setUserData(res.data);
                setFormData({ username: res.data.username, email: res.data.email, password: '' });
                setPreview(res.data.profile_image);
                setFetching(false);
            })
            .catch(() => setFetching(false));
    }, []);

    const validate = () => {
        let newErrors = {};
        if (!strictEmailRegex.test(formData.email)) newErrors.email = "Invalid league email.";
        if (formData.password && !passwordRegex.test(formData.password)) newErrors.password = "Security criteria not met.";
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        if (!validate()) return;
        setLoading(true);
        const data = new FormData();
        data.append('username', formData.username);
        data.append('email', formData.email);
        if (formData.password) data.append('password', formData.password);
        if (imageFile) data.append('profile_image', imageFile);

        try {
            const res = await api.put('profile/', data, { headers: { 'Content-Type': 'multipart/form-data' } });
            setUserData(res.data);
            setPreview(res.data.profile_image);
            setIsEditing(false);
            toast.success("Profile Updated!");
        } catch (err) { toast.error("Update failed."); } 
        finally { setLoading(false); }
    };

    const handleLogout = async () => {
        try {
            // Using the logout API endpoint
            await api.post('logout/');
            localStorage.clear();
            navigate('/login');
        } catch (err) {
            localStorage.clear();
            navigate('/login');
        }
    };

    if (fetching) return <div className="lp-loading-wrap"><FootballLoader message='profile...'/></div>;

    return (
        <div className="lp-page-container">
            <div className="lp-main-card">
                {/* Profile Hero */}
                <div className="lp-top-hero">
                    <div className="lp-pfp-container">
                        <img src={preview || '/default-avatar.png'} alt="User" className="lp-pfp-img" />
                        {isEditing && (
                            <label className="lp-pfp-edit">
                                📷 <input type="file" hidden onChange={(e) => {
                                    const file = e.target.files[0];
                                    if (file) { setImageFile(file); setPreview(URL.createObjectURL(file)); }
                                }} />
                            </label>
                        )}
                    </div>
                    <h2 className="lp-display-name">{userData?.username}</h2>
                    <span className="lp-tag-gold">{userData?.role || 'Elite Athlete'}</span>
                </div>

                {/* Score Stats */}
                <div className="lp-stats-row">
                    <div className="lp-stat-item">
                        <small>BALANCE</small>
                        <strong>{userData?.points || 0} PTS</strong>
                    </div>
                    <button className="lp-edit-btn" onClick={() => setIsEditing(!isEditing)}>
                        {isEditing ? "CANCEL" : "EDIT PROFILE"}
                    </button>
                </div>

                {isEditing ? (
                    <form className="lp-edit-form slide-in" onSubmit={handleUpdate}>
                        <div className="lp-field">
                            <label>Username</label>
                            <input type="text" value={formData.username} onChange={e => setFormData({ ...formData, username: e.target.value })} />
                        </div>
                        <div className="lp-field">
                            <label>Email</label>
                            <input type="email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} />
                            {errors.email && <span className="lp-error-txt">{errors.email}</span>}
                        </div>
                        <div className="lp-field">
                            <label>Update Password</label>
                            <input type="password" placeholder="Leave empty if no change" value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} />
                            {errors.password && <span className="lp-error-txt">{errors.password}</span>}
                        </div>
                        <button type="submit" className="lp-save-button" disabled={loading}>
                            {loading ? "SAVING..." : "SAVE PROFILE"}
                        </button>
                    </form>
                ) : (
                    <div className="lp-action-menu slide-in">
                        {/* PHOTO STYLE TOGGLE */}
                        <div className="lp-menu-link lp-toggle-item">
                            <div className="lp-link-left">
                                <span className="lp-icon">🔔</span> Notification Settings
                            </div>
                            <label className="lp-switch-photo">
                                <input 
                                    type="checkbox" 
                                    checked={notifEnabled} 
                                    onChange={() => setNotifEnabled(!notifEnabled)} 
                                />
                                <span className="lp-slider-photo"></span>
                            </label>
                        </div>

                        <button className="lp-menu-link" onClick={() => navigate('/booking-history')}>
                            <div className="lp-link-left"><span className="lp-icon">🎟️</span> Booking History</div>
                        </button>
                        
                        <button className="lp-menu-link" onClick={() => navigate('/reward-history')}>
                            <div className="lp-link-left"><span className="lp-icon">🎁</span> Reward History</div>
                        </button>

                        <button className="lp-menu-link" onClick={() => navigate('/ask-ai')}>
                            <div className="lp-link-left"><span className="lp-icon">💬</span>Ask Help</div>
                        </button>
                        <button className="lp-menu-link" onClick={() => navigate('/privacy-policy')}>
                            <div className="lp-link-left"><span className="lp-icon">🔒</span>Privacy Policy</div>
                        </button>
                        <button className="lp-menu-link" onClick={() => navigate('/contact')}>
                            <div className="lp-link-left"><span className="lp-icon">📞</span> Contact Us</div>
                        </button>

                        <button className="lp-menu-link lp-logout-btn" onClick={handleLogout}>
                            <div className="lp-link-left"><span className="lp-icon">🚪</span> Sign Out</div>
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Profile;
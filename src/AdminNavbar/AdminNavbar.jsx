import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import api from '../api';
import { toast } from 'react-toastify';
import './AdminNavbar.css';

const AdminNavbar = () => {
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            await api.post('logout/');
            localStorage.removeItem('is_admin');
            toast.success("Admin Session Ended");
            navigate('/login');
        } catch (err) {
            toast.error("Logout failed. Please try again.");
        }
    };

    return (
        <nav className="an-sidebar">
            <div className="an-logo-section">
                <h2 className="an-logo">PRO<span>LEAGUE</span></h2>
                <span className="an-badge">Admin Panel</span>
            </div>

            <ul className="an-nav-list">
                <li>
                    <NavLink to="/admin-dashboard" className={({ isActive }) => isActive ? "an-link active" : "an-link"}>
                        <span className="an-icon">📊</span> Dashboard
                    </NavLink>
                </li>
                <li>
                    <NavLink to="/admin-teams-management" className={({ isActive }) => isActive ? "an-link active" : "an-link"}>
                        <span className="an-icon">🛡️</span> Manage Teams
                    </NavLink>
                </li>
                <li>
                    <NavLink to="/admin-players-management" className={({ isActive }) => isActive ? "an-link active" : "an-link"}>
                        <span className="an-icon">👤</span> Manage Players
                    </NavLink>
                </li>

                <li>
                    <NavLink to="/admin-match-shedule" className={({ isActive }) => isActive ? "an-link active" : "an-link"}>
                        <span className="an-icon">⚽</span> Match Shedule
                    </NavLink>
                </li>
                
                <li>
                    <NavLink to="/admin-matches-management" className={({ isActive }) => isActive ? "an-link active" : "an-link"}>
                        <span className="an-icon">⚽</span> Match Management
                    </NavLink>
                </li>
            </ul>

            <div className="an-bottom-section">
                <button onClick={handleLogout} className="an-logout-btn">
                    <span className="an-icon">🚪</span> Sign Out
                </button>
            </div>
        </nav>
    );
};

export default AdminNavbar;
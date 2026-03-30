// AdminDashboard.jsx
import React, { useState, useEffect } from 'react';
import api from '../api'; // Your axios instance
import AdminNavbar from '../AdminNavbar/AdminNavbar';
import FootballLoader from '../FootballLoader';
import './AdminDashboard.css'
const AdminDashboard = () => {
    const [stats, setStats] = useState({ players_count: 0, teams_count: 0 });
    const [loading, setLoading] = useState(true);

    // This function "updates" the data by fetching it from the server
    const refreshDashboard = async () => {
        try {
            const res = await api.get('admin-dashboard/');
            setStats(res.data);
            setLoading(false);
        } catch (err) {
            console.error("Error updating dashboard:", err);
            setLoading(false);
        }
    };

    useEffect(() => {
        refreshDashboard();
    }, []);

    if (loading) return <FootballLoader />;

    return (
        <div style={{ display: 'flex' }}>
            <AdminNavbar />
            <main className="ad-main-content" style={{ marginLeft: '260px', flex: 1 }}>
                <div className="ad-header">
                    <h1>Dashboard <span>Update</span></h1>
                    <button onClick={refreshDashboard} className="ad-btn-secondary">
                        🔄 Refresh Stats
                    </button>
                </div>

                <div className="ad-stats-grid">
                    {/* The UI now updates dynamically based on the 'stats' state */}
                    <div className="ad-stat-card">
                         

                        <div className="ad-stat-info">
                            <h3>Total Users</h3>
                            <p className="ad-stat-number">{stats.users_count}</p>
                        </div>
                    </div>
                    <div className="ad-stat-card">
                        <div className="ad-stat-info">
                            <h3>Total Players</h3>
                            <p className="ad-stat-number">{stats.players_count}</p>
                        </div>
                        </div>


                    <div className="ad-stat-card">
                        <div className="ad-stat-info">
                            <h3>Active Teams</h3>
                            <p className="ad-stat-number">{stats.teams_count}</p>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default AdminDashboard
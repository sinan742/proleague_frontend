import React, { useState, useEffect } from 'react';
import api from '../api';
import AdminNavbar from '../AdminNavbar/AdminNavbar';
import FootballLoader from '../FootballLoader';
import './AdminDashboard.css';

const AdminDashboard = () => {
    const [stats, setStats] = useState({ users_count: 0, players_count: 0, teams_count: 0 });
    const [loading, setLoading] = useState(true);

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
        <div className="pro-adm-dashboard-layout">
            <AdminNavbar />
            
            <main className="pro-adm-content-area">
                <div className="pro-adm-top-bar">
                    <div className="pro-adm-title">
                        <h1>Admin <span>Insights</span></h1>
                        <p>Real-time tournament statistics</p>
                    </div>
                    <button onClick={refreshDashboard} className="pro-adm-refresh-btn">
                         Refresh Stats
                    </button>
                </div>

                <div className="pro-adm-stats-container">
                    {/* User Stats */}
                    <div className="pro-adm-stat-box user-accent">
                        <div className="pro-adm-stat-details">
                            <h3>Total Users</h3>
                            <p className="pro-adm-stat-val">{stats.users_count}</p>
                        </div>
                    </div>

                    {/* Player Stats */}
                    <div className="pro-adm-stat-box player-accent">
                        <div className="pro-adm-stat-details">
                            <h3>Total Players</h3>
                            <p className="pro-adm-stat-val">{stats.players_count}</p>
                        </div>
                    </div>

                    {/* Team Stats */}
                    <div className="pro-adm-stat-box team-accent">
                        <div className="pro-adm-stat-details">
                            <h3>Active Teams</h3>
                            <p className="pro-adm-stat-val">{stats.teams_count}</p>
                        </div>
                    </div>
                </div>

                <div className="pro-adm-footer-info">
                    <p>© 2026 ProLeague Admin Portal </p>
                </div>
            </main>
        </div>
    );
};

export default AdminDashboard;
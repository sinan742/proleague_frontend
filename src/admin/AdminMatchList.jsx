import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import AdminNavbar from '../AdminNavbar/AdminNavbar';
import FootballLoader from '../FootballLoader';
import './AdminMatchList.css';

const AdminMatchList = () => {
    const [matches, setMatches] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        api.get('admin-matches/')
            .then(res => {
                setMatches(res.data);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, []);

    // Function to handle Status Badge Color
    const getStatusClass = (status) => {
        switch (status?.toLowerCase()) {
            case 'live': return 'status-live';
            case 'completed': return 'status-done';
            default: return 'status-upcoming';
        }
    };

    if (loading) return <FootballLoader message="Fetching Fixtures..." />;

    return (
        <div className="aml-layout">
            <AdminNavbar />
            <div className="aml-content">
                <header className="aml-header">
                    <h2>Tournament <span>Fixtures</span></h2>
                    <p>Manage real-time match controls and scores</p>
                </header>

                <div className="aml-grid">
                    {matches.length > 0 ? matches.map(m => (
                        <div key={m.id} className="aml-card">
                            <div className="aml-card-top">
                                <span className={`aml-status-badge ${getStatusClass(m.status)}`}>
                                    {m.status || 'Scheduled'}
                                </span>
                                {/* <span className="aml-date">{new Date(m.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</span> */}
                            </div>

                            <div className="aml-match-display">
                                <div className="aml-team">
                                    <img src={m.home_team_logo || '/default-logo.png'} alt="home" />
                                    <span className="aml-team-name">{m.home_team_name}</span>
                                </div>

                                <div className="aml-vs-box">
                                    {m.status?.toLowerCase() === 'upcoming' ? (
                                        <span className="aml-vs-text">VS</span>
                                    ) : (
                                        <span className="aml-score">{m.home_score} - {m.away_score}</span>
                                    )}
                                </div>

                                <div className="aml-team">
                                    <img src={m.away_team_logo || '/default-logo.png'} alt="away" />
                                    <span className="aml-team-name">{m.away_team_name}</span>
                                </div>
                            </div>

                            <div className="aml-card-footer">
                                <button 
                                    className="aml-control-btn"
                                    onClick={() => navigate(`/admin/match/${m.id}`)}
                                >
                                    Control Match
                                </button>
                            </div>
                        </div>
                    )) : (
                        <div className="aml-empty">No matches scheduled yet.</div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminMatchList;
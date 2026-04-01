import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import AdminNavbar from '../AdminNavbar/AdminNavbar';
import './AdminMatchList.css';

const AdminMatchList = () => {
    const [matches, setMatches] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        api.get('admin-matches/').then(res => setMatches(res.data));
    }, []);

    return (
        <div className="ml-layout">
            <AdminNavbar />
            <div className="ml-content">
                <h2>Match <span>Fixtures</span></h2>
                <div className="ml-grid">
                    {matches.map(m => (
                        <div key={m.id} className="ml-card">
                            <div className="ml-teams">
                                <span>{m.home_team_name}</span>
                                <small>vs</small>
                                <span>{m.away_team_name}</span>
                            </div>
                            <button 
                                className="ml-control-btn"
                                onClick={() => navigate(`/admin/match/${m.id}`)}
                            >
                                Control Match
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default AdminMatchList;
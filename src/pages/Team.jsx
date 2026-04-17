import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import './Team.css';
import FootballLoader from '../FootballLoader';

const Team = () => {
    const [teams, setTeams] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTeams = async () => {
            try {
                const res = await api.get('teams/');
                setTeams(res.data);
            } catch (err) {
                console.error("Error fetching teams:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchTeams();
    }, []);

    if (loading) return <div className="tm-loader-wrap"><FootballLoader/></div>;

    return (
        <div className="tm-page-container">
            <header className="tm-main-header">
                <div className="tm-header-content">
                    <h1>League <span>Teams</span></h1>
                    <p>Experience the passion of ProLeague's elite football clubs.</p>
                </div>
            </header>

            <div className="tm-grid-layout">
                {teams.map((team) => (
                    <div key={team.id} className="tm-card-item">
                        {/* Top Accent Strip - Defaults to Dark Green, no blue */}
                        <div 
                            className="tm-top-accent" 
                            style={{ backgroundColor: team.primary_color || '#1B5E20' }}
                        ></div>
                        
                        <div className="tm-card-body">
                            <div className="tm-logo-container">
                                <img src={team.logo} alt={team.name} className="tm-club-logo" />
                            </div>
                            
                            <h2 className="tm-club-name">{team.name}</h2>
                            <p className="tm-club-loc">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 1118 0z" />
                                    <circle cx="12" cy="10" r="3" />
                                </svg>
                                {team.location || 'Stadium Grounds'}
                            </p>

                            <div className="tm-stats-box">
                                <div className="tm-stat-item">
                                    <span className="tm-stat-label">Manager</span>
                                    <span className="tm-stat-value">{team.coach_name}</span>
                                </div>
                                <div className="tm-divider"></div>
                                <div className="tm-stat-item">
                                    <span className="tm-stat-label">Home Ground</span>
                                    <span className="tm-stat-value">{team.stadium}</span>
                                </div>
                            </div>

                            <Link to={`/teams/${team.id}/`} className="tm-squad-link">
                                View Club Squad
                            </Link>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Team;
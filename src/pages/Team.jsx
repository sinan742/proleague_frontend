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

    if (loading) return <div className="loader"><FootballLoader/></div>;

    return (
        <div className="teams-page">
            <header className="teams-header">
                <h1>League <span>Teams</span></h1>
                <p>Explore the clubs competing in the ProLeague season.</p>
            </header>

            <div className="teams-grid">
                {teams.map((team) => (
                    <div key={team.id} className="team-card">
                        {/* Top Color Strip using your backend primary_color */}
                        <div 
                            className="team-color-strip" 
                            style={{ backgroundColor: team.primary_color || '#007bff' }}
                        ></div>
                        
                        <div className="team-card-content">
                            <img src={team.logo} alt={team.name} className="team-logo-main" />
                            
                            <h2 className="team-name">{team.name}</h2>
                            <p className="team-location">📍 {team.location || 'League City'}</p>

                            <div className="team-info-mini">
                                <div className="info-item">
                                    <span className="label">Coach</span>
                                    <span className="value">{team.coach_name}</span>
                                </div>
                                <div className="info-item">
                                    <span className="label">Stadium</span>
                                    <span className="value">{team.stadium}</span>
                                </div>
                            </div>

                            <Link to={`/teams/${team.id}/`} className="view-squad-btn">
                                View Full Squad
                            </Link>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Team;
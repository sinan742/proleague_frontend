import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import './Match.css';
import FootballLoader from '../FootballLoader';

const Match = () => {
    const [matches, setMatches] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get('matches/').then(res => {
            setMatches(res.data);
            setLoading(false);
        });

    }, []);

    if (loading) return <div className="barca-loader"><FootballLoader/></div>;

    return (
        <div className="match-page-container">
            <header className="match-header">
                <h1>Match <span>Center</span></h1>
                <p>Track every goal and every victory in the league.</p>
            </header>

            <div className="match-list-grid">
                {matches.map(m => (
                    <Link to={`/matches/${m.id}`} key={m.id} className={`match-card ${m.is_completed ? 'finished' : 'upcoming'}`}>
                        <div className="match-date-info">
                            <span>{new Date(m.match_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}</span>
                            <span className="match-venue">{m.stadium}</span>
                        </div>

                        <div className="match-main-row">
                            <div className="team-entry home">
                                <span className="team-name">{m.home_team_name}</span>
                                <img src={m.home_team_logo} alt="Home" />
                            </div>

                            <div className="score-box">
                                {m.status=='finished' || 'half_time' ? (
                                    <span className="final-score">{m.home_score} - {m.away_score}</span>
                                ) : (
                                    <span className="match-time">VS</span>
                                )}
                            </div>

                            <div className="team-entry away">
                                <img src={m.away_team_logo} alt="Away" />
                                <span className="team-name">{m.away_team_name}</span>
                            </div>
                        </div>

                        <div className="match-footer">
                            <span className="status-tag">
                                {m.status}
                            </span>
                            <span className="view-details">View Match Center →</span>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
};

export default Match;
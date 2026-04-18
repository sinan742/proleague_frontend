import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../api';
import './Match.css';
import FootballLoader from '../FootballLoader';

const Match = () => {
    const [matches, setMatches] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isLogged] = useState(localStorage.hasOwnProperty('is_admin') || localStorage.hasOwnProperty('access'));
    const navigate = useNavigate();

    useEffect(() => {
        api.get('matches/').then(res => {
            setMatches(res.data);
            setLoading(false);
        }).catch(err => {
            console.error("Error fetching matches", err);
            setLoading(false);
        });
    }, []);

    const handleAction = (e, matchId, path, isScheduled) => {
        e.preventDefault(); 
        if (!isLogged) {
            toast.error("Please Login first! ⚽");
            return;
        }
        if (!isScheduled) {
            toast.warning("Action locked for this match status.");
            return;
        }
        navigate(`${path}/${matchId}`);
    };

    if (loading) return <div className="pl-loader-wrap"><FootballLoader/></div>;

    return (
        <div className="pl-match-page">
            <header className="pl-main-header">
                <h1>Match <span>Center</span></h1>
                <p>ProLeague Tournament | Season 2026</p>
            </header>

            <div className="pl-list-container">
                {matches.map(m => {
                    const isScheduled = m.status.toLowerCase() === 'scheduled';
                    const color1 = m.home_team_color || '#1B5E20';
                    const color2 = m.away_team_color || '#0a2e0c';

                    return (
                        <div key={m.id} className="pl-match-row">
                            {/* MAIN CARD COMPONENT */}
                            <Link 
                                to={`/matches/${m.id}`} 
                                className="pl-card-body"
                                style={{ background: `linear-gradient(90deg, ${color1} 0%, ${color2} 100%)` }}
                            >
                                {/* HOME TEAM - Left Aligned */}
                                <div className="pl-team-side pl-home">
                                    <img src={m.home_team_logo} alt="" className="pl-club-logo" />
                                    <div className="pl-team-name-box">
                                        <span className="pl-team-name">{m.home_team_name}</span>
                                    </div>
                                </div>

                                {/* SCORE/STATUS CENTER */}
                                <div className="pl-center-info">
                                    <span className="pl-status-label">{m.status.replace('_', ' ')}</span>
                                    <div className="pl-score-val">
                                        {m.status === 'scheduled' ? 'VS' : `${m.home_score} - ${m.away_score}`}
                                    </div>
                                    <div className="pl-meta-info">
                                        <p>{new Date(m.match_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}</p>
                                        <p className="pl-venue-text">{m.stadium}</p>
                                    </div>
                                </div>

                                {/* AWAY TEAM - Right Aligned */}
                                <div className="pl-team-side pl-away">
                                    <div className="pl-team-name-box">
                                        <span className="pl-team-name">{m.away_team_name}</span>
                                    </div>
                                    <img src={m.away_team_logo} alt="" className="pl-club-logo" />
                                </div>
                            </Link>

                            {/* RED SIDE ACTION PANEL */}
                            <div className="pl-action-side">
                                <button 
                                    className={`pl-side-btn ${!isScheduled ? 'pl-btn-lock' : ''}`}
                                    onClick={(e) => handleAction(e, m.id, '/predictions', isScheduled)}
                                >
                                    Predict
                                </button>
                                <div className="pl-side-divider"></div>
                                <button 
                                    className={`pl-side-btn ${!isScheduled ? 'pl-btn-lock' : ''}`}
                                    onClick={(e) => handleAction(e, m.id, '/book-ticket', isScheduled)}
                                >
                                    Tickets
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default Match;
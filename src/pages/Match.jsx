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

    // Helper to stop propagation and check Auth
    const checkAuthAndAction = (e, action) => {
        e.preventDefault(); // Prevents the <Link> card click
        if (!isLogged) {
            toast.error("Please Login first! ⚽");
            return false;
        }
        return true;
    };

    const handlePredictClick = (e, matchId, isScheduled) => {
        if (!checkAuthAndAction(e)) return;
        if (!isScheduled) {
            toast.warning("Prediction locked. Match started/finished.");
            return;
        }
        navigate(`/predictions/${matchId}`);
    };

    const handleTicketClick = (e, matchId, isScheduled) => {
        if (!checkAuthAndAction(e)) return;
        if (!isScheduled) {
            toast.warning("Booking closed for this match.");
            return;
        }
        // Navigates to the booking page with the ID param
        navigate(`/book-ticket/${matchId}`);
    };

    if (loading) return <div className="barca-loader"><FootballLoader/></div>;

    return (
        <div className="match-page-container">
            <header className="match-header">
                <h1>Match <span>Center</span></h1>
                <p>Predict scores or book your stadium seats.</p>
            </header>

            <div className="match-list-grid">
                {matches.map(m => {
                    const isScheduled = m.status.toLowerCase() === 'scheduled';
                    
                    return (
                        <Link to={`/matches/${m.id}`} key={m.id} className={`match-card ${m.status.toLowerCase()}`}>
                            <div className="match-date-info">
                                <span>{new Date(m.match_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}</span>
                                <span className="match-venue">{m.stadium}</span>
                            </div>

                            <div className="match-main-row">
                                <div className="team-entry home">
                                    <span className="team-name">{m.home_team_name}</span>
                                    <img src={m.home_team_logo} alt="Home Team" />
                                </div>

                                <div className="score-box">
                                    {m.status === 'finished' || m.status === 'half_time' ? (
                                        <span className="final-score">{m.home_score} - {m.away_score}</span>
                                    ) : (
                                        <span className="match-time">VS</span>
                                    )}
                                </div>

                                <div className="team-entry away">
                                    <img src={m.away_team_logo} alt="Away Team" />
                                    <span className="team-name">{m.away_team_name}</span>
                                </div>
                            </div>

                            <div className="match-footer">
                                <div className="footer-left">
                                    <span className={`status-tag ${m.status.toLowerCase()}`}>
                                        {m.status.replace('_', ' ')}
                                    </span>
                                </div>

                                <div className="footer-right">
                                    {/* PREDICT BUTTON */}
                                    <button 
                                        className={`action-btn predict-btn ${!isScheduled ? 'disabled' : ''}`}
                                        onClick={(e) => handlePredictClick(e, m.id, isScheduled)}
                                    >
                                        Predict
                                    </button>

                                    {/* TICKET BUTTON */}
                                    <button 
                                        className={`action-btn ticket-btn ${!isScheduled ? 'disabled' : ''}`}
                                        onClick={(e) => handleTicketClick(e, m.id, isScheduled)}
                                    >
                                        Tickets 🎫
                                    </button>
                                </div>
                            </div>
                        </Link>
                    );
                })}
            </div>
        </div>
    );
};

export default Match;
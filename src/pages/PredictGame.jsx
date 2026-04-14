import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../api';
import './PredictGame.css';

const PredictGame = () => {
    const { matchId } = useParams();
    const navigate = useNavigate();
    
    const [match, setMatch] = useState(null);
    const [players, setPlayers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    const [guess, setGuess] = useState({ home: 0, away: 0 });
    const [selectedHomeScorers, setSelectedHomeScorers] = useState([]);
    const [selectedAwayScorers, setSelectedAwayScorers] = useState([]);

    useEffect(() => {
        const fetchGameData = async () => {
            try {
                const [matchRes, playerRes] = await Promise.all([
                    api.get(`/matches/${matchId}/`),
                    api.get('/players/') 
                ]);
                setMatch(matchRes.data);
                setPlayers(playerRes.data);
            } catch (err) {
                toast.error("Failed to load match data");
            } finally {
                setLoading(false);
            }
        };
        fetchGameData();
    }, [matchId]);

    // Handle Checkbox Ticks
    const handleTick = (playerId, teamType) => {
        if (teamType === 'home') {
            if (selectedHomeScorers.includes(playerId)) {
                setSelectedHomeScorers(selectedHomeScorers.filter(id => id !== playerId));
            } else if (selectedHomeScorers.length < guess.home) {
                setSelectedHomeScorers([...selectedHomeScorers, playerId]);
            } else {
                toast.info(`You predicted ${guess.home} goals for ${match.home_team_name}. Uncheck one to change.`);
            }
        } else {
            if (selectedAwayScorers.includes(playerId)) {
                setSelectedAwayScorers(selectedAwayScorers.filter(id => id !== playerId));
            } else if (selectedAwayScorers.length < guess.away) {
                setSelectedAwayScorers([...selectedAwayScorers, playerId]);
            } else {
                toast.info(`You predicted ${guess.away} goals for ${match.away_team_name}.`);
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        const payload = {
            match: matchId,
            home_score_guess: parseInt(guess.home),
            away_score_guess: parseInt(guess.away),
            home_scorers: selectedHomeScorers, // Sending arrays now
            away_scorers: selectedAwayScorers
        };

        try {
            await api.post('my-predictions/', payload);
            toast.success("Predictions Locked! ⚽");
            setTimeout(() => navigate('/matches'), 2000);
        } catch (err) {
            toast.error(err.response?.data?.error || "Submission failed");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) return <div className="predict-loading">Opening the locker room...</div>;

    const homeTeamPlayers = players.filter(p => p.team === match?.home_team);
    const awayTeamPlayers = players.filter(p => p.team === match?.away_team);

    return (
        <div className="predict-game-card">
            <header className="predict-header">
                <h2>Match Prediction</h2>
            </header>
            
            <form onSubmit={handleSubmit}>
                <div className="score-input-section">
                    <div className="team-input">
                        <img src={match.home_team_logo} alt="" />
                        <input type="number" min="0" value={guess.home} onChange={(e) => {setGuess({...guess, home: e.target.value}); setSelectedHomeScorers([]);}} />
                        <label>{match.home_team_name}</label>
                    </div>
                    <div className="vs">VS</div>
                    <div className="team-input">
                        <img src={match.away_team_logo} alt="" />
                        <input type="number" min="0" value={guess.away} onChange={(e) => {setGuess({...guess, away: e.target.value}); setSelectedAwayScorers([]);}} />
                        <label>{match.away_team_name}</label>
                    </div>
                </div>

                <div className="scorer-selection-area">
                    {/* Home Scorers List */}
                    <div className="scorer-list">
                        <h4>{match.home_team_name} Scorers (Pick {guess.home})</h4>
                        <div className="players-scroll">
                            {homeTeamPlayers.map(p => (
                                <div key={p.id} className={`player-tick ${selectedHomeScorers.includes(p.id) ? 'active' : ''}`} onClick={() => handleTick(p.id, 'home')}>
                                    <input type="checkbox" checked={selectedHomeScorers.includes(p.id)} readOnly />
                                    <span>{p.name} <small>{p.position}</small></span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Away Scorers List */}
                    <div className="scorer-list">
                        <h4>{match.away_team_name} Scorers (Pick {guess.away})</h4>
                        <div className="players-scroll">
                            {awayTeamPlayers.map(p => (
                                <div key={p.id} className={`player-tick ${selectedAwayScorers.includes(p.id) ? 'active' : ''}`} onClick={() => handleTick(p.id, 'away')}>
                                    <input type="checkbox" checked={selectedAwayScorers.includes(p.id)} readOnly />
                                    <span>{p.name} <small>{p.position}</small></span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <button type="submit" className="submit-prediction-btn" disabled={isSubmitting}>
                    {isSubmitting ? 'Confirming...' : 'Lock Prediction'}
                </button>
            </form>
        </div>
    );
};

export default PredictGame;
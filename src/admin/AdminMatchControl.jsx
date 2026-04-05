import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api';
import { toast } from 'react-toastify';
import AdminNavbar from '../AdminNavbar/AdminNavbar';
import FootballLoader from '../FootballLoader';
import './AdminMatchControl.css';

const AdminMatchControl = () => {
    const { id } = useParams(); 
    const navigate = useNavigate();
    
    // State Management
    const [match, setMatch] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isLive, setIsLive] = useState(false);
    const [timer, setTimer] = useState(0);
    const [selectedSide, setSelectedSide] = useState('home'); 
    const socket = useRef(null);

    // 1. Initial Data Fetch
    useEffect(() => {
        if (!id || id === 'undefined') {
            toast.error("Invalid Match ID");
            navigate('/admin-matches-management');
            return;
        }
        fetchMatchDetails();
    }, [id]);

    const fetchMatchDetails = async () => {
        try {
            const res = await api.get(`admin-matches/${id}/`);
            setMatch(res.data);
            setTimer(res.data.current_minute || 0);
            setLoading(false);
        } catch (err) {
            toast.error("Could not load match data");
        }
    };

    // 2. WebSocket Connection
    useEffect(() => {
        if (!id || id === 'undefined') return;
        const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws';
        const wsUrl = `${protocol}://127.0.0.1:8000/ws/match/${id}/`;
        socket.current = new WebSocket(wsUrl);
        
        socket.current.onmessage = (e) => {
            const data = JSON.parse(e.data);
            setMatch(prev => ({
                ...prev,
                home_score: data.home_score,
                away_score: data.away_score
            }));
        };
        return () => socket.current?.close();
    }, [id]);

    // 3. Timer Logic
    useEffect(() => {
        let interval = null;
        if (isLive) {
            interval = setInterval(() => {
                setTimer(prev => prev + 1);
            }, 1000); // 1s = 1m for testing
        }
        return () => clearInterval(interval);
    }, [isLive]);

    // 4. Handlers
    const handleStatusUpdate = async (status) => {
        setIsLive(false);
        try {
            await api.put(`admin-matches/${id}/`, { status, current_minute: timer });
            setMatch(prev => ({ ...prev, status }));
            toast.success(`Match is now ${status}`);
        } catch (err) {
            toast.error("Status update failed");
        }
    };

    const logEvent = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const playerId = formData.get('player');
        const side = formData.get('side');

        // Lookup player name from the correct roster
        const roster = side === 'home' ? match?.home_team_players : match?.away_team_players;
        const selectedPlayer = roster?.find(p => p.id.toString() === playerId);

        if (!selectedPlayer) return toast.error("Select a player");

        const payload = {
            player_name: selectedPlayer.name,
            event_type: formData.get('type'),
            team_side: side,
            minute: timer
        };

        try {
            await api.post(`admin-matches/${id}/events/`, payload);
            toast.success("Event Recorded!");
            fetchMatchDetails(); // Refresh score and timeline
            e.target.reset();
        } catch (err) {
            toast.error("Failed to log event");
        }
    };

    const updateStat = async (field, value) => {
        try {
            await api.put(`admin-matches/${id}/`, { [field]: value });
            setMatch(prev => ({ ...prev, [field]: value }));
        } catch (err) {
            toast.error("Stat update failed");
        }
    };

    if (loading) return <FootballLoader message="Syncing Match Center..." />;

    return (
        <div className="mc-layout">
            <AdminNavbar />
            <main className="mc-main">
                <div className="mc-container">
                    {/* HEADER */}
                    <header className="mc-header">
                        <button className="mc-back-btn" onClick={() => navigate(-1)}>← EXIT</button>
                        <h2>Match <span>Control Center</span></h2>
                        <div className={`mc-live-indicator ${isLive ? 'active' : ''}`}>
                            {isLive ? "● LIVE" : "PAUSED"}
                        </div>
                    </header>

                    {/* SCOREBOARD */}
                    <div className="mc-scoreboard">
                        <div className="mc-team-block">
                            <img src={match?.home_team_logo} alt="home" />
                            <h3>{match?.home_team_name}</h3>
                            <div className="mc-score-display">{match?.home_score}</div>
                        </div>

                        <div className="mc-timer-block">
                            <div className="mc-clock">{timer}'</div>
                            <div className="mc-timer-controls">
                                <button className={isLive ? "btn-pause" : "btn-start"} onClick={() => setIsLive(!isLive)}>
                                    {isLive ? "PAUSE" : "START"}
                                </button>
                                <button onClick={() => handleStatusUpdate('half_time')}>HT</button>
                                <button onClick={() => handleStatusUpdate('finished')}>FT</button>
                            </div>
                        </div>

                        <div className="mc-team-block">
                            <img src={match?.away_team_logo} alt="away" />
                            <h3>{match?.away_team_name}</h3>
                            <div className="mc-score-display">{match?.away_score}</div>
                        </div>
                    </div>

                    <div className="mc-control-grid">
                        {/* EVENT LOGGER */}
                        <div className="mc-card">
                            <h3>Quick <span>Event Logger</span></h3>
                            <form onSubmit={logEvent} className="mc-event-form">
                                <div className="mc-input-group">
                                    <label>Side</label>
                                    <select name="side" value={selectedSide} onChange={(e) => setSelectedSide(e.target.value)}>
                                        <option value="home">Home</option>
                                        <option value="away">Away</option>
                                    </select>
                                </div>
                                <div className="mc-input-group">
                                    <label>Player</label>
                                    <select name="player" required>
                                        <option value="">-- Select --</option>
                                        {(selectedSide === 'home' ? match?.home_team_players : match?.away_team_players)?.map(p => (
                                            <option key={p.id} value={p.id}>#{p.number} {p.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="mc-input-group">
                                    <label>Event</label>
                                    <select name="type">
                                        <option value="Goal">Goal ⚽</option>
                                        <option value="Yellow Card">Yellow Card 🟨</option>
                                        <option value="Red Card">Red Card 🟥</option>
                                    </select>
                                </div>
                                <button type="submit" className="mc-log-btn">Log Action</button>
                            </form>
                        </div>

                        
                    </div>
                    
                </div>
            </main>
        </div>
    );
};

export default AdminMatchControl;
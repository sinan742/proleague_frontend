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
    const [stats, setStats] = useState({ home: {}, away: {} });
    const [performances, setPerformances] = useState([]);
    const [performanceFilter, setPerformanceFilter] = useState('home'); // Home/Away sorting
    const [loading, setLoading] = useState(true);
    const [isLive, setIsLive] = useState(false);
    const [timer, setTimer] = useState(0);
    const [selectedSide, setSelectedSide] = useState('home');
    const socket = useRef(null);

    useEffect(() => {
        fetchMatchDetails();
        fetchPerformances();
    }, [id]);

    const fetchMatchDetails = async () => {
        try {
            const res = await api.get(`admin-matches/${id}/`);
            const data = res.data;
            setMatch(data);
            setTimer(data.current_minute || 0);

            if (data.stastastics && data.stastastics.length > 0) {
                const homeStats = data.stastastics.find(s => s.team === data.home_team) || { possession: 50 };
                const awayStats = data.stastastics.find(s => s.team === data.away_team) || { possession: 50 };
                setStats({ home: homeStats, away: awayStats });
            }
            setLoading(false);
        } catch (err) {
            toast.error("Match data not found");
            setLoading(false);
        }
    };

    const fetchPerformances = async () => {
        try {
            const res = await api.get(`admin-matches/${id}/performances/`);
            setPerformances(res.data);
        } catch (err) {
            console.error("Error fetching performances:", err);
        }
    };

    const initializeRosters = async () => {
        try {
            await api.post(`admin-matches/${id}/performances/`);
            toast.success("Player rows created!");
            fetchPerformances();
        } catch (err) {
            toast.error("Failed to initialize players");
        }
    };

    // Filtered list based on Home/Away selection
    const filteredPerformances = performances.filter(p => {
        const teamId = performanceFilter === 'home' ? match?.home_team : match?.away_team;
        // Check if player belongs to the filtered team
        return (performanceFilter === 'home' ? 
            match?.home_team_players?.some(hp => hp.id === p.player) : 
            match?.away_team_players?.some(ap => ap.id === p.player));
    });

    const handlePlayerStatUpdate = async (perfId, field, currentValue) => {
        try {
            const res = await api.patch(`admin-performances/${perfId}/`, {
                [field]: currentValue + 1
            });
            setPerformances(prev => prev.map(p => p.id === perfId ? res.data : p));
            toast.success(`Updated ${field.replace('_', ' ')}`);
        } catch (err) {
            toast.error("Update failed");
        }
    };

    // WebSocket for Score Updates
    useEffect(() => {
        const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws';
        socket.current = new WebSocket(`${protocol}://127.0.0.1:8000/ws/match/${id}/`);
        socket.current.onmessage = (e) => {
            const data = JSON.parse(e.data);
            setMatch(prev => ({ ...prev, home_score: data.home_score, away_score: data.away_score }));
        };
        return () => socket.current?.close();
    }, [id]);

    // Timer Logic
    useEffect(() => {
        let interval = null;
        if (isLive) {
            interval = setInterval(() => setTimer(prev => prev + 1), 1000);
        }
        return () => clearInterval(interval);
    }, [isLive]);

    const handleStatusUpdate = async (status) => {
        setIsLive(false); 
        try {
            await api.put(`admin-matches/${id}/`, { status, current_minute: timer });
            setMatch(prev => ({ ...prev, status }));
            toast.success(`Status: ${status.replace('_', ' ')}`);
        } catch (err) {
            toast.error("Status update failed");
        }
    };

    const handleStatUpdate = async (side, field) => {
        const teamId = side === 'home' ? match.home_team : match.away_team;
        const newValue = (stats[side][field] || 0) + 1;
        try {
            const res = await api.patch(`admin-matches/${id}/team/${teamId}/stats/`, { [field]: newValue });
            setStats(prev => ({ ...prev, [side]: { ...prev[side], [field]: res.data[field] } }));
        } catch (err) { toast.error("Stat update failed"); }
    };

    const handlePossessionUpdate = async (homeValue) => {
        const homeVal = parseInt(homeValue);
        try {
            await api.patch(`admin-matches/${id}/team/${match.home_team}/stats/`, { possession: homeVal });
            await api.patch(`admin-matches/${id}/team/${match.away_team}/stats/`, { possession: 100 - homeVal });
            setStats(prev => ({
                home: { ...prev.home, possession: homeVal },
                away: { ...prev.away, possession: 100 - homeVal }
            }));
        } catch (err) { toast.error("Possession update failed"); }
    };

    const logEvent = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const playerId = formData.get('player');
        const side = formData.get('side');
        const roster = side === 'home' ? match?.home_team_players : match?.away_team_players;
        const selectedPlayer = roster?.find(p => p.id.toString() === playerId);
        if (!selectedPlayer) return toast.error("Select a player");

        try {
            await api.post(`admin-matches/${id}/events/`, {
                player: selectedPlayer.id,
                player_name: selectedPlayer.name,
                event_type: formData.get('type'),
                team_side: side,
                minute: timer
            });
            toast.success("Event Recorded!");
            fetchMatchDetails(); 
            fetchPerformances();
            e.target.reset();
        } catch (err) { toast.error("Failed to log event"); }
    };

    if (loading) return <FootballLoader />;

    return (
        <div className="mc-layout">
            <AdminNavbar />
            <main className="mc-main">
                <div className="mc-container">
                    
                    {/* SCOREBOARD */}
                    <div className="mc-scoreboard-landscape">
                        <div className="mc-team-side">
                            <img src={match.home_team_logo} alt="home" />
                            <div className="mc-team-info">
                                <h3>{match.home_team_name}</h3>
                                <div className="mc-score-big">{match.home_score}</div>
                            </div>
                        </div>

                        <div className="mc-timer-center">
                            <div className="mc-clock-face">{timer}'</div>
                            <div className="mc-timer-controls">
                                <button className={isLive ? "pause-btn" : "start-btn"} onClick={() => setIsLive(!isLive)}>
                                    {isLive ? "PAUSE" : "START"}
                                </button>
                                <button className="status-btn" onClick={() => handleStatusUpdate('half_time')}>HT</button>
                                <button className="status-btn" onClick={() => handleStatusUpdate('finished')}>FT</button>
                            </div>
                            <div className="mc-current-status">Status: {match.status}</div>
                        </div>

                        <div className="mc-team-side mc-away">
                            <div className="mc-team-info">
                                <h3>{match.away_team_name}</h3>
                                <div className="mc-score-big">{match.away_score}</div>
                            </div>
                            <img src={match.away_team_logo} alt="away" />
                        </div>
                    </div>

                    <div className="mc-control-grid-vertical">
                        {/* EVENT LOGGER */}
                        <div className="mc-card">
                            <h3 className="mc-card-title">Quick <span>Event Logger</span></h3>
                            <form onSubmit={logEvent} className="mc-event-form-inline">
                                <select name="side" value={selectedSide} onChange={(e) => setSelectedSide(e.target.value)}>
                                    <option value="home">Home</option>
                                    <option value="away">Away</option>
                                </select>
                                <select name="player" required>
                                    <option value="">-- Player --</option>
                                    {(selectedSide === 'home' ? match.home_team_players : match.away_team_players)?.map(p => (
                                        <option key={p.id} value={p.id}>#{p.number} {p.name}</option>
                                    ))}
                                </select>
                                <select name="type">
                                    <option value="Goal">Goal ⚽</option>
                                    <option value="Yellow Card">Yellow Card 🟨</option>
                                    <option value="Red Card">Red Card 🟥</option>
                                </select>
                                <button type="submit" className="mc-submit-btn">LOG EVENT</button>
                            </form>
                        </div>

                        {/* MATCH STATS */}
                        <div className="mc-card">
                            <h3 className="mc-card-title">Match <span>Statistics</span></h3>
                            <div className="mc-possession-control">
                                <label>Possession: {stats.home.possession || 50}% - {stats.away.possession || 50}%</label>
                                <input type="range" min="0" max="100" value={stats.home.possession || 50} 
                                    onChange={(e) => handlePossessionUpdate(e.target.value)} className="mc-possession-slider" />
                            </div>
                            <div className="mc-stats-table-full">
                                {['shots', 'shots_on_target', 'corners', 'fouls', 'passes'].map(field => (
                                    <div key={field} className="mc-stat-row-full">
                                        <button onClick={() => handleStatUpdate('home', field)}>{stats.home[field] || 0}</button>
                                        <label>{field.replace(/_/g, ' ')}</label>
                                        <button onClick={() => handleStatUpdate('away', field)}>{stats.away[field] || 0}</button>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* PLAYER PERFORMANCE TABLE */}
                        <div className="mc-card">
                            <div className="mc-card-header-between">
                                <h3 className="mc-card-title">Individual <span>Performances</span></h3>
                                <div className="mc-team-tabs">
                                    <button className={performanceFilter === 'home' ? 'active' : ''} onClick={() => setPerformanceFilter('home')}>HOME</button>
                                    <button className={performanceFilter === 'away' ? 'active' : ''} onClick={() => setPerformanceFilter('away')}>AWAY</button>
                                </div>
                                {performances.length === 0 && (
                                    <button className="mc-init-btn" onClick={initializeRosters}>Init Roster</button>
                                )}
                            </div>
                            <div className="mc-table-container">
                                <table className="mc-performance-table">
                                    <thead>
                                        <tr>
                                            <th>Player</th>
                                            <th>G</th>
                                            <th>A</th>
                                            <th>S</th>
                                            <th>🟨</th>
                                            <th>🟥</th>
                                            <th>Min</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredPerformances.map(p => (
                                            <tr key={p.id}>
                                                <td><small>{p.player_position}</small> <strong>{p.player_name}</strong></td>
                                                <td><button className="mc-mini" onClick={() => handlePlayerStatUpdate(p.id, 'goals', p.goals)}>{p.goals}</button></td>
                                                <td><button className="mc-mini" onClick={() => handlePlayerStatUpdate(p.id, 'assists', p.assists)}>{p.assists}</button></td>
                                                <td><button className="mc-mini" onClick={() => handlePlayerStatUpdate(p.id, 'saves', p.saves)}>{p.saves}</button></td>
                                                <td><button className="mc-mini yc" onClick={() => handlePlayerStatUpdate(p.id, 'yellow_cards', p.yellow_cards)}>{p.yellow_cards}</button></td>
                                                <td><button className="mc-mini rc" onClick={() => handlePlayerStatUpdate(p.id, 'red_cards', p.red_cards)}>{p.red_cards}</button></td>
                                                <td><button className="mc-mini min" onClick={() => handlePlayerStatUpdate(p.id, 'minutes_played', p.minutes_played)}>{p.minutes_played}'</button></td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default AdminMatchControl;
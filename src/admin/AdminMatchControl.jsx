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
    const [performanceFilter, setPerformanceFilter] = useState('home'); 
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

    const filteredPerformances = performances.filter(p => {
        const teamId = performanceFilter === 'home' ? match?.home_team : match?.away_team;
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

    useEffect(() => {
        const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws';
        socket.current = new WebSocket(`${protocol}://127.0.0.1:8000/ws/match/${id}/`);
        socket.current.onmessage = (e) => {
            const data = JSON.parse(e.data);
            setMatch(prev => ({ ...prev, home_score: data.home_score, away_score: data.away_score }));
        };
        return () => socket.current?.close();
    }, [id]);

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
        <div className="amc-v99-layout">
            <AdminNavbar />
            <main className="amc-v99-main">
                <div className="amc-v99-container">
                    
                    {/* SCOREBOARD */}
                    <div className="amc-v99-scoreboard-landscape">
                        <div className="amc-v99-team-side">
                            <img src={match.home_team_logo} alt="home" className="amc-v99-logo-img" />
                            <div className="amc-v99-team-info">
                                <h3 className="amc-v99-team-title">{match.home_team_name}</h3>
                                <div className="amc-v99-score-big">{match.home_score}</div>
                            </div>
                        </div>

                        <div className="amc-v99-timer-center">
                            <div className="amc-v99-clock-face">{timer}'</div>
                            <div className="amc-v99-timer-controls">
                                <button className={isLive ? "amc-v99-pause-btn" : "amc-v99-start-btn"} onClick={() => setIsLive(!isLive)}>
                                    {isLive ? "PAUSE" : "START"}
                                </button>
                                <button className="amc-v99-status-btn" onClick={() => handleStatusUpdate('half_time')}>HT</button>
                                <button className="amc-v99-status-btn" onClick={() => handleStatusUpdate('finished')}>FT</button>
                            </div>
                            <div className="amc-v99-current-status">Status: {match.status?.toUpperCase()}</div>
                        </div>

                        <div className="amc-v99-team-side amc-v99-away">
                            <div className="amc-v99-team-info">
                                <h3 className="amc-v99-team-title">{match.away_team_name}</h3>
                                <div className="amc-v99-score-big">{match.away_score}</div>
                            </div>
                            <img src={match.away_team_logo} alt="away" className="amc-v99-logo-img" />
                        </div>
                    </div>

                    <div className="amc-v99-control-grid-vertical">
                        {/* EVENT LOGGER */}
                        <div className="amc-v99-card">
                            <h3 className="amc-v99-card-header">Quick <span className="amc-v99-accent">Event Logger</span></h3>
                            <form onSubmit={logEvent} className="amc-v99-event-form-inline">
                                <select className="amc-v99-select" name="side" value={selectedSide} onChange={(e) => setSelectedSide(e.target.value)}>
                                    <option value="home">Home</option>
                                    <option value="away">Away</option>
                                </select>
                                <select className="amc-v99-select" name="player" required>
                                    <option value="">-- Player --</option>
                                    {(selectedSide === 'home' ? match.home_team_players : match.away_team_players)?.map(p => (
                                        <option key={p.id} value={p.id}>#{p.number} {p.name}</option>
                                    ))}
                                </select>
                                <select className="amc-v99-select" name="type">
                                    <option value="Goal">Goal ⚽</option>
                                    <option value="Yellow Card">Yellow Card 🟨</option>
                                    <option value="Red Card">Red Card 🟥</option>
                                </select>
                                <button type="submit" className="amc-v99-submit-btn">LOG EVENT</button>
                            </form>
                        </div>

                        {/* MATCH STATS */}
                        <div className="amc-v99-card">
                            <h3 className="amc-v99-card-header">Match <span className="amc-v99-accent">Statistics</span></h3>
                            <div className="amc-v99-possession-control">
                                <label className="amc-v99-label">Possession: {stats.home.possession || 50}% - {stats.away.possession || 50}%</label>
                                <input type="range" min="0" max="100" value={stats.home.possession || 50} 
                                    onChange={(e) => handlePossessionUpdate(e.target.value)} className="amc-v99-possession-slider" />
                            </div>
                            <div className="amc-v99-stats-table-full">
                                {['shots', 'shots_on_target', 'corners', 'fouls', 'passes'].map(field => (
                                    <div key={field} className="amc-v99-stat-row-full">
                                        <button className="amc-v99-stat-inc-btn" onClick={() => handleStatUpdate('home', field)}>{stats.home[field] || 0}</button>
                                        <label className="amc-v99-stat-label">{field.replace(/_/g, ' ').toUpperCase()}</label>
                                        <button className="amc-v99-stat-inc-btn" onClick={() => handleStatUpdate('away', field)}>{stats.away[field] || 0}</button>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* PLAYER PERFORMANCE TABLE */}
                        <div className="amc-v99-card">
                            <div className="amc-v99-card-header-between">
                                <h3 className="amc-v99-card-header">Individual <span className="amc-v99-accent">Performances</span></h3>
                                <div className="amc-v99-team-tabs">
                                    <button className={`amc-v99-tab-btn ${performanceFilter === 'home' ? 'amc-v99-tab-active' : ''}`} onClick={() => setPerformanceFilter('home')}>HOME</button>
                                    <button className={`amc-v99-tab-btn ${performanceFilter === 'away' ? 'amc-v99-tab-active' : ''}`} onClick={() => setPerformanceFilter('away')}>AWAY</button>
                                </div>
                                {performances.length === 0 && (
                                    <button className="amc-v99-init-btn" onClick={initializeRosters}>Init Roster</button>
                                )}
                            </div>
                            <div className="amc-v99-table-container">
                                <table className="amc-v99-performance-table">
                                    <thead>
                                        <tr>
                                            <th className="amc-v99-th">Player</th>
                                            <th className="amc-v99-th">G</th>
                                            <th className="amc-v99-th">A</th>
                                            <th className="amc-v99-th">S</th>
                                            <th className="amc-v99-th">🟨</th>
                                            <th className="amc-v99-th">🟥</th>
                                            <th className="amc-v99-th">Min</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredPerformances.map(p => (
                                            <tr key={p.id} className="amc-v99-tr">
                                                <td className="amc-v99-td"><small className="amc-v99-pos-small">{p.player_position}</small> <strong className="amc-v99-pname">{p.player_name}</strong></td>
                                                <td className="amc-v99-td"><button className="amc-v99-mini-btn" onClick={() => handlePlayerStatUpdate(p.id, 'goals', p.goals)}>{p.goals}</button></td>
                                                <td className="amc-v99-td"><button className="amc-v99-mini-btn" onClick={() => handlePlayerStatUpdate(p.id, 'assists', p.assists)}>{p.assists}</button></td>
                                                <td className="amc-v99-td"><button className="amc-v99-mini-btn" onClick={() => handlePlayerStatUpdate(p.id, 'saves', p.saves)}>{p.saves}</button></td>
                                                <td className="amc-v99-td"><button className="amc-v99-mini-btn amc-v99-yc" onClick={() => handlePlayerStatUpdate(p.id, 'yellow_cards', p.yellow_cards)}>{p.yellow_cards}</button></td>
                                                <td className="amc-v99-td"><button className="amc-v99-mini-btn amc-v99-rc" onClick={() => handlePlayerStatUpdate(p.id, 'red_cards', p.red_cards)}>{p.red_cards}</button></td>
                                                <td className="amc-v99-td"><button className="amc-v99-mini-btn amc-v99-min" onClick={() => handlePlayerStatUpdate(p.id, 'minutes_played', p.minutes_played)}>{p.minutes_played}'</button></td>
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
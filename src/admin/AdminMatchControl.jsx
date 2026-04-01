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
            console.error(err);
            toast.error("Could not load match data");
        }
    };

    // 2. WebSocket Connection (Real-time Score & Events)
    useEffect(() => {
        if (!id || id === 'undefined') return;

        const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws';
        const wsUrl = `${protocol}://127.0.0.1:8000/ws/match/${id}/`;
        
        socket.current = new WebSocket(wsUrl);

        socket.current.onopen = () => console.log("WebSocket: Live Connection Established ✅");
        
        socket.current.onmessage = (e) => {
            const data = JSON.parse(e.data);
            // Update local state with data pushed from Django save() method
            setMatch(prev => ({
                ...prev,
                home_score: data.home_score,
                away_score: data.away_score
            }));
            
            if (data.player) {
                toast.info(`${data.player} - ${data.type} (${data.minute}')`, {
                    position: "top-right",
                    autoClose: 3000
                });
            }
        };

        socket.current.onclose = () => console.log("WebSocket: Connection Closed ❌");

        return () => socket.current?.close();
    }, [id]);

    // 3. Smart Timer Logic (Auto-stops at 45 and 90)
    useEffect(() => {
        let interval = null;
        if (isLive) {
            interval = setInterval(() => {
                setTimer(prev => {
                    const next = prev + 1;
                    if (next === 45) handleStatusUpdate('half_time', 45);
                    if (next === 90) handleStatusUpdate('finished', 90);
                    return next;
                });
            }, 1000); // 1 second = 1 minute for testing. Change to 60000 for real-time.
        }
        return () => clearInterval(interval);
    }, [isLive]);

    const handleStatusUpdate = async (status, minuteValue) => {
        setIsLive(false);
        const finalMinute = minuteValue !== undefined ? minuteValue : timer;
        try {
            await api.put(`admin-matches/${id}/`, { 
                status: status, 
                current_minute: finalMinute 
            });
            setMatch(prev => ({ ...prev, status: status }));
            toast.success(`Match status updated to ${status}`);
        } catch (err) {
            toast.error("Status update failed");
        }
    };

    const logEvent = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const payload = {
            player_name: formData.get('player'),
            event_type: formData.get('type'),
            team_side: formData.get('side'),
            minute: timer
        };

        try {
            // This triggers the save() method in Django, which broadcasts via WebSocket
            await api.post(`admin-matches/${id}/events/`, payload);
            e.target.reset();
        } catch (err) {
            toast.error("Failed to log match event");
        }
    };

    if (loading) return <FootballLoader message="Entering Match Center..." />;

    return (
        <div className="mc-layout">
            <AdminNavbar />
            <main className="mc-main">
                <div className="mc-container">
                    <header className="mc-header">
                        <button className="mc-back-btn" onClick={() => navigate(-1)}>← Back</button>
                        <h2>Match <span>Control Center</span></h2>
                    </header>

                    {/* SCOREBOARD SECTION */}
                    <div className="mc-scoreboard">
                        <div className="mc-team-block">
                            <img src={match?.home_team_logo || '/default-logo.png'} alt="home" />
                            <h3>{match?.home_team_name}</h3>
                            <div className="mc-score-display">{match?.home_score}</div>
                        </div>

                        <div className="mc-timer-block">
                            <div className={`mc-status-badge ${match?.status}`}>{match?.status}</div>
                            <div className="mc-clock">{timer}'</div>
                            <div className="mc-timer-controls">
                                <button 
                                    className={isLive ? "mc-btn-pause" : "mc-btn-start"} 
                                    onClick={() => setIsLive(!isLive)}
                                >
                                    {isLive ? "PAUSE" : "START"}
                                </button>
                                <button onClick={() => handleStatusUpdate('half_time')}>HT</button>
                                <button onClick={() => handleStatusUpdate('finished')}>FT</button>
                            </div>
                        </div>

                        <div className="mc-team-block">
                            <img src={match?.away_team_logo || '/default-logo.png'} alt="away" />
                            <h3>{match?.away_team_name}</h3>
                            <div className="mc-score-display">{match?.away_score}</div>
                        </div>
                    </div>

                    {/* EVENT LOGGING SECTION */}
                    <div className="mc-event-card">
                        <h3>Quick <span>Event Logger</span></h3>
                        <form onSubmit={logEvent} className="mc-event-form">
                            <input name="player" placeholder="Player Name" required />
                            <select name="side">
                                <option value="home">Home Team</option>
                                <option value="away">Away Team</option>
                            </select>
                            <select name="type">
                                <option value="Goal">Goal ⚽</option>
                                <option value="Yellow Card">Yellow Card 🟨</option>
                                <option value="Red Card">Red Card 🟥</option>
                            </select>
                            <button type="submit" className="ad-btn-primary">Log Action</button>
                        </form>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default AdminMatchControl;
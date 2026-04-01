import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api';
import './MatchDetails.css';
import FootballLoader from '../FootballLoader';

const MatchDetails = () => {
    const { id } = useParams();
    const [match, setMatch] = useState(null);
    const socket = useRef(null);

    useEffect(() => {
        // 1. Initial Data Fetch
        api.get(`matches/${id}/stats/`).then(res => {
            setMatch(res.data);
        });

        // 2. WebSocket Setup for Live Updates
        const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws';
        socket.current = new WebSocket(`${protocol}://127.0.0.1:8000/ws/match/${id}/`);

        socket.current.onmessage = (e) => {
            const data = JSON.parse(e.data);
            
            setMatch(prev => {
                // If the message contains a player name, create a new event object
                const newEvent = data.player ? {
                    player_name: data.player,
                    event_type: data.type,
                    minute: data.minute,
                    team_side: data.side || (data.home_score > prev.home_score ? 'home' : 'away')
                } : null;

                return {
                    ...prev,
                    home_score: data.home_score !== undefined ? data.home_score : prev.home_score,
                    away_score: data.away_score !== undefined ? data.away_score : prev.away_score,
                    current_minute: data.minute !== undefined ? data.minute : prev.current_minute,
                    // Prepend the new event to the timeline if it exists
                    events: newEvent ? [newEvent, ...(prev.events || [])] : prev.events
                };
            });
        };

        return () => socket.current?.close();
    }, [id]);

    if (!match) return <div className="barca-loader"><FootballLoader/></div>;

    const homeStats = match.statistics?.find(s => s.team_name === match.home_team_name) || {};
    const awayStats = match.statistics?.find(s => s.team_name === match.away_team_name) || {};

    return (
        <div className="match-detail-page">
            <section className="match-hero-bg">
                <div className="hero-content">
                    <div className="hero-team">
                        <img src={match.home_team_logo} alt="Home" />
                        <h2>{match.home_team_name}</h2>
                    </div>

                    <div className="hero-score-area">
                        <div className="big-score">
                            {match.home_score} <span>-</span> {match.away_score}
                        </div>
                        <div className="match-meta">
                            <span className={`status-pill ${match.status}`}>
                                {match.status === 'live' ? `● LIVE` : match.status.toUpperCase()} 
                                <span className="live-min"> {match.current_minute}'</span>
                            </span>
                        </div>
                    </div>

                    <div className="hero-team">
                        <img src={match.away_team_logo} alt="Away" />
                        <h2>{match.away_team_name}</h2>
                    </div>
                </div>
            </section>

            <div className="match-content-grid">
                {/* LEFT: TIMELINE */}
                <div className="match-timeline">
                    <div className="section-head">
                        <h3>Match <span>Timeline</span></h3>
                    </div>
                    <div className="timeline-container">
                        {match.events && match.events.length > 0 ? (
                            match.events.map((ev, i) => (
                                <div key={i} className={`timeline-card ${ev.team_side}`}>
                                    <span className="ev-min">{ev.minute}'</span>
                                    <span className="ev-icon">{ev.event_type === 'Goal' ? '⚽' : '🟨'}</span>
                                    <div className="ev-details">
                                        <strong>{ev.player_name}</strong>
                                        <small>{ev.event_type}</small>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="no-data">Waiting for match action...</p>
                        )}
                    </div>
                </div>

                {/* MIDDLE: STATS */}
                <div className="match-stats-center">
                    <div className="section-head text-center">
                        <h3>Match <span>Stats</span></h3>
                    </div>
                    <div className="stats-container">
                        <StatComparison label="Possession" home={homeStats.possession} away={awayStats.possession} unit="%" />
                        <StatComparison label="Shots" home={homeStats.shots} away={awayStats.shots} />
                        <StatComparison label="On Target" home={homeStats.shots_on_target} away={awayStats.shots_on_target} />
                        <StatComparison label="Passes" home={homeStats.passes} away={awayStats.passes} />
                    </div>

                    <div className="performance-section">
                        <div className="section-head">
                            <h3>Player <span>Performances</span></h3>
                        </div>
                        <div className="performance-list">
                            {match.performances?.map(p => (
                                <div className="perf-card" key={p.id}>
                                    <img src={p.player_photo} alt={p.player_name} className="mini-p-img" />
                                    <div className="p-info">
                                        <span className="p-name">{p.player_name}</span>
                                        <span className="p-stats">
                                            {p.goals > 0 && `⚽ ${p.goals} `}
                                            {p.assists > 0 && `🅰️ ${p.assists} `}
                                        </span>
                                    </div>
                                    <div className="p-cards">
                                        {p.yellow_cards > 0 && <div className="card-y"></div>}
                                        {p.red_cards > 0 && <div className="card-r"></div>}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <aside className="match-sidebar">
                    <div className="venue-card">
                        <h4>Stadium</h4>
                        <p>{match.stadium}</p>
                    </div>
                    <div className="venue-card">
                        <h4>Kick Off</h4>
                        <p>{new Date(match.match_date).toLocaleDateString()}</p>
                        <p>{match.match_time.split('T')[1]?.substring(0, 5) || ""}</p>
                    </div>
                </aside>
            </div>
        </div>
    );
};

const StatComparison = ({ label, home = 0, away = 0, unit = "" }) => {
    const total = (Number(home) + Number(away)) || 1;
    const homePercent = (Number(home) / total) * 100;
    return (
        <div className="stat-row">
            <div className="stat-labels">
                <span>{home}{unit}</span>
                <span className="stat-name">{label}</span>
                <span>{away}{unit}</span>
            </div>
            <div className="stat-bar-bg">
                <div className="stat-bar-home" style={{ width: `${homePercent}%` }}></div>
                <div className="stat-bar-away" style={{ width: `${100 - homePercent}%` }}></div>
            </div>
        </div>
    );
};

export default MatchDetails;
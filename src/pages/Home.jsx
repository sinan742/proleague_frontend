import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import './Home.css';

const Home = () => {
    const [stats, setStats] = useState({ scorer: null, asister: null, keeper: null });
    const [todayMatches, setTodayMatches] = useState([]);
    const [counts, setCounts] = useState({ teams: 0, players: 0, matches: 0 });

    useEffect(() => {
        const fetchHomeData = async () => {
            try {
                const [playerRes, teamRes, matchRes] = await Promise.all([
                    api.get('players/'),
                    api.get('teams/'),
                    api.get('matches/')
                ]);

                const allPlayers = playerRes.data;
                const allMatches = matchRes.data;

                // 1. Filter Today's Matches
                const today = new Date().toLocaleDateString('en-CA');
                const todayOnly = allMatches.filter(m => m.match_date === today);
                setTodayMatches(todayOnly);

                // 2. Top Performers Logic
                setStats({
                    scorer: [...allPlayers].sort((a, b) => b.goals - a.goals)[0],
                    asister: [...allPlayers].sort((a, b) => b.assists - a.assists)[0],
                    keeper: [...allPlayers].filter(p => p.position === 'GK').sort((a, b) => b.saves - a.saves)[0]
                });

                setCounts({
                    teams: teamRes.data.length,
                    players: allPlayers.length,
                    matches: allMatches.length
                });
            } catch (err) {
                console.error("Error loading home data", err);
            }
        };
        fetchHomeData();
    }, []);

    return (
        <div className="home-container">
            {/* HERO SECTION */}
            <header className="home-hero">
                <div className="hero-content">
                    <div className="status-tag">Live League Dashboard</div>
                    <h1>PRO<span>LEAGUE</span></h1>
                    <div className="quick-stats">
                        <div className="qs-item"><strong>{counts.teams}</strong> Clubs</div>
                        <div className="qs-item"><strong>{counts.players}</strong> Players</div>
                    </div>
                </div>
            </header>

            {/* TODAY'S MATCHES RIBBON */}
            <section className="matches-today">
                <div className="section-label">Today's Fixtures</div>
                <div className="matches-scroll">
                    {todayMatches.length > 0 ? (
                        todayMatches.map(match => (
                            <div key={match.id} className="match-mini-card">
                                <div className="m-team">
                                    <img src={match.home_team_logo} alt="" />
                                    <span>{match.home_team_name.substring(0, 3)}</span>
                                </div>
                                <div className="m-vs">VS</div>
                                <div className="m-team">
                                    <img src={match.away_team_logo} alt="" />
                                    <span>{match.away_team_name.substring(0, 3)}</span>
                                </div>
                                <div className="m-time">{match.match_time || 'LIVE'}</div>
                            </div>
                        ))
                    ) : (
                        <p className="no-matches">No matches scheduled for today</p>
                    )}
                </div>
            </section>

            {/* STAR PLAYERS SPOTLIGHT */}
            <section className="spotlight-section">
                <h2 className="section-title">Season <span>Superstars</span></h2>
                <div className="spotlight-grid">
                    {/* Top Scorer Card */}
                    <PlayerCard player={stats.scorer} label="Golden Boot" stat="goals" unit="Goals" icon="⚽" color="#edbb00" />
                    {/* Top Assister Card */}
                    <PlayerCard player={stats.asister} label="Playmaker" stat="assists" unit="Assists" icon="👟" color="#007bff" />
                    {/* Top Keeper Card */}
                    <PlayerCard player={stats.keeper} label="Golden Glove" stat="saves" unit="Saves" icon="🧤" color="#ff4d4d" />
                </div>
            </section>
        </div>
    );
};

const PlayerCard = ({ player, label, stat, unit, icon, color }) => {
    if (!player) return null;
    return (
        <div className="p-spotlight-card" style={{ borderTop: `4px solid ${color}` }}>
            <div className="p-badge" style={{ backgroundColor: color }}>{label} {icon}</div>
            <div className="p-img-box">
                <img src={player.photo} alt={player.name} onError={(e) => e.target.src = 'https://via.placeholder.com/150'} />
            </div>
            <div className="p-details">
                <h3>{player.name}</h3>
                <p>{player.team_name}</p>
                <div className="p-stat">
                    <span className="p-val" style={{ color: color }}>{player[stat]}</span>
                    <span className="p-unit">{unit}</span>
                </div>
            </div>
            <Link to={`/players/${player.id}`} className="p-link">View Stats</Link>
        </div>
    );
};

export default Home;
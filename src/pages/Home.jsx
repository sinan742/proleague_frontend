import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import './Home.css';

const Home = () => {
    const [stats, setStats] = useState({ scorer: null, asister: null, keeper: null });
    const [todayMatches, setTodayMatches] = useState([]);
    const [allMatches, setAllMatches] = useState([]);
    const [topTeams, setTopTeams] = useState([]);
    const [counts, setCounts] = useState({ teams: 0, players: 0, matches: 0 });

    useEffect(() => {
        const fetchHomeData = async () => {
            try {
                const [playerRes, leagueRes, matchRes] = await Promise.all([
                    api.get('players/'),
                    api.get('league-table/'), 
                    api.get('matches/')
                ]);

                const allPlayers = playerRes.data;
                const leagueData = leagueRes.data;
                const matches = matchRes.data;

                const today = new Date().toLocaleDateString('en-CA');
                setTodayMatches(matches.filter(m => m.match_date === today));
                setAllMatches(matches);

                setTopTeams(leagueData.slice(0, 5));

                setStats({
                    scorer: [...allPlayers].sort((a, b) => b.goals - a.goals)[0],
                    asister: [...allPlayers].sort((a, b) => b.assists - a.assists)[0],
                    keeper: [...allPlayers].filter(p => p.position === 'GK').sort((a, b) => b.saves - a.saves)[0]
                });

                setCounts({
                    teams: leagueData.length,
                    players: allPlayers.length,
                    matches: matches.length
                });
            } catch (err) {
                console.error("Error loading home data", err);
            }
        };
        fetchHomeData();
    }, []);

    return (
        <div className="home-container">
            <header className="home-hero">
                <div className="hero-content">
                    <span className="status-tag">Live Football Dashboard</span>
                    <h1>PRO<span>LEAGUE</span></h1>
                    <div className="quick-stats">
                        <div className="qs-item"><strong>{counts.teams}</strong> Clubs</div>
                        <div className="qs-item"><strong>{counts.players}</strong> Players</div>
                        <div className="qs-item"><strong>{counts.matches}</strong> Matches</div>
                    </div>
                </div>
            </header>

            {/* RIBBON: Today's Matches */}
            <section className="matches-today">
                <h2 className="section-label">Today's Fixtures</h2>
                <div className="matches-scroll">
                    {todayMatches.length > 0 ? (
                        todayMatches.map(m => (
                            <Link to={`/matches/${m.id}`} key={m.id} className="match-mini-card">
                                <div className="m-team">
                                    <img src={m.home_team_logo} alt="" />
                                    <span>{m.home_team_name?.substring(0, 3).toUpperCase()}</span>
                                </div>
                                <div className="m-score-vs">
                                    {m.is_completed ? `${m.home_score}-${m.away_score}` : 'VS'}
                                </div>
                                <div className="m-team">
                                    <img src={m.away_team_logo} alt="" />
                                    <span>{m.away_team_name?.substring(0, 3).toUpperCase()}</span>
                                </div>
                            </Link>
                        ))
                    ) : (
                        <p className="no-matches">No matches scheduled for today</p>
                    )}
                </div>
            </section>

            <div className="home-content-stack">
                {/* SLIDER: Match Center */}
                <section className="match-slider-section">
                    <div className="section-header-flex">
                        <h2 className="section-title">Match <span>Center</span> 🏟️</h2>
                        <Link to="/matches" className="view-all-link">See All Matches</Link>
                    </div>
                    <div className="horizontal-slider">
                        {allMatches.map(m => (
                            <Link to={`/matches/${m.id}`} key={m.id} className={`match-slide-card ${m.is_completed ? 'finished' : 'upcoming'}`}>
                                <span className="slide-date">{new Date(m.match_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}</span>
                                <div className="slide-teams">
                                    <div className="slide-t">
                                        <img src={m.home_team_logo} alt="" />
                                        <span style={{color:'white'}}>{m.home_team_name}</span>
                                    </div>
                                    <div className="slide-score">
                                        {m.is_completed ? `${m.home_score} - ${m.away_score}` : 'VS'}
                                    </div>
                                    <div className="slide-t">
                                        <img src={m.away_team_logo} alt="" />
                                        <span style={{color:'white'}}>{m.away_team_name}</span>
                                    </div>
                                </div>
                                <div className="slide-footer">{m.stadium || m.venue || 'TBD'}</div>
                            </Link>
                        ))}
                    </div>
                </section>

                {/* SUPERSTARS */}
                <section className="spotlight-section">
                    <h2 className="section-title">Season <span>Superstars</span> 🏆</h2>
                    <div className="spotlight-grid">
                        <PlayerCard player={stats.scorer} label="Golden Boot" stat="goals" unit="Goals" icon="⚽" color="#edbb00" />
                        <PlayerCard player={stats.asister} label="Playmaker" stat="assists" unit="Assists" icon="👟" color="#58a6ff" />
                        <PlayerCard player={stats.keeper} label="Golden Glove" stat="saves" unit="Saves" icon="🧤" color="#ff4d4d" />
                    </div>
                </section>

                {/* POINTS TABLE */}
                <section className="full-table-section">
                    <h2 className="section-title">League <span>Standings</span> 📊</h2>
                    <div className="mini-table-card">
                        <table className="m-points-table">
                            <thead>
                                <tr>
                                    <th>Pos</th><th>Club</th><th>P</th><th>W</th><th>D</th><th>L</th><th>GD</th><th>Pts</th>
                                </tr>
                            </thead>
                            <tbody>
                                {topTeams.map((team, index) => (
                                    <tr key={team.id || index}>
                                        <td>{index + 1}</td>
                                        <td className="table-team-cell">
                                            <img src={team.team_logo || team.logo} alt="" />
                                            <span>{team.team_name || team.name}</span>
                                        </td>
                                        <td>{team.p || 0}</td>
                                        <td>{team.w || 0}</td>
                                        <td>{team.d || 0}</td>
                                        <td>{team.l || 0}</td>
                                        <td>{team.gd || team.gd || 0}</td>
                                        <td className="table-pts"><strong>{team.pts || team.pts || 0}</strong></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        <div className="table-footer">
                            <Link to="/point-table" className="table-full-link">View Full Standings →</Link>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
};

const PlayerCard = ({ player, label, stat, unit, icon, color }) => {
    if (!player) return null;
    return (
        <div className="p-spotlight-card">
            <div className="p-badge" style={{ backgroundColor: color }}>{label} {icon}</div>
            <div className="p-img-box">
                <img src={player.photo} alt={player.name} onError={(e) => e.target.src = 'https://via.placeholder.com/150?text=Player'} />
            </div>
            <div className="p-details">
                <h3>{player.name}</h3>
                <p className="p-team-sub">{player.team_name}</p>
                <div className="p-stat">
                    <span className="p-val">{player[stat]}</span>
                    <span className="p-unit">{unit}</span>
                </div>
            </div>
            <Link to={`/players/${player.id}`} className="p-link">View Stats</Link>
        </div>
    );
};

export default Home;
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api';
import './MatchDetails.css';

const MatchDetails = () => {
    const { id } = useParams();
    const [match, setMatch] = useState(null);

    useEffect(() => {
        // Fetching from your new APIView endpoint that includes statistics
        api.get(`matches/${id}/stats/`).then(res => setMatch(res.data));
    }, [id]);

    if (!match) return <div className="barca-loader">Fetching Match Data...</div>;

    // Helper to find stats for home/away
    const homeStats = match.statistics?.find(s => s.team_name === match.home_team_name) || {};
    const awayStats = match.statistics?.find(s => s.team_name === match.away_team_name) || {};

    return (
        <div className="match-detail-page">
            {/* GIANT SCOREBOARD HERO */}
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
                            {match.is_completed ? 'FULL TIME' : 'UPCOMING'}
                        </div>
                    </div>

                    <div className="hero-team">
                        <img src={match.away_team_logo} alt="Away" />
                        <h2>{match.away_team_name}</h2>
                    </div>
                </div>
            </section>

            <div className="match-content-grid">
                {/* LEFT: PERFORMANCE REPORT */}
                <div className="match-report">
                    <div className="section-head">
                        <h3>Match <span>Report</span></h3>
                    </div>
                    
                    <div className="performance-list">
                        {match.performances && match.performances.length > 0 ? (
                            match.performances.map(p => (
                                <div className="perf-card" key={p.id}>
                                    <img src={p.player_photo} alt={p.player_name} className="mini-p-img" />
                                    <div className="p-info">
                                        <span className="p-name">{p.player_name}</span>
                                        <span className="p-stats">
                                            {p.goals > 0 && `⚽ ${p.goals} Goals `}
                                            {p.assists > 0 && `🅰️ ${p.assists} Assists `}
                                            {p.saves > 0 && `🧤 ${p.saves} Saves `}
                                        </span>
                                    </div>
                                    <div className="p-cards">
                                        {p.yellow_cards > 0 && <div className="card-y"></div>}
                                        {p.red_cards > 0 && <div className="card-r"></div>}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="no-data">Lineups and stats will appear here after the match starts.</p>
                        )}
                    </div>
                </div>

                {/* MIDDLE: MATCH STATISTICS (NEW) */}
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
                </div>

                {/* RIGHT: VENUE INFO */}
                <aside className="match-sidebar">
                    <div className="venue-card">
                        <h4>Venue</h4>
                        <p>{match.stadium}</p>
                        <div className="stadium-overlay"></div>
                    </div>
                    <div className="venue-card">
                        <h4>Date</h4>
                        <p>{new Date(match.match_date).toLocaleString()}</p>
                    </div>
                </aside>
            </div>
        </div>
    );
};

// Reusable Stat Row Component
const StatComparison = ({ label, home = 0, away = 0, unit = "" }) => {
    const total = (home + away) || 1;
    const homePercent = (home / total) * 100;

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
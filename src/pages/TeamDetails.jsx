import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api';
import './TeamDetails.css';
import FootballLoader from '../FootballLoader';

const TeamDetails = () => {
    const { id } = useParams();
    const [data, setData] = useState({ team: null, upcoming: [], finished: [] });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTeamData = async () => {
            try {
                const res = await api.get(`teams/${id}/`);
                setData({
                    team: res.data.team_details,
                    upcoming: res.data.upcoming,
                    finished: res.data.finished
                });
            } catch (err) {
                console.error("Error fetching team details:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchTeamData();
    }, [id]);

    const { team, upcoming, finished } = data;

    if (loading) return <div className="barca-loader"><FootballLoader/></div>;
    if (!team) return <div className="barca-error"><FootballLoader/></div>;

    const getPlayersByPos = (posCode) => {
        return team.players ? team.players.filter(p => p.position === posCode) : [];
    };

    const positionGroups = [
        { title: 'Goalkeepers', code: 'GK' },
        { title: 'Defenders', code: 'DF' },
        { title: 'Midfielders', code: 'MF' },
        { title: 'Forwards', code: 'FW' }
    ];

    return (
        <div className="barca-team-container">
            {/* HERO BANNER */}
            <header className="barca-hero" style={{ '--accent': team.primary_color || '#a50044' }}>
                <div className="hero-overlay"></div>
                <div className="hero-content">
                    <img src={team.logo} alt={team.name} className="barca-logo-lg" />
                    <div className="hero-info">
                        <span className="league-tag">Official Club Profile</span>
                        <h1>{team.name}</h1>
                        <p className="hero-meta">
                            Manager: <strong>{team.coach_name}</strong> | 
                            Stadium: <strong>{team.stadium}</strong>
                        </p>
                    </div>
                </div>
            </header>

            <div className="barca-main-content">
                <div className="squad-wrapper">
                    
                    {/* UPCOMING MATCHES */}
                    <section className="match-section">
                        <div className="position-title-bar">
                            <h2>Upcoming <span>Fixtures</span></h2>
                            <div className="title-line"></div>
                        </div>
                        <div className="team-matches-list">
                            {upcoming.length > 0 ? (
                                upcoming.map(m => (
                                    <div key={m.id} className="match-row-compact fixture">
                                        <div className="compact-team home">
                                            <span>{m.home_team_name}</span>
                                            <img src={m.home_team_logo} alt="" />
                                        </div>
                                        <div className="compact-time-box">
                                            <span className="match-time-tag">VS</span>
                                            <small>{new Date(m.match_date).toLocaleDateString()}</small>
                                        </div>
                                        <div className="compact-team away">
                                            <img src={m.away_team_logo} alt="" />
                                            <span>{m.away_team_name}</span>
                                        </div>
                                    </div>
                                ))
                            ) : <p className="no-data">No upcoming matches scheduled.</p>}
                        </div>
                    </section>

                    {/* RECENT RESULTS */}
                    <section className="match-section">
                        <div className="position-title-bar">
                            <h2>Recent <span>Results</span></h2>
                            <div className="title-line"></div>
                        </div>
                        <div className="team-matches-list">
                            {finished.length > 0 ? (
                                finished.map(m => (
                                    <Link to={`/matches/${m.id}`} key={m.id} className="match-row-compact result">
                                        <div className="compact-team home">
                                            <span>{m.home_team_name}</span>
                                            <img src={m.home_team_logo} alt="" />
                                        </div>
                                        <div className="compact-score-box">
                                            <span className="compact-score">{m.home_score} - {m.away_score}</span>
                                        </div>
                                        <div className="compact-team away">
                                            <img src={m.away_team_logo} alt="" />
                                            <span>{m.away_team_name}</span>
                                        </div>
                                    </Link>
                                ))
                            ) : <p className="no-data">No recent results found.</p>}
                        </div>
                    </section>

                    {/* SQUAD SECTIONS */}
                    {positionGroups.map((pos) => {
                        const players = getPlayersByPos(pos.code);
                        if (players.length === 0) return null;
                        return (
                            <section key={pos.code} className="position-section">
                                <div className="position-title">
                                    <h2>{pos.title}</h2>
                                    <div className="title-line"></div>
                                </div>
                                <div className="barca-player-grid">
                                    {players.map(player => (
                                        <Link to={`/players/${player.id}`} key={player.id} className="barca-player-card">
                                            <div className="card-tp">
                                                <span className="jersey-bg-num">{player.number}</span>
                                                <img src={player.photo} alt={player.name} className="player-img" />
                                            </div>
                                            <div className="card-bt">
                                                <div className="p-identity-wrap">
                                                    <span className="p-num-accent">#{player.number}</span>
                                                    <h3 className="p-name-main">{player.name}</h3>
                                                    <span className="p-pos-sub">{player.position}</span>
                                                </div>
                                                <div className="p-stats-hover">
                                                    <div className="stat-line">
                                                        <span>{player.position === 'GK' ? 'Saves' : 'Goals'}</span>
                                                        <span>{player.position === 'GK' ? player.saves : player.goals}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="card-bottom-line"></div>
                                        </Link>
                                    ))}
                                </div>
                            </section>
                        );
                    })}
                </div>

                {/* SIDEBAR */}
                <aside className="barca-sidebar">
                    <div className="sidebar-card">
                        <h3>About the Club</h3>
                        <p>{team.about}</p>
                    </div>
                    <div className="sidebar-card stadium-highlight">
                        <h3>Home Stadium</h3>
                        <h4>{team.stadium}</h4>
                        <div className="stadium-mini-tag">Home Ground</div>
                    </div>
                </aside>
            </div>
        </div>
    );
};

export default TeamDetails;
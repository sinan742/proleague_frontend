import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api';
import './TeamDetails.css';

const TeamDetails = () => {
    const { id } = useParams();
    const [team, setTeam] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTeamData = async () => {
            try {
                const res = await api.get(`teams/${id}/`);
                setTeam(res.data);
            } catch (err) {
                console.error("Error fetching team details:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchTeamData();
    }, [id]);

    if (loading) return <div className="barca-loader">Loading Club Profile...</div>;
    if (!team) return <div className="barca-error">Team not found.</div>;

    // Filter Logic for Positions
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
            {/* HERO BANNER SECTION */}
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
                    {positionGroups.map((pos) => {
                        const players = getPlayersByPos(pos.code);
                        if (players.length === 0) return null;

                        return (
                            <section key={pos.code} className="position-section">
                                <div className="position-title-bar">
                                    <h2>{pos.title}</h2>
                                    <div className="title-line"></div>
                                </div>
                                
                                <div className="barca-player-grid">
                                    {players.map(player => (
                                        <Link to={`/players/${player.id}`} key={player.id} className="barca-player-card">
                                            {/* Visual Area */}
                                            <div className="card-top">
                                                <span className="jersey-bg-num">{player.number}</span>
                                                <img src={player.photo} alt={player.name} className="player-img-cutout" />
                                            </div>

                                            {/* Identity Area (Pops up on Hover) */}
                                            <div className="card-bottom">
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
                                                    <div className="stat-line">
                                                        <span>Matches</span>
                                                        <span>{player.matches_played}</span>
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
                        <p>Join the atmosphere on matchday.</p>
                    </div>
                </aside>
            </div>
        </div>
    );
};

export default TeamDetails;
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api';
import './PlayerDetail.css';
import FootballLoader from '../FootballLoader';

const PlayerDetail = () => {
    const { id } = useParams();
    const [player, setPlayer] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPlayer = async () => {
            try {
                const res = await api.get(`players/${id}/`);
                setPlayer(res.data);
            } catch (err) {
                console.error("Error fetching player:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchPlayer();
    }, [id]);

    if (loading) return <div className="loading-state"><FootballLoader/></div>;
    if (!player) return <div className="error-state"><FootballLoader/></div>;

    return (
        <div className="barca-player-page">
            {/* HERO SECTION */}
            <section className="player-hero" style={{ '--team-color': '#a50044' }}>
                <div className="hero-background-text">{player.name.split(' ').pop()}</div>
                
                <div className="hero-content">
                    <div className="player-image-wrap">
                        <img src={player.photo} alt={player.name} className="main-cutout" />
                    </div>
                    
                    <div className="player-identity">
                        <span className="big-number">{player.number}</span>
                        <div className="name-box">
                            <h2 className="first-name">{player.name.split(' ')[0]}</h2>
                            <h1 className="last-name">{player.name.split(' ').slice(1).join(' ')}</h1>
                        </div>
                        <div className="position-pill">{player.position}</div>
                    </div>
                </div>
            </section>

            {/* STATS SECTION */}
            <section className="stats-container">
                <div className="stats-header">
                    <h2>Technical <span>Profile</span></h2>
                    <Link to={`/teams/${player.team}`} className="back-to-team">
                        {player.team_name} Club Data →
                    </Link>
                </div>

                <div className="stats-technical-grid">
                    <div className="tech-stat">
                        <label>Appearances</label>
                        <strong>{player.matches_played}</strong>
                    </div>
                    <div className="tech-stat">
                        <label>Minutes</label>
                        <strong>{player.played_minutes}'</strong>
                    </div>
                    <div className="tech-stat highlight">
                        <label>{player.position === 'GK' ? 'Saves' : 'Goals'}</label>
                        <strong>{player.position === 'GK' ? player.saves : player.goals}</strong>
                    </div>
                    <div className="tech-stat">
                        <label>Assists</label>
                        <strong>{player.assists}</strong>
                    </div>
                    <div className="tech-stat card-stat">
                        <label>Discipline</label>
                        <div className="cards-flex">
                            <span className="y-card">{player.yellow_cards}</span>
                            <span className="r-card">{player.red_cards}</span>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default PlayerDetail;
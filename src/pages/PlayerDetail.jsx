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

    if (loading) return <div className="p-loader-wrap"><FootballLoader/></div>;
    if (!player) return <div className="p-error-wrap"><FootballLoader/></div>;

    // Split name for styling
    const nameParts = player.name.split(' ');
    const firstName = nameParts[0];
    const lastName = nameParts.slice(1).join(' ');

    return (
        <div className="p-detail-container" style={{ 
            '--team-primary': player.color_2 || '#1B5E20', 
            '--team-secondary': player.color_1 || '#ffffff' 
        }}>
            {/* HERO SECTION */}
            <section className="p-hero">
                <div className="p-hero-bg-text">{lastName || firstName}</div>
                
                <div className="p-hero-content">
                    <div className="p-image-section">
                        <img src={player.photo} alt={player.name} className="p-main-img" />
                        <div className="p-team-logo-overlay">
                            <img src={player.team_logo} alt={player.team_name} />
                        </div>
                    </div>
                    
                    <div className="p-identity-section">
                        <div className="p-num-row">
                            <span className="p-big-num">{player.number}</span>
                            <div className="p-pos-badge">{player.position}</div>
                        </div>
                        <div className="p-name-card">
                            <h2 className="p-first-name">{firstName}</h2>
                            <h1 className="p-last-name">{lastName}</h1>
                        </div>
                        <Link to={`/teams/${player.team}`} className="p-team-link">
                            {player.team_name}
                        </Link>
                    </div>
                </div>
            </section>

            {/* TECHNICAL STATS SECTION */}
            <section className="p-stats-section">
                <div className="p-section-header">
                    <h2>Technical <span>Performance</span></h2>
                    <div className="p-header-line"></div>
                </div>

                <div className="p-stats-grid">
                    <div className="p-stat-box">
                        <label>Matches</label>
                        <h3>{player.matches_played}</h3>
                    </div>
                    <div className="p-stat-box">
                        <label>Minutes</label>
                        <h3>{player.played_minutes}'</h3>
                    </div>
                    <div className="p-stat-box highlight">
                        <label>{player.position === 'GK' ? 'Saves' : 'Goals'}</label>
                        <h3>{player.position === 'GK' ? player.saves : player.goals}</h3>
                    </div>
                    <div className="p-stat-box">
                        <label>Assists</label>
                        <h3>{player.assists}</h3>
                    </div>
                    <div className="p-stat-box discipline">
                        <label>Discipline</label>
                        <div className="p-cards-row">
                            <div className="p-card-y"><span>{player.yellow_cards}</span></div>
                            <div className="p-card-r"><span>{player.red_cards}</span></div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default PlayerDetail;
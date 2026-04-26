import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api';
import './TeamDetails.css';
import FootballLoader from '../FootballLoader';

const TeamDetails = () => {
    const { id } = useParams();
    const [data, setData] = useState({ team: null, upcoming: [], finished: [] });
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('details'); // Tabs: details, matches, squad

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

    if (loading) return <div className="uptd-loader-wrap"><FootballLoader/></div>;
    if (!team) return <div className="uptd-error">Team not found.</div>;

    const positionGroups = [
        { title: 'Goalkeepers', code: 'GK' },
        { title: 'Defenders', code: 'DF' },
        { title: 'Midfielders', code: 'MF' },
        { title: 'Forwards', code: 'FW' }
    ];

    // CSS Variables for Club Colors
    const clubStyle = {
        '--club-primary': team.color_1 || '#1B5E20',
        '--club-secondary': team.color_2 || '#4CAF50',
        '--club-accent': team.color_3 || '#FFD700'
    };

    return (
        <div className="uptd-container" style={clubStyle}>
            {/* 1. HERO HEADER */}
            <header className="uptd-hero">
                <div className="uptd-hero-content">
                    <img src={team.logo} alt={team.name} className="uptd-main-logo" />
                    <div className="uptd-hero-info">
                        <h1>{team.name}</h1>
                        <p>{team.stadium} • {team.coach_name}</p>
                    </div>
                </div>
            </header>

            {/* 2. NAVIGATION TABS */}
            <nav className="uptd-tab-bar">
                <button 
                    className={activeTab === 'details' ? 'active' : ''} 
                    onClick={() => setActiveTab('details')}
                >Club Details</button>
                <button 
                    className={activeTab === 'matches' ? 'active' : ''} 
                    onClick={() => setActiveTab('matches')}
                >Upcoming Matches</button>
                <button 
                    className={activeTab === 'squad' ? 'active' : ''} 
                    onClick={() => setActiveTab('squad')}
                >Full Squad</button>
            </nav>

            {/* 3. DYNAMIC CONTENT SECTION */}
            <main className="uptd-main-content">
                
                {/* --- DETAILS TAB --- */}
                {activeTab === 'details' && (
                    <div className="uptd-details-tab animated-in">
                        <div className="uptd-about-card">
                            <h3>About the Club</h3>
                            <p>{team.about || "Club history and details will be updated soon."}</p>
                        </div>
                        <div className="uptd-stadium-card">
                            <div className="stadium-overlay"></div>
                            <h3>Home Grounds</h3>
                            <h2>{team.stadium}</h2>
                            <span className="uptd-loc-tag">📍 {team.location}</span>
                        </div>
                    </div>
                )}

                {/* --- MATCHES TAB --- */}
               {activeTab === 'matches' && (
    <div className="uptd-matches-tab animated-in">
        <h2 className="uptd-sub-title">Match <span>Schedule</span></h2>
        <div className="uptd-match-list">
            {upcoming.length > 0 ? upcoming.map(m => {
                const isPlayedOrLive = ['live', 'half_time', 'finished'].includes(m.status);

                return (
                    <div key={m.id} className="uptd-match-item">
                        {/* Home Team */}
                        <div className="uptd-m-side">
                            <img src={m.home_team_logo} alt={m.home_team_name} />
                            <span>{m.home_team_name}</span>
                        </div>
                        
                        {/* Center Info with Link */}
                        <Link to={`/matches/${m.id}`} className="uptd-m-link-wrapper">
                            <div className="uptd-m-center">
                                {isPlayedOrLive ? (
                                    <div className="uptd-m-score">
                                        <span>{m.home_score}</span>
                                        <span className="uptd-score-divider">-</span>
                                        <span>{m.away_score}</span>
                                    </div>
                                ) : (
                                    <span className="uptd-vs">VS</span>
                                )}
                                <p className="uptd-m-date">
                                    {new Date(m.match_date).toLocaleDateString('en-GB', {
                                        day: '2-digit',
                                        month: 'short'
                                    })}
                                </p>
                                {m.status === 'live' && (
                                    <span className="uptd-live-indicator">
                                        <span className="live-dot"></span> LIVE
                                    </span>
                                )}
                            </div>
                        </Link>

                        {/* Away Team */}
                        <div className="uptd-m-side">
                            <img src={m.away_team_logo} alt={m.away_team_name} />
                            <span>{m.away_team_name}</span>
                        </div>
                    </div>
                );
            }) : <p className="uptd-empty">No upcoming fixtures scheduled.</p>}
        </div>
    </div>
)}
                {/* --- SQUAD TAB --- */}
                {activeTab === 'squad' && (
                    <div className="uptd-squad-tab animated-in">
                        {positionGroups.map(group => {
                            const players = team.players?.filter(p => p.position === group.code) || [];
                            if (players.length === 0) return null;
                            return (
                                <div key={group.code} className="uptd-pos-group">
                                    <h3 className="uptd-pos-title">{group.title}</h3>
                                    <div className="uptd-player-grid">
                                        {players.map(p => (
                                            <Link 
                                                to={`/players/${p.id}`} 
                                                key={p.id} 
                                                className="uptd-p-card"
                                                style={{ '--p-color': team.color_1, '--s-color': team.color_2 }}
                                            >
                                                <div className="uptd-p-top">
                                                    <span className="uptd-p-number">{p.number}</span>
                                                    <img src={p.photo} alt={p.name} />
                                                </div>
                                                <div className="uptd-p-bottom">
                                                    <h4>{p.name}</h4>
                                                    <span className="uptd-p-role">{p.position}</span>
                                                </div>
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </main>
        </div>
    );
};

export default TeamDetails;
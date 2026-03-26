import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import './AllPlayers.css';

const AllPlayers = () => {
    const [players, setPlayers] = useState([]);
    const [filteredPlayers, setFilteredPlayers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [activeFilter, setActiveFilter] = useState("ALL");

    useEffect(() => {
        const fetchPlayers = async () => {
            try {
                const res = await api.get('players/');
                setPlayers(res.data);
                setFilteredPlayers(res.data);
            } catch (err) {
                console.error("Error fetching league players:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchPlayers();
    }, []);

    // Filter Logic
    useEffect(() => {
        let results = players;

        if (activeFilter !== "ALL") {
            results = results.filter(p => p.position === activeFilter);
        }

        if (searchTerm) {
            results = results.filter(p => 
                p.name.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        setFilteredPlayers(results);
    }, [searchTerm, activeFilter, players]);

    if (loading) return <div className="league-loader">Loading League Stars...</div>;

    return (
        <div className="league-players-container">
            <header className="league-players-header">
                <div className="header-content">
                    <h1>League <span>Stars</span></h1>
                    <p>Browse all registered players in the tournament</p>
                </div>
            </header>

            <div className="filter-bar">
                <div className="search-box">
                    <input 
                        type="text" 
                        placeholder="Search player name..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="position-filters">
                    {["ALL", "GK", "DF", "MF", "FW"].map(pos => (
                        <button 
                            key={pos}
                            className={activeFilter === pos ? "active" : ""}
                            onClick={() => setActiveFilter(pos)}
                        >
                            {pos === "ALL" ? "All Players" : pos}
                        </button>
                    ))}
                </div>
            </div>

            <div className="league-player-grid">
                {filteredPlayers.length > 0 ? (
                    filteredPlayers.map(player => (
                        <Link to={`/players/${player.id}`} key={player.id} className="player-league-card">
                            <div className="card-visual">
                                <span className="bg-num">{player.number}</span>
                                <img src={player.photo} alt={player.name} className="player-img" />
                                <div className="team-badge-mini">
                                    {player.team_name}
                                </div>
                            </div>
                            <div className="card-info">
                                <div className="info-top">
                                    <span className="p-number">#{player.number}</span>
                                    <span className="p-pos">{player.position}</span>
                                </div>
                                <h3 className="p-name">{player.name}</h3>
                                <div className="p-main-stat">
                                    {player.position === 'GK' ? 
                                        `🧤 ${player.saves} Saves` : 
                                        `⚽ ${player.goals} Goals`}
                                </div>
                            </div>
                            <div className="bottom-accent"></div>
                        </Link>
                    ))
                ) : (
                    <div className="no-results">No players found matching your criteria.</div>
                )}
            </div>
        </div>
    );
};

export default AllPlayers;
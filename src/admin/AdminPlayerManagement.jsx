import React, { useState, useEffect } from 'react';
import api from '../api';
import './AdminPlayerManagement.css';
import { toast } from 'react-toastify';
import FootballLoader from '../FootballLoader';
import AdminNavbar from '../AdminNavbar/AdminNavbar';

const AdminPlayerManagement = () => {
    const [players, setPlayers] = useState([]);
    const [teams, setTeams] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    
    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingPlayer, setEditingPlayer] = useState(null);

    useEffect(() => {
        fetchInitialData();
    }, []);

    const fetchInitialData = async () => {
        try {
            const [playerRes, teamRes] = await Promise.all([
                api.get('admin-players/'),
                api.get('admin-teams/') 
            ]);
            setPlayers(playerRes.data);
            setTeams(teamRes.data);
            setLoading(false);
        } catch (err) {
            toast.error("Failed to load data");
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm("Delete this player?")) {
            try {
                await api.delete(`admin-players/${id}/`);
                toast.success("Player removed");
                setPlayers(players.filter(p => p.id !== id));
            } catch (err) {
                toast.error("Error deleting player");
            }
        }
    };

    const openEditModal = (player) => {
        setEditingPlayer({ ...player });
        setIsModalOpen(true);
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        try {
            const res = await api.put(`admin-players/${editingPlayer.id}/`, editingPlayer);
            toast.success("Player updated!");
            
            // Re-fetch or manually update local state
            setPlayers(players.map(p => p.id === editingPlayer.id ? res.data : p));
            setIsModalOpen(false);
        } catch (err) {
            toast.error("Update failed. Check if number is unique.");
        }
    };

    const filteredPlayers = players.filter(p => 
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.number.toString().includes(searchTerm)
    );

    if (loading) return <div className="ml-loader-wrapper"><FootballLoader/></div>;

    return (
        <div className="ml-layout">
            <AdminNavbar />
            
            <main className="ml-content">
                <header className="ml-header-section">
                    <h2>Player <span>Management</span></h2>
                    <div className="ml-search-bar">
                        <input 
                            type="text" 
                            placeholder="Search by name or jersey..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </header>

                <div className="ml-table-container">
                    <table className="ml-table">
                        <thead>
                            <tr>
                                <th>Photo</th>
                                <th>Name</th>
                                <th>Jersey</th>
                                <th>Position</th>
                                <th>Current Team</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredPlayers.map(player => (
                                <tr key={player.id}>
                                    <td>
                                        <img 
                                            src={player.photo || '/default.png'} 
                                            className="ml-player-img" 
                                            alt={player.name} 
                                        />
                                    </td>
                                    <td><span className="ml-player-name">{player.name}</span></td>
                                    <td><span className="ml-jersey-pill">#{player.number}</span></td>
                                    <td>{player.position}</td>
                                    <td>{player.team_name || 'Free Agent'}</td>
                                    <td className="ml-actions">
                                        <button className="ml-action-btn ml-edit" onClick={() => openEditModal(player)}>EDIT</button>
                                        <button className="ml-action-btn ml-delete" onClick={() => handleDelete(player.id)}>DELETE</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* MODAL SECTION */}
                {isModalOpen && (
                    <div className="ml-modal-overlay">
                        <div className="ml-modal-card">
                            <h3>Edit <span>Player</span></h3>
                            <form onSubmit={handleUpdate}>
                                <div className="ml-form-group">
                                    <label>Full Name</label>
                                    <input 
                                        type="text" 
                                        value={editingPlayer.name} 
                                        onChange={(e) => setEditingPlayer({...editingPlayer, name: e.target.value})}
                                        required 
                                    />
                                </div>
                                <div className="ml-form-row">
                                    <div className="ml-form-group">
                                        <label>Jersey Number</label>
                                        <input 
                                            type="number" 
                                            value={editingPlayer.number} 
                                            onChange={(e) => setEditingPlayer({...editingPlayer, number: e.target.value})}
                                            required 
                                        />
                                    </div>
                                    <div className="ml-form-group">
                                        <label>Position</label>
                                        <select 
                                            value={editingPlayer.position} 
                                            onChange={(e) => setEditingPlayer({...editingPlayer, position: e.target.value})}
                                        >
                                            <option value="Forward">Forward</option>
                                            <option value="Midfielder">Midfielder</option>
                                            <option value="Defender">Defender</option>
                                            <option value="Goalkeeper">Goalkeeper</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="ml-form-group">
                                    <label>Assign Team</label>
                                    <select 
                                        value={editingPlayer.team} 
                                        onChange={(e) => setEditingPlayer({...editingPlayer, team: e.target.value})}
                                    >
                                        <option value="">Select Team</option>
                                        {teams.map(t => (
                                            <option key={t.id} value={t.id}>{t.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="ml-modal-footer">
                                    <button type="button" className="ml-cancel-btn" onClick={() => setIsModalOpen(false)}>Cancel</button>
                                    <button type="submit" className="ml-save-btn">Update Player</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default AdminPlayerManagement;
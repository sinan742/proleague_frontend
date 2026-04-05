import React, { useState, useEffect } from 'react';
import api from '../api';
import { toast } from 'react-toastify';
import FootballLoader from '../FootballLoader';
import AdminNavbar from '../AdminNavbar/AdminNavbar'; // Imported as requested
import './AdminManageTeams.css';

const AdminManageTeams = () => {
    const [teams, setTeams] = useState([]);
    const [selectedTeam, setSelectedTeam] = useState(null);
    const [loading, setLoading] = useState(true);
    const [view, setView] = useState('list');

    // Modal States
    const [showTeamModal, setShowTeamModal] = useState(false);
    const [showPlayerModal, setShowPlayerModal] = useState(false);
    const [editingTeam, setEditingTeam] = useState(null);
    const [editingPlayer, setEditingPlayer] = useState(null);

    // Form States
    const [teamForm, setTeamForm] = useState({ name: '', coach_name: '', logo: '' });
    const [playerForm, setPlayerForm] = useState({ name: '', position: '', number: '', photo: '' });

    useEffect(() => { fetchTeams(); }, []);

    const fetchTeams = async () => {
        try {
            const res = await api.get('admin-teams/');
            setTeams(res.data);
        } catch (err) {
            toast.error("Failed to load teams");
        } finally {
            setLoading(false);
        }
    };

    const handleTeamClick = async (teamId) => {
        setLoading(true);
        try {
            const res = await api.get(`admin-teams/${teamId}/`);
            setSelectedTeam(res.data);
            setView('detail');
        } catch (err) {
            toast.error("Could not load details");
        } finally {
            setLoading(false);
        }
    };

    const handleTeamSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingTeam) {
                await api.put(`admin-teams/${editingTeam.id}/`, teamForm);
                toast.success("Team updated!");
            } else {
                await api.post('admin-teams/', teamForm);
                toast.success("Team added!");
            }
            setShowTeamModal(false);
            setEditingTeam(null);
            setTeamForm({ name: '', coach_name: '', logo: '' });
            fetchTeams();
        } catch (err) {
            toast.error("Error saving team");
        }
    };

    const handlePlayerSubmit = async (e) => {
        e.preventDefault();
        const payload = { ...playerForm, team: selectedTeam.id };
        try {
            if (editingPlayer) {
                await api.put(`admin-players/${editingPlayer.id}/`, payload);
                toast.success("Player updated!");
            } else {
                await api.post('admin-players/', payload);
                toast.success("Player added!");
            }
            setShowPlayerModal(false);
            setEditingPlayer(null);
            setPlayerForm({ name: '', position: '', number: '', photo: '' });
            handleTeamClick(selectedTeam.id); 
        } catch (err) {
            toast.error("Error saving player.");
        }
    };

    const deletePlayer = async (id) => {
        if (!window.confirm("Remove this player?")) return;
        try {
            await api.delete(`admin-players/${id}/`);
            handleTeamClick(selectedTeam.id);
        } catch (err) {
            toast.error("Delete failed");
        }
    };

    if (loading) return <FootballLoader message="Syncing League Data..." />;

    return (
        <div className="mt-layout-wrapper">
            {/* Sidebar Component */}
            <AdminNavbar />

            {/* Main Content Area */}
            <div className="mt-main-content">
                <div className="mt-container">
                    {view === 'list' ? (
                        <section className="mt-list-view">
                            <header className="mt-header">
                                <h2>Manage <span>Teams</span></h2>
                                <button className="ad-btn-primary" onClick={() => setShowTeamModal(true)}>+ New Team</button>
                            </header>
                            <div className="mt-grid">
                                {teams.map(team => (
                                    <div key={team.id} className="mt-card" onClick={() => handleTeamClick(team.id)}>
                                        <img src={team.logo || '/default-logo.png'} alt="logo" />
                                        <h3>{team.name}</h3>
                                        <p>Coach: {team.coach_name || 'N/A'}</p>
                                    </div>
                                ))}
                            </div>
                        </section>
                    ) : (
                        <section className="mt-detail-view">
                            <button className="mt-back-btn" onClick={() => setView('list')}>← Back to Teams</button>
                            <div className="mt-team-banner">
                                <img src={selectedTeam.logo || '/default-logo.png'} alt="logo" />
                                <div className="banner-text">
                                    <h1>{selectedTeam.name}</h1>
                                    <button className="edit-team-small" onClick={() => {
                                        setEditingTeam(selectedTeam);
                                        setTeamForm({ name: selectedTeam.name, coach_name: selectedTeam.coach_name, logo: selectedTeam.logo });
                                        setShowTeamModal(true);
                                    }}>Edit Team Info</button>
                                </div>
                            </div>

                            <div className="mt-players-section">
                                <div className="mt-section-header">
                                    <h3>Squad List</h3>
                                    <button className="ad-btn-secondary" onClick={() => setShowPlayerModal(true)}>+ Add Player</button>
                                </div>
                                <table className="mt-table">
                                    <thead>
                                        <tr><th>Players</th><th>#</th><th>Name</th><th>Position</th><th>Actions</th></tr>
                                    </thead>
                                    <tbody>
                                        {selectedTeam.players?.map(p => (
                                            <tr key={p.id}>
                                                <td><img src={p.photo || '/default-avatar.png'} alt={p.name} className="mt-player-img" /></td>
                                                <td>{p.number}</td>
                                                <td>{p.name}</td>
                                                <td>{p.position}</td>
                                                <td>
                                                    <button className="mt-edit-btn" onClick={() => {
                                                        setEditingPlayer(p);
                                                        setPlayerForm({ name: p.name, position: p.position, number: p.number, photo: p.photo || '' });
                                                        setShowPlayerModal(true);
                                                    }}>Edit</button>
                                                    <button className="mt-del-btn" onClick={() => deletePlayer(p.id)}>Delete</button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </section>
                    )}

                    {/* MODALS */}
                    {showTeamModal && (
                        <div className="mt-modal-overlay">
                            <div className="mt-modal">
                                <h3>{editingTeam ? 'Update Team' : 'Create Team'}</h3>
                                <form onSubmit={handleTeamSubmit}>
                                    <input type="text" placeholder="Team Name" required value={teamForm.name} onChange={e => setTeamForm({...teamForm, name: e.target.value})} />
                                    <input type="text" placeholder="Coach Name" value={teamForm.coach_name} onChange={e => setTeamForm({...teamForm, coach_name: e.target.value})} />
                                    <input type="text" placeholder="Team Logo URL" value={teamForm.logo} onChange={e => setTeamForm({...teamForm, logo: e.target.value})} />
                                    <div className="modal-btns">
                                        <button type="submit" className="ad-btn-primary">Save Team</button>
                                        <button type="button" className="mt-cancel-btn" onClick={() => {setShowTeamModal(false); setEditingTeam(null);}}>Cancel</button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )}

                    {showPlayerModal && (
                        <div className="mt-modal-overlay">
                            <div className="mt-modal">
                                <h3>{editingPlayer ? 'Update Player' : 'Register Player'}</h3>
                                <form onSubmit={handlePlayerSubmit}>
                                    <input type="text" placeholder="Full Name" required value={playerForm.name} onChange={e => setPlayerForm({...playerForm, name: e.target.value})} />
                                    <input type="text" placeholder="Position" value={playerForm.position} onChange={e => setPlayerForm({...playerForm, position: e.target.value})} />
                                    <input type="number" placeholder="Jersey Number" value={playerForm.number} onChange={e => setPlayerForm({...playerForm, number: e.target.value})} />
                                    <input type="text" placeholder="Photo URL" value={playerForm.photo} onChange={e => setPlayerForm({...playerForm, photo: e.target.value})} />
                                    <div className="modal-btns">
                                        <button type="submit" className="ad-btn-primary">Confirm Player</button>
                                        <button type="button" className="mt-cancel-btn" onClick={() => {setShowPlayerModal(false); setEditingPlayer(null);}}>Cancel</button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminManageTeams;
import React, { useState, useEffect } from 'react';
import api from '../api';
import './AdminMatchSchedule.css';
import { toast } from 'react-toastify';
import FootballLoader from '../FootballLoader';
import AdminNavbar from '../AdminNavbar/AdminNavbar';

const AdminMatchSchedule = () => {
    const [matches, setMatches] = useState([]);
    const [teams, setTeams] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const [editingMatch, setEditingMatch] = useState({
        home_team: '',
        away_team: '',
        match_date: '',
        match_time_input: '', 
        stadium: '',
        status: 'scheduled'
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [matchRes, teamRes] = await Promise.all([
                api.get('admin-match-shedule/'),
                api.get('admin-teams/') 
            ]);
            setMatches(matchRes.data);
            setTeams(teamRes.data);
            setLoading(false);
        } catch (err) {
            toast.error("Failed to load data");
            setLoading(false);
        }
    };

    const handleOpenModal = (match = null) => {
        if (match) {
            const timeOnly = match.match_time?.includes('T') 
                ? match.match_time.split('T')[1].substring(0, 5) 
                : match.match_time;

            setEditingMatch({ 
                ...match, 
                match_time_input: timeOnly 
            });
        } else {
            setEditingMatch({
                home_team: '', away_team: '', match_date: '',
                match_time_input: '', stadium: '', status: 'scheduled'
            });
        }
        setIsModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const combinedDateTime = `${editingMatch.match_date}T${editingMatch.match_time_input}:00`;

        const payload = {
            home_team: editingMatch.home_team,
            away_team: editingMatch.away_team,
            match_date: editingMatch.match_date,
            match_time: combinedDateTime,
            stadium: editingMatch.stadium,
            status: editingMatch.status
        };

        try {
            if (editingMatch.id) {
                const res = await api.put(`admin-match-shedule/${editingMatch.id}/`, payload);
                setMatches(matches.map(m => m.id === editingMatch.id ? res.data : m));
                toast.success("Match updated");
            } else {
                const res = await api.post('admin-match-shedule/', payload);
                setMatches([res.data, ...matches]);
                toast.success("Match scheduled");
            }
            setIsModalOpen(false);
        } catch (err) {
            toast.error("Error: Check if teams are different");
        }
    };

    const handleDelete = async (id) => {
        if (!id) return;
        if (window.confirm("Delete this match?")) {
            try {
                await api.delete(`admin-match-shedule/${id}/`);
                setMatches(matches.filter(m => m.id !== id));
                toast.success("Match deleted");
            } catch (err) {
                toast.error("Delete failed");
            }
        }
    };

    if (loading) return <div className="ml-loader-container"><FootballLoader/></div>;

    return (
        <div className="ml-layout">
            <AdminNavbar />
            
            <main className="ml-content">
                <header className="ml-header-section">
                    <h2>Match <span>Schedule</span></h2>
                    <button className="ml-add-btn" onClick={() => handleOpenModal()}>
                        + CREATE MATCH
                    </button>
                </header>

                <div className="ml-table-wrapper">
                    <table className="ml-table">
                        <thead>
                            <tr>
                                <th>Date & Time</th>
                                <th>Matchup</th>
                                <th>Stadium</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {matches.length > 0 ? matches.map(m => (
                                <tr key={m.id}>
                                    <td>
                                        <div className="ml-date-box">
                                            <strong>{m.match_date}</strong>
                                            <span>{m.match_time?.split('T')[1]?.substring(0, 5)}</span>
                                        </div>
                                    </td>
                                    <td>
                                        <span className="ml-team-text">{m.home_team_name} {m.home_score}</span>
                                        <small className="ml-vs"> VS </small>
                                        <span className="ml-team-text">{m.away_score} {m.away_team_name}</span>
                                    </td>
                                    <td>{m.stadium}</td>
                                    <td><span className={`ml-status-pill ${m.status}`}>{m.status}</span></td>
                                    <td className="ml-actions">
                                        <button className="ml-action-btn ml-edit" onClick={() => handleOpenModal(m)}>EDIT</button>
                                        <button className="ml-action-btn ml-delete" onClick={() => handleDelete(m.id)}>DELETE</button>
                                    </td>
                                </tr>
                            )) : (
                                <tr><td colSpan="5" className="ml-no-data">No matches found.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {isModalOpen && (
                    <div className="ml-modal-overlay">
                        <div className="ml-modal-card">
                            <h3>{editingMatch.id ? 'Edit' : 'Schedule'} <span>Match</span></h3>
                            <form onSubmit={handleSubmit}>
                                <div className="ml-form-row">
                                    <div className="ml-form-group">
                                        <label>Home Team</label>
                                        <select value={editingMatch.home_team} onChange={(e) => setEditingMatch({...editingMatch, home_team: e.target.value})} required>
                                            <option value="">Select Team</option>
                                            {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                                        </select>
                                    </div>
                                    <div className="ml-form-group">
                                        <label>Away Team</label>
                                        <select value={editingMatch.away_team} onChange={(e) => setEditingMatch({...editingMatch, away_team: e.target.value})} required>
                                            <option value="">Select Team</option>
                                            {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                                        </select>
                                    </div>
                                </div>
                                <div className="ml-form-row">
                                    <div className="ml-form-group">
                                        <label>Date</label>
                                        <input type="date" value={editingMatch.match_date} onChange={(e) => setEditingMatch({...editingMatch, match_date: e.target.value})} required />
                                    </div>
                                    <div className="ml-form-group">
                                        <label>Time</label>
                                        <input type="time" value={editingMatch.match_time_input} onChange={(e) => setEditingMatch({...editingMatch, match_time_input: e.target.value})} required />
                                    </div>
                                </div>
                                <div className="ml-form-group">
                                    <label>Stadium</label>
                                    <input type="text" value={editingMatch.stadium} onChange={(e) => setEditingMatch({...editingMatch, stadium: e.target.value})} required placeholder="Enter Stadium Name" />
                                </div>
                                <div className="ml-modal-footer">
                                    <button type="button" className="ml-cancel-btn" onClick={() => setIsModalOpen(false)}>Cancel</button>
                                    <button type="submit" className="ml-save-btn">Save Match</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default AdminMatchSchedule;
import React, { useState, useEffect } from 'react';
import api from '../api';
import { toast } from 'react-toastify';
import FootballLoader from '../FootballLoader';
import AdminNavbar from '../AdminNavbar/AdminNavbar';
import './AdminVoucherManagement.css';

const AdminVoucherManagement = () => {
    const [vouchers, setVouchers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingVoucher, setEditingVoucher] = useState(null);

    // Initial Form State matching your VoucherPool Model
    const initialForm = {
        code: '',
        reward_type: 'KIT',
        points_cost: 500,
        is_claimed: false,
        is_redeemed: false
    };
    const [form, setForm] = useState(initialForm);

    useEffect(() => {
        fetchVouchers();
    }, []);

    const fetchVouchers = async () => {
        try {
            const res = await api.get('admin-vouchers/');
            setVouchers(res.data);
        } catch (err) {
            toast.error("Failed to load rewards pool");
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingVoucher) {
                await api.put(`admin-vouchers/${editingVoucher.id}/`, form);
                toast.success("Reward updated successfully!");
            } else {
                await api.post('admin-vouchers/', form);
                toast.success("New reward added to the pool!");
            }
            closeModal();
            fetchVouchers();
        } catch (err) {
            toast.error(err.response?.data?.code || "Error saving reward");
        }
    };

    const deleteVoucher = async (id) => {
        if (!window.confirm("Are you sure you want to remove this reward?")) return;
        try {
            await api.delete(`admin-vouchers/${id}/`);
            toast.success("Reward deleted");
            fetchVouchers();
        } catch (err) {
            toast.error("Delete failed");
        }
    };

    const closeModal = () => {
        setShowModal(false);
        setEditingVoucher(null);
        setForm(initialForm);
    };

    if (loading) return <FootballLoader message="Loading ProLeague Rewards..." />;

    return (
        <div className="av-layout">
            <AdminNavbar/>
            <main className="av-content">
                <div className="av-header-section">
                    <div className="av-title">
                        <h1>Voucher <span>Pool</span></h1>
                        <p>Manage football kits, tickets, and discounts for users.</p>
                    </div>
                    <button className="av-add-btn" onClick={() => setShowModal(true)}>
                        <i className="fas fa-plus"></i> Add New Reward
                    </button>
                </div>

                <div className="av-stats-grid">
                    <div className="av-stat-card">
                        <span>Total Items</span>
                        <h3>{vouchers.length}</h3>
                    </div>
                    <div className="av-stat-card">
                        <span>Available</span>
                        <h3>{vouchers.filter(v => !v.is_claimed).length}</h3>
                    </div>
                    <div className="av-stat-card">
                        <span>Claimed</span>
                        <h3>{vouchers.filter(v => v.is_claimed).length}</h3>
                    </div>
                </div>

                <div className="av-table-wrapper">
                    <table className="av-main-table">
                        <thead>
                            <tr>
                                <th>Reward Type</th>
                                <th>Voucher Code</th>
                                <th>Points Cost</th>
                                <th>Status</th>
                                <th>Redeemed</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {vouchers.map((v) => (
                                <tr key={v.id}>
                                    <td>
                                        <span className={`type-badge ${v.reward_type.toLowerCase()}`}>
                                            {v.reward_type}
                                        </span>
                                    </td>
                                    <td className="code-cell">{v.code}</td>
                                    <td><strong>{v.points_cost}</strong> pts</td>
                                    <td>
                                        <span className={`status-dot ${v.is_claimed ? 'claimed' : 'available'}`}>
                                            {v.is_claimed ? 'Claimed' : 'Available'}
                                        </span>
                                    </td>
                                    <td>{v.is_redeemed ? '✅ Yes' : '❌ No'}</td>
                                    <td className="actions-cell">
                                        <button className="btn-icon edit" onClick={() => {
                                            setEditingVoucher(v);
                                            setForm(v);
                                            setShowModal(true);
                                        }}>Edit</button>
                                        <button className="btn-icon delete" onClick={() => deleteVoucher(v.id)}>Del</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </main>

            {showModal && (
                <div className="av-modal-overlay">
                    <div className="av-modal">
                        <div className="modal-header">
                            <h3>{editingVoucher ? 'Edit Reward' : 'Create New Reward'}</h3>
                            <button className="close-x" onClick={closeModal}>&times;</button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label>Voucher Code</label>
                                <input 
                                    type="text" 
                                    placeholder="e.g. KIT-M-2026" 
                                    required 
                                    value={form.code} 
                                    onChange={e => setForm({...form, code: e.target.value.toUpperCase()})}
                                />
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Reward Type</label>
                                    <select 
                                        value={form.reward_type} 
                                        onChange={e => setForm({...form, reward_type: e.target.value})}
                                    >
                                        <option value="KIT">Football Kit</option>
                                        <option value="TICKET">Match Ticket</option>
                                        <option value="DISCOUNT">Discount</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Points Cost</label>
                                    <input 
                                        type="number" 
                                        value={form.points_cost} 
                                        onChange={e => setForm({...form, points_cost: e.target.value})}
                                    />
                                </div>
                            </div>

                            <div className="modal-actions">
                                <button type="button" className="btn-secondary" onClick={closeModal}>Cancel</button>
                                <button type="submit" className="btn-primary">Save Reward</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminVoucherManagement;
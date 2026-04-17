import React, { useState, useEffect } from 'react';
import api from '../api';
import { toast } from 'react-toastify';
import FootballLoader from '../FootballLoader';
import AdminNavbar from '../AdminNavbar/AdminNavbar';
import './AdminBookingManagement.css';

const AdminBookingManagement = () => {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('ALL');
    
    // Detail View and Navigation States
    const [selectedBooking, setSelectedBooking] = useState(null);
    const [view, setView] = useState('list'); // 'list' or 'detail'

    useEffect(() => {
        fetchBookings();
    }, []);

    const fetchBookings = async () => {
        setLoading(true);
        try {
            const res = await api.get('admin-bookings/');
            setBookings(res.data);
        } catch (err) {
            toast.error("Failed to load booking ledger");
        } finally {
            setLoading(false);
        }
    };

    // detail button click cheyyumpol ulla function
    const handleViewDetails = async (id) => {
        setLoading(true);
        try {
            const res = await api.get(`admin-bookings/${id}/`);
            setSelectedBooking(res.data);
            setView('detail'); // Switch to Detail Screen
        } catch (err) {
            toast.error("Could not load booking details");
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (id, newStatus) => {
        try {
            await api.put(`admin-bookings/${id}/`, { 
                payment_status: newStatus, 
                is_confirmed: newStatus === 'COMPLETED' 
            });
            toast.success(`Booking marked as ${newStatus}`);
            
            // Refresh logic
            if (view === 'detail') {
                handleViewDetails(id);
            } else {
                fetchBookings();
            }
        } catch (err) {
            toast.error("Update failed");
        }
    };

    const filteredBookings = filter === 'ALL' ? bookings : bookings.filter(b => b.stand === filter);

    if (loading) return <FootballLoader message="Syncing Ticket Records..." />;

    return (
        <div className="ab-layout">
            <AdminNavbar />

            <main className="ab-main">
                {view === 'list' ? (
                    // --- 1. LIST VIEW (ALL BOOKINGS) ---
                    <div className="ab-view-container">
                        <header className="ab-header">
                            <div className="ab-welcome">
                                <h1>Booking <span>Management</span></h1>
                                <p>Monitor stadium occupancy and ticket revenue.</p>
                            </div>
                            <div className="ab-controls">
                                <select className="ab-filter" value={filter} onChange={(e) => setFilter(e.target.value)}>
                                    <option value="ALL">All Stands</option>
                                    <option value="VIP">VIP West</option>
                                    <option value="GENERAL">General East</option>
                                    <option value="NORTH">North Goal</option>
                                    <option value="SOUTH">South Goal</option>
                                </select>
                            </div>
                        </header>

                        <div className="ab-stats-container">
                            <div className="ab-stat-glass vip">
                                <span>VIP Revenue</span>
                                <h3>₹{bookings.filter(b => b.stand === 'VIP').reduce((acc, curr) => acc + parseFloat(curr.price_paid), 0)}</h3>
                            </div>
                            <div className="ab-stat-glass pending">
                                <span>Pending Approval</span>
                                <h3>{bookings.filter(b => b.payment_status === 'PENDING').length}</h3>
                            </div>
                            <div className="ab-stat-glass total">
                                <span>Seats Booked</span>
                                <h3>{bookings.length}</h3>
                            </div>
                        </div>

                        <div className="ab-table-card">
                            <table className="ab-table">
                                <thead>
                                    <tr>
                                        <th>User</th>
                                        <th>Match</th>
                                        <th>Stand & Seat</th>
                                        <th>Amount</th>
                                        <th>Status</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredBookings.map((b) => (
                                        <tr key={b.id} className={b.is_confirmed ? 'confirmed-row' : ''}>
                                            <td>
                                                <div className="user-info">
                                                    <span className="user-avatar">{b.user_name?.charAt(0)}</span>
                                                    {b.user_name}
                                                </div>
                                            </td>
                                            <td className="match-name">{b.match_name}</td>
                                            <td>
                                                <span className={`stand-tag ${b.stand.toLowerCase()}`}>{b.stand}</span>
                                                <span className="seat-no">Seat: {b.seat_number || 'TBD'}</span>
                                            </td>
                                            <td className="price-cell">₹{b.price_paid}</td>
                                            <td>
                                                <span className={`pay-status ${b.payment_status.toLowerCase()}`}>
                                                    {b.payment_status}
                                                </span>
                                            </td>
                                            <td className="actions-cell">
                                                {b.payment_status === 'PENDING' && (
                                                    <button 
                                                        className="btn-approve" 
                                                        onClick={() => handleStatusUpdate(b.id, 'COMPLETED')}
                                                    >Confirm</button>
                                                )}
                                                <button className="btn-view" onClick={() => handleViewDetails(b.id)}>
                                                    Details
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                ) : (
                    // --- 2. DETAIL VIEW (SINGLE BOOKING INFO) ---
                    <div className="ab-detail-view animated fadeIn">
                        <button className="ab-back-btn" onClick={() => setView('list')}>
                            ← Back to Ledger
                        </button>
                        
                        <div className="detail-header-row">
                            <h2>Ticket Details <span>#PRO-{selectedBooking.id}</span></h2>
                        </div>

                        <div className="detail-grid">
                            <div className="detail-card info-section">
                                <h3>Fan & Match Info</h3>
                                <div className="detail-item">
                                    <label>User Name</label>
                                    <p>{selectedBooking.user_name}</p>
                                </div>
                                <div className="detail-item">
                                    <label>Match Fixture</label>
                                    <p>{selectedBooking.match_name}</p>
                                </div>
                                <div className="detail-item">
                                    <label>Seat Allocation</label>
                                    <p>{selectedBooking.stand} - Seat {selectedBooking.seat_number || 'N/A'}</p>
                                </div>
                                <div className="detail-item">
                                    <label>Booking Date</label>
                                    <p>{new Date(selectedBooking.booking_date).toLocaleString()}</p>
                                </div>
                            </div>

                            <div className="detail-card finance-section">
                                <h3>Payment Status</h3>
                                <div className="detail-item">
                                    <label>Payment Method</label>
                                    <p>{selectedBooking.payment_method}</p>
                                </div>
                                <div className="detail-item">
                                    <label>Price Paid</label>
                                    <p className="highlight-price">₹{selectedBooking.price_paid}</p>
                                </div>
                                <div className="detail-item">
                                    <label>Voucher Status</label>
                                    <p>{selectedBooking.applied_voucher ? 'Voucher Applied' : 'No Voucher'}</p>
                                </div>
                                <div className={`status-banner ${selectedBooking.payment_status.toLowerCase()}`}>
                                    {selectedBooking.payment_status}
                                </div>
                                
                                {selectedBooking.payment_status === 'PENDING' && (
                                    <button 
                                        className="btn-verify-full" 
                                        onClick={() => handleStatusUpdate(selectedBooking.id, 'COMPLETED')}
                                    >
                                        Mark as Completed
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default AdminBookingManagement;
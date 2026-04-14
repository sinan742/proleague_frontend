import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import './RewardHistory.css';

const RewardHistory = () => {
    const [history, setHistory] = useState([]);
    const [vouchers, setVouchers] = useState([]); // State for won vouchers
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch point transactions (predictions)
                const predRes = await api.get('predictions-history/');
                setHistory(predRes.data);

                // Fetch voucher collection (scratched cards)
                const voucherRes = await api.get('voucher-history/');
                setVouchers(voucherRes.data);

                setLoading(false);
            } catch (error) {
                console.error("Error fetching history:", error);
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    if (loading) return <div className="history-loader">Loading your rewards...</div>;

    return (
        <div className="reward-history-container">
            {/* Header with Navigation to Redeem Page */}
            <div className="history-header-flex">
                <h2 className="history-header">Reward <span>History</span></h2>
                <button 
                    className="navigate-redeem-btn" 
                    onClick={() => navigate('/reward-scratch')}
                >
                    Redeem Points 🎁
                </button>
            </div>

            {/* SECTION 1: POINTS EARNED FROM MATCHES */}
            <div className="history-section">
                <h3 className="sub-header">Points <span>Earned</span></h3>
                <div className="history-cards-list">
                    {history.map(item => (
                        <div key={item.id} className="history-card">
                            <div className="card-top">
                                <span className="match-date">{new Date(item.created_at).toLocaleDateString()}</span>
                                <div className="points-badge">+{item.points_awarded} Points</div>
                            </div>
                            <div className="card-footer">
                                <span className="match-name">{item.match_name}</span>
                                <span className="success-tag">Successfully Processed</span>
                            </div>
                        </div>
                    ))}
                    {history.length === 0 && <p className="empty-msg">No prediction points earned yet.</p>}
                </div>
            </div>

            {/* SECTION 2: VOUCHERS CLAIMED (KITS & TICKETS) */}
            <div className="history-section voucher-section">
                <h3 className="sub-header">My <span>Voucher Collection</span></h3>
                <div className="voucher-history-list">
                    {vouchers.map(v => (
                        <div key={v.id} className="voucher-history-card">
                            <div className="v-info">
                                <strong>{v.reward_type}</strong>
                                <span>{v.date}</span>
                            </div>
                            <div className="v-code-area">
                                <small>Code</small>
                                <code>{v.code}</code>
                            </div>
                        </div>
                    ))}
                    {vouchers.length === 0 && <p className="empty-msg">No vouchers claimed yet.</p>}
                </div>
            </div>
        </div>
    );
};

export default RewardHistory;
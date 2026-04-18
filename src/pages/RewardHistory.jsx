import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import './RewardHistory.css';
import FootballLoader from '../FootballLoader';

const RewardHistory = () => {
    const [history, setHistory] = useState([]);
    const [vouchers, setVouchers] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const predRes = await api.get('predictions-history/');
                setHistory(predRes.data);
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

    // Your working Copy Logic (Unchanged as requested)
    const handleCopy = (code) => {
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(code).then(() => {
            }).catch(err => {
                console.error('Failed to copy!', err);
            });
        } else {
            const textArea = document.createElement("textarea");
            textArea.value = code;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand("copy");
            document.body.removeChild(textArea);
        }
    };

    if (loading) return <div className="rhp-loader-wrap"><FootballLoader message="Loading rewards..." /></div>;

    return (
        <div className="rhp-container">
            <div className="rhp-header-flex">
                <h2 className="rhp-main-title">Reward <span>History</span></h2>
                <button className="rhp-redeem-btn" onClick={() => navigate('/reward-scratch')}>
                    Redeem Points 🎁
                </button>
            </div>

            <div className="rhp-section">
                <h3 className="rhp-sub-title">Points <span>Earned</span></h3>
                <div className="rhp-points-list">
                    {history.map(item => (
                        <div key={item.id} className="rhp-point-card">
                            <div className="rhp-card-header">
                                <span className="rhp-date">{new Date(item.created_at).toLocaleDateString()}</span>
                                <div className="rhp-badge">+{item.points_awarded} PTS</div>
                            </div>
                            <div className="rhp-card-body">
                                <span className="rhp-match-name">{item.match_name}</span>
                                <span className="rhp-status-ok">Processed</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="rhp-section">
                <h3 className="rhp-sub-title">My <span>Vouchers</span></h3>
                <div className="rhp-voucher-grid">
                    {vouchers.map(v => (
                        /* Added dynamic class for redeemed state */
                        <div key={v.id} className={`rhp-v-card ${v.is_redeemed ? 'rhp-redeemed-card' : ''}`}>
                            <div className="rhp-v-left">
                                <div className="rhp-v-type">
                                    {v.reward_type}
                                    {v.is_redeemed && <span className="rhp-used-label">(USED)</span>}
                                </div>
                                <div className="rhp-v-date">Won: {v.date}</div>
                            </div>
                            
                            <div className="rhp-v-right">
                                <div className="rhp-code-box">
                                    <small>CODE</small>
                                    {/* If redeemed, hide the code with dots */}
                                    <code>{v.is_redeemed ? '••••••••' : v.code}</code>
                                </div>
                                
                                <button 
                                    className={`rhp-copy-btn ${v.is_redeemed ? 'rhp-btn-disabled' : ''}`} 
                                    onClick={() => !v.is_redeemed && handleCopy(v.code)}
                                    type="button"
                                    disabled={v.is_redeemed}
                                >
                                    {v.is_redeemed ? (
                                        <>
                                            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5">
                                                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                                                <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                                            </svg>
                                            <span>Used</span>
                                        </>
                                    ) : (
                                        <>
                                            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5">
                                                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                                                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                                            </svg>
                                            <span>Copy</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default RewardHistory;
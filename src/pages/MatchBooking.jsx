import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api';
import { toast } from 'react-toastify';
import './MatchBooking.css';

const MatchBooking = () => {
    const { matchId } = useParams();
    const navigate = useNavigate();
    
    const [match, setMatch] = useState(null);
    const [method, setMethod] = useState('MONEY'); // 'MONEY' or 'VOUCHER'
    const [selectedStand, setSelectedStand] = useState('GENERAL');
    const [voucherCode, setVoucherCode] = useState("");
    const [loading, setLoading] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);

    const prices = { VIP: 2000, GENERAL: 500, NORTH: 300, SOUTH: 300 };

    useEffect(() => {
        api.get(`matches/${matchId}/`)
            .then(res => setMatch(res.data))
            .catch(() => toast.error("Match details not found"));
    }, [matchId]);

    const handleBooking = async () => {
        setLoading(true);
        try {
            const payload = {
                match_id: matchId,
                stand: selectedStand,
                voucher_code: method === 'VOUCHER' ? voucherCode : null
            };

            await api.post('book-ticket/', payload);
            setShowSuccess(true);
            
            setTimeout(() => {
                navigate('/booking-history');
            }, 3800);
        } catch (err) {
            toast.error(err.response?.data?.error || "Transaction Failed");
        } finally {
            setLoading(false);
        }
    };

    if (!match) return (
        <div className="mdp2-loading-screen">
            <div className="mdp2-spinner"></div>
            <p>PREPARING STADIUM...</p>
        </div>
    );

    return (
        <div className="mdp2-booking-wrapper">
            {/* SUCCESS OVERLAY */}
            {showSuccess && (
                <div className="mdp2-success-overlay">
                    <div className="mdp2-success-content mdp2-animate-zoom">
                        <div className="mdp2-check-icon">✔</div>
                        <h2>TICKET CONFIRMED</h2>
                        <p>Your seat at {match.venue} is secured. See you at the match!</p>
                        <div className="mdp2-progress-track">
                            <div className="mdp2-progress-fill"></div>
                        </div>
                    </div>
                </div>
            )}

            <div className={`mdp2-booking-card ${showSuccess ? 'mdp2-blur' : ''}`}>
                {/* Header */}
                <div className="mdp2-booking-header">
                    <div className="mdp2-teams-grid">
                        <div className="mdp2-team-unit">
                            <div className="mdp2-logo-container">
                                <img src={match.home_team_logo} alt={match.home_team_name} />
                            </div>
                            <p>{match.home_team_name}</p>
                        </div>
                        <div className="mdp2-vs-badge">VS</div>
                        <div className="mdp2-team-unit">
                            <div className="mdp2-logo-container">
                                <img src={match.away_team_logo} alt={match.away_team_name} />
                            </div>
                            <p>{match.away_team_name}</p>
                        </div>
                    </div>
                </div>

                <div className="mdp2-booking-body">
                    {/* Method Toggle */}
                    <div className="mdp2-method-toggle">
                        <button 
                            className={method === 'MONEY' ? 'is-active' : ''} 
                            onClick={() => setMethod('MONEY')}
                        >
                            Pay Online
                        </button>
                        <button 
                            className={method === 'VOUCHER' ? 'is-active' : ''} 
                            onClick={() => setMethod('VOUCHER')}
                        >
                            Use Voucher
                        </button>
                    </div>

                    {/* Stand Grid */}
                    <div className="mdp2-input-group">
                        <label className="mdp2-label-small">Select Seating Category</label>
                        <div className="mdp2-stand-grid">
                            {Object.keys(prices).map(key => (
                                <button 
                                    key={key} 
                                    className={`mdp2-stand-btn ${selectedStand === key ? 'is-selected' : ''}`}
                                    onClick={() => setSelectedStand(key)}
                                >
                                    <span className="mdp2-stand-name">{key}</span>
                                    <span className="mdp2-stand-price">₹{prices[key]}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Pricing Summary or Voucher Input */}
                    <div className="mdp2-action-area">
                        {method === 'VOUCHER' ? (
                            <div className="mdp2-voucher-box">
                                <label className="mdp2-label-small">Voucher Code</label>
                                <input 
                                    type="text" 
                                    placeholder="PASTE CODE" 
                                    value={voucherCode}
                                    onChange={(e) => setVoucherCode(e.target.value.toUpperCase())}
                                />
                            </div>
                        ) : (
                            <div className="mdp2-summary-box">
                                <div className="mdp2-summary-row">
                                    <span>Seating Amount</span>
                                    <span className="mdp2-bold">₹{prices[selectedStand]}</span>
                                </div>
                            </div>
                        )}

                        <button 
                            className="mdp2-main-action-btn" 
                            onClick={handleBooking} 
                            disabled={loading}
                        >
                            {loading ? "AUTHORIZING..." : method === 'VOUCHER' ? "REDEEM TICKET" : `PAY ₹${prices[selectedStand]}`}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MatchBooking;
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

    const prices = { VIP: 2000, GENERAL: 500, NORTH: 300, SOUTH: 300 };

    useEffect(() => {
        api.get(`matches/${matchId}/`)
            .then(res => setMatch(res.data))
            .catch(() => toast.error("Match not found"));
    }, [matchId]);

    const handleBooking = async () => {
        setLoading(true);
        try {
            const payload = {
                match_id: matchId,
                stand: selectedStand,
                voucher_code: method === 'VOUCHER' ? voucherCode : null
            };

            const res = await api.post('book-ticket/', payload);
            toast.success(`Ticket Confirmed! Seat: ${res.data.booking_details.seat}`);
            navigate('/reward-history');
        } catch (err) {
            toast.error(err.response?.data?.error || "Transaction Failed");
        } finally {
            setLoading(false);
        }
    };

    if (!match) return <div className="loader-container">Loading Stadium...</div>;

    return (
        <div className="booking-wrapper">
            <div className="booking-card animate-pop">
                {/* Match Info Header */}
                <div className="booking-header">
                    <div className="teams-display">
                        <div className="team">
                            <img src={match.home_team_logo} alt="home" />
                            <p>{match.home_team_name}</p>
                        </div>
                        <div className="vs-circle">VS</div>
                        <div className="team">
                            <img src={match.away_team_logo} alt="away" />
                            <p>{match.away_team_name}</p>
                        </div>
                    </div>
                </div>

                <div className="booking-body">
                    {/* Method Selector */}
                    <div className="method-selector">
                        <button 
                            className={method === 'MONEY' ? 'active' : ''} 
                            onClick={() => setMethod('MONEY')}
                        >
                            💳 Online Payment
                        </button>
                        <button 
                            className={method === 'VOUCHER' ? 'active' : ''} 
                            onClick={() => setMethod('VOUCHER')}
                        >
                            🎟️ Use Voucher
                        </button>
                    </div>

                    {/* Stand Selection */}
                    <div className="input-section">
                        <label>Choose Seating Stand</label>
                        <div className="stand-grid">
                            {Object.keys(prices).map(key => (
                                <div 
                                    key={key} 
                                    className={`stand-option ${selectedStand === key ? 'selected' : ''}`}
                                    onClick={() => setSelectedStand(key)}
                                >
                                    <span className="stand-name">{key}</span>
                                    <span className="stand-price">₹{prices[key]}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Conditional Input */}
                    {method === 'VOUCHER' ? (
                        <div className="voucher-area animate-fade">
                            <label>Enter Free Ticket Voucher</label>
                            <input 
                                type="text" 
                                placeholder="PASTE CODE HERE" 
                                value={voucherCode}
                                onChange={(e) => setVoucherCode(e.target.value.toUpperCase())}
                            />
                            <p className="hint-text">Available in your Reward History</p>
                        </div>
                    ) : (
                        <div className="payment-summary animate-fade">
                            <div className="summary-row">
                                <span>Ticket Price</span>
                                <span>₹{prices[selectedStand]}</span>
                            </div>
                            <div className="summary-row">
                                <span>Booking Fee</span>
                                <span>₹0.00</span>
                            </div>
                            <div className="summary-row total">
                                <span>Total Amount</span>
                                <span>₹{prices[selectedStand]}</span>
                            </div>
                        </div>
                    )}

                    <button 
                        className="confirm-btn" 
                        onClick={handleBooking}
                        disabled={loading}
                    >
                        {loading ? "Verifying..." : method === 'VOUCHER' ? "Redeem & Book Free" : `Pay ₹${prices[selectedStand]}`}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default MatchBooking;
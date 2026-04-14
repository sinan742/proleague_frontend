import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api';
import { toast } from 'react-toastify';
import './MatchBooking.css';

const MatchBooking = ({ refreshUser }) => {
    const { matchId } = useParams(); // Get the ID from the URL
    const navigate = useNavigate();
    
    const [matchDetails, setMatchDetails] = useState(null);
    const [selectedStand, setSelectedStand] = useState(null);
    const [voucherCode, setVoucherCode] = useState("");
    const [loading, setLoading] = useState(false);

    const stands = [
        { id: 'VIP', name: 'VIP Stand (West)', price: 2000, icon: '👑' },
        { id: 'GENERAL', name: 'General Stand (East)', price: 500, icon: '🏟️' },
        { id: 'NORTH', name: 'North Stand (Goal)', price: 300, icon: '🥅' },
        { id: 'SOUTH', name: 'South Stand (Goal)', price: 300, icon: '🥅' }
    ];

    // Fetch match details to show teams on the booking page
    useEffect(() => {
        api.get(`matches/${matchId}/`)
            .then(res => setMatchDetails(res.data))
            .catch(() => toast.error("Could not load match details"));
    }, [matchId]);

    const handleBooking = async () => {
        if (!selectedStand) return toast.warning("Please pick a stand!");
        
        setLoading(true);
        try {
            const res = await api.post('book-ticket/', {
                match_id: matchId,
                stand: selectedStand.id,
                voucher_code: voucherCode
            });
            
            toast.success("Ticket Booked Successfully!");
            refreshUser(); // Update points in Navbar
            navigate('/reward-history'); // Send user to see their new booking
        } catch (err) {
            toast.error(err.response?.data?.error || "Booking failed");
        } finally {
            setLoading(false);
        }
    };

    if (!matchDetails) return <div className="loader">Loading Match...</div>;

    return (
        <div className="booking-page-container">
            <div className="match-banner">
                <h3>{matchDetails.home_team_name} vs {matchDetails.away_team_name}</h3>
                <p>{matchDetails.venue} | {new Date(matchDetails.date).toDateString()}</p>
            </div>

            <h2 className="section-title">Select <span>Stand</span></h2>
            
            <div className="stands-grid">
                {stands.map(stand => (
                    <div 
                        key={stand.id} 
                        className={`stand-card ${selectedStand?.id === stand.id ? 'active' : ''}`}
                        onClick={() => setSelectedStand(stand)}
                    >
                        <div className="stand-icon">{stand.icon}</div>
                        <h4>{stand.name}</h4>
                        <p>{stand.price} Pts</p>
                    </div>
                ))}
            </div>

            {selectedStand && (
                <div className="payment-panel animate-pop">
                    <div className="booking-summary">
                        <p>Selected: <strong>{selectedStand.name}</strong></p>
                        <p>Total: <strong>{voucherCode ? "FREE" : `${selectedStand.price} Pts`}</strong></p>
                    </div>

                    <div className="voucher-input-box">
                        <label>Redeem Free Ticket Voucher</label>
                        <input 
                            type="text" 
                            placeholder="Enter Code (e.g. TICKET-XYZ)" 
                            value={voucherCode}
                            onChange={(e) => setVoucherCode(e.target.value)}
                        />
                    </div>

                    <button className="book-btn" onClick={handleBooking} disabled={loading}>
                        {loading ? "Processing..." : "Confirm Booking"}
                    </button>
                </div>
            )}
        </div>
    );
};

export default MatchBooking;
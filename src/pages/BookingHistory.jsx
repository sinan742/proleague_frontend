import React, { useState, useEffect, useRef } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import api from '../api';
import './BookingHistory.css';
import FootballLoader from '../FootballLoader';

const BookingHistory = () => {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedTicket, setSelectedTicket] = useState(null);
    const ticketRef = useRef(null);

    useEffect(() => {
        api.get('booking-history/')
            .then(res => {
                setBookings(res.data);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, []);

    const handleDownload = async () => {
        if (!ticketRef.current) return;
        try {
            const canvas = await html2canvas(ticketRef.current, {
                scale: 2,
                useCORS: true, // Important for the QR image
                backgroundColor: "#ffffff"
            });
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'mm', 'a4');
            pdf.addImage(imgData, 'PNG', 10, 10, 190, 0);
            pdf.save(`Ticket-${selectedTicket.id}.pdf`);
        } catch (error) {
            alert("Error generating PDF");
        }
    };

    if (loading) return <div className="loader"><FootballLoader/></div>;

    return (
        <div className="booking-history-page">
            <h2 className="title">My <span>Stadium Entry</span> Passes</h2>

            <div className="booking-grid">
                {bookings.map(b => (
                    <div key={b.id} className="tkt-row" onClick={() => setSelectedTicket(b)}>
                        <div className="tkt-info">
                            <h4>{b.match_name}</h4>
                            <p>{b.stand} | Seat {b.seat_number}</p>
                        </div>
                        <div className="view-link">VIEW QR</div>
                    </div>
                ))}
            </div>

            {selectedTicket && (
                <div className="modal-bg" onClick={() => setSelectedTicket(null)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        
                        {/* THE TICKET - THE PART TO BE DOWNLOADED */}
                        <div className="ticket-design" ref={ticketRef}>
                            <div className="top-banner">
                                <h3>{selectedTicket.match_name}</h3>
                                <p>OFFICIAL ENTRY PASS</p>
                            </div>
                            
                            <div className="mid-section">
                                <div className="stats">
                                    <div className="stat"><span>STAND</span><p>{selectedTicket.stand}</p></div>
                                    <div className="stat"><span>SEAT</span><p>{selectedTicket.seat_number}</p></div>
                                </div>

                                {/* PURE IMAGE QR CODE (NO LIBRARY NEEDED) */}
                                <div className="qr-image-box">
                                    <img 
                                        src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=TICKET-${selectedTicket.id}`} 
                                        alt="QR Code" 
                                        crossOrigin="anonymous"
                                    />
                                    <p>SCAN AT GATE</p>
                                </div>
                            </div>
                        </div>

                        <div className="actions">
                            <button className="dl-btn" onClick={handleDownload}>Download PDF</button>
                            <button className="close-btn" onClick={() => setSelectedTicket(null)}>Close</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BookingHistory;
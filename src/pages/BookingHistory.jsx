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
                scale: 3,
                useCORS: true,
                backgroundColor: "#ffffff",
                logging: false
            });
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'mm', 'a4');
            const imgProps = pdf.getImageProperties(imgData);
            const pdfWidth = pdf.internal.pageSize.getWidth() - 20;
            const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
            
            pdf.addImage(imgData, 'PNG', 10, 10, pdfWidth, pdfHeight);
            pdf.save(`ProLeague-Ticket-${selectedTicket.id}.pdf`);
        } catch (error) {
            console.error("PDF Error:", error);
            alert("Error generating PDF. Please try again.");
        }
    };

    if (loading) return <div className="bhp-loader-wrap"><FootballLoader message="Retrieving your passes..." /></div>;

    return (
        <div className="bhp-page-container">
            <header className="bhp-header">
                <h2 className="bhp-title">My <span>Stadium</span> Passes</h2>
                <p>Digital tickets for your upcoming ProLeague matches</p>
            </header>

            <div className="bhp-grid">
                {bookings.length > 0 ? bookings.map(b => (
                    <div key={b.id} className="bhp-ticket-card" onClick={() => setSelectedTicket(b)}>
                        <div className="bhp-card-left">
                            <div className="bhp-stub-icon">🎟️</div>
                        </div>
                        <div className="bhp-card-main">
                            <h4>{b.match_name}</h4>
                            <div className="bhp-card-details">
                                <span><strong>Stand:</strong> {b.stand}</span>
                                <span><strong>Seat:</strong> {b.seat_number}</span>
                            </div>
                        </div>
                        <div className="bhp-card-right">
                            <span className="bhp-qr-preview">QR</span>
                        </div>
                    </div>
                )) : (
                    <div className="bhp-no-data">
                        <p>No tickets found. Ready for your first match?</p>
                    </div>
                )}
            </div>

            {selectedTicket && (
                <div className="bhp-modal-overlay" onClick={() => setSelectedTicket(null)}>
                    <div className="bhp-modal-content" onClick={e => e.stopPropagation()}>
                        
                        {/* --- THE TICKET DESIGN --- */}
                        <div className="bhp-ticket-design" ref={ticketRef}>
                            <div className="bhp-t-header">
                                <div className="bhp-t-brand">PROLEAGUE 2026</div>
                                <h2>{selectedTicket.match_name}</h2>
                                <p className="bhp-t-tag">OFFICIAL MATCH ENTRY PASS</p>
                            </div>
                            
                            <div className="bhp-t-body">
                                <div className="bhp-t-info-grid">
                                    <div className="bhp-t-item">
                                        <label>STAND</label>
                                        <p>{selectedTicket.stand}</p>
                                    </div>
                                    <div className="bhp-t-item">
                                        <label>SEAT</label>
                                        <p>{selectedTicket.seat_number}</p>
                                    </div>
                                    <div className="bhp-t-item">
                                        <label>TICKET ID</label>
                                        <p>#{selectedTicket.id}</p>
                                    </div>
                                </div>

                                <div className="bhp-t-qr-zone">
                                    <div className="bhp-qr-wrapper">
                                        <img 
                                            src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=PROLEAGUE-TKT-${selectedTicket.id}`} 
                                            alt="QR Code" 
                                            crossOrigin="anonymous"
                                        />
                                    </div>
                                    <p className="bhp-qr-hint">Scan this code at the stadium gate</p>
                                </div>
                            </div>
                            
                            <div className="bhp-t-footer">
                                <p>Please bring a valid ID along with this digital pass.</p>
                            </div>
                        </div>

                        <div className="bhp-modal-actions">
                            <button className="bhp-btn-dl" onClick={handleDownload}>
                                📥 Download PDF
                            </button>
                            <button className="bhp-btn-close" onClick={() => setSelectedTicket(null)}>
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BookingHistory;
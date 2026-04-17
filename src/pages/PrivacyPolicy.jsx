import React from 'react';
import './PrivacyPolicy.css';

const PrivacyPolicy = () => {
    return (
        <div className="pp-layout">
            
            <main className="pp-content">
                <header className="pp-header">
                    <h1>ProLeague <span>Rules & Privacy</span></h1>
                    <p>Learn how to predict, earn points, and claim your rewards.</p>
                </header>

                <div className="pp-grid">
                    {/* Prediction Guide */}
                    <section className="pp-card">
                        <div className="pp-icon">🔮</div>
                        <h2>How to Predict Matches</h2>
                        <p>Our AI-powered prediction system allows you to test your football knowledge.</p>
                        <ul>
                            <li>Select an upcoming match from the <strong>Schedule</strong>.</li>
                            <li>Choose the winner or a draw before the match starts.</li>
                            <li>AI Scout provides stats to help you make better choices.</li>
                            <li>Results are updated instantly after the final whistle.</li>
                        </ul>
                    </section>

                    {/* Reward Points */}
                    <section className="pp-card">
                        <div className="pp-icon">🪙</div>
                        <h2>Earning & Redeeming Points</h2>
                        <p>Accumulate points and trade them for exclusive ProLeague gear.</p>
                        <div className="pp-points-table">
                            <div className="p-row"><span>Correct Winner</span> <strong>+100 Pts</strong></div>
                            <div className="p-row"><span>Correct Score</span> <strong>+250 Pts</strong></div>
                        </div>
                        <p className="pp-note">Visit the <strong>Rewards</strong> tab to claim your Vouchers.</p>
                    </section>

                    {/* Ticket Guide */}
                    <section className="pp-card">
                        <div className="pp-icon">🎟️</div>
                        <h2>Applying Free Tickets</h2>
                        <p>Follow these steps to use your earned vouchers for match tickets:</p>
                        <ol>
                            <li>Go to <strong>Bookings</strong> and select a match.</li>
                            <li>Pick <strong>General</strong> or <strong>Goal Stand</strong> seats.</li>
                            <li>Enter your unique code in the <strong>"Voucher Code"</strong> field.</li>
                            <li>Confirm your ₹0 booking and receive your ticket via email.</li>
                        </ol>
                    </section>

                    {/* Privacy Section */}
                    <section className="pp-card privacy">
                        <div className="pp-icon">🛡️</div>
                        <h2>Your Privacy Matters</h2>
                        <p>We ensure your data is safe within the ProLeague ecosystem.</p>
                        <ul>
                            <li><strong>Encrypted Data:</strong> Your passwords and personal info are fully encrypted.</li>
                            <li><strong>No Third-Party Sharing:</strong> We never sell your data to outside companies.</li>
                            <li><strong>Transparency:</strong> Your prediction history is only used for Leaderboard rankings.</li>
                        </ul>
                    </section>
                </div>

                <footer className="pp-footer">
                    <p>© 2026 ProLeague Tournament Management. Developed by Muhammed Sinan A.</p>
                </footer>
            </main>
        </div>
    );
};

export default PrivacyPolicy;
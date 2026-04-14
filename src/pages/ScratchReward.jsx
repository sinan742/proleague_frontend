import React, { useState, useRef, useEffect } from 'react';
import api from '../api';
import { toast } from 'react-toastify';
import './ScratchReward.css';

const ScratchReward = ({ userPoints, refreshUser }) => {
    const rewardTiers = [
        { id: 2, type: "KIT", title: "Official Kit", cost: 500, icon: "👕" },
        { id: 3, type: "TICKET", title: "Match Ticket", cost: 1500, icon: "🎟️" }
    ];

    const [activeReward, setActiveReward] = useState(null);
    const [revealedCode, setRevealedCode] = useState("");
    const [history, setHistory] = useState([]);
    const canvasRef = useRef(null);

    const fetchHistory = async () => {
        try {
            const res = await api.get('voucher-history/');
            setHistory(res.data);
        } catch (err) { console.error("History fetch failed"); }
    };

    useEffect(() => { fetchHistory(); }, []);

    const handleCardClick = async (reward) => {
        if (userPoints < reward.cost) return;

        try {
            const res = await api.post('claim-voucher/', { type: reward.type });
            setRevealedCode(res.data.code);
            setActiveReward(reward.id);
            refreshUser();
            fetchHistory();
        } catch (err) {
            toast.error(err.response?.data?.error || "Out of stock!");
        }
    };

    useEffect(() => {
        if (activeReward && canvasRef.current) {
            const canvas = canvasRef.current;
            const ctx = canvas.getContext('2d');
            // GPay Style Silver Scratch Layer
            const grad = ctx.createLinearGradient(0, 0, 300, 200);
            grad.addColorStop(0, '#ADB5BD');
            grad.addColorStop(1, '#6C757D');
            ctx.fillStyle = grad;
            ctx.fillRect(0, 0, 300, 200);
            
            ctx.fillStyle = 'rgba(255,255,255,0.3)';
            ctx.font = "bold 14px Arial";
            ctx.textAlign = "center";
            ctx.fillText("SCRATCH OFF", 150, 110);

            const scratch = (e) => {
                const rect = canvas.getBoundingClientRect();
                const x = (e.clientX || (e.touches && e.touches[0].clientX)) - rect.left;
                const y = (e.clientY || (e.touches && e.touches[0].clientY)) - rect.top;
                ctx.globalCompositeOperation = 'destination-out';
                ctx.beginPath(); ctx.arc(x, y, 25, 0, Math.PI * 2); ctx.fill();
            };

            const moveHandler = (e) => { if (e.buttons === 1 || e.type === 'touchmove') scratch(e); };
            canvas.addEventListener('mousemove', moveHandler);
            canvas.addEventListener('touchmove', moveHandler);
            return () => {
                canvas.removeEventListener('mousemove', moveHandler);
                canvas.removeEventListener('touchmove', moveHandler);
            };
        }
    }, [activeReward]);

    return (
        <div className="gpay-rewards-container">
            <header className="rewards-header">
                <h1>Rewards</h1>
                <div className="points-pill">
                    <span className="coin-icon">🪙</span> {userPoints} Points
                </div>
            </header>

            <div className="rewards-grid">
                {rewardTiers.map((item) => {
                    const isLocked = userPoints < item.cost;
                    const isScratching = activeReward === item.id;

                    return (
                        <div 
                            key={item.id} 
                            className={`gpay-card ${isLocked ? 'is-locked' : 'is-ready'} ${isScratching ? 'is-popped' : ''}`}
                            onClick={() => !isScratching && handleCardClick(item)}
                        >
                            {isScratching ? (
                                <div className="scratch-module">
                                    <div className="win-content">
                                        <p>You Unlocked</p>
                                        <div className="win-code">{revealedCode}</div>
                                        <button className="close-btn" onClick={() => setActiveReward(null)}>Done</button>
                                    </div>
                                    <canvas ref={canvasRef} width={300} height={200} className="gpay-canvas" />
                                </div>
                            ) : (
                                <div className="card-front">
                                    <div className="card-visual">{item.icon}</div>
                                    <div className="card-details">
                                        <h3>{item.title}</h3>
                                        <p>{item.cost} pts</p>
                                    </div>
                                    {isLocked && (
                                        <div className="lock-tag">
                                            <span className="lock-icon">🔒</span>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            <section className="history-section">
                <h3>My Collection</h3>
                <div className="history-grid">
                    {history.map(v => (
                        <div key={v.id} className="history-pill">
                            <span className="pill-type">{v.reward_type}</span>
                            <code className="pill-code">{v.code}</code>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
};

export default ScratchReward;
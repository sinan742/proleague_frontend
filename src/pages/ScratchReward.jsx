import React, { useState, useRef, useEffect, useCallback } from 'react';
import api from '../api';
import { toast } from 'react-toastify';
import './ScratchReward.css';
import FootballLoader from '../FootballLoader';

/* ─── Config ──────────────────────────────────────── */
const REWARD_TIERS = [
    { id: 2, type: 'KIT',    title: 'Official Kit',  cost: 500,  icon: '👕', accent: 'kit'    },
    { id: 3, type: 'TICKET', title: 'Match Ticket',  cost: 1500, icon: '🎟️', accent: 'ticket' },
];

/* ─── Copy Logic Helper ─────────────────────────── */
const copyToClipboard = async (text) => {
    // 1. Try Modern API
    if (navigator.clipboard && navigator.clipboard.writeText) {
        try {
            await navigator.clipboard.writeText(text);
            return true;
        } catch (err) {
            console.error("Clipboard API failed, trying fallback...");
        }
    }

    // 2. Fallback: Create invisible textarea
    try {
        const textArea = document.createElement("textarea");
        textArea.value = text;
        // Make it non-editable and hide it
        textArea.setAttribute("readonly", "");
        textArea.style.position = "absolute";
        textArea.style.left = "-9999px";
        document.body.appendChild(textArea);
        textArea.select();
        const successful = document.execCommand("copy");
        document.body.removeChild(textArea);
        return successful;
    } catch (err) {
        console.error("Fallback failed", err);
        return false;
    }
};

/* ─── CopyButton Component ────────────────────────── */
const CopyButton = ({ code, variant = 'inline' }) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = async (e) => {
        e.stopPropagation();
        const isSuccess = await copyToClipboard(code);
        
        if (isSuccess) {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } else {
        }
    };

    return (
        <button 
            className={`sr3-copy-btn sr3-copy-btn--${variant} ${copied ? 'sr3-copy-btn--done' : ''}`} 
            onClick={handleCopy}
            type="button"
        >
            {copied ? '✓ Copied!' : 'Copy'}
        </button>
    );
};

/* ─── ScratchModal Component ──────────────────────── */
const ScratchModal = ({ reward, code, onClose }) => {
    const canvasRef = useRef(null);
    const [revealed, setRev] = useState(false);

    const paintCanvas = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const zone = canvas.parentElement;
        canvas.width = zone.clientWidth || 340;
        canvas.height = zone.clientHeight || 224;
        const ctx = canvas.getContext('2d');

        const grad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
        grad.addColorStop(0, '#D4AF37');
        grad.addColorStop(0.5, '#FFD700');
        grad.addColorStop(1, '#B8860B');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = 'rgba(80,50,5,0.7)';
        ctx.font = 'bold 16px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('✦ SCRATCH TO REVEAL ✦', canvas.width / 2, canvas.height / 2);
    }, []);

    useEffect(() => { paintCanvas(); }, [paintCanvas]);

    const doScratch = (e) => {
        const canvas = canvasRef.current;
        if (revealed) return; // Stop logic if already gone
        
        const rect = canvas.getBoundingClientRect();
        const src = e.touches ? e.touches[0] : e;
        const x = src.clientX - rect.left;
        const y = src.clientY - rect.top;

        const ctx = canvas.getContext('2d');
        ctx.globalCompositeOperation = 'destination-out';
        ctx.beginPath();
        ctx.arc(x, y, 30, 0, Math.PI * 2);
        ctx.fill();

        // Check if 50% scratched to hide canvas completely
        const { data } = ctx.getImageData(0, 0, canvas.width, canvas.height);
        let cleared = 0;
        for (let i = 3; i < data.length; i += 4) if (data[i] === 0) cleared++;
        if ((cleared / (canvas.width * canvas.height)) > 0.45) {
            setRev(true);
        }
    };

    return (
        <div className="sr3-overlay">
            <div className="sr3-modal">
                <button className="sr3-modal-close" onClick={onClose}>✕</button>
                <div className="sr3-scratch-zone">
                    <div className="sr3-reveal-layer">
                        <span className="sr3-trophy">🏆</span>
                        <p className="sr3-won-title">You won!</p>
                        <p className="sr3-won-sub"><strong>{reward.title}</strong></p>
                        <div className="sr3-code-box">
                            <code className="sr3-code-txt">{code}</code>
                            <CopyButton code={code} variant="inline" />
                        </div>
                        <button className="sr3-done-btn" onClick={onClose}>Done</button>
                    </div>
                    {/* Only show canvas if not revealed */}
                    {!revealed && (
                        <canvas 
                            ref={canvasRef} 
                            className="sr3-canvas"
                            onMouseMove={(e) => e.buttons === 1 && doScratch(e)}
                            onTouchMove={(e) => { e.preventDefault(); doScratch(e); }}
                        />
                    )}
                </div>
            </div>
        </div>
    );
};

/* ─── Main Component ──────────────────────────────── */
const ScratchReward = ({ refreshUser }) => {
    const [userPoints, setUserPoints] = useState(0);
    const [activeReward, setActiveReward] = useState(null);
    const [revealedCode, setRevealedCode] = useState('');
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchProfileData = useCallback(async () => {
        try {
            const res = await api.get('profile/');
            setUserPoints(res.data.points);
        } catch (err) { console.error(err); }
    }, []);

    const fetchHistory = useCallback(async () => {
        try {
            const res = await api.get('voucher-history/');
            setHistory(res.data.filter(v => !v.is_redeemed));
        } catch (err) { console.error(err); } 
        finally { setLoading(false); }
    }, []);

    useEffect(() => {
        fetchProfileData();
        fetchHistory();
    }, [fetchProfileData, fetchHistory]);

    const handleClaim = async (reward) => {
        if (userPoints < reward.cost) {
            toast.error(`Need ${reward.cost - userPoints} more points!`, { position: 'bottom-center' });
            return;
        }

        try {
            const res = await api.post('claim-voucher/', { type: reward.type });
            setRevealedCode(res.data.code);
            setActiveReward(reward);
            fetchProfileData();
            if(refreshUser) refreshUser();
            fetchHistory();
        } catch (err) {
            toast.error(err.response?.data?.error ?? 'Out of stock!');
        }
    };

    if (loading) return <div className="sr3-loader-wrap"><FootballLoader /></div>;

    return (
        <div className="sr3-page">
            <header className="sr3-header">
                <div className="sr3-header-txt">
                    <h1>ProLeague <span>Rewards</span></h1>
                    <p>Redeem points for exclusive gear.</p>
                </div>
                <div className="sr3-pts-badge">
                    <span className="sr3-coin">🪙</span>
                    <div className="sr3-pts-inner">
                        <small>Balance</small>
                        <strong>{userPoints.toLocaleString()}</strong>
                    </div>
                </div>
            </header>

            <div className="sr3-grid">
                {REWARD_TIERS.map((r) => {
                    const locked = userPoints < r.cost;
                    return (
                        <div key={r.id} className={`sr3-card sr3-card--${locked ? 'locked' : 'ready'}`} onClick={() => !locked && handleClaim(r)}>
                            <div className={`sr3-card-top sr3-card-top--${r.accent}`} />
                            <div className="sr3-card-body">
                                <span className="sr3-icon">{r.icon}</span>
                                <p className="sr3-card-title">{r.title}</p>
                                <span className="sr3-card-cost">{r.cost.toLocaleString()} <small>pts</small></span>
                                {locked && <p className="sr3-card-need">Need {r.cost - userPoints} more</p>}
                            </div>
                            {locked && <div className="sr3-card-lock">🔒</div>}
                        </div>
                    );
                })}
            </div>

            {activeReward && revealedCode && (
                <ScratchModal reward={activeReward} code={revealedCode} onClose={() => { setActiveReward(null); setRevealedCode(''); }} />
            )}

            <section className="sr3-history">
                <h2 className="sr3-history-title">My <em>Collection</em></h2>
                <div className="sr3-history-list">
                    {history.length > 0 ? history.map((v) => (
                        <div key={v.id} className="sr3-history-item">
                            <div className="sr3-hist-info">
                                <span className="sr3-hist-type">{v.reward_type}</span>
                                <span className="sr3-hist-date">{v.date}</span>
                            </div>
                            <div className="sr3-hist-right">
                                <code className="sr3-hist-code">{v.code}</code>
                                <CopyButton code={v.code} variant="ghost" />
                            </div>
                        </div>
                    )) : <p className="sr3-empty">No active vouchers yet.</p>}
                </div>
            </section>
        </div>
    );
};

export default ScratchReward;
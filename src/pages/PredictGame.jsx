import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../api';
import './PredictGame.css';
import FootballLoader from '../FootballLoader';

/* ─── Step indicator ──────────────────────────────── */

const STEPS = [
    { num: 1, label: 'Score'   },
    { num: 2, label: 'Scorers' },
    { num: 3, label: 'Locked'  },
];

const StepBar = ({ current }) => (
    <div className="pg-steps" aria-label="Prediction steps">
        {STEPS.map((s, i) => {
            const done   = current > s.num;
            const active = current === s.num;
            return (
                <React.Fragment key={s.num}>
                    <div className="pg-step">
                        <div
                            className={`pg-step-dot ${done ? 'pg-step-dot--done' : active ? 'pg-step-dot--active' : ''}`}
                            aria-current={active ? 'step' : undefined}
                        >
                            {done ? '✓' : s.num}
                        </div>
                        <span className={`pg-step-label ${done || active ? 'pg-step-label--on' : ''}`}>
                            {s.label}
                        </span>
                    </div>
                    {i < STEPS.length - 1 && (
                        <div className={`pg-step-line ${done ? 'pg-step-line--done' : ''}`} aria-hidden="true" />
                    )}
                </React.Fragment>
            );
        })}
    </div>
);

/* ─── Team logo ───────────────────────────────────── */

const TeamLogo = ({ src, name, size = 60 }) => {
    const [err, setErr] = React.useState(false);
    if (!src || err) {
        return (
            <div
                className="pg-team-logo-fb"
                style={{ width: size, height: size, fontSize: Math.round(size * 0.27) }}
                aria-hidden="true"
            >
                {name?.slice(0, 2).toUpperCase() ?? '??'}
            </div>
        );
    }
    return (
        <img
            src={src}
            alt={name}
            className="pg-team-logo"
            style={{ width: size, height: size }}
            onError={() => setErr(true)}
        />
    );
};

/* ─── Confetti ────────────────────────────────────── */

const CONFETTI_COLORS = ['#FFD700', '#1B5E20', '#4CAF50', '#C8A800', '#F8F5F0'];

const Confetti = () => (
    <div className="pg-confetti-wrap" aria-hidden="true">
        {Array.from({ length: 18 }, (_, i) => (
            <span
                key={i}
                className="pg-confetti-dot"
                style={{
                    left:             `${Math.random() * 100}%`,
                    top:              `${Math.random() * 30}%`,
                    background:       CONFETTI_COLORS[i % CONFETTI_COLORS.length],
                    animationDelay:   `${(Math.random() * 0.6).toFixed(2)}s`,
                    transform:        `rotate(${Math.floor(Math.random() * 360)}deg)`,
                }}
            />
        ))}
    </div>
);

/* ─── Step 1 — Score picker ───────────────────────── */

const ScoreStep = ({ match, score, onChange, onNext }) => {
    const adj = (team, delta) => {
        onChange({ ...score, [team]: Math.max(0, score[team] + delta) });
    };

    return (
        <div className="pg-step-content pg-anim-fade">

            <div className="pg-matchup">
                {/* Home */}
                <div className="pg-team-side">
                    <TeamLogo src={match.home_team_logo} name={match.home_team_name} size={64} />
                    <div className="pg-score-spinner">
                        <button
                            className="pg-spin-btn"
                            onClick={() => adj('home', -1)}
                            aria-label="Decrease home score"
                        >−</button>
                        <span className="pg-score-val" aria-label={`Home score: ${score.home}`}>
                            {score.home}
                        </span>
                        <button
                            className="pg-spin-btn"
                            onClick={() => adj('home', 1)}
                            aria-label="Increase home score"
                        >+</button>
                    </div>
                    <span className="pg-team-label">{match.home_team_name}</span>
                </div>

                <span className="pg-vs-badge" aria-hidden="true">VS</span>

                {/* Away */}
                <div className="pg-team-side">
                    <TeamLogo src={match.away_team_logo} name={match.away_team_name} size={64} />
                    <div className="pg-score-spinner">
                        <button
                            className="pg-spin-btn"
                            onClick={() => adj('away', -1)}
                            aria-label="Decrease away score"
                        >−</button>
                        <span className="pg-score-val" aria-label={`Away score: ${score.away}`}>
                            {score.away}
                        </span>
                        <button
                            className="pg-spin-btn"
                            onClick={() => adj('away', 1)}
                            aria-label="Increase away score"
                        >+</button>
                    </div>
                    <span className="pg-team-label">{match.away_team_name}</span>
                </div>
            </div>

            <p className="pg-score-hint">
                {score.home === 0 && score.away === 0
                    ? 'Tap + to set your predicted score'
                    : `You predict ${match.home_team_name} ${score.home} – ${score.away} ${match.away_team_name}`
                }
            </p>

            <button className="pg-next-btn" onClick={onNext}>
                Next — Pick Scorers →
            </button>
        </div>
    );
};

/* ─── Step 2 — Scorer picker ──────────────────────── */

const ScorerStep = ({ match, score, players, homePicked, awayPicked, onToggle, onBack, onSubmit, submitting }) => {
    const [activeTeam, setActiveTeam] = useState('home');

    const teamPlayers   = activeTeam === 'home'
        ? players.filter(p => p.team === match.home_team)
        : players.filter(p => p.team === match.away_team);

    const picked        = activeTeam === 'home' ? homePicked : awayPicked;
    const max           = activeTeam === 'home' ? score.home : score.away;
    const totalGoals    = score.home + score.away;
    const totalPicked   = homePicked.length + awayPicked.length;

    const homeComplete  = score.home  === 0 || homePicked.length === score.home;
    const awayComplete  = score.away  === 0 || awayPicked.length === score.away;
    const allDone       = homeComplete && awayComplete;

    return (
        <div className="pg-step-content pg-anim-slide">

            {/* Summary strip */}
            <div className="pg-summary-strip" aria-label="Your predicted score">
                <span className="pg-summary-score">
                    {score.home} – {score.away}
                </span>
                <div className="pg-summary-names">
                    <span className="pg-summary-home">{match.home_team_name}</span>
                    <span className="pg-summary-away">{match.away_team_name}</span>
                </div>
            </div>

            {/* Section header */}
            <div className="pg-scorer-head">
                <h2 className="pg-scorer-title">Pick <em>Scorers</em></h2>
                <span className={`pg-scorer-badge ${totalPicked === totalGoals && totalGoals > 0 ? 'pg-scorer-badge--full' : ''}`}>
                    {totalPicked} / {totalGoals} picked
                </span>
            </div>

            {/* Team toggle tabs */}
            <div className="pg-team-tabs" role="tablist">
                {[
                    { key: 'home', name: match.home_team_name, logo: match.home_team_logo, ok: homeComplete },
                    { key: 'away', name: match.away_team_name, logo: match.away_team_logo, ok: awayComplete },
                ].map(t => (
                    <button
                        key={t.key}
                        className={`pg-team-tab ${activeTeam === t.key ? 'pg-team-tab--on' : ''}`}
                        onClick={() => setActiveTeam(t.key)}
                        role="tab"
                        aria-selected={activeTeam === t.key}
                    >
                        <TeamLogo src={t.logo} name={t.name} size={20} />
                        <span>{t.name}</span>
                        {t.ok && <span className="pg-tab-ok" aria-label="Complete">✓</span>}
                    </button>
                ))}
            </div>

            {/* Player list */}
            <div
                className="pg-players-list"
                role="listbox"
                aria-label={`${activeTeam === 'home' ? match.home_team_name : match.away_team_name} scorers`}
                aria-multiselectable="true"
            >
                {teamPlayers.length > 0 ? teamPlayers.map((p, i) => {
                    const isTicked   = picked.includes(p.id);
                    const isDisabled = !isTicked && picked.length >= max;
                    return (
                        <div
                            key={p.id}
                            className={`pg-player-row ${isTicked ? 'pg-player-row--ticked' : ''} ${isDisabled ? 'pg-player-row--disabled' : ''}`}
                            style={{ animationDelay: `${i * 0.05}s` }}
                            onClick={() => !isDisabled && onToggle(p.id, activeTeam)}
                            role="option"
                            aria-selected={isTicked}
                            aria-disabled={isDisabled}
                            tabIndex={0}
                            onKeyDown={e => e.key === 'Enter' && !isDisabled && onToggle(p.id, activeTeam)}
                        >
                            <div className="pg-player-avatar">
                                {p.photo
                                    ? <img src={p.photo} alt={p.name} className="pg-player-photo" onError={e => e.target.style.display='none'} />
                                    : null
                                }
                                <div className={`pg-player-fb ${isTicked ? 'pg-player-fb--ticked' : ''}`} style={{ display: p.photo ? 'none' : 'flex' }}>
                                    {p.name?.slice(0, 2).toUpperCase()}
                                </div>
                            </div>
                            <span className="pg-player-name">{p.name}</span>
                            <span className="pg-player-pos">{p.position}</span>
                            <div className={`pg-tick-box ${isTicked ? 'pg-tick-box--on' : ''}`} aria-hidden="true">
                                {isTicked && <span className="pg-tick-icon">✓</span>}
                            </div>
                        </div>
                    );
                }) : (
                    <p className="pg-empty-players">No players found for this team.</p>
                )}
            </div>

            {/* Footer */}
            <div className="pg-scorer-footer">
                <button className="pg-back-btn" onClick={onBack}>← Back</button>
                <button
                    className="pg-lock-btn"
                    onClick={onSubmit}
                    disabled={!allDone || submitting}
                    aria-busy={submitting}
                >
                    {submitting ? (
                        <span className="pg-submitting">
                            <span className="pg-submitting-dot" />
                            <span className="pg-submitting-dot" />
                            <span className="pg-submitting-dot" />
                            Confirming…
                        </span>
                    ) : 'Lock Prediction'}
                </button>
            </div>
        </div>
    );
};

/* ─── Step 3 — Success ────────────────────────────── */

const SuccessStep = ({ match, score, onGoBack }) => (
    <div className="pg-success-wrap" style={{ position: 'relative' }}>
        <Confetti />
        <div className="pg-success pg-anim-pop">
            <div className="pg-success-trophy" aria-hidden="true">🏆</div>
            <h2 className="pg-success-title">Prediction Locked!</h2>
            <p className="pg-success-sub">
                Your pick has been saved. We'll reveal how accurate you were after the final whistle.
            </p>
            <div className="pg-success-score-wrap">
                <span className="pg-success-team">{match.home_team_name}</span>
                <span className="pg-success-score">{score.home} – {score.away}</span>
                <span className="pg-success-team">{match.away_team_name}</span>
            </div>
            <div className="pg-pts-badge">⭐ Earn +10 pts if correct</div>
            <div className="pg-waiting-card">
                <div className="pg-waiting-dots" aria-hidden="true">
                    <span className="pg-dot" />
                    <span className="pg-dot" />
                    <span className="pg-dot" />
                </div>
                <div className="pg-waiting-txt">
                    <strong>Waiting for the final whistle…</strong>
                    <span>Check back after kick-off to see your result</span>
                </div>
            </div>
            <button className="pg-back-matches-btn" onClick={onGoBack}>
                ← Back to Matches
            </button>
        </div>
    </div>
);

/* ─── Main ────────────────────────────────────────── */

const PredictGame = () => {
    const { matchId }  = useParams();
    const navigate     = useNavigate();

    const [match,       setMatch]       = useState(null);
    const [players,     setPlayers]     = useState([]);
    const [loading,     setLoading]     = useState(true);
    const [step,        setStep]        = useState(1);
    const [submitting,  setSubmitting]  = useState(false);

    const [score,       setScore]       = useState({ home: 0, away: 0 });
    const [homePicked,  setHomePicked]  = useState([]);
    const [awayPicked,  setAwayPicked]  = useState([]);

    /* Reset scorers when score changes */
    const handleScoreChange = (newScore) => {
        if (newScore.home !== score.home) setHomePicked([]);
        if (newScore.away !== score.away) setAwayPicked([]);
        setScore(newScore);
    };

    useEffect(() => {
        const fetchAll = async () => {
            try {
                const [matchRes, playerRes] = await Promise.all([
                    api.get(`/matches/${matchId}/`),
                    api.get('/players/'),
                ]);
                setMatch(matchRes.data);
                setPlayers(playerRes.data);
            } catch {
                toast.error('Failed to load match data');
            } finally {
                setLoading(false);
            }
        };
        fetchAll();
    }, [matchId]);

    const handleToggle = useCallback((playerId, teamType) => {
        if (teamType === 'home') {
            if (homePicked.includes(playerId)) {
                setHomePicked(homePicked.filter(id => id !== playerId));
            } else if (homePicked.length < score.home) {
                setHomePicked([...homePicked, playerId]);
            } else {
                toast.info(`You predicted ${score.home} goal${score.home !== 1 ? 's' : ''} for ${match?.home_team_name}. Uncheck one to swap.`);
            }
        } else {
            if (awayPicked.includes(playerId)) {
                setAwayPicked(awayPicked.filter(id => id !== playerId));
            } else if (awayPicked.length < score.away) {
                setAwayPicked([...awayPicked, playerId]);
            } else {
                toast.info(`You predicted ${score.away} goal${score.away !== 1 ? 's' : ''} for ${match?.away_team_name}. Uncheck one to swap.`);
            }
        }
    }, [homePicked, awayPicked, score, match]);

    const handleSubmit = async () => {
        setSubmitting(true);
        try {
            await api.post('my-predictions/', {
                match:            matchId,
                home_score_guess: score.home,
                away_score_guess: score.away,
                home_scorers:     homePicked,
                away_scorers:     awayPicked,
            });
            toast.success('Prediction locked! ⚽');
            setStep(3);
        } catch (err) {
            toast.error(err.response?.data?.error ?? 'Submission failed');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="pg-loader-wrap" role="status">
                <FootballLoader />
            </div>
        );
    }

    if (!match) {
        return <div className="pg-loader-wrap">Match not found.</div>;
    }

    return (
        <div className="pg-page">

            {/* Hero */}
            <div className="pg-hero">
                <div className="pg-hero-glow" aria-hidden="true" />
                <div className="pg-hero-tag">⚽ Match Prediction</div>
                <h1 className="pg-hero-title">
                    Predict the <em>Result</em>
                </h1>
                <p className="pg-hero-sub">
                    {match.home_team_name} vs {match.away_team_name}
                </p>
            </div>

            {/* Step bar */}
            <StepBar current={step} />

            {/* Content */}
            <div className="pg-body">
                {step === 1 && (
                    <ScoreStep
                        match={match}
                        score={score}
                        onChange={handleScoreChange}
                        onNext={() => setStep(2)}
                    />
                )}

                {step === 2 && (
                    <ScorerStep
                        match={match}
                        score={score}
                        players={players}
                        homePicked={homePicked}
                        awayPicked={awayPicked}
                        onToggle={handleToggle}
                        onBack={() => setStep(1)}
                        onSubmit={handleSubmit}
                        submitting={submitting}
                    />
                )}

                {step === 3 && (
                    <SuccessStep
                        match={match}
                        score={score}
                        onGoBack={() => navigate('/matches')}
                    />
                )}
            </div>

        </div>
    );
};

export default PredictGame;
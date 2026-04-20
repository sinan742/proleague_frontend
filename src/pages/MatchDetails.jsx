import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api';
import './MatchDetails.css';
import FootballLoader from '../FootballLoader';

/* ─── Event icon map ──────────────────────────────── */

const EVENT_ICONS = {
    'Goal':         '⚽',
    'Yellow Card':  '🟨',
    'Red Card':     '🟥',
    'Substitution': '🔄',
    'Penalty':      '🎯',
    'Own Goal':     '🥅',
};
const getIcon = (type) => EVENT_ICONS[type] ?? '📋';

/* ─── TeamLogo ────────────────────────────────────── */

const TeamLogo = ({ src, name, size = 52 }) => {
    const [err, setErr] = React.useState(false);
    if (!src || err) {
        return (
            <div
                className="mdp2-team-logo mdp2-team-logo--fb"
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
            className="mdp2-team-logo"
            style={{ width: size, height: size }}
            onError={() => setErr(true)}
        />
    );
};

/* ─── StatBar ─────────────────────────────────────── */

const StatBar = ({ label, home = 0, away = 0, unit = '', delay = 0 }) => {
    const h   = Number(home) || 0;
    const a   = Number(away) || 0;
    const tot = (h + a) || 1;
    const hp  = Math.round((h / tot) * 100);
    return (
        <div className="mdp2-stat-row" style={{ animationDelay: `${delay}s` }}>
            <div className="mdp2-stat-labels">
                <span className="mdp2-stat-hv">{h}{unit}</span>
                <span className="mdp2-stat-lbl">{label}</span>
                <span className="mdp2-stat-av">{a}{unit}</span>
            </div>
            <div className="mdp2-stat-track" role="meter" aria-label={`${label}: home ${h}${unit}, away ${a}${unit}`}>
                <div className="mdp2-stat-hfill" style={{ width: `${hp}%` }} />
                <div className="mdp2-stat-afill" style={{ width: `${100 - hp}%` }} />
            </div>
        </div>
    );
};

/* ─── SplitTimeline ───────────────────────────────── */

const SplitTimeline = ({ events = [] }) => {
    if (!events.length) {
        return <p className="mdp2-empty">Match action will appear here once the game begins.</p>;
    }
    return (
        <div className="mdp2-tl-wrap" role="list">
            {events.map((ev, i) => {
                const isHome = ev.team_side === 'home';
                const icon   = getIcon(ev.event_type);
                return (
                    <div
                        key={i}
                        className="mdp2-tl-row"
                        role="listitem"
                        style={{ animationDelay: `${i * 0.05}s` }}
                    >
                        {/* Home column */}
                        <div className={`mdp2-tl-side mdp2-tl-side--home ${!isHome ? 'mdp2-tl-side--empty' : ''}`}>
                            {isHome && (
                                <div className="mdp2-tl-card mdp2-tl-card--home">
                                    <span className="mdp2-tl-icon mdp2-tl-icon--home">{icon}</span>
                                    <div className="mdp2-tl-body">
                                        <p className="mdp2-tl-pname">{ev.player_name}</p>
                                        <p className="mdp2-tl-etype">{ev.event_type}</p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Centre minute bubble */}
                        <div className="mdp2-tl-min">
                            <span className="mdp2-tl-min-badge">{ev.minute}'</span>
                        </div>

                        {/* Away column */}
                        <div className={`mdp2-tl-side mdp2-tl-side--away ${isHome ? 'mdp2-tl-side--empty' : ''}`}>
                            {!isHome && (
                                <div className="mdp2-tl-card mdp2-tl-card--away">
                                    <span className="mdp2-tl-icon mdp2-tl-icon--away">{icon}</span>
                                    <div className="mdp2-tl-body">
                                        <p className="mdp2-tl-pname">{ev.player_name}</p>
                                        <p className="mdp2-tl-etype">{ev.event_type}</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

/* ─── ScoreEventsStrip ────────────────────────────── */

const ScoreEventsStrip = ({ events = [] }) => {
    const goalTypes  = new Set(['Goal', 'Penalty', 'Own Goal']);
    const goals      = events.filter(e => goalTypes.has(e.event_type));
    const homeGoals  = goals.filter(e => e.team_side === 'home');
    const awayGoals  = goals.filter(e => e.team_side === 'away');

    return (
        <div className="mdp2-score-events" aria-label="Goal scorers">
            <div className="mdp2-score-evt-col mdp2-score-evt-col--home">
                {homeGoals.length > 0
                    ? homeGoals.map((e, i) => (
                        <span key={i} className="mdp2-score-evt-item">
                            <em>{e.minute}'</em> {e.player_name} ⚽
                        </span>
                    ))
                    : <span className="mdp2-score-evt-none">–</span>
                }
            </div>
            <div className="mdp2-score-evt-spacer" aria-hidden="true" />
            <div className="mdp2-score-evt-col mdp2-score-evt-col--away">
                {awayGoals.length > 0
                    ? awayGoals.map((e, i) => (
                        <span key={i} className="mdp2-score-evt-item">
                            <em>{e.minute}'</em> {e.player_name} ⚽
                        </span>
                    ))
                    : <span className="mdp2-score-evt-none">–</span>
                }
            </div>
        </div>
    );
};

/* ─── PerformanceTable ────────────────────────────── */

const PerformanceTable = ({ performances = [] }) => {
    // Buttons removed. Logic now sorts all players by rating descending.
    const sortedPerformances = [...performances].sort((a, b) => (Number(b.rating) || 0) - (Number(a.rating) || 0));

    const ratingCls = (r) => {
        const n = Number(r) || 0;
        if (n >= 8)   return 'mdp2-perf-rating--hi';
        if (n >= 6.5) return 'mdp2-perf-rating--mid';
        return 'mdp2-perf-rating--lo';
    };

    return (
        <div className="mdp2-perf-table-wrap">
            <table className="mdp2-perf-table">
                <thead>
                    <tr>
                        <th>Player</th>
                        <th title="Goals">G</th>
                        <th title="Assists">A</th>
                        <th title="Yellow Cards">YC</th>
                        <th title="Red Cards">RC</th>
                        <th title="Rating">Rtg</th>
                    </tr>
                </thead>
                <tbody>
                    {sortedPerformances.length > 0 ? sortedPerformances.map((p, i) => (
                        <tr key={p.id ?? i} className="mdp2-perf-row">
                            <td>
                                <div className="mdp2-perf-player">
                                    {p.player_photo
                                        ? <img
                                            src={p.player_photo}
                                            alt={p.player_name}
                                            className="mdp2-perf-photo"
                                            onError={e => {
                                                e.target.style.display = 'none';
                                                e.target.nextSibling?.style && (e.target.nextSibling.style.display = 'flex');
                                            }}
                                          />
                                        : null
                                    }
                                    <div
                                        className="mdp2-perf-photo-fb"
                                        style={{ display: p.player_photo ? 'none' : 'flex' }}
                                    >
                                        {p.player_name?.slice(0, 2).toUpperCase()}
                                    </div>
                                    <div>
                                        <p className="mdp2-perf-pname">{p.player_name}</p>
                                        <p className="mdp2-perf-pos">{p.position ?? ''}</p>
                                    </div>
                                </div>
                            </td>
                            <td>{p.goals > 0
                                ? <span className="mdp2-perf-badge mdp2-perf-badge--goal">{p.goals}</span>
                                : <span className="mdp2-perf-zero">0</span>}
                            </td>
                            <td>{p.assists > 0
                                ? <span className="mdp2-perf-badge mdp2-perf-badge--assist">{p.assists}</span>
                                : <span className="mdp2-perf-zero">0</span>}
                            </td>
                            <td>{p.yellow_cards > 0
                                ? <span className="mdp2-perf-badge mdp2-perf-badge--yc">🟨 {p.yellow_cards}</span>
                                : <span className="mdp2-perf-zero">0</span>}
                            </td>
                            <td>{p.red_cards > 0
                                ? <span className="mdp2-perf-badge mdp2-perf-badge--rc">🟥 {p.red_cards}</span>
                                : <span className="mdp2-perf-zero">0</span>}
                            </td>
                            <td>
                                <span className={`mdp2-perf-rating ${ratingCls(p.rating)}`}>
                                    {p.rating ? Number(p.rating).toFixed(1) : '—'}
                                </span>
                            </td>
                        </tr>
                    )) : (
                        <tr>
                            <td colSpan={6} className="mdp2-empty">No performance data yet.</td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
};

/* ─── Main ────────────────────────────────────────── */

const MatchDetails = () => {
    const { id }                    = useParams();
    const [match, setMatch]         = useState(null);
    const [performances, setPerformances] = useState([]);
    const [activeTab, setActiveTab] = useState('events');
    const socket                    = useRef(null);

    useEffect(() => {
        api.get(`matches/${id}/stats/`).then(res => setMatch(res.data));
        
        // Added fetch for performance data
        api.get(`performances/add/?match=${id}`).then(res => setPerformances(res.data));

        const protocol    = window.location.protocol === 'https:' ? 'wss' : 'ws';
        socket.current    = new WebSocket(`${protocol}://127.0.0.1:8000/ws/match/${id}/`);

        socket.current.onmessage = (e) => {
            const data = JSON.parse(e.data);
            setMatch(prev => {
                if (!prev) return prev;
                const newEvent = data.player ? {
                    player_name: data.player,
                    event_type:  data.type,
                    minute:      data.minute,
                    team_side:   data.side ?? (
                        (data.home_score ?? prev.home_score) > prev.home_score ? 'home' : 'away'
                    ),
                } : null;
                return {
                    ...prev,
                    home_score:     data.home_score     ?? prev.home_score,
                    away_score:     data.away_score     ?? prev.away_score,
                    current_minute: data.minute         ?? prev.current_minute,
                    events: newEvent
                        ? [newEvent, ...(prev.events ?? [])]
                        : prev.events,
                };
            });
        };

        return () => socket.current?.close();
    }, [id]);

    if (!match) {
        return (
            <div className="mdp2-loader-wrap" role="status">
                <FootballLoader />
            </div>
        );
    }

    const homeStats = match.statistics?.find(s => s.team_name === match.home_team_name) ?? {};
    const awayStats = match.statistics?.find(s => s.team_name === match.away_team_name) ?? {};
    const isLive    = match.status ;

    const TABS = [
        { key: 'events',      label: 'Match Timeline' },
        { key: 'stats',       label: 'Team Stats'     },
        { key: 'performance', label: 'Performances'   },
    ];

    return (
        <div className="mdp2-page">

            {/* ── Hero ─────────────────────────────────── */}
            <section className="mdp2-hero" aria-label="Match scoreboard">
                <div className="mdp2-hero-grid" aria-hidden="true" />
                <div className="mdp2-hero-glow"  aria-hidden="true" />

                <div className="mdp2-scoreboard">
                    <div className="mdp2-team-col">
                        <TeamLogo src={match.home_team_logo} name={match.home_team_name} size={56} />
                        <span className="mdp2-team-name">{match.home_team_name}</span>
                    </div>

                    <div className="mdp2-score-block">
                        <div className="mdp2-score-nums" aria-label={`${match.home_score} – ${match.away_score}`}>
                            <span className="mdp2-score-n">{match.home_score ?? 0}</span>
                            <span className="mdp2-score-dash" aria-hidden="true">–</span>
                            <span className="mdp2-score-n">{match.away_score ?? 0}</span>
                        </div>
                        <div
                            className={`mdp2-status-pill ${isLive ? 'mdp2-status-pill--live' : 'mdp2-status-pill--done'}`}
                            role="status"
                        >
                            {isLive ? (
                                <>
                                    <span className="mdp2-live-dot" aria-hidden="true" />
                                    LIVE {match.current_minute}'
                                </>
                            ) : (
                                match.status?.replace(/_/g, ' ').toUpperCase()
                            )}
                        </div>
                    </div>

                    <div className="mdp2-team-col">
                        <TeamLogo src={match.away_team_logo} name={match.away_team_name} size={56} />
                        <span className="mdp2-team-name">{match.away_team_name}</span>
                    </div>
                </div>

                {/* Goal scorers strip */}
                <ScoreEventsStrip events={match.events ?? []} />

                <div className="mdp2-venue-strip">
                    <span className="mdp2-venue-txt">
                        {match.venue ?? 'Main Stadium'}
                        {match.match_date && (
                            <> · {new Date(match.match_date).toLocaleDateString('en-GB', {
                                weekday: 'short', day: '2-digit', month: 'short', year: 'numeric',
                            })}</>
                        )}
                    </span>
                </div>
            </section>

            {/* ── Tabs ─────────────────────────────────── */}
            <nav className="mdp2-tabs" role="tablist" aria-label="Match sections">
                {TABS.map(t => (
                    <button
                        key={t.key}
                        className={`mdp2-tab ${activeTab === t.key ? 'mdp2-tab--on' : ''}`}
                        onClick={() => setActiveTab(t.key)}
                        aria-selected={activeTab === t.key}
                        role="tab"
                    >
                        {t.label}
                    </button>
                ))}
            </nav>

            {/* ── Content ──────────────────────────────── */}
            <main className="mdp2-content" role="tabpanel">

                {activeTab === 'events' && (
                    <div className="mdp2-anim">
                        <h3 className="mdp2-sec-title">Match <em>Timeline</em></h3>
                        <div className="mdp2-tl-header" aria-hidden="true">
                            <span className="mdp2-tl-hdr-home">{match.home_team_name}</span>
                            <span />
                            <span className="mdp2-tl-hdr-away">{match.away_team_name}</span>
                        </div>
                        <SplitTimeline events={match.events ?? []} />
                    </div>
                )}

                {activeTab === 'stats' && (
                    <div className="mdp2-anim">
                        <h3 className="mdp2-sec-title">Team <em>Stats</em></h3>
                        <div className="mdp2-stats-team-row">
                            <span className="mdp2-stats-hn">{match.home_team_name}</span>
                            <span className="mdp2-stats-an">{match.away_team_name}</span>
                        </div>
                        <div className="mdp2-stats-list">
                            <StatBar label="Possession"      home={homeStats.possession}      away={awayStats.possession}      unit="%" delay={0.05} />
                            <StatBar label="Total Shots"     home={homeStats.shots}           away={awayStats.shots}           delay={0.10} />
                            <StatBar label="Shots on Target" home={homeStats.shots_on_target} away={awayStats.shots_on_target} delay={0.15} />
                            <StatBar label="Total Passes"    home={homeStats.passes}          away={awayStats.passes}          delay={0.20} />
                            <StatBar label="Corners"         home={homeStats.corners}         away={awayStats.corners}         delay={0.25} />
                            <StatBar label="Fouls"           home={homeStats.fouls}           away={awayStats.fouls}           delay={0.30} />
                            <StatBar label="Yellow Cards"    home={homeStats.yellow_cards}    away={awayStats.yellow_cards}    delay={0.35} />
                        </div>
                    </div>
                )}

                {activeTab === 'performance' && (
                    <div className="mdp2-anim">
                        <h3 className="mdp2-sec-title">Player <em>Performances</em></h3>
                        <PerformanceTable performances={performances} />
                    </div>
                )}

            </main>
        </div>
    );
};

export default MatchDetails;
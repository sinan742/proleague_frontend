import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import './Home.css';

/* ─────────────────────────────────────────────
   PlayerCard — spotlight superstar widget
───────────────────────────────────────────── */
const PlayerCard = ({ player, label, stat, unit, icon, delay = 0 }) => {
    if (!player) return null;
    return (
        <div className="sp-card" style={{ animationDelay: `${delay}s` }}>
            <div className={`sp-badge sp-badge--${stat}`}>
                <span>{icon}</span> {label}
            </div>
            <div className="sp-img-wrap">
                <img
                    src={player.photo}
                    alt={player.name}
                    className="sp-img"
                    onError={e => { e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(player.name)}&background=1B5E20&color=FFD700&bold=true`; }}
                />
            </div>
            <div className="sp-info">
                <p className="sp-name">{player.name}</p>
                <p className="sp-team">{player.team_name}</p>
                <div className="sp-stat-box">
                    <span className="sp-num">{player[stat] ?? 0}</span>
                    <span className="sp-unit">{unit}</span>
                </div>
            </div>
            <Link to={`/players/${player.id}`} className="sp-link">View Stats</Link>
        </div>
    );
};

/* ─────────────────────────────────────────────
   MatchMiniCard — today's ribbon pill
───────────────────────────────────────────── */
const MatchMiniCard = ({ m }) => {
    const isLive     = m.status === 'live';
    const isFinished = m.status === 'finished' || m.status === 'half_time';
    const scoreStr   = isFinished || isLive ? `${m.home_score} – ${m.away_score}` : 'vs';

    return (
        <Link to={`/matches/${m.id}`} className={`today-pill ${isLive ? 'today-pill--live' : ''}`}>
            <div className="tp-side">
                {m.home_team_logo
                    ? <img src={m.home_team_logo} alt="" className="tp-logo" />
                    : <div className="tp-logo tp-logo--fb">{m.home_team_name?.slice(0, 2)}</div>
                }
                <span className="tp-abbr">{m.home_team_name?.slice(0, 3).toUpperCase()}</span>
            </div>
            <div className="tp-score">{scoreStr}</div>
            <div className="tp-side">
                {m.away_team_logo
                    ? <img src={m.away_team_logo} alt="" className="tp-logo" />
                    : <div className="tp-logo tp-logo--fb">{m.away_team_name?.slice(0, 2)}</div>
                }
                <span className="tp-abbr">{m.away_team_name?.slice(0, 3).toUpperCase()}</span>
            </div>
            {isLive && <span className="tp-live-badge" aria-label="Live match">LIVE</span>}
        </Link>
    );
};

/* ─────────────────────────────────────────────
   MatchSlideCard — horizontal match center card
───────────────────────────────────────────── */
const MatchSlideCard = ({ m, delay = 0 }) => {
    const isFinished = m.is_completed || m.status === 'finished';
    const dateStr = new Date(m.match_date).toLocaleDateString('en-GB', {
        day: '2-digit', month: 'short',
    });

    return (
        <Link
            to={`/matches/${m.id}`}
            className={`mc-card ${isFinished ? 'mc-card--finished' : ''}`}
            style={{ animationDelay: `${delay}s` }}
        >
            <span className="mc-date">{dateStr} · {isFinished ? 'Finished' : 'Upcoming'}</span>
            <div className="mc-team">
                {m.home_team_logo
                    ? <img src={m.home_team_logo} alt="" className="mc-logo" />
                    : <div className="mc-logo mc-logo--fb">{m.home_team_name?.slice(0, 2)}</div>
                }
                <span className="mc-tname">{m.home_team_name}</span>
            </div>
            <div className="mc-score">
                {isFinished ? `${m.home_score} – ${m.away_score}` : 'VS'}
            </div>
            <div className="mc-team">
                {m.away_team_logo
                    ? <img src={m.away_team_logo} alt="" className="mc-logo" />
                    : <div className="mc-logo mc-logo--fb">{m.away_team_name?.slice(0, 2)}</div>
                }
                <span className="mc-tname">{m.away_team_name}</span>
            </div>
            <div className="mc-venue">{m.stadium || m.venue || 'Main Stadium'}</div>
        </Link>
    );
};

/* ─────────────────────────────────────────────
   Main Home component
───────────────────────────────────────────── */
const Home = () => {
    const [stats, setStats]           = useState({ scorer: null, asister: null, keeper: null });
    const [todayMatches, setToday]    = useState([]);
    const [allMatches, setAll]        = useState([]);
    const [topTeams, setTopTeams]     = useState([]);
    const [counts, setCounts]         = useState({ teams: 0, players: 0, matches: 0 });
    const [loading, setLoading]       = useState(true);

    useEffect(() => {
        const fetchAll = async () => {
            try {
                const [playerRes, leagueRes, matchRes] = await Promise.all([
                    api.get('players/'),
                    api.get('league-table/'),
                    api.get('matches/'),
                ]);

                const players = playerRes.data;
                const league  = leagueRes.data;
                const matches = matchRes.data;

                const today = new Date().toLocaleDateString('en-CA');
                setToday(matches.filter(m => m.match_date?.startsWith(today)));
                setAll(matches);
                setTopTeams(league.slice(0, 5));

                const byGoals   = [...players].sort((a, b) => (b.goals   ?? 0) - (a.goals   ?? 0));
                const byAssists = [...players].sort((a, b) => (b.assists  ?? 0) - (a.assists  ?? 0));
                const keepers   = players.filter(p => p.position === 'GK')
                                         .sort((a, b) => (b.saves ?? 0) - (a.saves ?? 0));
                setStats({
                    scorer:  byGoals[0]   ?? null,
                    asister: byAssists[0] ?? null,
                    keeper:  keepers[0]   ?? null,
                });

                setCounts({ teams: league.length, players: players.length, matches: matches.length });
            } catch (err) {
                console.error('Home data fetch failed', err);
            } finally {
                setLoading(false);
            }
        };
        fetchAll();
    }, []);

    return (
        <div className="home">

            {/* ── Hero ─────────────────────────────────────── */}
            <header className="home-hero" aria-label="ProLeague dashboard header">
                <div className="hero-tag">
                    <span className="hero-dot" aria-hidden="true" />
                    Live Football Dashboard
                </div>
                <h1 className="hero-title">PRO<span>LEAGUE</span></h1>
                <div className="hero-stats" aria-label="Tournament stats">
                    <div className="hs-item">
                        <span className="hs-num">{counts.teams}</span>
                        <span className="hs-label">Clubs</span>
                    </div>
                    <div className="hs-divider" aria-hidden="true" />
                    <div className="hs-item">
                        <span className="hs-num">{counts.players}</span>
                        <span className="hs-label">Players</span>
                    </div>
                    <div className="hs-divider" aria-hidden="true" />
                    <div className="hs-item">
                        <span className="hs-num">{counts.matches}</span>
                        <span className="hs-label">Matches</span>
                    </div>
                </div>
            </header>

            {/* ── Today's fixtures ribbon ───────────────────── */}
            <section className="today-bar" aria-label="Today's fixtures">
                <span className="today-bar__label">Today</span>
                <div className="today-bar__scroll">
                    {loading ? (
                        <span className="today-bar__empty">Loading…</span>
                    ) : todayMatches.length > 0 ? (
                        todayMatches.map(m => <MatchMiniCard key={m.id} m={m} />)
                    ) : (
                        <span className="today-bar__empty">No fixtures today</span>
                    )}
                </div>
            </section>

            <div className="home-stack">

                {/* ── Match center ──────────────────────────── */}
                <section className="home-section" aria-labelledby="mc-head">
                    <div className="section-head">
                        <h2 id="mc-head" className="section-title">Match <em>Center</em></h2>
                        <Link to="/matches" className="section-link">See all →</Link>
                    </div>
                    <div className="h-scroll" role="list">
                        {allMatches.map((m, i) => (
                            <div role="listitem" key={m.id}>
                                <MatchSlideCard m={m} delay={i * 0.06} />
                            </div>
                        ))}
                    </div>
                </section>

                {/* ── Superstars ────────────────────────────── */}
                <section className="home-section" aria-labelledby="ss-head">
                    <h2 id="ss-head" className="section-title" style={{ marginBottom: '14px' }}>
                        Season <em>Superstars</em>
                    </h2>
                    <div className="spotlight-grid">
                        <PlayerCard player={stats.scorer}  label="Golden Boot"  stat="goals"   unit="Goals"   icon="⚽" delay={0.05} />
                        <PlayerCard player={stats.asister} label="Playmaker"    stat="assists" unit="Assists" icon="👟" delay={0.10} />
                        <PlayerCard player={stats.keeper}  label="Golden Glove" stat="saves"   unit="Saves"   icon="🧤" delay={0.15} />
                    </div>
                </section>

                {/* ── League standings ──────────────────────── */}
                <section className="home-section" aria-labelledby="ls-head">
                    <div className="section-head">
                        <h2 id="ls-head" className="section-title">League <em>Standings</em></h2>
                        <Link to="/point-table" className="section-link">Full table →</Link>
                    </div>
                    <div className="standings-card">
                        <table className="standings-table">
                            <thead>
                                <tr>
                                    <th>Pos</th>
                                    <th>Club</th>
                                    <th>P</th>
                                    <th>W</th>
                                    <th>D</th>
                                    <th>L</th>
                                    <th>GD</th>
                                    <th>Pts</th>
                                </tr>
                            </thead>
                            <tbody>
                                {topTeams.map((t, i) => (
                                    <tr key={t.id ?? i}>
                                        <td className={i === 0 ? 'pos pos--1' : 'pos'}>{i + 1}</td>
                                        <td>
                                            <div className="tbl-team">
                                                {(t.team_logo || t.logo)
                                                    ? <img src={t.team_logo || t.logo} alt="" className="tbl-logo" />
                                                    : <div className="tbl-logo tbl-logo--fb">{(t.team_name || t.name)?.slice(0, 2)}</div>
                                                }
                                                <span className="tbl-name">{t.team_name || t.name}</span>
                                            </div>
                                        </td>
                                        <td>{t.p  ?? t.played   ?? 0}</td>
                                        <td>{t.w  ?? t.wins     ?? 0}</td>
                                        <td>{t.d  ?? t.draws    ?? 0}</td>
                                        <td>{t.l  ?? t.losses   ?? 0}</td>
                                        <td>{t.gd ?? t.goal_difference ?? 0}</td>
                                        <td className="tbl-pts">{t.pts ?? t.points ?? 0}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        <div className="standings-foot">
                            <Link to="/point-table">View Full Standings →</Link>
                        </div>
                    </div>
                </section>

            </div>
        </div>
    );
};

export default Home;
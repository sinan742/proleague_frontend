import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import api from '../api';
import './Navbar.css';

const NAV_ITEMS = [
    {
        label: 'Home',
        to: '/',
        icon: (
            <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.5" stroke="currentColor">
                <path d="M3 12L12 3L21 12V20H15V14H9V20H3V12Z" />
            </svg>
        ),
    },
    {
        label: 'Matches',
        to: '/matches',
        icon: (
            <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.5" stroke="currentColor">
                <rect x="3" y="4" width="18" height="18" rx="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
        ),
    },
    {
        label: 'Players',
        to: '/playersall',
        icon: (
            <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.5" stroke="currentColor">
                <circle cx="12" cy="8" r="4" />
                <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
            </svg>
        ),
    },
    {
        label: 'Week team',
        to: '/team-of-the-week',
        icon: (
            <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.5" stroke="currentColor">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
        ),
    },
];

const RewardIcon = () => (
    <svg viewBox="0 0 16 16" fill="#f0c040" width="13" height="13">
        <circle cx="8" cy="8" r="7" />
        <text x="8" y="11.5" textAnchor="middle" fontSize="8" fill="#0f1923" fontWeight="bold">₿</text>
    </svg>
);

const ProfileIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.5" stroke="currentColor" width="16" height="16">
        <circle cx="12" cy="8" r="4" />
        <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
    </svg>
);

const Navbar = () => {
    const location = useLocation();
    const [user, setUser] = useState(null);
    const [teams, setTeams] = useState([]);
    const [isLogged, setIsLogged] = useState(localStorage.hasOwnProperty('is_admin'));
    const [activeTeam, setActiveTeam] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            if (localStorage.hasOwnProperty('is_admin')) {
                try {
                    const res = await api.get('profile/');
                    setUser(res.data);
                    setIsLogged(true);
                } catch {
                    setIsLogged(false);
                }
            }
            try {
                const teamRes = await api.get('teams/');
                setTeams(teamRes.data);
            } catch {
                console.error('Error fetching teams');
            }
        };
        fetchData();
    }, [location.pathname]);

    const handleLogout = async () => {
        try { await api.post('logout/'); } finally {
            localStorage.removeItem('is_admin');
            window.location.href = '/login';
        }
    };

    const isActive = (path) =>
        path === '/'
            ? location.pathname === '/'
            : location.pathname.startsWith(path);

    const userInitials = user?.username
        ? user.username.slice(0, 2).toUpperCase()
        : 'PL';

    return (
        <>
            {/* ── Top bar ───────────────────────────────────────── */}
            <header className="nb-topbar">
                <Link to="/" className="nb-logo">
                    PRO<span>LEAGUE</span>
                </Link>

                <div className="nb-actions">
                    {isLogged ? (
                        <>
                            <Link to="/reward-history" className="nb-pts-pill" aria-label="View reward points">
                                <RewardIcon />
                                <span>{(user?.points ?? 0).toLocaleString()} pts</span>
                            </Link>

                            <Link to="/profile" className="nb-avatar" aria-label="View profile">
                                {user?.profile_image ? (
                                    <img
                                        src={user.profile_image}
                                        alt={user.username || 'Profile'}
                                        className="nb-avatar-img"
                                    />
                                ) : (
                                    userInitials
                                )}
                                <span className="nb-avatar-dot" />
                            </Link>

                            <button
                                className="nb-logout-btn"
                                onClick={handleLogout}
                                aria-label="Log out"
                            >
                                <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.5" stroke="currentColor" width="16" height="16">
                                    <path d="M17 16l4-4m0 0l-4-4m4 4H7" />
                                    <path d="M3 12a9 9 0 0 0 9 9m0-18a9 9 0 0 0-9 9" />
                                </svg>
                            </button>
                        </>
                    ) : (
                        <div className="nb-auth-links">
                            <Link to="/login" className="nb-login-link">Login</Link>
                            <Link to="/register" className="nb-signup-btn">Sign up</Link>
                        </div>
                    )}
                </div>
            </header>

            {/* ── Desktop nav links (hidden on mobile) ─────────── */}
            <nav className="nb-desktop-links" aria-label="Main navigation">
                <Link to="/" className={isActive('/') ? 'active' : ''}>Home</Link>
                <Link to="/teams" className={isActive('/teams') ? 'active' : ''}>Teams</Link>
                <Link to="/playersall" className={isActive('/playersall') ? 'active' : ''}>Players</Link>
                <Link to="/point-table" className={isActive('/point-table') ? 'active' : ''}>Table</Link>
                <Link to="/matches" className={isActive('/matches') ? 'active' : ''}>Fixtures</Link>
                <Link to="/team-of-the-week" className={isActive('/team-of-the-week') ? 'active' : ''}>Week team</Link>
                <Link to="/booking-history" className={isActive('/booking-history') ? 'active' : ''}>Booking History</Link>

            </nav>

            {/* ── Teams strip ───────────────────────────────────── */}
            {teams.length > 0 && (
                <div className="nb-teams-strip" role="list" aria-label="Browse teams">
                    {teams.map((team) => (
                        <Link
                            key={team.id}
                            to={`/teams/${team.id}`}
                            role="listitem"
                            className={`nb-team-chip ${activeTeam === team.id ? 'active' : ''}`}
                            onClick={() => setActiveTeam(team.id)}
                            aria-label={team.name}
                        >
                            {team.logo ? (
                                <img
                                    src={team.logo}
                                    alt=""
                                    className="nb-team-logo-img"
                                    aria-hidden="true"
                                />
                            ) : (
                                <div className="nb-team-logo-fallback" aria-hidden="true">
                                    {team.name.slice(0, 3).toUpperCase()}
                                </div>
                            )}
                            <span className="nb-team-name">{team.name}</span>
                        </Link>
                    ))}
                </div>
            )}

            {/* ── Mobile bottom nav ─────────────────────────────── */}
            <nav className="nb-bottomnav" aria-label="Mobile navigation">
                {NAV_ITEMS.map((item) => {
                    const active = isActive(item.to);
                    return (
                        <Link
                            key={item.to}
                            to={item.to}
                            className={`nb-nav-item ${active ? 'active' : ''}`}
                            aria-current={active ? 'page' : undefined}
                            aria-label={item.label}
                        >
                            {active && <span className="nb-active-dot" aria-hidden="true" />}
                            <span className="nb-nav-icon" aria-hidden="true">{item.icon}</span>
                            <span className="nb-nav-label">{item.label}</span>
                        </Link>
                    );
                })}
            </nav>
        </>
    );
};

export default Navbar;
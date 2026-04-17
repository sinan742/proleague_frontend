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
        label: 'Tickets', // Mobile focus on History/Booking
        to: '/booking-history',
        icon: (
            <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.5" stroke="currentColor">
                <path d="M2 9V5a2 2 0 012-2h16a2 2 0 012 2v4M2 15v4a2 2 0 002 2h16a2 2 0 002-2v-4M2 9a3 3 0 013 3 3 3 0 01-3 3M22 9a3 3 0 00-3 3 3 3 0 003 3M12 5v14" strokeDasharray="2 2" />
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
        label: 'Week 11', // Team of the Week
        to: '/team-of-the-week',
        icon: (
            <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.5" stroke="currentColor">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
        ),
    },
    {
        label: 'AI Chat', // Updated Label and Icon
        to: '/ask-ai',
        icon: (
            <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.5" stroke="currentColor">
                <path d="M12 3V5M12 19V21M4.22 4.22L5.64 5.64M18.36 18.36L19.78 19.78M1 12H3M21 12H23M4.22 19.78L5.64 18.36M18.36 5.64L19.78 4.22M12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9Z" />
                <path d="M12 7C9.23858 7 7 9.23858 7 12C7 14.7614 9.23858 17 12 17C14.7614 17 17 14.7614 17 12C17 9.23858 14.7614 7 12 7Z" strokeDasharray="2 2" />
            </svg>
        ),
    },
];

const RewardIcon = () => (
    <svg viewBox="0 0 16 16" fill="#FFD700" width="13" height="13">
        <circle cx="8" cy="8" r="7" />
        <text x="8" y="11.5" textAnchor="middle" fontSize="8" fill="#1B5E20" fontWeight="bold">₿</text>
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
            <header className="nb-topbar">
                <Link to="/" className="nb-logo">
                    PRO<span>LEAGUE</span>
                </Link>

                <div className="nb-actions">
                    {isLogged ? (
                        <>
                            <Link to="/reward-history" className="nb-pts-pill">
                                <RewardIcon />
                                <span>{(user?.points ?? 0).toLocaleString()} pts</span>
                            </Link>

                            <Link to="/profile" className="nb-avatar">
                                {user?.profile_image ? (
                                    <img src={user.profile_image} alt={user.username} className="nb-avatar-img" />
                                ) : (
                                    <span className="nb-initials">{userInitials}</span>
                                )}
                                <span className="nb-avatar-dot" />
                            </Link>

                            <button className="nb-logout-btn" onClick={handleLogout}>
                                <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" stroke="currentColor" width="18" height="18">
                                    <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" />
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

            <nav className="nb-desktop-links">
                <Link to="/" className={isActive('/') ? 'active' : ''}>Home</Link>
                <Link to="/teams" className={isActive('/teams') ? 'active' : ''}>Teams</Link>
                <Link to="/playersall" className={isActive('/playersall') ? 'active' : ''}>Players</Link>
                <Link to="/point-table" className={isActive('/point-table') ? 'active' : ''}>Table</Link>
                <Link to="/matches" className={isActive('/matches') ? 'active' : ''}>Fixtures</Link>
                <Link to="/team-of-the-week" className={isActive('/team-of-the-week') ? 'active' : ''}>Week team</Link>
                <Link to="/booking-history" className={isActive('/booking-history') ? 'active' : ''}>Booking History</Link>
                <Link to="/ask-ai" className={isActive('/ask-ai') ? 'active' : ''}>Ask Help</Link>
                <Link to="/privacy-policy" className={isActive('/privacy-policy') ? 'active' : ''}>Privacy Policy</Link>
            </nav>

            {teams.length > 0 && (
                <div className="nb-teams-strip">
                    {teams.map((team) => (
                        <Link
                            key={team.id}
                            to={`/teams/${team.id}`}
                            className={`nb-team-chip ${activeTeam === team.id ? 'active' : ''}`}
                            onClick={() => setActiveTeam(team.id)}
                        >
                            {team.logo ? (
                                <img src={team.logo} alt="" className="nb-team-logo-img" />
                            ) : (
                                <div className="nb-team-logo-fallback">{team.name.slice(0, 2)}</div>
                            )}
                            <span className="nb-team-name">{team.name}</span>
                        </Link>
                    ))}
                </div>
            )}

            <nav className="nb-bottomnav">
                {NAV_ITEMS.map((item) => {
                    const active = isActive(item.to);
                    return (
                        <Link
                            key={item.to}
                            to={item.to}
                            className={`nb-nav-item ${active ? 'active' : ''}`}
                        >
                            <span className="nb-nav-icon">{item.icon}</span>
                            <span className="nb-nav-label">{item.label}</span>
                        </Link>
                    );
                })}
            </nav>
        </>
    );
};

export default Navbar;
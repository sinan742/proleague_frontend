import React, { useState, useEffect, useRef } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import api from '../api';
import './AdminNavbar.css';

const NAV_ITEMS = [
    { to: '/admin-dashboard',          icon: '📊', label: 'Dashboard',        tabLabel: 'Dash'     },
    { to: '/admin-teams-management',   icon: '🛡️', label: 'Manage Teams',     tabLabel: 'Teams'    },
    { to: '/admin-players-management', icon: '👤', label: 'Manage Players',    tabLabel: 'Players'  },
    { to: '/admin-match-shedule',      icon: '📅', label: 'Match Schedule',    tabLabel: 'Schedule' },
    { to: '/admin-matches-management', icon: '⚽', label: 'Match Management',  tabLabel: 'Matches'  },
    { to: '/admin-voucher-management', icon: '🎟️', label: 'Vouchers',          tabLabel: 'Vouchers' },
    { to: '/admin-booking-management', icon: '🎫', label: 'Ticket Management', tabLabel: 'Tickets'  },
];

const AdminNavbar = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [isOpen, setIsOpen] = useState(false);
    const sidebarRef = useRef(null);

    const handleLogout = async () => {
        try {
            await api.post('logout/');
            localStorage.removeItem('is_admin');
            toast.success('Admin Session Ended');
            navigate('/login');
        } catch (err) {
            toast.error('Logout failed. Please try again.');
        }
    };

    /* Close drawer when route changes */
    useEffect(() => {
        setIsOpen(false);
    }, [location.pathname]);

    /* Close drawer on outside click */
    useEffect(() => {
        const handleOutside = (e) => {
            if (isOpen && sidebarRef.current && !sidebarRef.current.contains(e.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleOutside);
        return () => document.removeEventListener('mousedown', handleOutside);
    }, [isOpen]);

    /* Prevent body scroll when drawer is open on tablet */
    useEffect(() => {
        document.body.style.overflow = isOpen ? 'hidden' : '';
        return () => { document.body.style.overflow = ''; };
    }, [isOpen]);

    /* Bottom tab bar — only top 5 items shown */
    const TAB_ITEMS = NAV_ITEMS.slice(0, 5);

    return (
        <>
            {/* ── SIDEBAR / TOP DRAWER ── */}
            <nav
                ref={sidebarRef}
                className={`an-sidebar${isOpen ? ' mobile-open' : ''}`}
            >
                <div className="an-logo-section">
                    <h2 className="an-logo">PRO<span>LEAGUE</span></h2>
                    <span className="an-badge">Admin Panel</span>

                    {/* Hamburger — visible on tablet only (hidden on mobile via CSS) */}
                    <button
                        className={`an-menu-btn${isOpen ? ' open' : ''}`}
                        onClick={() => setIsOpen(prev => !prev)}
                        aria-label="Toggle navigation menu"
                        aria-expanded={isOpen}
                    >
                        <span />
                        <span />
                        <span />
                    </button>
                </div>

                <ul className="an-nav-list">
                    {NAV_ITEMS.map(item => (
                        <li key={item.to}>
                            <NavLink
                                to={item.to}
                                className={({ isActive }) =>
                                    isActive ? 'an-link active' : 'an-link'
                                }
                            >
                                <span className="an-icon">{item.icon}</span>
                                {item.label}
                            </NavLink>
                        </li>
                    ))}
                </ul>

                <div className="an-bottom-section">
                    <button onClick={handleLogout} className="an-logout-btn">
                        <span className="an-icon">🚪</span> Sign Out
                    </button>
                </div>
            </nav>

            {/* ── OVERLAY (tablet drawer backdrop) ── */}
            <div
                className={`an-overlay${isOpen ? ' visible' : ''}`}
                onClick={() => setIsOpen(false)}
                aria-hidden="true"
            />

            {/* ── BOTTOM TAB BAR (mobile ≤540px only) ── */}
            <nav className="an-tab-bar" aria-label="Mobile navigation">
                {TAB_ITEMS.map(item => (
                    <NavLink
                        key={item.to}
                        to={item.to}
                        className={({ isActive }) =>
                            isActive ? 'an-tab-item active' : 'an-tab-item'
                        }
                        aria-label={item.label}
                    >
                        <span className="an-tab-icon">{item.icon}</span>
                        <span className="an-tab-label">{item.tabLabel}</span>
                    </NavLink>
                ))}
            </nav>
        </>
    );
};

export default AdminNavbar;
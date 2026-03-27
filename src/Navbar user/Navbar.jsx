import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import api from '../api';
import './Navbar.css';

const Navbar = () => {
    const navigate = useNavigate();
    const location = useLocation();
    
    const [user, setUser] = useState(null);
    const [teams, setTeams] = useState([]);
    const [isLogged, setIsLogged] = useState(localStorage.hasOwnProperty('is_admin'));
    const [menuOpen, setMenuOpen] = useState(false);

    // Fetch User and Teams data
    useEffect(() => {
        const fetchData = async () => {
            // 1. Fetch User Profile if logged in
            if (localStorage.hasOwnProperty('is_admin')) {
                try {
                    const res = await api.get('profile/');
                    setUser(res.data);
                    setIsLogged(true);
                } catch (err) {
                    setIsLogged(false);
                }
            }
            
            // 2. Fetch Teams for the Hover Ribbon
            try {
                const teamRes = await api.get('teams/');
                setTeams(teamRes.data);
            } catch (err) {
                console.error("Error fetching teams for navbar");
            }
        };

        fetchData();
        setMenuOpen(false); // Close mobile menu on route change
    }, [location]);

    const handleLogout = async () => {
        try {
            await api.post('logout/'); 
        } finally {
            localStorage.removeItem('is_admin');
            window.location.href = '/login';
        }
    };

    return (
        <nav className="navbar">
            <div className="nav-container">
                <div className="nav-logo">
                    <Link to="/">PRO<span>LEAGUE</span></Link>
                </div>

                {/* Hamburger Icon */}
                <div className="menu-icon" onClick={() => setMenuOpen(!menuOpen)}>
                    <div className={menuOpen ? "bar open" : "bar"}></div>
                    <div className={menuOpen ? "bar open" : "bar"}></div>
                    <div className={menuOpen ? "bar open" : "bar"}></div>
                </div>

                <ul className={menuOpen ? "nav-links active" : "nav-links"}>
                    <li><Link to="/">Home</Link></li>
                    
                    {/* Teams Link with Hover Ribbon */}
                    <li className="teams-nav-item">
                        <Link to="/teams">Teams</Link>
                        <div className="teams-ribbon">
                            {teams.map(team => (
                                <Link key={team.id} to={`/teams/${team.id}`} className="ribbon-logo">
                                    <img src={team.logo} alt={team.name} title={team.name} />
                                </Link>
                            ))}
                        </div>
                    </li>

                    <li><Link to="/playersall">Players</Link></li>
                    <li><Link to="/point-table">Table</Link></li>
                    <li><Link to="/matches">Fixtures</Link></li>
                    
                    {/* Mobile Only Auth Links */}
                    {menuOpen && !isLogged && (
                        <li className="mobile-only"><Link to="/login">Login</Link></li>
                    )}
                </ul>

                <div className="nav-auth">
                    {isLogged ? (
                        <div className="user-section">
                            <div className="points-badge">
                                <span className="coin-icon">🪙</span>
                                {user?.points || 0} Pts
                            </div>

                            <Link to="/profile" className="welcome-msg">
                                Hi, <span>{user?.username || 'Player'}</span>
                            </Link>

                            <button className="logout-btn" onClick={handleLogout}>Logout</button>
                        </div>
                    ) : (
                        <div className="auth-buttons">
                            <Link to="/login" className="login-link">Login</Link>
                            <Link to="/register" className="register-btn">Sign Up</Link>
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
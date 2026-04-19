import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Components - Make sure the file exists in src/components/SplashScreen.jsx
import Navbar from './Navbar user/Navbar';
import PublicRoute from './PublicRoute';

// Auth & Pages
import Register from './auth/Register';
import Login from './auth/Login';
import VerifyOTP from './auth/verifyOTP';
import ForgotPassword from './auth/ForgotPassword';
import Home from './pages/Home';
import Profile from './pages/Profile';
import Team from './pages/Team';
import TeamDetails from './pages/TeamDetails';
import PlayerDetail from './pages/PlayerDetail';
import AllPlayers from './pages/AllPlayers';
import Match from './pages/Match';
import MatchDetails from './pages/MatchDetails';
import PointTable from './pages/PointTable';
import WeekTeam from './pages/WeekTeam';
import PredictGame from './pages/PredictGame';
import RewardHistory from './pages/RewardHistory';
import ScratchReward from './pages/ScratchReward';
import MatchBooking from './pages/MatchBooking';
import BookingHistory from './pages/BookingHistory';
import ChatAssistant from './pages/ChatAssistant';
import PrivacyPolicy from './pages/PrivacyPolicy';

// Admin Pages
import AdminDashboard from './admin/AdminDashboard';
import AdminManageTeams from './admin/AdminManageTeams';
import AdminMatchControl from './admin/AdminMatchControl';
import AdminMatchList from './admin/AdminMatchList';
import AdminPlayerManagement from './admin/AdminPlayerManagement';
import AdminMatchSchedule from './admin/AdminMatchSchedule';
import AdminVoucherManagement from './admin/AdminVoucherManagement';
import AdminBookingManagement from './admin/AdminBookingManagement';
import SplashScreen from './SplashScreen';

/* ── Navbar Controller ─────────────────────────── */
const NavigationWrapper = () => {
  const location = useLocation();
  const hideNavbarPaths = ['/login', '/register', '/verify-otp', '/forgot-password'];
  
  const shouldHide = 
    hideNavbarPaths.includes(location.pathname) || 
    location.pathname.startsWith('/admin');

  return shouldHide ? null : <Navbar />;
};

/* ── Main App Component ────────────────────────── */
function App() {
  const [showSplash, setShowSplash] = useState(false);

  useEffect(() => {
    // Check if splash was already shown in this tab session
    const splashStatus = sessionStorage.getItem('proleague_splash_shown');
    if (!splashStatus) {
      setShowSplash(true);
    }
  }, []);

  const handleSplashFinished = () => {
    // Save to session so it doesn't show on refresh
    sessionStorage.setItem('proleague_splash_shown', 'true');
    setShowSplash(false);
  };

  // 1. Show Splash Screen only on first visit to the tab
  if (showSplash) {
    return <SplashScreen onFinished={handleSplashFinished} />;
  }

  return (
    <Router>
      <ToastContainer 
        position="top-right"
        autoClose={3000}
        theme="dark"
      />
      
      <NavigationWrapper />

      <div className="App animated-fade-in">
        <Routes>
          {/* Public / Auth Routes */}
          <Route path="/register" element={<PublicRoute><Register/></PublicRoute>} />
          <Route path="/verify-otp" element={<VerifyOTP/>} />
          <Route path="/login" element={<PublicRoute><Login/></PublicRoute>} />
          <Route path='/forgot-password' element={<ForgotPassword/>}/>

          {/* User Routes */}
          <Route path="/" element={<Home/>} />
          <Route path='/profile' element={<Profile/>}/>
          <Route path='/teams' element={<Team/>}/>
          <Route path="/teams/:id" element={<TeamDetails />} />
          <Route path="/players/:id" element={<PlayerDetail/>} />
          <Route path="/playersall" element={<AllPlayers />} />
          <Route path="/matches" element={<Match/>} />
          <Route path="/matches/:id" element={<MatchDetails/>} />
          <Route path="/point-table" element={<PointTable/>} />
          <Route path="/team-of-the-week" element={<WeekTeam/>} />
          <Route path="/predictions/:matchId" element={<PredictGame />} />
          <Route path='/reward-history' element={<RewardHistory/>}/>
          <Route path='/reward-scratch' element={<ScratchReward/>}/>
          <Route path="/book-ticket/:matchId" element={<MatchBooking />} />
          <Route path='/booking-history' element={<BookingHistory/>}/>
          <Route path='ask-ai/' element={<ChatAssistant/>}/>
          <Route path='privacy-policy/' element={<PrivacyPolicy/>}/>

          {/* Admin Routes */}
          <Route path="/admin-dashboard" element={<AdminDashboard/>} />
          <Route path="/admin-booking-management" element={<AdminBookingManagement />} />
          <Route path="/admin-teams-management" element={<AdminManageTeams/>} />
          <Route path="/admin-matches-management" element={<AdminMatchList/>} />
          <Route path="/admin/match/:id" element={<AdminMatchControl />} />
          <Route path="/admin-players-management" element={<AdminPlayerManagement />} />
          <Route path="/admin-match-shedule" element={<AdminMatchSchedule />} />
          <Route path="/admin-voucher-management" element={<AdminVoucherManagement />} />

          {/* 404 Page */}
          <Route path="*" element={
            <div style={{textAlign: 'center', padding: '100px', color: '#1B5E20'}}>
              <h2>404: Page Not Found ⚽</h2>
              <p>The ball is out of the pitch!</p>
            </div>
          } />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
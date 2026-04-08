import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate ,useLocation} from 'react-router-dom';
import Register from './auth/Register';
import AdminDashboard from './admin/AdminDashboard';
import Home from './pages/Home';
import Login from './auth/Login';
import VerifyOTP from './auth/verifyOTP';
import Navbar from './Navbar user/Navbar';
import Profile from './pages/Profile';
import ForgotPassword from './auth/ForgotPassword';
import Team from './pages/Team';
import TeamDetails from './pages/TeamDetails';
import PlayerDetail from './pages/PlayerDetail';
import AllPlayers from './pages/AllPlayers';
import Match from './pages/Match';
import MatchDetails from './pages/MatchDetails';
import PointTable from './pages/PointTable';
import PublicRoute from './PublicRoute';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import AdminManageTeams from './admin/AdminManageTeams';
import AdminMatchControl from './admin/AdminMatchControl';
import AdminMatchList from './admin/AdminMatchList';
import AdminPlayerManagement from './admin/AdminPlayerManagement';
import AdminMatchSchedule from './admin/AdminMatchSchedule';
import WeekTeam from './pages/WeekTeam';
// Assume you'll create these next:
// import Login from './Login';
// import Dashboard from './Dashboard';
const NavigationWrapper = () => {
  const location = useLocation();
  
  const hideNavbarPaths = ['/login', '/register', '/verify-otp', '/forgot-password'];
  
  const shouldHide = 
    hideNavbarPaths.includes(location.pathname) || 
    location.pathname.startsWith('/admin'); // This hides for ALL admin pages

  return shouldHide ? null : <Navbar />;
};

function App() {
  return (
    <Router>
      <ToastContainer 
        position="top-right"
        autoClose={3000}
        theme="dark" // Matches your ProLeague dark theme
      />
      <NavigationWrapper/>
      <div className="App">
        {/* You can add a Navbar here that stays visible on all pages */}

        <Routes>
          {/* Default page is Register */}
          
          
          <Route path="/register" element={
            <PublicRoute>
            <Register/>
            </PublicRoute>} />

          <Route path="/verify-otp" element={<VerifyOTP/>} />

          <Route path="/login" element={<PublicRoute><Login/></PublicRoute>} />

          <Route path="/admin-dashboard" element={<AdminDashboard/>} />
          <Route path="/" element={<Home/>} />
          <Route path='/forgot-password' element={<ForgotPassword/>}/>
          <Route path='/profile' element={<Profile/>}/>
          <Route path='/teams' element={<Team/>}/>
          <Route path="/teams/:id" element={<TeamDetails />} />
          <Route path="/players/:id" element={<PlayerDetail/>} />
          <Route path="/playersall" element={<AllPlayers />} />
          <Route path="/matches" element={<Match/>} />
          <Route path="/matches/:id" element={<MatchDetails/>} />
          <Route path="/point-table" element={<PointTable/>} />
          <Route path="/team-of-the-week" element={<WeekTeam/>} />



          <Route path="/admin-teams-management" element={<AdminManageTeams/>} />
          <Route path="/admin-matches-management" element={<AdminMatchList/>} />
          <Route path="/admin/match/:id" element={<AdminMatchControl />} />
          <Route path="/admin-players-management" element={<AdminPlayerManagement />} />
          <Route path="/admin-match-shedule" element={<AdminMatchSchedule />} />







          
          <Route path="*" element={<h2>404: Page Not Found</h2>} />
          
        </Routes>
      </div>
    </Router>
  );
}

export default App;
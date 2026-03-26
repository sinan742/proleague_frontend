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
// Assume you'll create these next:
// import Login from './Login';
// import Dashboard from './Dashboard';
const NavigationWrapper = () => {
  const location = useLocation();
  
  // List of paths where you DON'T want the Navbar to appear
  const hideNavbarPaths = ['/login', '/register', '/verify-otp'];

  // Only show Navbar if the current path is NOT in the list
  if (hideNavbarPaths.includes(location.pathname)) {
    return null;
  }

  return <Navbar />;
};

function App() {
  return (
    <Router>
      <NavigationWrapper/>
      <div className="App">
        {/* You can add a Navbar here that stays visible on all pages */}

        <Routes>
          {/* Default page is Register */}
          <Route path="/" element={<Navigate to="/register" />} />
          
          <Route path="/register" element={<Register/>} />
          <Route path="/verify-otp" element={<VerifyOTP/>} />
          <Route path="/login" element={<Login/>} />
          <Route path="/admin-dashboard" element={<AdminDashboard/>} />
          <Route path="/home" element={<Home/>} />
          <Route path='/forgot-password' element={<ForgotPassword/>}/>
          <Route path='/profile' element={<Profile/>}/>
          <Route path='/teams' element={<Team/>}/>
          <Route path="/teams/:id" element={<TeamDetails />} />
          <Route path="/players/:id" element={<PlayerDetail/>} />
          <Route path="/playersall" element={<AllPlayers />} />
          <Route path="/matches" element={<Match/>} />
          <Route path="/matches/:id" element={<MatchDetails/>} />
          <Route path="/point-table" element={<PointTable/>} />


          
          <Route path="*" element={<h2>404: Page Not Found</h2>} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
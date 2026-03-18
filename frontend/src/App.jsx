import React, { useState, useEffect } from 'react';
import {
  BrowserRouter as Router, Routes, Route,
  Navigate, Outlet, useLocation
} from 'react-router-dom';
import { Menu } from 'lucide-react';
import Sidebar from './components/Sidebar';

// Pages
import Home from './pages/Home';
import SignIn from './pages/SignIn';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import UploadCrop from './pages/UploadCrop';
import MyCrops from './pages/MyCrops';
import TransportDashboard from './pages/TransportDashboard';
import LabDashboard from './pages/LabDashboard';
import ManufactureDashboard from './pages/ManufactureDashboard';
import GovernmentDashboard from './pages/GovernmentDashboard';
import GovernmentMap from './pages/GovernmentMap';
import GovernmentUsers from './pages/GovernmentUsers';
import ConsumerPage from './pages/ConsumerPage';

/* ── Layout for authenticated pages ── */
const AppLayout = ({ user, onSignOut }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  if (!user) return <Navigate to="/signin" replace />;

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar
        user={user}
        onSignOut={onSignOut}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
      <main className="md:ml-64 transition-all duration-300">
        {/* Mobile header */}
        <header className="flex items-center justify-between bg-white shadow-sm h-14 px-4 md:hidden sticky top-0 z-10">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-lg hover:bg-gray-100"
          >
            <Menu size={22} />
          </button>
          <span className="font-bold text-[#133215]">Sanjeevani</span>
          <div className="w-8 h-8 rounded-full bg-[#92B775] flex items-center justify-center text-white text-sm font-bold">
            {user?.name?.[0]?.toUpperCase()}
          </div>
        </header>
        <div className="p-4 lg:p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

/* ── Role guard ── */
const RoleRoute = ({ user, allowedRoles, children }) => {
  if (!user) return <Navigate to="/signin" replace />;
  if (!allowedRoles.includes(user.role)) return <Navigate to="/dashboard" replace />;
  return children;
};

/* ── Main App ── */
function App() {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('user')); } catch { return null; }
  });

  const handleSignIn = (userData, token) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('token', token);
  };

  const handleSignOut = () => {
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  };

  /* Redirect after login based on role */
  const getDefaultRoute = (u) => {
    if (!u) return '/signin';
    const map = {
      farmer: '/dashboard',
      transporter: '/dashboard',
      lab: '/dashboard',
      manufacturer: '/dashboard',
      government: '/dashboard',
    };
    return map[u.role] || '/dashboard';
  };

  return (
    <Router>
      <Routes>
        {/* Public */}
        <Route path="/" element={user ? <Navigate to={getDefaultRoute(user)} /> : <Home />} />
        <Route path="/signin" element={user ? <Navigate to={getDefaultRoute(user)} /> : <SignIn onSignIn={handleSignIn} />} />
        <Route path="/signup" element={user ? <Navigate to={getDefaultRoute(user)} /> : <Signup onSignIn={handleSignIn} />} />
        <Route path="/consumer/:id" element={<ConsumerPage />} />

        {/* Protected layout */}
        <Route element={<AppLayout user={user} onSignOut={handleSignOut} />}>
          <Route path="/dashboard" element={
            user?.role === 'government'
              ? <GovernmentDashboard />
              : <Dashboard user={user} />
          } />

          {/* Farmer */}
          <Route path="/upload-crop" element={
            <RoleRoute user={user} allowedRoles={['farmer']}>
              <UploadCrop user={user} />
            </RoleRoute>
          } />
          <Route path="/my-crops" element={
            <RoleRoute user={user} allowedRoles={['farmer']}>
              <MyCrops user={user} />
            </RoleRoute>
          } />

          {/* Transporter */}
          <Route path="/transport" element={
            <RoleRoute user={user} allowedRoles={['transporter']}>
              <TransportDashboard user={user} />
            </RoleRoute>
          } />

          {/* Lab */}
          <Route path="/lab" element={
            <RoleRoute user={user} allowedRoles={['lab']}>
              <LabDashboard user={user} />
            </RoleRoute>
          } />

          {/* Manufacturer */}
          <Route path="/manufacture" element={
            <RoleRoute user={user} allowedRoles={['manufacturer']}>
              <ManufactureDashboard user={user} />
            </RoleRoute>
          } />

          {/* Government */}
          <Route path="/gov-map" element={
            <RoleRoute user={user} allowedRoles={['government']}>
              <GovernmentMap />
            </RoleRoute>
          } />
          <Route path="/gov-users" element={
            <RoleRoute user={user} allowedRoles={['government']}>
              <GovernmentUsers />
            </RoleRoute>
          } />
        </Route>

        <Route path="*" element={<Navigate to={user ? getDefaultRoute(user) : '/'} replace />} />
      </Routes>
    </Router>
  );
}

export default App;

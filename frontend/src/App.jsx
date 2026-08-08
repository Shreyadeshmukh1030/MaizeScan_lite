import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import {
  Scan, BarChart3, FileText, BookOpen,
  Settings, LogOut, LayoutDashboard, User, Menu, X, DollarSign
} from 'lucide-react';
import DetectionPage from './pages/DetectionPage';
import ReportsPage from './pages/ReportsPage';
import DashboardPage from './pages/DashboardPage';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProfilePage from './pages/ProfilePage';
import RevenuePage from './pages/RevenuePage';
import FarmerGuidePage from './pages/FarmerGuidePage';
import CertificatePage from './pages/CertificatePage';
import axios from 'axios';
import { Navigate } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL || 'https://maizescan-vmi3.onrender.com';

const App = () => {
  return (
    <Router>
      <AppContent />
    </Router>
  );
};

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

const AppContent = () => {
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [user, setUser] = useState(null);

  // Hide navigation for auth pages
  const isAuthPage = ['/login', '/register'].includes(location.pathname);
  const isLanding = location.pathname === '/';

  useEffect(() => {
    // Auto-close sidebar on mobile
    if (window.innerWidth < 1024) setIsSidebarOpen(false);

    // Fetch user data if not on auth/landing page and we have a token
    if (!isAuthPage && !isLanding) {
      const token = localStorage.getItem('token');
      if (token) {
        axios.get(`${API_URL}/users/me`, {
          headers: { Authorization: `Bearer ${token}` }
        }).then(res => setUser(res.data))
          .catch(() => {
            localStorage.removeItem('token');
            setUser(null);
          });
      }
    }
  }, [location.pathname]);

  if (isAuthPage) {
    return (
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Routes>
    );
  }

  return (
    <div className="main-layout" style={{ display: 'flex', minHeight: '100vh', background: 'var(--background)' }}>
      {!isLanding && (
        <Sidebar isOpen={isSidebarOpen} toggle={() => setIsSidebarOpen(!isSidebarOpen)} />
      )}

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', position: 'relative' }}>
        {isLanding ? (
          <PublicHeader />
        ) : (
          <InternalHeader user={user} isOpen={isSidebarOpen} toggle={() => setIsSidebarOpen(!isSidebarOpen)} />
        )}

        <main style={{ flex: 1 }}>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/detect" element={<ProtectedRoute><DetectionPage user={user} /></ProtectedRoute>} />
            <Route path="/reports" element={<ProtectedRoute><ReportsPage user={user} /></ProtectedRoute>} />
            <Route path="/analytics" element={<ProtectedRoute><DashboardPage user={user} /></ProtectedRoute>} />
            <Route path="/revenue" element={<ProtectedRoute><RevenuePage /></ProtectedRoute>} />
            <Route path="/guide" element={<FarmerGuidePage />} />
            <Route path="/profile" element={<ProtectedRoute><ProfilePage user={user} /></ProtectedRoute>} />
            <Route path="/certificate/:id" element={<ProtectedRoute><CertificatePage user={user} /></ProtectedRoute>} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

const PublicHeader = () => (
  <nav className="glass-panel" style={{
    position: 'fixed', top: '1.5rem', left: '50%', transform: 'translateX(-50%)', zIndex: 100,
    padding: '0.6rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    width: '90%', maxWidth: '1200px', borderRadius: '1rem', border: '1px solid rgba(0,0,0,0.05)',
    background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(20px)',
    boxShadow: '0 4px 20px rgba(0,0,0,0.03)'
  }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
      <img src="/images/logo.png" alt="MaizeScan Logo" style={{ height: '36px', width: 'auto' }} />
      <span style={{ fontSize: '1.25rem', fontWeight: 950, color: 'var(--primary-dark)', letterSpacing: '-0.02em' }}>Maize<span style={{ color: 'var(--primary)' }}>Scan</span></span>
    </div>
    <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
      <Link to="/" className="nav-link">Home</Link>
      <Link to="/guide" className="nav-link">Master Guide</Link>
      <div style={{ width: '1px', height: '16px', background: 'rgba(0,0,0,0.1)', margin: '0 0.5rem' }} />
      <Link to="/login" className="nav-link" style={{ opacity: 1, color: 'var(--primary)' }}>Login</Link>
      <Link to="/register" className="btn btn-primary" style={{ padding: '0.6rem 1.25rem', borderRadius: '0.5rem', fontSize: '0.85rem' }}>Join Platform</Link>
    </div>
  </nav>
);

const InternalHeader = ({ user, isOpen, toggle }) => (
  <header style={{
    padding: '1.25rem 2.5rem', background: 'white', borderBottom: '1px solid #f1f5f9',
    display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 50
  }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
      <button onClick={toggle} className="btn-icon" style={{ padding: '0.5rem' }}>
        {isOpen ? <X size={20} /> : <Menu size={20} />}
      </button>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <img src="/images/logo.png" alt="Logo" style={{ height: '35px', width: '35px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--primary-dark)' }} />
        <h2 style={{ fontSize: '1.1rem', fontWeight: 900, letterSpacing: '-0.5px' }}>
          MAIZESCAN <span style={{ color: 'var(--text-light)', fontWeight: 500, marginLeft: '0.5rem' }}>// AGRI-CORE DASHBOARD</span>
        </h2>
      </div>
    </div>
    <Link to="/profile" style={{ textDecoration: 'none', display: 'flex', gap: '1.25rem', alignItems: 'center', color: 'inherit' }}>
      <div style={{ textAlign: 'right' }}>
        <div style={{ fontWeight: 900, fontSize: '0.95rem', color: 'var(--primary-dark)' }}>{user?.full_name || 'Agri Operator'}</div>
        <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-light)', textTransform: 'uppercase' }}>Analyst ID: MS-{user?.id || '0000'}</div>
      </div>
      <div style={{
        width: '45px', height: '45px', borderRadius: '1rem',
        background: 'var(--gradient-lush)', display: 'flex',
        alignItems: 'center', justifyContent: 'center', color: 'white',
        fontWeight: 900, boxShadow: '0 4px 10px rgba(0,0,0,0.05)', overflow: 'hidden'
      }}>
        {user?.full_name?.charAt(0) || 'U'}
      </div>
    </Link>
  </header>
);

const Sidebar = ({ isOpen, toggle }) => {
  const logout = () => {
    localStorage.removeItem('token');
    window.location.href = '/login';
  };

  return (
    <div style={{
      width: isOpen ? '300px' : '0',
      transition: 'width 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
      background: '#051F20',
      overflow: 'hidden',
      color: 'white',
      display: 'flex',
      flexDirection: 'column',
      zIndex: 60,
      boxShadow: '10px 0 40px rgba(0,0,0,0.1)'
    }}>
      <div style={{ padding: '2.5rem', display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2.5rem' }}>
        <img src="/images/logo.png" alt="Logo" style={{ height: '60px', width: '60px', borderRadius: '50%', border: '3px solid rgba(255,255,255,0.2)', objectFit: 'cover' }} />
        <span style={{ fontSize: '1.75rem', fontWeight: 950, color: 'white', letterSpacing: '-1.5px' }}>MaizeScan</span>
      </div>

      <div style={{ flex: 1, padding: '0 1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        <SidebarLink to="/analytics" icon={<LayoutDashboard size={22} />} label="Analytics Feed" />
        <SidebarLink to="/detect" icon={<Scan size={22} />} label="Live Inspection" />
        <SidebarLink to="/reports" icon={<FileText size={22} />} label="Audit Trail" />
        <SidebarLink to="/revenue" icon={<DollarSign size={22} />} label="Revenue Model" />
        <SidebarLink to="/guide" icon={<BookOpen size={22} />} label="Farmer Education" />
        <SidebarLink to="/profile" icon={<User size={22} />} label="Account Identity" />

        <div style={{ height: '1px', background: 'rgba(255,255,255,0.1)', margin: '1.5rem 0' }} />

        <button onClick={logout} style={{
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
          padding: '0',
          width: '100%',
          textAlign: 'left'
        }}>
          <SidebarLink to="/login" icon={<LogOut size={22} />} label="Power Off" />
        </button>
      </div>

      <div className="glass-panel" style={{ padding: '1.5rem', margin: '1.5rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
        <div style={{ fontSize: '0.7rem', fontWeight: 900, opacity: 0.5, marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px' }}>AI Engine Status</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div className="recording-status" style={{ background: '#22c55e', width: '10px', height: '10px' }} />
          <span style={{ fontSize: '0.9rem', fontWeight: 800 }}>YOLOv8 Core Online</span>
        </div>
      </div>
    </div>
  );
};

const SidebarLink = ({ to, icon, label }) => {
  const location = useLocation();
  const isActive = location.pathname === to;

  return (
    <Link to={to} style={{
      textDecoration: 'none',
      color: isActive ? 'white' : 'rgba(255,255,255,0.5)',
      display: 'flex',
      alignItems: 'center',
      gap: '1.25rem',
      padding: '1.1rem 1.25rem',
      borderRadius: '1.25rem',
      background: isActive ? 'rgba(255,255,255,0.12)' : 'transparent',
      fontWeight: isActive ? 900 : 700,
      fontSize: '1rem',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      border: isActive ? '1px solid rgba(255,255,255,0.1)' : '1px solid transparent'
    }}>
      {icon}
      <span>{label}</span>
    </Link>
  );
};

export default App;

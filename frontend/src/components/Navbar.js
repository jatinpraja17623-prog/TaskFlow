import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => { logout(); navigate('/login'); };

  const isActive = (path) => location.pathname === path || location.pathname.startsWith(path + '/');

  return (
    <nav style={{
      background: 'rgba(6,6,8,0.8)', backdropFilter: 'blur(20px)',
      borderBottom: '1px solid var(--border)',
      padding: '0 32px', height: '64px',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      position: 'sticky', top: 0, zIndex: 100
    }}>
      {/* Left: Logo + Links */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
        <Link to="/dashboard" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '32px', height: '32px', borderRadius: '9px',
            background: 'linear-gradient(135deg, var(--accent), var(--accent2))',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px'
          }}>⚡</div>
          <span style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: '17px', color: 'var(--text)', letterSpacing: '-0.02em' }}>TaskFlow</span>
        </Link>

        <div style={{ display: 'flex', gap: '4px' }}>
          {[
            { path: '/dashboard', label: '⊞ Dashboard' },
            { path: '/projects', label: '📁 Projects' },
          ].map(({ path, label }) => (
            <Link key={path} to={path} style={{
              color: isActive(path) ? 'var(--text)' : 'var(--text3)',
              textDecoration: 'none', fontSize: '13px', fontWeight: 500,
              padding: '6px 14px', borderRadius: '8px',
              background: isActive(path) ? 'var(--surface2)' : 'transparent',
              border: `1px solid ${isActive(path) ? 'var(--border2)' : 'transparent'}`,
              transition: 'all 0.2s'
            }}>{label}</Link>
          ))}
        </div>
      </div>

      {/* Right: User info */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <span className={`badge badge-${user?.role}`}>
          {user?.role === 'admin' ? '👑' : '👤'} {user?.role}
        </span>
        <div style={{
          padding: '6px 14px', borderRadius: '8px',
          background: 'var(--surface2)', border: '1px solid var(--border)',
          fontSize: '13px', color: 'var(--text2)'
        }}>{user?.name}</div>
        <button className="btn btn-ghost" onClick={handleLogout} style={{ padding: '7px 14px', fontSize: '13px' }}>
          Sign out
        </button>
      </div>
    </nav>
  );
}

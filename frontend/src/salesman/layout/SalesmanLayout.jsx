import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import GlobalSearch from '../components/GlobalSearch';
import ThemeToggle from '../components/ThemeToggle';
import ToastNotification from '../components/ToastNotification';
import OfflineIndicator from '../components/OfflineIndicator';
import '../styles/salesman.css';

/**
 * SalesmanLayout - Enhanced Clean Professional Layout
 * Sidebar + Topbar + Content Area + Advanced Features
 * Mobile-responsive with hamburger menu
 * NO attendance blocking
 */
export default function SalesmanLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const menuItems = [
    { path: '/salesman/dashboard', icon: '🏠', label: 'Dashboard' },
    { path: '/salesman/attendance', icon: '🕘', label: 'Attendance' },
    { path: '/salesman/enquiries', icon: '📋', label: 'Enquiries & Leads' },
    { path: '/salesman/calls', icon: '📞', label: 'Calls' },
    { path: '/salesman/followups', icon: '🔁', label: 'Follow-Ups' },
    { path: '/salesman/orders', icon: '🧾', label: 'Orders' },
    { path: '/salesman/daily-report', icon: '📝', label: 'Daily Report' },
    { path: '/salesman/compliance', icon: '⚖️', label: 'Discipline & Compliance' },
  ];

  return (
    <div className="salesman-layout">
      {/* Toast Notifications */}
      <ToastNotification />

      {/* Offline Indicator */}
      <OfflineIndicator />

      {/* Mobile Overlay */}
      {mobileMenuOpen && (
        <div 
          className="sidebar-overlay show"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`salesman-sidebar ${sidebarCollapsed ? 'collapsed' : ''} ${mobileMenuOpen ? 'mobile-open' : ''}`}>
        {/* Sidebar Header */}
        <div className="sidebar-header">
          {!sidebarCollapsed && (
            <div className="sidebar-logo">
              👔 Salesman
            </div>
          )}
          {sidebarCollapsed && (
            <div className="sidebar-logo">
              👔
            </div>
          )}
          <button
            className="sidebar-toggle"
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            title={sidebarCollapsed ? 'Expand' : 'Collapse'}
          >
            {sidebarCollapsed ? '▶' : '◀'}
          </button>
        </div>

        {/* Navigation Menu */}
        <nav className="sidebar-nav">
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `sidebar-item ${isActive ? 'active' : ''}`
              }
              onClick={() => setMobileMenuOpen(false)}
            >
              <span className="sidebar-icon">{item.icon}</span>
              <span className="sidebar-label">{item.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Sidebar Footer - Logout */}
        <div className="sidebar-footer">
          <button
            className="sidebar-item"
            onClick={handleLogout}
            style={{ color: '#DC2626' }}
          >
            <span className="sidebar-icon">🚪</span>
            <span className="sidebar-label">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="salesman-main">
        {/* Top Bar with Advanced Features */}
        <div className="salesman-topbar">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button
              className="mobile-menu-btn"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              ☰
            </button>
            <h1 className="topbar-title">Salesman Portal</h1>
          </div>
          <div className="topbar-actions">
            <GlobalSearch />
            <ThemeToggle />
            <div className="user-badge">
              {user?.full_name || user?.username}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="salesman-content">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

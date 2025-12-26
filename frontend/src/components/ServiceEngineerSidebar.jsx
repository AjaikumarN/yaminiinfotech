import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';

const ServiceEngineerSidebar = ({ isOpen = true, onClose }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const handleNavClick = () => {
    // Close sidebar on mobile after navigation
    if (window.innerWidth <= 768 && onClose) {
      onClose();
    }
  };

  const sidebarStyle = {
    position: 'fixed',
    left: isOpen ? 0 : '-260px',
    top: '70px',
    width: '260px',
    height: 'calc(100vh - 70px)',
    background: 'white',
    boxShadow: '2px 0 8px rgba(0,0,0,0.1)',
    display: 'flex',
    flexDirection: 'column',
    zIndex: 100,
    transition: 'left 0.3s ease'
  };

  const headerStyle = {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    padding: '24px',
    textAlign: 'center',
    borderBottom: '3px solid #5a67d8'
  };

  const navStyle = {
    flex: 1,
    overflowY: 'auto',
    padding: '16px 0'
  };

  const navItemStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '14px 20px',
    color: '#4b5563',
    textDecoration: 'none',
    transition: 'all 0.3s',
    borderLeft: '4px solid transparent',
    cursor: 'pointer'
  };

  const navItemActiveStyle = {
    ...navItemStyle,
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    borderLeft: '4px solid #5a67d8',
    fontWeight: '600'
  };

  const iconStyle = {
    fontSize: '20px'
  };

  const footerStyle = {
    padding: '16px',
    borderTop: '1px solid #e5e7eb'
  };

  const logoutBtnStyle = {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '14px 20px',
    background: '#fee2e2',
    color: '#dc2626',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: '600',
    transition: 'all 0.3s'
  };

  return (
    <div style={sidebarStyle}>
      <div style={headerStyle}>
        <div style={{ fontSize: '48px', marginBottom: '8px' }}>🔧</div>
        <h3 style={{ margin: 0, color: 'white', fontSize: '18px', fontWeight: '700' }}>
          Service Engineer
        </h3>
      </div>

      <nav style={navStyle}>
        <NavLink
          to="/service-engineer/dashboard"
          style={({ isActive }) => isActive ? navItemActiveStyle : navItemStyle}
          onClick={handleNavClick}
        >
          <span style={iconStyle}>🏠</span>
          <span>Dashboard</span>
        </NavLink>

        <NavLink
          to="/service-engineer/attendance"
          style={({ isActive }) => isActive ? navItemActiveStyle : navItemStyle}
          onClick={handleNavClick}
        >
          <span style={iconStyle}>🕘</span>
          <span>Daily Start</span>
        </NavLink>

        <NavLink
          to="/service-engineer/jobs"
          style={({ isActive }) => isActive ? navItemActiveStyle : navItemStyle}
          onClick={handleNavClick}
        >
          <span style={iconStyle}>🛠</span>
          <span>Assigned Jobs</span>
        </NavLink>

        <NavLink
          to="/service-engineer/history"
          style={({ isActive }) => isActive ? navItemActiveStyle : navItemStyle}
          onClick={handleNavClick}
        >
          <span style={iconStyle}>🔁</span>
          <span>Service History</span>
        </NavLink>

        <NavLink
          to="/service-engineer/sla-tracker"
          style={({ isActive }) => isActive ? navItemActiveStyle : navItemStyle}
          onClick={handleNavClick}
        >
          <span style={iconStyle}>⏱</span>
          <span>SLA Tracker</span>
        </NavLink>

        <NavLink
          to="/service-engineer/feedback"
          style={({ isActive }) => isActive ? navItemActiveStyle : navItemStyle}
          onClick={handleNavClick}
        >
          <span style={iconStyle}>⭐</span>
          <span>Customer Feedback</span>
        </NavLink>

        <NavLink
          to="/service-engineer/daily-report"
          style={({ isActive }) => isActive ? navItemActiveStyle : navItemStyle}
          onClick={handleNavClick}
        >
          <span style={iconStyle}>📊</span>
          <span>Daily Update</span>
        </NavLink>
      </nav>

      <div style={footerStyle}>
        <button 
          onClick={handleLogout} 
          style={logoutBtnStyle}
          onMouseEnter={(e) => e.target.style.background = '#fecaca'}
          onMouseLeave={(e) => e.target.style.background = '#fee2e2'}
        >
          <span style={iconStyle}>🚪</span>
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
};

export default ServiceEngineerSidebar;

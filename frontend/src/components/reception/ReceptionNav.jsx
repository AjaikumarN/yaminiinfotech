import React, { useContext } from 'react';
import { NavLink } from 'react-router-dom';
import { AuthContext } from '../../contexts/AuthContext';

const ReceptionNav = ({ isOpen, onClose }) => {
  const { user } = useContext(AuthContext);

  const menuItems = [
    { path: '/reception/dashboard', icon: '📊', label: 'Dashboard', subtitle: 'Summary View' },
    { path: '/reception/enquiries', icon: '📋', label: 'Enquiry Board', subtitle: 'Full Data' },
    { path: '/reception/calls', icon: '📞', label: 'Calls & Target', subtitle: 'History' },
    { path: '/reception/service-complaints', icon: '🔧', label: 'Service Complaints', subtitle: 'Full Data' },
    { path: '/reception/repeat-complaints', icon: '⚠️', label: 'Repeat Complaints', subtitle: 'Alert View' },
    { path: '/reception/delivery-log', icon: '📦', label: 'Delivery Log', subtitle: 'IN / OUT' },
    { path: '/reception/outstanding', icon: '₹', label: 'Outstanding', subtitle: 'Read-only' },
    { path: '/reception/missing-reports', icon: '⚠️', label: 'Missing Reports', subtitle: 'Employee Discipline' },
    { path: '/reception/visitors', icon: '🚶', label: 'Visitor Log', subtitle: 'Entry Register' }
  ];

  return (
    <>
      {isOpen && <div className="sidebar-overlay" onClick={onClose}></div>}
      <div className={`reception-nav ${isOpen ? 'open' : ''}`}>
      <div className="nav-header">
        <h2>📞 Reception Menu</h2>
        <p className="user-name">{user?.full_name || user?.username}</p>
      </div>
      
      <nav className="nav-menu">
        {menuItems.map(item => (
          <NavLink 
            key={item.path}
            to={item.path}
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            onClick={onClose}
          >
            <span className="nav-icon">{item.icon}</span>
            <div className="nav-text">
              <div className="nav-label">{item.label}</div>
              <div className="nav-subtitle">{item.subtitle}</div>
            </div>
          </NavLink>
        ))}
      </nav>

      <style>{`
        .sidebar-overlay {
          position: fixed;
          top: 70px;
          left: 0;
          width: 100%;
          height: calc(100vh - 70px);
          background: transparent;
          z-index: 999;
        }

        .reception-nav {
          width: 280px;
          background: #ffffff;
          color: #1e293b;
          min-height: calc(100vh - 70px);
          position: fixed;
          left: -280px;
          top: 70px;
          overflow-y: auto;
          z-index: 1000;
          transition: left 0.3s ease;
          border-right: 1px solid #e2e8f0;
          box-shadow: 2px 0 10px rgba(0, 0, 0, 0.1);
        }

        .reception-nav.open {
          left: 0;
        }

        .nav-header {
          padding: 25px 20px;
          border-bottom: 1px solid #e2e8f0;
          background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
        }

        .nav-header h2 {
          margin: 0 0 10px 0;
          font-size: 20px;
          font-weight: 700;
          color: #ffffff;
        }

        .user-name {
          margin: 0;
          font-size: 13px;
          color: rgba(255, 255, 255, 0.9);
        }

        .nav-menu {
          padding: 10px 0;
        }

        .nav-item {
          display: flex;
          align-items: center;
          gap: 15px;
          padding: 15px 20px;
          color: #475569;
          text-decoration: none;
          transition: all 0.3s;
          border-left: 4px solid transparent;
        }

        .nav-item:hover {
          background: #f1f5f9;
          color: #1e293b;
          border-left-color: #3b82f6;
        }

        .nav-item.active {
          background: #eff6ff;
          color: #1e40af;
          border-left-color: #3b82f6;
          font-weight: 600;
        }

        .nav-icon {
          font-size: 24px;
          width: 30px;
          text-align: center;
        }

        .nav-text {
          flex: 1;
        }

        .nav-label {
          font-size: 14px;
          font-weight: 500;
          color: #1e293b;
        }

        .nav-item.active .nav-label {
          color: #1e40af;
        }

        .nav-subtitle {
          font-size: 11px;
          color: #64748b;
          margin-top: 2px;
        }

        .nav-item.active .nav-subtitle {
          color: #3b82f6;
        }
      `}</style>
      </div>
    </>
  );
};

export default ReceptionNav;

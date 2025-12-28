import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';

/**
 * Modern YouTube-Style Sidebar Component
 * Reusable for Salesman, Reception, and Service Engineer
 */
const ModernSidebar = ({ isOpen, onClose, config }) => {
  const navigate = useNavigate();
  const [hoveredIndex, setHoveredIndex] = useState(null);

  const handleLogout = () => {
    if (confirm('Are you sure you want to logout?')) {
      localStorage.removeItem('token');
      navigate('/login');
    }
  };

  const handleNavClick = () => {
    if (window.innerWidth <= 768 && onClose) {
      onClose();
    }
  };

  return (
    <>
      <style>{`
        .ms-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0, 0, 0, 0.3);
          opacity: ${isOpen ? '1' : '0'};
          visibility: ${isOpen ? 'visible' : 'hidden'};
          transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
          z-index: 999;
        }

        .modern-sidebar {
          position: fixed;
          left: ${isOpen ? '0' : '-300px'};
          top: 70px;
          width: 280px;
          height: calc(100vh - 70px);
          background: #ffffff;
          display: flex;
          flex-direction: column;
          z-index: 1000;
          transition: left 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: 4px 0 16px rgba(0,0,0,0.12);
          border-right: 1px solid #e0e0e0;
        }

        .ms-header {
          background: linear-gradient(135deg, ${config.gradientStart} 0%, ${config.gradientEnd} 100%);
          padding: 16px;
          position: relative;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-shrink: 0;
          min-height: 70px;
        }

        .ms-header-content {
          display: flex;
          align-items: center;
          gap: 12px;
          flex: 1;
        }

        .ms-header::before {
          content: '';
          position: absolute;
          top: -50%;
          right: -50%;
          width: 200%;
          height: 200%;
          background: radial-gradient(circle, rgba(255,255,255,0.05) 0%, transparent 70%);
          animation: ms-pulse 4s ease-in-out infinite;
        }

        @keyframes ms-pulse {
          0%, 100% { transform: scale(1) rotate(0deg); }
          50% { transform: scale(1.1) rotate(180deg); }
        }

        .ms-header-icon {
          font-size: 36px;
          display: inline-block;
          animation: ms-float 3s ease-in-out infinite;
          position: relative;
          z-index: 1;
          filter: drop-shadow(0 2px 4px rgba(0,0,0,0.2));
        }

        @keyframes ms-float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-5px); }
        }

        .ms-header-text {
          display: flex;
          flex-direction: column;
          gap: 2px;
          position: relative;
          z-index: 1;
        }

        .ms-header-title {
          margin: 0;
          color: white;
          font-size: 16px;
          font-weight: 700;
          text-shadow: 0 1px 3px rgba(0,0,0,0.2);
          letter-spacing: 0.3px;
        }

        .ms-header-subtitle {
          margin: 0;
          color: rgba(255,255,255,0.9);
          font-size: 10px;
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 0.8px;
        }

        .ms-close-btn {
          background: rgba(255, 255, 255, 0.2);
          border: 1px solid rgba(255, 255, 255, 0.3);
          color: white;
          width: 32px;
          height: 32px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          font-size: 18px;
          transition: all 0.2s ease;
          position: relative;
          z-index: 1;
        }

        .ms-close-btn:hover {
          background: rgba(255, 255, 255, 0.3);
          transform: scale(1.05);
        }

        .ms-close-btn:active {
          transform: scale(0.95);
        }
          position: relative;
          z-index: 1;
          text-transform: uppercase;
          letter-spacing: 1px;
        }

        .ms-nav {
          flex: 1 1 auto;
          overflow-y: scroll;
          overflow-x: hidden;
          padding: 4px 0 16px;
          background: #ffffff;
          min-height: 0;
          height: 100%;
        }

        .ms-nav::-webkit-scrollbar {
          width: 6px;
        }

        .ms-nav::-webkit-scrollbar-track {
          background: transparent;
        }

        .ms-nav::-webkit-scrollbar-thumb {
          background: #d0d0d0;
          border-radius: 3px;
        }

        .ms-nav::-webkit-scrollbar-thumb:hover {
          background: #a0a0a0;
        }

        .ms-nav-item {
          display: flex;
          align-items: center;
          gap: 14px;0px 16px;
          margin: 111px 16px;
          margin: 2px 12px;
          color: #3c3c3c;
          text-decoration: none;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
          border-radius: 10px;
          cursor: pointer;
          position: relative;
          overflow: hidden;
          font-weight: 500;
        }

        .ms-nav-item::before {
          content: '';
          position: absolute;
          left: 0;
          top: 50%;
          transform: translateY(-50%);
          width: 3px;
          height: 0;
          background: ${config.accentColor};
          transition: height 0.2s ease;
          border-radius: 0 2px 2px 0;
        }

        .ms-nav-item:hover {
          background: linear-gradient(to right, rgba(${config.accentColor === '#667eea' ? '102, 126, 234' : config.accentColor === '#3b82f6' ? '59, 130, 246' : '16, 185, 129'}, 0.08), rgba(${config.accentColor === '#667eea' ? '102, 126, 234' : config.accentColor === '#3b82f6' ? '59, 130, 246' : '16, 185, 129'}, 0.04));
          color: #1a1a1a;
          transform: translateX(3px);
        }

        .ms-nav-item:hover::before {
          height: 65%;
        }

        .ms-nav-item.active {
          background: linear-gradient(to right, rgba(${config.accentColor === '#667eea' ? '102, 126, 234' : config.accentColor === '#3b82f6' ? '59, 130, 246' : '16, 185, 129'}, 0.12), rgba(${config.accentColor === '#667eea' ? '102, 126, 234' : config.accentColor === '#3b82f6' ? '59, 130, 246' : '16, 185, 129'}, 0.06));
          color: ${config.accentColor};
          font-weight: 700;
        }

        .ms-nav-item.active::before {
          height: 75%;
        }

        .ms-nav-item.active .ms-nav-icon {
          transform: scale(1.08);
        }

        .ms-nav-icon-wrapper {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 36px;
          height: 36px;
          background: linear-gradient(135deg, #F3F4F6 0%, #E5E7EB 100%);
          border-radius: 10px;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          flex-shrink: 0;
          box-shadow: 0 2px 4px rgba(0,0,0,0.05);
        }

        .ms-nav-icon {
          font-size: 20px;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .ms-nav-label {
          font-size: 14px;
          font-weight: 500;
          white-space: nowrap;
          flex: 1;
          letter-spacing: 0.2px;
        }

        .ms-section14px 16px 8px;
          color: #909090;
          font-size: 11px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 1px;
        }

        .ms-section-title:first-child {
          padding-top: 8:first-child {
          padding-top: 12px;
        }

        .ms-divider {
          height: 1px;
          background: linear-gradient(to right, transparent, #e5e5e5, transparent);
          margin: 12px 16px;
        }

        .ms-footer {
          padding: 12px;
          background: #f9f9f9;
          flex-shrink: 0;
          border-top: 1px solid #e5e5e5;
        }

        .ms-logout-btn {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          padding: 14px 16px;
          background: linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0%, rgba(220, 38, 38, 0.05) 100%);
          color: #DC2626;
          border: 1.5px solid rgba(239, 68, 68, 0.3);
          border-radius: 12px;
          cursor: pointer;
          font-weight: 700;
          font-size: 14px;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
          overflow: hidden;
        }

        .ms-logout-btn::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
          transition: left 0.5s;
        }
  animat  animation: ms-logout-pulse 2s ease-in-out infinite;
        }

        @keyframes ms-logout-pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.1); }
        ion: ms-logout-pulse 2s ease-in-out infinite;
        }

        @keyframes ms-logout-pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.1); }
        
        .ms-logout-btn:hover::before {
          left: 100%;
        }

        .ms-logout-btn:hover {
          background: linear-gradient(135deg, rgba(239, 68, 68, 0.2) 0%, rgba(220, 38, 38, 0.15) 100%);
          border-color: rgba(239, 68, 68, 0.5);
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(239, 68, 68, 0.25);
        }

        .ms-logout-btn:active {
          transform: translateY(0);
          box-shadow: 0 2px 8px rgba(239, 68, 68, 0.2);
        }

        .ms-logout-icon {
          font-size: 18px;
        }

        @media (max-width: 768px) {
          .modern-sidebar {
            width: 260px;
          }
        }


      `}</style>

      {/* Overlay for mobile/tablet */}
      <div className="ms-overlay" onClick={onClose}></div>

      <div className="modern-sidebar">
        <div className="ms-header">
          <div className="ms-header-content">
            <div className="ms-header-icon">{config.icon}</div>
            <div className="ms-header-text">
              <h3 className="ms-header-title">{config.title}</h3>
              <p className="ms-header-subtitle">{config.subtitle}</p>
            </div>
          </div>
          <button className="ms-close-btn" onClick={onClose} title="Close menu">
            ✕
          </button>
        </div>

        <nav className="ms-nav">
          {config.sections?.map((section, sectionIndex) => (
            <div key={sectionIndex}>
              {section.title && (
                <div className="ms-section-title">{section.title}</div>
              )}
              {section.items.map((item, itemIndex) => (
                <NavLink
                  key={itemIndex}
                  to={item.path}
                  className={({ isActive }) => `ms-nav-item ${isActive ? 'active' : ''}`}
                  onClick={handleNavClick}
                  onMouseEnter={() => setHoveredIndex(`${sectionIndex}-${itemIndex}`)}
                  onMouseLeave={() => setHoveredIndex(null)}
                >
                  <div className="ms-nav-icon-wrapper">
                    <span className="ms-nav-icon">{item.icon}</span>
                  </div>
                  <span className="ms-nav-label">{item.label}</span>
                  {item.badge && (
                    <span style={{
                      background: item.badge.color || '#ef4444',
                      color: 'white',
                      fontSize: '10px',
                      fontWeight: '700',
                      padding: '2px 6px',
                      borderRadius: '10px',
                      marginLeft: 'auto'
                    }}>
                      {item.badge.text}
                    </span>
                  )}
                </NavLink>
              ))}
              {sectionIndex < config.sections.length - 1 && (
                <div className="ms-divider"></div>
              )}
            </div>
          ))}
        </nav>

        <div className="ms-footer">
          <button onClick={handleLogout} className="ms-logout-btn">
            <span className="ms-logout-icon">🚪</span>
            <span>Logout</span>
          </button>
        </div>
      </div>
    </>
  );
};

export default ModernSidebar;

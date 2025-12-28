import React, { useEffect, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';

const ReceptionNav = ({ isOpen, onClose }) => {
  const location = useLocation();
  const [openSections, setOpenSections] = useState({});

  const sections = [
    {
      title: 'Dashboard',
      items: [
        { icon: '📊', label: 'Dashboard', path: '/reception/dashboard' }
      ]
    },
    {
      title: 'Operations',
      items: [
        { icon: '📋', label: 'Enquiry Board', path: '/reception/enquiries' },
        { icon: '📞', label: 'Calls & Target', path: '/reception/calls' },
        { icon: '🔧', label: 'Service Complaints', path: '/reception/service-complaints' },
        { icon: '⚠️', label: 'Repeat Complaints', path: '/reception/repeat-complaints' }
      ]
    },
    {
      title: 'Logs & Records',
      items: [
        { icon: '📦', label: 'Delivery Log', path: '/reception/delivery-log' },
        { icon: '🚶', label: 'Visitor Log', path: '/reception/visitors' }
      ]
    },
    {
      title: 'Reports',
      items: [
        { icon: '₹', label: 'Outstanding', path: '/reception/outstanding' },
        { icon: '⚠️', label: 'Missing Reports', path: '/reception/missing-reports' }
      ]
    }
  ];

  const isPathActive = (path) =>
    location.pathname === path ||
    (path !== '/reception/dashboard' && location.pathname.startsWith(path));

  useEffect(() => {
    setOpenSections((prev) => {
      const next = { ...prev };
      sections.forEach((section) => {
        const active = section.items.some((item) => isPathActive(item.path));
        if (active) {
          next[section.title] = true;
        }
      });
      return next;
    });
  }, [location.pathname]);

  const sidebarStyles = {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '280px',
    height: '100vh',
    background: 'linear-gradient(180deg, #f8fafc 0%, #f5f7fb 100%)',
    borderRight: '1px solid #e5e7eb',
    zIndex: 100,
    overflow: 'auto',
    boxShadow: '0 20px 38px rgba(15,23,42,0.08)',
    transition: 'all 0.3s ease',
    transform: isOpen ? 'translateX(0)' : 'translateX(-100%)'
  };

  const headerStyles = {
    padding: '24px',
    borderBottom: '1px solid #e5e7eb',
    background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)'
  };

  const logoStyles = {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '8px'
  };

  const logoIconStyles = {
    width: '52px',
    height: '52px',
    borderRadius: '14px',
    background: 'rgba(255, 255, 255, 0.25)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '24px',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(255, 255, 255, 0.3)'
  };

  const logoTextStyles = {
    flex: 1
  };

  const logoTitleStyles = {
    fontSize: '18px',
    fontWeight: '700',
    color: 'white',
    margin: 0,
    marginBottom: '2px',
    letterSpacing: '-0.5px'
  };

  const logoSubtitleStyles = {
    fontSize: '11px',
    color: 'rgba(255, 255, 255, 0.8)',
    margin: 0,
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    fontWeight: '600'
  };

  const closeButtonStyles = {
    background: 'rgba(255, 255, 255, 0.2)',
    border: 'none',
    color: 'white',
    width: '32px',
    height: '32px',
    borderRadius: '8px',
    fontSize: '20px',
    cursor: 'pointer',
    transition: 'all 0.2s',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  };

  const navStyles = {
    padding: '16px'
  };

  const sectionHeaderStyles = {
    fontSize: '11px',
    fontWeight: '700',
    color: '#9ca3af',
    textTransform: 'uppercase',
    letterSpacing: '0.6px',
    padding: '12px 16px',
    marginBottom: '8px',
    marginTop: '16px'
  };

  const getLinkStyles = (isActive) => ({
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '10px 12px',
    marginBottom: '4px',
    borderRadius: '10px',
    fontSize: '14px',
    fontWeight: isActive ? '600' : '500',
    color: isActive ? '#3b82f6' : '#6b7280',
    backgroundColor: isActive ? 'rgba(59, 130, 246, 0.08)' : 'transparent',
    textDecoration: 'none',
    transition: 'all 0.2s ease',
    cursor: 'pointer',
    border: '1px solid',
    borderColor: isActive ? 'rgba(59, 130, 246, 0.2)' : 'transparent',
    width: '100%',
    textAlign: 'left'
  });

  const iconStyles = {
    fontSize: '18px',
    width: '20px',
    textAlign: 'center'
  };

  const logoutButtonStyles = {
    width: 'calc(100% - 32px)',
    margin: '16px auto',
    padding: '10px 12px',
    background: '#3b82f6',
    color: 'white',
    border: 'none',
    borderRadius: '10px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s',
    textAlign: 'center'
  };

  return (
    <>
      {/* Backdrop for mobile */}
      {isOpen && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: 'rgba(0, 0, 0, 0.5)',
            zIndex: 99,
            display: window.innerWidth > 768 ? 'none' : 'block'
          }}
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside style={sidebarStyles}>
        {/* Header */}
        <div style={headerStyles}>
          <div style={logoStyles}>
            <div style={logoIconStyles}>📞</div>
            <div style={logoTextStyles}>
              <h2 style={logoTitleStyles}>Reception</h2>
              <p style={logoSubtitleStyles}>Front Desk Operations</p>
            </div>
            <button
              onClick={onClose}
              style={closeButtonStyles}
              onMouseEnter={(e) => e.target.style.background = 'rgba(255, 255, 255, 0.35)'}
              onMouseLeave={(e) => e.target.style.background = 'rgba(255, 255, 255, 0.2)'}
            >
              ✕
            </button>
          </div>
        </div>

        {/* Navigation */}
        <nav style={navStyles}>
          {sections.map((section) => (
            <div key={section.title}>
              <div style={sectionHeaderStyles}>{section.title}</div>
              {section.items.map((item) => {
                const isActive = isPathActive(item.path);
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    style={getLinkStyles(isActive)}
                    onMouseEnter={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.backgroundColor = 'rgba(107, 114, 128, 0.05)';
                        e.currentTarget.style.color = '#4b5563';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.backgroundColor = 'transparent';
                        e.currentTarget.style.color = '#6b7280';
                      }
                    }}
                  >
                    <span style={iconStyles}>{item.icon}</span>
                    <span>{item.label}</span>
                  </NavLink>
                );
              })}
            </div>
          ))}
        </nav>

        {/* Logout Button */}
        <button
          style={logoutButtonStyles}
          onMouseEnter={(e) => e.target.style.background = '#2563eb'}
          onMouseLeave={(e) => e.target.style.background = '#3b82f6'}
        >
          🚪 Logout
        </button>
      </aside>
    </>
  );
};

export default ReceptionNav;

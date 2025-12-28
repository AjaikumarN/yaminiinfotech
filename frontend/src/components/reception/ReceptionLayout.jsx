import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import ReceptionNav from './ReceptionNav';

const ReceptionLayout = () => {
  const [menuOpen, setMenuOpen] = useState(true);

  // Listen to custom event from Header
  useEffect(() => {
    const handleMenuToggle = () => {
      setMenuOpen(prev => !prev);
    };
    
    window.addEventListener('toggleReceptionMenu', handleMenuToggle);
    return () => window.removeEventListener('toggleReceptionMenu', handleMenuToggle);
  }, []);

  // Handle responsive sidebar
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth <= 768) {
        setMenuOpen(false);
      } else {
        setMenuOpen(true);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const closeMenu = () => setMenuOpen(false);

  return (
    <div className="reception-layout">
      <ReceptionNav isOpen={menuOpen} onClose={closeMenu} />
      <div className={`reception-content ${menuOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
        <Outlet />
      </div>

      <style>{`
        .reception-layout {
          display: flex;
          min-height: calc(100vh - 70px);
          background: #ffffff !important;
        }

        .reception-content {
          flex: 1;
          background: #ffffff !important;
          transition: margin-left 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          margin-top: 70px;
        }

        .reception-content.sidebar-open {
          margin-left: 280px;
        }

        .reception-content.sidebar-closed {
          margin-left: 0;
        }

        @media (max-width: 768px) {
          .reception-content {
            margin-left: 0 !important;
          }
        }
      `}</style>
    </div>
  );
};

export default ReceptionLayout;

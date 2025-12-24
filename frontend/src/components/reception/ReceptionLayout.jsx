import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import ReceptionNav from './ReceptionNav';

const ReceptionLayout = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  // Listen to custom event from Header
  React.useEffect(() => {
    const handleMenuToggle = () => {
      setMenuOpen(prev => !prev);
    };
    
    window.addEventListener('toggleReceptionMenu', handleMenuToggle);
    return () => window.removeEventListener('toggleReceptionMenu', handleMenuToggle);
  }, []);

  const closeMenu = () => setMenuOpen(false);

  return (
    <div className="reception-layout">
      <ReceptionNav isOpen={menuOpen} onClose={closeMenu} />
      <div className="reception-content">
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
          margin-left: 0;
          background: #ffffff !important;
        }
      `}</style>
    </div>
  );
};

export default ReceptionLayout;

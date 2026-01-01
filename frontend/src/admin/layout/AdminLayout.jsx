import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import AdminSidebar from './AdminSidebar';
import AdminEmployeesPanel from '../components/AdminEmployeesPanel';
import AdminErrorBoundary from '../components/AdminErrorBoundary';
import FixedFooter from '../../components/FixedFooter';
import { theme } from '../styles/designSystem';
import '../styles/admin.css';
import '../styles/animations.css';

/**
 * AdminLayout - Enterprise Mission Control Layout
 * Responsive without toggles - sidebar auto-hides on mobile
 * Desktop: Fixed sidebar + topbar
 * Tablet: Fixed sidebar (narrower) + topbar
 * Mobile: Topbar only (sidebar hidden)
 */
export default function AdminLayout() {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showEmployeesPanel, setShowEmployeesPanel] = useState(false);

  // Enforce admin-only access
  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'ADMIN') {
      navigate('/login');
    }
  }, [isAuthenticated, user, navigate]);

  // Track window width for responsive layout
  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Listen for sidebar toggle from Header
  useEffect(() => {
    const handleToggle = () => {
      setSidebarOpen(prev => !prev);
    };
    
    const handleShowEmployees = () => setShowEmployeesPanel(true);
    const handleHideEmployees = () => setShowEmployeesPanel(false);

    window.addEventListener('toggleAdminMenu', handleToggle);
    window.addEventListener('showEmployeesPanel', handleShowEmployees);
    window.addEventListener('hideEmployeesPanel', handleHideEmployees);

    return () => {
      window.removeEventListener('toggleAdminMenu', handleToggle);
      window.removeEventListener('showEmployeesPanel', handleShowEmployees);
      window.removeEventListener('hideEmployeesPanel', handleHideEmployees);
    };
  }, []);

  if (!isAuthenticated || user?.role !== 'ADMIN') {
    return null;
  }

  // Responsive breakpoints
  const isMobile = windowWidth < theme.layout.breakpoints.tablet;
  const isTablet = windowWidth >= theme.layout.breakpoints.tablet && windowWidth < theme.layout.breakpoints.laptop;
  const isDesktop = windowWidth >= theme.layout.breakpoints.laptop;

  // Responsive sidebar width
  const sidebarWidth = isMobile ? 0 : (isTablet ? '220px' : theme.layout.sidebarWidth);
  const showSidebar = !isMobile && sidebarOpen;

  const layoutStyles = {
    display: 'flex',
    minHeight: '100vh',
    backgroundColor: theme.colors.neutral.bg
  };

  const mainStyles = {
    marginLeft: showSidebar ? sidebarWidth : 0,
    marginTop: 0,
    transition: theme.transitions.normal,
    minHeight: '100vh',
    width: '100%',
    padding: isMobile ? theme.spacing.md : (isTablet ? theme.spacing.lg : theme.spacing.xl),
    maxWidth: '100%',
    overflowX: 'hidden'
  };

  const contentContainerStyles = {
    width: '100%',
    maxWidth: isDesktop ? '1600px' : '100%',
    margin: '0 auto'
  };

  console.log('AdminLayout render', { sidebarOpen, showEmployeesPanel, windowWidth });

  return (
    <AdminErrorBoundary>
      <div style={layoutStyles}>
        {/* Sidebar - auto-hidden on mobile */}
        {showSidebar && <AdminSidebar isCompact={isTablet} onClose={() => setSidebarOpen(false)} />}
        
        {/* Main Content Area */}
        <main style={mainStyles}>
          <div style={contentContainerStyles}>
            {showEmployeesPanel ? (
              <AdminEmployeesPanel onClose={() => window.dispatchEvent(new Event('hideEmployeesPanel'))} />
            ) : (
              <Outlet />
            )}
          </div>
        </main>
        <FixedFooter />
      </div>
    </AdminErrorBoundary>
  );
}

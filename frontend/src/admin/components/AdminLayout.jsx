import React, { useState } from 'react';
import AdminSidebar from './AdminSidebar';
import AdminTopBar from './AdminTopBar';

/**
 * ADMIN LAYOUT - Able Pro Style
 * Main wrapper with sidebar + topbar + content area
 */
export default function AdminLayout({ children, title, breadcrumbs }) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div style={styles.container}>
      {/* Sidebar */}
      <AdminSidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      {/* Main Content Area */}
      <div style={{
        ...styles.mainArea,
        marginLeft: sidebarCollapsed ? '70px' : '260px'
      }}>
        {/* Top Bar */}
        <AdminTopBar onMenuToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />

        {/* Breadcrumbs (if provided) */}
        {breadcrumbs && (
          <div style={styles.breadcrumbsWrapper}>
            <div style={styles.breadcrumbs}>
              {breadcrumbs.map((crumb, idx) => (
                <React.Fragment key={idx}>
                  {idx > 0 && (
                    <span className="material-icons" style={styles.breadcrumbSeparator}>
                      chevron_right
                    </span>
                  )}
                  <span style={{
                    ...styles.breadcrumb,
                    ...(idx === breadcrumbs.length - 1 ? styles.breadcrumbActive : {})
                  }}>
                    {crumb}
                  </span>
                </React.Fragment>
              ))}
            </div>
          </div>
        )}

        {/* Page Content */}
        <div style={styles.content}>
          {children}
        </div>
      </div>

      {/* Background overlay when sidebar expanded on mobile */}
      {!sidebarCollapsed && window.innerWidth < 768 && (
        <div
          style={styles.overlay}
          onClick={() => setSidebarCollapsed(true)}
        />
      )}
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    minHeight: '100vh',
    background: '#f5f7fa',
    position: 'relative'
  },
  mainArea: {
    flex: 1,
    transition: 'margin-left 0.3s ease',
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column'
  },
  breadcrumbsWrapper: {
    background: '#ffffff',
    borderBottom: '1px solid #e5e7eb',
    padding: '12px 24px'
  },
  breadcrumbs: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '13px'
  },
  breadcrumb: {
    color: '#6b7280',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'color 0.2s',
    ':hover': {
      color: '#6366f1'
    }
  },
  breadcrumbActive: {
    color: '#111827',
    fontWeight: '600'
  },
  breadcrumbSeparator: {
    fontSize: '16px',
    color: '#d1d5db'
  },
  content: {
    flex: 1,
    padding: '24px',
    maxWidth: '1600px',
    width: '100%',
    margin: '0 auto'
  },
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0, 0, 0, 0.5)',
    zIndex: 999,
    display: 'block'
  }
};

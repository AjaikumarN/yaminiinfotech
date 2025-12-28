import React, { useEffect, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { theme } from '../styles/designSystem';

/**
 * AdminSidebar - Enterprise Navigation Sidebar
 * Always visible on desktop/tablet, hidden on mobile
 * Compact mode for tablets (narrower with space efficiency)
 */
export default function AdminSidebar({ isCompact = false, onClose }) {
  const location = useLocation();
  const sections = [
    {
      title: 'Overview',
      items: [
        { icon: '📊', label: 'Dashboard', path: '/admin/dashboard' }
      ]
    },
    {
      title: 'Employees',
      items: [
        { icon: '👥', label: 'All Employees', path: '/admin/employees/salesmen' },
        { icon: '👔', label: 'Salesmen', path: '/admin/employees/salesmen' },
        { icon: '🔧', label: 'Engineers', path: '/admin/employees/engineers' },
        { icon: '🏢', label: 'Reception', path: '/admin/employees/reception' }
      ]
    },
    {
      title: 'Inventory',
      items: [
        { icon: '📦', label: 'Products', path: '/admin/products' },
        { icon: '📊', label: 'Stock', path: '/admin/stock' }
      ]
    },
    {
      title: 'Sales',
      items: [
        { icon: '📋', label: 'Enquiries', path: '/admin/enquiries' },
        { icon: '🛒', label: 'Orders', path: '/admin/orders' }
      ]
    },
    {
      title: 'Finance',
      items: [
        { icon: '💰', label: 'Invoices', path: '/admin/invoices' },
        { icon: '💳', label: 'Outstanding', path: '/admin/outstanding' }
      ]
    },
    {
      title: 'Service',
      items: [
        { icon: '🛠', label: 'Requests', path: '/admin/service/requests' },
        { icon: '⏱️', label: 'SLA Monitor', path: '/admin/service/sla' },
        { icon: '📋', label: 'MIF', path: '/admin/service/mif' }
      ]
    },
    {
      title: 'Operations',
      items: [
        { icon: '🕐', label: 'Attendance', path: '/admin/attendance' }
      ]
    },
    {
      title: 'Insights',
      items: [
        { icon: '📈', label: 'Analytics', path: '/admin/analytics' }
      ]
    },
    {
      title: 'System',
      items: [
        { icon: '🧾', label: 'Audit Logs', path: '/admin/audit-logs' },
        { icon: '👤', label: 'New Employee', path: '/admin/new-employee' },
        { icon: '⚙️', label: 'Settings', path: '/admin/settings' }
      ]
    }
  ];

  const [openSections, setOpenSections] = useState(() => {
    const initial = {};
    sections.forEach((section) => {
      initial[section.title] = true;
    });
    return initial;
  });

  const isPathActive = (path) =>
    location.pathname === path ||
    (path !== '/admin/dashboard' && location.pathname.startsWith(path));

  useEffect(() => {
    setOpenSections((prev) => {
      let changed = false;
      const next = { ...prev };
      sections.forEach((section) => {
        const active = section.items.some((item) => isPathActive(item.path));
        if (active && !prev[section.title]) {
          next[section.title] = true;
          changed = true;
        }
      });
      return changed ? next : prev;
    });
  }, [location.pathname]);

  if (!location.pathname.startsWith('/admin')) {
    return null;
  }

  const sidebarStyles = {
    position: 'fixed',
    top: 0,
    left: 0,
    width: isCompact ? '220px' : theme.layout.sidebarWidth,
    height: '100vh',
    background: 'linear-gradient(180deg, #f8fafc 0%, #f5f7fb 100%)',
    borderRight: `1px solid ${theme.colors.neutral.border}`,
    zIndex: theme.zIndex.sidebar,
    overflow: 'auto',
    boxShadow: '0 20px 38px rgba(15,23,42,0.08)',
    transition: theme.transitions.normal
  };

  const headerStyles = {
    padding: isCompact ? theme.spacing.md : theme.spacing.xl,
    borderBottom: `1px solid ${theme.colors.neutral.border}`,
    background: 'linear-gradient(135deg, #e0e7ff 0%, #e5e7eb 100%)'
  };

  const logoStyles = {
    display: 'flex',
    alignItems: 'center',
    gap: isCompact ? theme.spacing.sm : theme.spacing.md
  };

  const logoIconStyles = {
    width: isCompact ? '42px' : '52px',
    height: isCompact ? '42px' : '52px',
    borderRadius: '14px',
    background: `linear-gradient(135deg, ${theme.colors.primary.main} 0%, ${theme.colors.primary.dark} 100%)`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: isCompact ? '20px' : '24px',
    color: theme.colors.neutral.white,
    boxShadow: '0 12px 24px rgba(59,130,246,0.25)'
  };

  const logoTitleStyles = {
    fontSize: isCompact ? theme.typography.fontSize.base : theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.primary,
    marginBottom: '2px',
    letterSpacing: '0.2px'
  };

  const logoSubtitleStyles = {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.text.tertiary,
    display: isCompact ? 'none' : 'block'
  };

  const navStyles = {
    padding: isCompact ? theme.spacing.sm : theme.spacing.md
  };

  const sectionHeaderStyles = {
    fontSize: theme.typography.fontSize.xs,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.tertiary,
    textTransform: 'uppercase',
    letterSpacing: '0.6px',
    padding: `${theme.spacing.sm} ${theme.spacing.md}`,
    marginBottom: theme.spacing.xs,
    marginTop: theme.spacing.md
  };

  const getLinkStyles = (isActive) => ({
    display: 'flex',
    alignItems: 'center',
    gap: isCompact ? theme.spacing.sm : theme.spacing.md,
    padding: `${theme.spacing.sm} ${theme.spacing.md}`,
    marginBottom: theme.spacing.xs,
    borderRadius: theme.borderRadius.lg,
    fontSize: isCompact ? theme.typography.fontSize.sm : theme.typography.fontSize.base,
    fontWeight: isActive ? theme.typography.fontWeight.semibold : theme.typography.fontWeight.medium,
    color: isActive ? theme.colors.primary.main : theme.colors.text.secondary,
    backgroundColor: isActive ? 'rgba(79,70,229,0.08)' : 'transparent',
    textDecoration: 'none',
    transition: theme.transitions.fast,
    cursor: 'pointer',
    border: '1px solid',
    borderColor: isActive ? 'rgba(79,70,229,0.2)' : 'transparent',
    width: '100%',
    textAlign: 'left',
    position: 'relative'
  });

  const iconStyles = {
    fontSize: isCompact ? '16px' : '18px',
    width: '20px',
    textAlign: 'center',
    flexShrink: 0
  };

  return (
    <aside style={sidebarStyles}>
      {/* Header */}
      <div style={headerStyles}>
        <div style={logoStyles}>
          <div style={logoIconStyles}>A</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={logoTitleStyles}>Admin</div>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              style={{
                background: 'rgba(79, 70, 229, 0.15)',
                border: 'none',
                color: theme.colors.primary.main,
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                fontSize: '18px',
                cursor: 'pointer',
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 'bold'
              }}
              onMouseEnter={(e) => {
                e.target.style.background = 'rgba(79, 70, 229, 0.25)';
                e.target.style.transform = 'scale(1.05)';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'rgba(79, 70, 229, 0.15)';
                e.target.style.transform = 'scale(1)';
              }}
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav style={navStyles}>
        {sections.map((section, idx) => {
          const sectionHasActive = section.items.some((item) => isPathActive(item.path));

          const toggleSection = () => {
            setOpenSections((prev) => ({ ...prev, [section.title]: !prev[section.title] }));
          };

          const itemsWrapperStyle = {
            maxHeight: openSections[section.title] ? '800px' : '0px',
            overflow: 'hidden',
            transition: 'max-height 0.25s ease, opacity 0.2s ease',
            opacity: openSections[section.title] ? 1 : 0,
            pointerEvents: openSections[section.title] ? 'auto' : 'none',
            paddingTop: openSections[section.title] ? '4px' : '0'
          };

          return (
            <div key={idx}>
              <button
                type="button"
                onClick={toggleSection}
                aria-expanded={openSections[section.title]}
                style={{
                  ...sectionHeaderStyles,
                  width: '100%',
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}
              >
                <span>{section.title}</span>
                <span style={{ fontSize: '12px', color: theme.colors.text.tertiary }}>
                  {openSections[section.title] ? '▾' : '▸'}
                </span>
              </button>

              <div style={itemsWrapperStyle}>
                {section.items.map((item, itemIdx) => {
                  const isActive = isPathActive(item.path);

                  return (
                    <NavLink
                      key={itemIdx}
                      to={item.path}
                      style={getLinkStyles(isActive)}
                      onMouseEnter={(e) => {
                        if (!isActive) {
                          e.currentTarget.style.backgroundColor = theme.colors.neutral.bg;
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isActive) {
                          e.currentTarget.style.backgroundColor = 'transparent';
                        }
                      }}
                    >
                      <span style={iconStyles}>{item.icon}</span>
                      <span style={{ 
                        overflow: 'hidden', 
                        textOverflow: 'ellipsis', 
                        whiteSpace: 'nowrap' 
                      }}>
                        {item.label}
                      </span>
                      
                      {/* Active indicator */}
                      {isActive && (
                        <div style={{
                          position: 'absolute',
                          left: 6,
                          top: '50%',
                          transform: 'translateY(-50%)',
                          width: '4px',
                          height: '60%',
                          backgroundColor: theme.colors.primary.main,
                          borderRadius: '6px'
                        }} />
                      )}
                    </NavLink>
                  );
                })}
              </div>
            </div>
          );
        })}
      </nav>
    </aside>
  );
}

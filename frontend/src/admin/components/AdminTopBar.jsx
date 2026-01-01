import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

/**
 * ADMIN TOP BAR - Able Pro Style
 * Global search, notifications, theme toggle, profile dropdown
 */
export default function AdminTopBar({ onMenuToggle }) {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [searchOpen, setSearchOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const notifications = [
    { id: 1, icon: 'assignment', text: 'New enquiry assigned', time: '5m ago', unread: true },
    { id: 2, icon: 'warning', text: 'SLA breach alert', time: '12m ago', unread: true },
    { id: 3, icon: 'check_circle', text: 'Order approved', time: '1h ago', unread: false }
  ];

  const unreadCount = notifications.filter(n => n.unread).length;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div style={styles.topBar}>
      {/* Left Section */}
      <div style={styles.leftSection}>
        <button onClick={onMenuToggle} style={styles.menuButton}>
          <span className="material-icons">menu</span>
        </button>

        {/* Global Search */}
        <div style={styles.searchWrapper}>
          <span className="material-icons" style={styles.searchIcon}>search</span>
          <input
            type="text"
            placeholder="Search... (Ctrl + K)"
            style={styles.searchInput}
            onFocus={() => setSearchOpen(true)}
            onBlur={() => setTimeout(() => setSearchOpen(false), 200)}
          />
          <kbd style={styles.kbd}>⌘K</kbd>
        </div>
      </div>

      {/* Right Section */}
      <div style={styles.rightSection}>
        {/* Theme Toggle */}
        <button style={styles.iconButton} title="Toggle theme">
          <span className="material-icons">light_mode</span>
        </button>

        {/* Notifications */}
        <div style={styles.notificationWrapper}>
          <button
            style={styles.iconButton}
            onClick={() => setNotificationsOpen(!notificationsOpen)}
          >
            <span className="material-icons">notifications</span>
            {unreadCount > 0 && (
              <span style={styles.notificationBadge}>{unreadCount}</span>
            )}
          </button>

          {/* Notification Dropdown */}
          {notificationsOpen && (
            <div style={styles.dropdown}>
              <div style={styles.dropdownHeader}>
                <span style={styles.dropdownTitle}>Notifications</span>
                <button style={styles.markAllRead}>Mark all read</button>
              </div>
              <div style={styles.notificationList}>
                {notifications.map(notif => (
                  <div key={notif.id} style={styles.notificationItem}>
                    <div style={{
                      ...styles.notifIcon,
                      background: notif.unread ? '#eef2ff' : '#f9fafb'
                    }}>
                      <span className="material-icons" style={{
                        fontSize: '18px',
                        color: notif.unread ? '#6366f1' : '#9ca3af'
                      }}>
                        {notif.icon}
                      </span>
                    </div>
                    <div style={styles.notifContent}>
                      <span style={{
                        ...styles.notifText,
                        fontWeight: notif.unread ? '600' : '400'
                      }}>
                        {notif.text}
                      </span>
                      <span style={styles.notifTime}>{notif.time}</span>
                    </div>
                    {notif.unread && <span style={styles.unreadDot} />}
                  </div>
                ))}
              </div>
              <div style={styles.dropdownFooter}>
                <button
                  style={styles.viewAllButton}
                  onClick={() => {
                    setNotificationsOpen(false);
                    navigate('/admin/notifications');
                  }}
                >
                  View all notifications
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Profile Dropdown */}
        <div style={styles.profileWrapper}>
          <button
            style={styles.profileButton}
            onClick={() => setProfileOpen(!profileOpen)}
          >
            <div style={styles.avatar}>
              {user?.photo ? (
                <img src={user.photo} alt={user.name} style={styles.avatarImage} />
              ) : (
                <span style={styles.avatarPlaceholder}>
                  {user?.name?.charAt(0) || 'A'}
                </span>
              )}
            </div>
            <div style={styles.profileInfo}>
              <span style={styles.profileName}>{user?.name || 'Admin'}</span>
              <span style={styles.profileRole}>Administrator</span>
            </div>
            <span className="material-icons" style={styles.dropdownArrow}>
              {profileOpen ? 'expand_less' : 'expand_more'}
            </span>
          </button>

          {/* Profile Dropdown */}
          {profileOpen && (
            <div style={styles.dropdown}>
              <div style={styles.profileDropdownHeader}>
                <div style={styles.profileDropdownAvatar}>
                  {user?.photo ? (
                    <img src={user.photo} alt={user.name} style={styles.avatarImage} />
                  ) : (
                    <span style={styles.avatarPlaceholder}>
                      {user?.name?.charAt(0) || 'A'}
                    </span>
                  )}
                </div>
                <div>
                  <div style={styles.profileDropdownName}>{user?.name || 'Admin'}</div>
                  <div style={styles.profileDropdownEmail}>{user?.email || 'admin@yamini.com'}</div>
                </div>
              </div>

              <div style={styles.profileMenuList}>
                <button style={styles.profileMenuItem} onClick={() => navigate('/admin/profile')}>
                  <span className="material-icons" style={styles.profileMenuIcon}>person</span>
                  <span>My Profile</span>
                </button>
                <button style={styles.profileMenuItem} onClick={() => navigate('/admin/settings')}>
                  <span className="material-icons" style={styles.profileMenuIcon}>settings</span>
                  <span>Settings</span>
                </button>
                <div style={styles.profileMenuDivider} />
                <button style={styles.profileMenuItemDanger} onClick={handleLogout}>
                  <span className="material-icons" style={styles.profileMenuIcon}>logout</span>
                  <span>Logout</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const styles = {
  topBar: {
    height: '64px',
    background: '#ffffff',
    borderBottom: '1px solid #e5e7eb',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 24px',
    position: 'sticky',
    top: 0,
    zIndex: 999
  },
  leftSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    flex: 1
  },
  menuButton: {
    width: '40px',
    height: '40px',
    border: 'none',
    background: 'transparent',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    color: '#6b7280',
    transition: 'all 0.2s',
    ':hover': {
      background: '#f9fafb'
    }
  },
  searchWrapper: {
    position: 'relative',
    width: '100%',
    maxWidth: '400px',
    display: 'flex',
    alignItems: 'center'
  },
  searchIcon: {
    position: 'absolute',
    left: '12px',
    fontSize: '20px',
    color: '#9ca3af',
    pointerEvents: 'none'
  },
  searchInput: {
    width: '100%',
    padding: '10px 80px 10px 44px',
    border: '1px solid #e5e7eb',
    borderRadius: '8px',
    fontSize: '14px',
    color: '#374151',
    outline: 'none',
    transition: 'all 0.2s',
    ':focus': {
      borderColor: '#6366f1',
      boxShadow: '0 0 0 3px rgba(99, 102, 241, 0.1)'
    }
  },
  kbd: {
    position: 'absolute',
    right: '12px',
    padding: '4px 8px',
    background: '#f3f4f6',
    border: '1px solid #e5e7eb',
    borderRadius: '4px',
    fontSize: '11px',
    fontWeight: '600',
    color: '#6b7280',
    fontFamily: 'monospace'
  },
  rightSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  iconButton: {
    width: '40px',
    height: '40px',
    border: 'none',
    background: 'transparent',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    color: '#6b7280',
    transition: 'all 0.2s',
    position: 'relative',
    ':hover': {
      background: '#f9fafb'
    }
  },
  notificationWrapper: {
    position: 'relative'
  },
  notificationBadge: {
    position: 'absolute',
    top: '6px',
    right: '6px',
    width: '18px',
    height: '18px',
    background: '#ef4444',
    color: '#ffffff',
    fontSize: '10px',
    fontWeight: '700',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: '2px solid #ffffff'
  },
  profileWrapper: {
    position: 'relative',
    marginLeft: '8px'
  },
  profileButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '6px 12px 6px 6px',
    border: '1px solid #e5e7eb',
    borderRadius: '8px',
    background: 'transparent',
    cursor: 'pointer',
    transition: 'all 0.2s',
    ':hover': {
      background: '#f9fafb',
      borderColor: '#d1d5db'
    }
  },
  avatar: {
    width: '36px',
    height: '36px',
    borderRadius: '8px',
    overflow: 'hidden',
    background: '#eef2ff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover'
  },
  avatarPlaceholder: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#6366f1'
  },
  profileInfo: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: '2px'
  },
  profileName: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#111827'
  },
  profileRole: {
    fontSize: '12px',
    color: '#6b7280'
  },
  dropdownArrow: {
    fontSize: '20px',
    color: '#9ca3af'
  },
  dropdown: {
    position: 'absolute',
    top: 'calc(100% + 8px)',
    right: 0,
    width: '320px',
    background: '#ffffff',
    border: '1px solid #e5e7eb',
    borderRadius: '12px',
    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12)',
    zIndex: 1000
  },
  dropdownHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '16px',
    borderBottom: '1px solid #f3f4f6'
  },
  dropdownTitle: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#111827'
  },
  markAllRead: {
    fontSize: '12px',
    color: '#6366f1',
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    fontWeight: '500'
  },
  notificationList: {
    maxHeight: '320px',
    overflowY: 'auto'
  },
  notificationItem: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '12px',
    padding: '12px 16px',
    cursor: 'pointer',
    transition: 'background 0.2s',
    position: 'relative',
    ':hover': {
      background: '#f9fafb'
    }
  },
  notifIcon: {
    width: '36px',
    height: '36px',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0
  },
  notifContent: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '4px'
  },
  notifText: {
    fontSize: '13px',
    color: '#374151'
  },
  notifTime: {
    fontSize: '11px',
    color: '#9ca3af'
  },
  unreadDot: {
    width: '8px',
    height: '8px',
    background: '#6366f1',
    borderRadius: '50%',
    position: 'absolute',
    top: '20px',
    right: '16px'
  },
  dropdownFooter: {
    padding: '12px',
    borderTop: '1px solid #f3f4f6'
  },
  viewAllButton: {
    width: '100%',
    padding: '8px',
    background: 'transparent',
    border: 'none',
    borderRadius: '6px',
    fontSize: '13px',
    fontWeight: '500',
    color: '#6366f1',
    cursor: 'pointer',
    transition: 'background 0.2s',
    ':hover': {
      background: '#f9fafb'
    }
  },
  profileDropdownHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '16px',
    borderBottom: '1px solid #f3f4f6'
  },
  profileDropdownAvatar: {
    width: '48px',
    height: '48px',
    borderRadius: '10px',
    overflow: 'hidden',
    background: '#eef2ff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '20px',
    fontWeight: '600',
    color: '#6366f1'
  },
  profileDropdownName: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#111827'
  },
  profileDropdownEmail: {
    fontSize: '12px',
    color: '#6b7280',
    marginTop: '2px'
  },
  profileMenuList: {
    padding: '8px'
  },
  profileMenuItem: {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '10px 12px',
    background: 'transparent',
    border: 'none',
    borderRadius: '6px',
    fontSize: '13px',
    fontWeight: '500',
    color: '#374151',
    cursor: 'pointer',
    transition: 'background 0.2s',
    textAlign: 'left',
    ':hover': {
      background: '#f9fafb'
    }
  },
  profileMenuIcon: {
    fontSize: '18px',
    color: '#9ca3af'
  },
  profileMenuDivider: {
    height: '1px',
    background: '#f3f4f6',
    margin: '8px 0'
  },
  profileMenuItemDanger: {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '10px 12px',
    background: 'transparent',
    border: 'none',
    borderRadius: '6px',
    fontSize: '13px',
    fontWeight: '500',
    color: '#ef4444',
    cursor: 'pointer',
    transition: 'background 0.2s',
    textAlign: 'left',
    ':hover': {
      background: '#fef2f2'
    }
  }
};

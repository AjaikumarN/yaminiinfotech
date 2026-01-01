import React, { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { FiSearch, FiBell, FiShoppingCart, FiMenu, FiX, FiChevronDown, FiChevronUp, FiUser, FiLogOut } from 'react-icons/fi'
import { useAuth } from '../contexts/AuthContext.jsx'
import { apiRequest } from '../utils/api.js'
import Notifications from './Notifications.jsx'

const navItems = [
  { label: 'Home', href: '/' },
  { label: 'Products', href: '/products' },
  { label: 'Services', href: '#' },
  { label: 'Blog', href: '/blog' },
  { label: 'About Us', href: '/about' },
  { label: 'Contact', href: '/contact' }
]

export default function Header({ showNotificationPanel, setShowNotificationPanel }) {
  const { isAuthenticated, user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)
  const [employeesOpen, setEmployeesOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)
  const [notifications, setNotifications] = useState([])
  const [allNotifications, setAllNotifications] = useState([])

  // Fetch backend notifications for authenticated users
  useEffect(() => {
    if (isAuthenticated && user) {
      fetchNotifications()
      // Poll every 60 seconds
      const interval = setInterval(fetchNotifications, 60000)
      return () => clearInterval(interval)
    }
  }, [isAuthenticated, user])

  const fetchNotifications = async () => {
    try {
      const allNotifs = await apiRequest('/api/notifications/my-notifications')
      
      // Filter unread on frontend since API parameter might not work
      const unreadNotifs = (allNotifs || []).filter(n => !n.read_status)
      
      setNotifications(unreadNotifs)
      setAllNotifications(allNotifs || [])
      setUnreadCount(unreadNotifs.length)
    } catch (error) {
      console.error('Failed to fetch notifications:', error)
    }
  }

  const markAsRead = async (notificationId) => {
    try {
      await apiRequest(`/api/notifications/${notificationId}/read`, { method: 'PUT' })
      await fetchNotifications() // Refresh notifications
    } catch (error) {
      console.error('Failed to mark notification as read:', error)
    }
  }

  const toggleMenu = () => setMenuOpen(!menuOpen)
  const closeMenu = () => {
    setMenuOpen(false)
    setEmployeesOpen(false)
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
    setUserMenuOpen(false)
  }

  return (
    <>
    <Notifications 
      showPanel={showNotificationPanel}
      setShowPanel={setShowNotificationPanel}
      backendNotifications={notifications}
      allNotifications={allNotifications}
      markAsRead={markAsRead}
      refreshNotifications={fetchNotifications}
    />
    <header className="site-header">
      <div className="topbar">
        {!(location.pathname === '/' || location.pathname.startsWith('/login')) && (
          <button className="menu-toggle" onClick={() => {
            if (location.pathname.startsWith('/reception')) {
              // Dispatch custom event for reception sidebar
              window.dispatchEvent(new Event('toggleReceptionMenu'));
            } else if (location.pathname.startsWith('/service-engineer') || location.pathname.startsWith('/engineer')) {
              // Dispatch custom event for service engineer sidebar (supports both route variants)
              window.dispatchEvent(new Event('toggleServiceEngineerMenu'));
            } else if (location.pathname.startsWith('/salesman')) {
              // Dispatch custom event for salesman sidebar
              window.dispatchEvent(new Event('toggleSalesmanMenu'));
            } else if (location.pathname.startsWith('/admin')) {
              // Dispatch custom event for admin sidebar
              window.dispatchEvent(new Event('toggleAdminMenu'));
            } else {
              toggleMenu();
            }
          }} aria-label="Menu">
            {menuOpen ? <FiX /> : <FiMenu />}
          </button>
        )}
        <div className="logo-wrap">
          <img src="/assets/main_logo.png" alt="Yamini Infotech" className="logo-icon" />
          <div className="logo-text">
            <div className="company">YAMINI INFOTECH</div>
            <div className="tagline">Driving Business Through Technology</div>
          </div>
        </div>
        <div className="actions">
          {!isAuthenticated && (
            <>
              <button aria-label="Search" className="icon-btn"><FiSearch /></button>
              <button aria-label="Cart" className="icon-btn">
                <FiShoppingCart />
              </button>
            </>
          )}
          
          {isAuthenticated && (
            <button 
              aria-label="Notifications" 
              className="icon-btn badge notification-btn"
              onClick={() => setShowNotificationPanel(!showNotificationPanel)}
            >
              <FiBell />
              {unreadCount > 0 && <span className="count">{unreadCount}</span>}
            </button>
          )}
          
          {isAuthenticated ? (
            <div className="user-menu-container">
              <button 
                className="user-btn" 
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                aria-label="User menu"
              >
                <FiUser />
                <span className="user-name">{user?.full_name || user?.username}</span>
              </button>
              
              {userMenuOpen && (
                <div className="user-dropdown">
                  <div className="user-info">
                    <div className="user-name-full">{user?.full_name || user?.username}</div>
                    <div className="user-role">{user?.role?.replace('_', ' ').toUpperCase()}</div>
                    <div className="user-email">{user?.email}</div>
                  </div>
                  <button className="logout-btn" onClick={handleLogout}>
                    <FiLogOut />
                    <span>Logout</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link to="/login" className="login-link">
              <FiUser />
              <span>Staff Login</span>
            </Link>
          )}
        </div>
      </div>

      {isAuthenticated && (
      <div className={`sidebar-menu ${menuOpen ? 'open' : ''}`}>
        <div className="sidebar-overlay" onClick={closeMenu}></div>
        <div className="sidebar-content">
          <div className="sidebar-header">
            <h3>Staff Menu</h3>
            <button onClick={closeMenu} className="close-btn"><FiX /></button>
          </div>
          <nav className="sidebar-nav">
            <ul>
              {user?.role === 'RECEPTION' && (
                <li className="menu-item">
                  <Link to="/reception/dashboard" onClick={closeMenu} className="menu-link">Reception Dashboard</Link>
                </li>
              )}
              
              {user?.role === 'SALESMAN' && (
                <>
                  <li className="menu-item">
                    <Link to="/salesman/dashboard" onClick={closeMenu} className="menu-link">Dashboard</Link>
                  </li>
                  <li className="menu-item">
                    <Link to="/salesman/enquiries" onClick={closeMenu} className="menu-link">Enquiries</Link>
                  </li>
                  <li className="menu-item">
                    <Link to="/salesman/calls" onClick={closeMenu} className="menu-link">Calls</Link>
                  </li>
                  <li className="menu-item">
                    <Link to="/salesman/followups" onClick={closeMenu} className="menu-link">Follow-Ups</Link>
                  </li>
                </>
              )}
              
              {user?.role === 'OFFICE_STAFF' && (
                <li className="menu-item">
                  <Link to="/office/dashboard" onClick={closeMenu} className="menu-link">Office Staff Dashboard</Link>
                </li>
              )}
              
              {user?.role === 'ADMIN' && (
                <>
                  <li className="menu-item">
                    <Link to="/admin/dashboard" onClick={closeMenu} className="menu-link">Admin Dashboard</Link>
                  </li>
                  <li className="menu-item">
                    <Link to="/reception/dashboard" onClick={closeMenu} className="menu-link">Reception</Link>
                  </li>
                  <li className="menu-item">
                    <button onClick={() => setEmployeesOpen(!employeesOpen)} className="menu-btn">
                      <span>All Dashboards</span>
                      {employeesOpen ? <FiChevronUp /> : <FiChevronDown />}
                    </button>
                    {employeesOpen && (
                      <ul className="submenu">
                        <li><Link to="/salesman/dashboard" onClick={closeMenu}>Salesman</Link></li>
                        <li><Link to="/engineer/dashboard" onClick={closeMenu}>Service Engineer</Link></li>
                        <li><Link to="/office/dashboard" onClick={closeMenu}>Office Staff</Link></li>
                      </ul>
                    )}
                  </li>
                </>
              )}
              
              <li className="menu-item logout-menu-item">
                <button className="logout-btn-sidebar" onClick={() => { handleLogout(); closeMenu(); }}>
                  <FiLogOut />
                  <span>Logout</span>
                </button>
              </li>
            </ul>
          </nav>
        </div>
      </div>
      )}

      {!isAuthenticated && (
      <nav className="nav">
        <ul>
          {navItems.map((item) => (
            <li key={item.label}>
              {item.href.startsWith('/') ? (
                <Link to={item.href}>{item.label}</Link>
              ) : (
                <a href={item.href}>{item.label}</a>
              )}
            </li>
          ))}
        </ul>
      </nav>
      )}
    </header>
    </>
  )
}

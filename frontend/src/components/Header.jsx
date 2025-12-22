import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { FiSearch, FiBell, FiShoppingCart, FiMenu, FiX, FiChevronDown, FiChevronUp, FiUser, FiLogOut } from 'react-icons/fi'
import { useAuth } from '../contexts/AuthContext.jsx'
import { useNotifications } from '../contexts/NotificationContext.jsx'

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
  const { unreadCount } = useNotifications()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)
  const [employeesOpen, setEmployeesOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)

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
    <header className="site-header">
      <div className="topbar">
        <button className="menu-toggle" onClick={toggleMenu} aria-label="Menu">
          {menuOpen ? <FiX /> : <FiMenu />}
        </button>
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
              {user?.role === 'reception' && (
                <li className="menu-item">
                  <Link to="/reception/dashboard" onClick={closeMenu} className="menu-link">Reception Dashboard</Link>
                </li>
              )}
              
              {user?.role === 'salesman' && (
                <li className="menu-item">
                  <Link to="/salesman/dashboard" onClick={closeMenu} className="menu-link">Salesman Dashboard</Link>
                </li>
              )}
              
              {user?.role === 'service_engineer' && (
                <li className="menu-item">
                  <Link to="/engineer/dashboard" onClick={closeMenu} className="menu-link">Engineer Dashboard</Link>
                </li>
              )}
              
              {user?.role === 'office_staff' && (
                <li className="menu-item">
                  <Link to="/office/dashboard" onClick={closeMenu} className="menu-link">Office Staff Dashboard</Link>
                </li>
              )}
              
              {user?.role === 'admin' && (
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
  )
}

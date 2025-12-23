import React, { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext.jsx'
import { getPostLoginRedirect } from '../utils/dashboardRoutes.js'

export default function Login() {
  const navigate = useNavigate()
  const location = useLocation()
  const { login } = useAuth()
  
  const [credentials, setCredentials] = useState({
    username: '',
    password: ''
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const from = location.state?.from?.pathname || '/'

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const result = await login(credentials.username, credentials.password)
      
      if (result.success) {
        // Use centralized routing helper
        const redirectPath = getPostLoginRedirect(result.user.role, from)
        navigate(redirectPath, { replace: true })
      } else {
        setError(result.error || 'Login failed. Please check your credentials.')
      }
    } catch (err) {
      console.error('Login error:', err)
      setError(err.message || 'An error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <div className="logo-section">
            <h1>🔐 YAMINI INFOTECH</h1>
            <p>Internal Staff Access Portal</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <h2>Staff Sign In</h2>
          <p className="staff-notice">⚠️ This login is for internal staff only. Customers do not need to log in.</p>
          
          {error && (
            <div className="error-message">
              <span>⚠️</span> {error}
            </div>
          )}

          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              id="username"
              type="text"
              value={credentials.username}
              onChange={(e) => setCredentials({...credentials, username: e.target.value})}
              placeholder="Enter your username"
              required
              autoComplete="username"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <div className="password-input-wrapper">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                value={credentials.password}
                onChange={(e) => setCredentials({...credentials, password: e.target.value})}
                placeholder="Enter your password"
                required
                autoComplete="current-password"
              />
              <button
                type="button"
                className="toggle-password"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex="-1"
              >
                {showPassword ? '👁️' : '👁️‍🗨️'}
              </button>
            </div>
          </div>

          <button type="submit" className="btn-login" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="security-notice">
          <p>🔒 <strong>Security Notice:</strong></p>
          <ul>
            <li>MIF data accessible ONLY to Admin & authorized Office Staff</li>
            <li>All access is logged and monitored</li>
            <li>Role-based access control enforced</li>
          </ul>
        </div>
      </div>

      <style>{`
        .login-container {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          padding: 20px;
        }

        .login-card {
          background: white;
          border-radius: 16px;
          box-shadow: 0 10px 40px rgba(0,0,0,0.2);
          max-width: 500px;
          width: 100%;
          overflow: hidden;
        }

        .login-header {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 30px;
          text-align: center;
        }

        .logo-section h1 {
          margin: 0 0 10px 0;
          font-size: 28px;
        }

        .logo-section p {
          margin: 0;
          opacity: 0.9;
        }

        .login-form {
          padding: 30px;
        }

        .login-form h210px 0;
          color: #2c3e50;
        }

        .staff-notice {
          margin: 0 0 25px 0;
          padding: 10px;
          background: #e3f2fd;
          border-left: 4px solid #2196f3;
          border-radius: 4px;
          color: #1565c0;
          font-size: 14pxpx 0;
          color: #2c3e50;
        }

        .error-message {
          background: #fee;
          border-left: 4px solid #e74c3c;
          color: #c0392b;
          padding: 12px 15px;
          margin-bottom: 20px;
          border-radius: 4px;
          display: flex;
          align-items: center;
          gap: 10px;
          animation: shake 0.5s;
        }

        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
          20%, 40%, 60%, 80% { transform: translateX(5px); }
        }

        .form-group {
          margin-bottom: 20px;
        }

        .form-group label {
          display: block;
          margin-bottom: 8px;
          font-weight: 600;
          color: #2c3e50;
        }

        .password-input-wrapper {
          position: relative;
        }

        .password-input-wrapper input {
          width: 100%;
          padding: 12px 45px 12px 15px;
          border: 2px solid #e0e0e0;
          border-radius: 8px;
          font-size: 15px;
          transition: all 0.3s;
        }

        .toggle-password {
          position: absolute;
          right: 10px;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          font-size: 18px;
          cursor: pointer;
          padding: 5px;
          opacity: 0.6;
          transition: opacity 0.3s;
        }

        .toggle-password:hover {
          opacity: 1;
        }

        .form-group input {
          width: 100%;
          padding: 12px 15px;
          border: 2px solid #e0e0e0;
          border-radius: 8px;
          font-size: 15px;
          transition: all 0.3s;
        }

        .form-group input:focus {
          outline: none;
          border-color: #667eea;
          box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
        }

        .btn-login {
          width: 100%;
          padding: 14px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          border-radius: 8px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s;
        }

        .btn-login:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
        }

        .btn-login:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .demo-credentials {
          padding: 20px 30px;
          background: #f8f9fa;
          border-top: 1px solid #e0e0e0;
        }

        .demo-credentials h3 {
          margin: 0 0 15px 0;
          color: #2c3e50;
          font-size: 16px;
        }

        .demo-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 10px;
        }

        .demo-btn {
          padding: 12px;
          background: white;
          border: 2px solid #e0e0e0;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.3s;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
        }

        .demo-btn:hover {
          border-color: #667eea;
          background: #f0f4ff;
          transform: translateY(-2px);
        }

        .demo-btn strong {
          color: #2c3e50;
          font-size: 14px;
        }

        .demo-btn small {
          color: #7f8c8d;
          font-size: 12px;
        }

        .security-notice {
          padding: 20px 30px;
          background: #fff3cd;
          border-top: 1px solid #ffc107;
        }

        .security-notice p {
          margin: 0 0 10px 0;
          color: #856404;
          font-weight: 600;
        }

        .security-notice ul {
          margin: 0;
          padding-left: 20px;
          color: #856404;
        }

        .security-notice li {
          margin-bottom: 5px;
          font-size: 13px;
        }

        @media (max-width: 600px) {
          .demo-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  )
}

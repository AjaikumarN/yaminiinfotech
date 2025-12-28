import React, { useState, useEffect } from 'react'
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
  const [rememberMe, setRememberMe] = useState(false)
  const [particles, setParticles] = useState([])
  const [focusedField, setFocusedField] = useState(null)

  const from = location.state?.from?.pathname || '/'

  // Generate floating particles for background effect
  useEffect(() => {
    const particleArray = Array.from({ length: 30 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      animationDelay: Math.random() * 20,
      size: Math.random() * 4 + 2
    }))
    setParticles(particleArray)
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const result = await login(credentials.username, credentials.password)
      
      if (result.success) {
        // Save remember me preference
        if (rememberMe) {
          localStorage.setItem('rememberedUser', credentials.username)
        }
        
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
      {/* Animated Background Particles */}
      <div className="particles-background">
        {particles.map(particle => (
          <div
            key={particle.id}
            className="particle"
            style={{
              left: `${particle.left}%`,
              animationDelay: `${particle.animationDelay}s`,
              width: `${particle.size}px`,
              height: `${particle.size}px`
            }}
          />
        ))}
      </div>

      {/* Gradient Orbs */}
      <div className="gradient-orb orb-1"></div>
      <div className="gradient-orb orb-2"></div>
      <div className="gradient-orb orb-3"></div>

      <div className="login-card">
        {/* Glass Header */}
        <div className="login-header">
          <div className="logo-container">
            <img src="/images/yamini-logo.png" alt="Yamini Infotech Logo" className="logo-icon" />
            <h1 className="company-name">YAMINI INFOTECH</h1>
            <p className="tagline">Staff Management System</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-header">
            <h2>🔐 Secure Access Portal</h2>
            <p>Enter your credentials to continue</p>
          </div>

          {error && (
            <div className="error-message">
              <div className="error-icon">⚠️</div>
              <div className="error-text">{error}</div>
            </div>
          )}

          <div className={`form-group ${focusedField === 'username' ? 'focused' : ''}`}>
            <label htmlFor="username">
              <span className="label-icon">👤</span>
              Username
            </label>
            <div className="input-wrapper">
              <input
                id="username"
                type="text"
                value={credentials.username}
                onChange={(e) => setCredentials({...credentials, username: e.target.value})}
                onFocus={() => setFocusedField('username')}
                onBlur={() => setFocusedField(null)}
                placeholder="Enter your username"
                required
                autoComplete="username"
              />
              <div className="input-border"></div>
            </div>
          </div>

          <div className={`form-group ${focusedField === 'password' ? 'focused' : ''}`}>
            <label htmlFor="password">
              <span className="label-icon">🔒</span>
              Password
            </label>
            <div className="input-wrapper password-wrapper">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                value={credentials.password}
                onChange={(e) => setCredentials({...credentials, password: e.target.value})}
                onFocus={() => setFocusedField('password')}
                onBlur={() => setFocusedField(null)}
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
                {showPassword ? (
                  <svg viewBox="0 0 24 24" fill="none">
                    <path d="M12 5C8.24 5 5.04 7.16 3.27 10.5C5.04 13.84 8.24 16 12 16C15.76 16 18.96 13.84 20.73 10.5C18.96 7.16 15.76 5 12 5ZM12 14C10.34 14 9 12.66 9 11C9 9.34 10.34 8 12 8C13.66 8 15 9.34 15 11C15 12.66 13.66 14 12 14Z" fill="currentColor"/>
                  </svg>
                ) : (
                  <svg viewBox="0 0 24 24" fill="none">
                    <path d="M12 7C14.76 7 17.3 8.5 18.82 11C17.3 13.5 14.76 15 12 15C9.24 15 6.7 13.5 5.18 11C6.7 8.5 9.24 7 12 7ZM2 11C4.04 6.5 7.88 4 12 4C16.12 4 19.96 6.5 22 11C19.96 15.5 16.12 18 12 18C7.88 18 4.04 15.5 2 11Z" fill="currentColor" opacity="0.3"/>
                    <line x1="4" y1="4" x2="20" y2="20" stroke="currentColor" strokeWidth="2"/>
                  </svg>
                )}
              </button>
              <div className="input-border"></div>
            </div>
          </div>

          <div className="form-options">
            <label className="checkbox-container">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              <span className="checkmark"></span>
              <span className="checkbox-label">Remember me</span>
            </label>
            <a href="#" className="forgot-link">Forgot password?</a>
          </div>

          <button type="submit" className="btn-login" disabled={loading}>
            {loading ? (
              <>
                <span className="spinner"></span>
                Authenticating...
              </>
            ) : (
              <>
                Sign In
                <svg className="arrow-icon" viewBox="0 0 24 24" fill="none">
                  <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </>
            )}
          </button>
        </form>

        <div className="security-footer">
          <div className="security-badge">
            <svg viewBox="0 0 24 24" fill="none">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" fill="currentColor" opacity="0.2"/>
              <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span>256-bit SSL Encrypted</span>
          </div>
          <div className="security-text">
            Protected by enterprise-grade security
          </div>
        </div>
      </div>

      <style>{`
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        .login-container {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #1e3c72 0%, #2a5298 50%, #7e22ce 100%);
          padding: 20px;
          position: relative;
          overflow: hidden;
        }

        /* Animated Particles */
        .particles-background {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          overflow: hidden;
          pointer-events: none;
        }

        .particle {
          position: absolute;
          background: rgba(255, 255, 255, 0.5);
          border-radius: 50%;
          animation: float 20s infinite ease-in-out;
        }

        @keyframes float {
          0%, 100% {
            transform: translateY(0) translateX(0);
            opacity: 0;
          }
          10% {
            opacity: 1;
          }
          90% {
            opacity: 1;
          }
          100% {
            transform: translateY(-100vh) translateX(100px);
            opacity: 0;
          }
        }

        /* Gradient Orbs */
        .gradient-orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(80px);
          opacity: 0.6;
          animation: pulse 8s ease-in-out infinite;
        }

        .orb-1 {
          width: 400px;
          height: 400px;
          background: radial-gradient(circle, rgba(126, 34, 206, 0.4) 0%, transparent 70%);
          top: -200px;
          left: -200px;
          animation-delay: 0s;
        }

        .orb-2 {
          width: 500px;
          height: 500px;
          background: radial-gradient(circle, rgba(59, 130, 246, 0.4) 0%, transparent 70%);
          bottom: -250px;
          right: -250px;
          animation-delay: 2s;
        }

        .orb-3 {
          width: 300px;
          height: 300px;
          background: radial-gradient(circle, rgba(168, 85, 247, 0.4) 0%, transparent 70%);
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          animation-delay: 4s;
        }

        @keyframes pulse {
          0%, 100% {
            transform: scale(1) translate(0, 0);
          }
          50% {
            transform: scale(1.2) translate(20px, -20px);
          }
        }

        /* Main Card */
        .login-card {
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(20px);
          border-radius: 24px;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3),
                      0 0 0 1px rgba(255, 255, 255, 0.1);
          max-width: 480px;
          width: 100%;
          overflow: hidden;
          position: relative;
          animation: slideUp 0.6s ease-out;
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        /* Header */
        .login-header {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          padding: 40px 30px;
          text-align: center;
          position: relative;
          overflow: hidden;
        }

        .login-header::before {
          content: '';
          position: absolute;
          top: -50%;
          left: -50%;
          width: 200%;
          height: 200%;
          background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%);
          animation: rotate 20s linear infinite;
        }

        @keyframes rotate {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        .logo-container {
          position: relative;
          z-index: 1;
          text-align: center;
        }

        .logo-icon {
          width: 120px;
          height: 120px;
          object-fit: contain;
          margin: 0 auto 20px;
          display: block;
          animation: float-logo 3s ease-in-out infinite;
        }

        @keyframes float-logo {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }

        .company-name {
          margin: 0 0 8px 0;
          color: white;
          font-size: 28px;
          font-weight: 700;
          letter-spacing: 1px;
          text-shadow: 0 2px 10px rgba(0,0,0,0.2);
        }

        .tagline {
          margin: 0;
          color: rgba(255, 255, 255, 0.9);
          font-size: 14px;
          font-weight: 400;
        }

        /* Form */
        .login-form {
          padding: 40px 30px 30px;
        }

        .form-header {
          margin-bottom: 30px;
          text-align: center;
        }

        .form-header h2 {
          margin: 0 0 8px 0;
          color: #1f2937;
          font-size: 24px;
          font-weight: 700;
        }

        .form-header p {
          margin: 0;
          color: #6b7280;
          font-size: 14px;
        }

        /* Error Message */
        .error-message {
          background: linear-gradient(135deg, #fee2e2 0%, #fecaca 100%);
          border-left: 4px solid #ef4444;
          color: #b91c1c;
          padding: 14px 16px;
          margin-bottom: 24px;
          border-radius: 12px;
          display: flex;
          align-items: flex-start;
          gap: 12px;
          animation: shake 0.5s, fadeIn 0.3s;
        }

        .error-icon {
          font-size: 20px;
          flex-shrink: 0;
        }

        .error-text {
          flex: 1;
          font-size: 14px;
          font-weight: 500;
        }

        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
          20%, 40%, 60%, 80% { transform: translateX(5px); }
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        /* Form Groups */
        .form-group {
          margin-bottom: 24px;
          position: relative;
        }

        .form-group label {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 10px;
          font-weight: 600;
          color: #374151;
          font-size: 14px;
          transition: color 0.3s;
        }

        .form-group.focused label {
          color: #667eea;
        }

        .label-icon {
          font-size: 16px;
        }

        .input-wrapper {
          position: relative;
        }

        .input-wrapper input {
          width: 100%;
          padding: 14px 16px;
          border: 2px solid #e5e7eb;
          border-radius: 12px;
          font-size: 15px;
          background: white;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          outline: none;
        }

        .input-wrapper input:focus {
          border-color: #667eea;
          box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.1);
          transform: translateY(-1px);
        }

        .input-wrapper input::placeholder {
          color: #9ca3af;
        }

        .input-border {
          position: absolute;
          bottom: 0;
          left: 0;
          width: 0;
          height: 2px;
          background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
          transition: width 0.3s ease;
        }

        .form-group.focused .input-border {
          width: 100%;
        }

        /* Password Input */
        .password-wrapper {
          position: relative;
        }

        .password-wrapper input {
          padding-right: 48px;
        }

        .toggle-password {
          position: absolute;
          right: 12px;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          width: 24px;
          height: 24px;
          cursor: pointer;
          color: #9ca3af;
          transition: all 0.3s;
          padding: 0;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .toggle-password:hover {
          color: #667eea;
          transform: translateY(-50%) scale(1.1);
        }

        .toggle-password svg {
          width: 20px;
          height: 20px;
        }

        /* Form Options */
        .form-options {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 28px;
          font-size: 14px;
        }

        .checkbox-container {
          display: flex;
          align-items: center;
          gap: 8px;
          cursor: pointer;
          user-select: none;
        }

        .checkbox-container input[type="checkbox"] {
          position: absolute;
          opacity: 0;
        }

        .checkmark {
          width: 18px;
          height: 18px;
          border: 2px solid #d1d5db;
          border-radius: 4px;
          position: relative;
          transition: all 0.3s;
        }

        .checkbox-container input[type="checkbox"]:checked ~ .checkmark {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-color: #667eea;
        }

        .checkbox-container input[type="checkbox"]:checked ~ .checkmark::after {
          content: '✓';
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          color: white;
          font-size: 12px;
          font-weight: bold;
        }

        .checkbox-label {
          color: #6b7280;
          font-weight: 500;
        }

        .forgot-link {
          color: #667eea;
          text-decoration: none;
          font-weight: 600;
          transition: color 0.3s;
        }

        .forgot-link:hover {
          color: #764ba2;
          text-decoration: underline;
        }

        /* Login Button */
        .btn-login {
          width: 100%;
          padding: 16px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          border-radius: 12px;
          font-size: 16px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.3s;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          position: relative;
          overflow: hidden;
        }

        .btn-login::before {
          content: '';
          position: absolute;
          top: 50%;
          left: 50%;
          width: 0;
          height: 0;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.2);
          transition: width 0.6s, height 0.6s, top 0.6s, left 0.6s;
        }

        .btn-login:hover:not(:disabled)::before {
          width: 300px;
          height: 300px;
          top: calc(50% - 150px);
          left: calc(50% - 150px);
        }

        .btn-login:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 12px 24px rgba(102, 126, 234, 0.4);
        }

        .btn-login:active:not(:disabled) {
          transform: translateY(0);
        }

        .btn-login:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .btn-login > * {
          position: relative;
          z-index: 1;
        }

        .arrow-icon {
          width: 20px;
          height: 20px;
          transition: transform 0.3s;
        }

        .btn-login:hover:not(:disabled) .arrow-icon {
          transform: translateX(4px);
        }

        /* Spinner */
        .spinner {
          width: 20px;
          height: 20px;
          border: 3px solid rgba(255, 255, 255, 0.3);
          border-top-color: white;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        /* Security Footer */
        .security-footer {
          padding: 20px 30px;
          background: linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%);
          border-top: 1px solid #e5e7eb;
        }

        .security-badge {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          color: #10b981;
          font-weight: 600;
          font-size: 14px;
          margin-bottom: 8px;
        }

        .security-badge svg {
          width: 20px;
          height: 20px;
        }

        .security-text {
          text-align: center;
          color: #6b7280;
          font-size: 12px;
        }

        /* Responsive */
        @media (max-width: 640px) {
          .login-card {
            max-width: 100%;
            border-radius: 16px;
          }

          .login-header {
            padding: 30px 20px;
          }

          .company-name {
            font-size: 24px;
          }

          .login-form {
            padding: 30px 20px 20px;
          }

          .form-header h2 {
            font-size: 20px;
          }

          .social-login {
            flex-direction: column;
          }

          .orb-1, .orb-2, .orb-3 {
            display: none;
          }
        }
      `}</style>
    </div>
  )
}

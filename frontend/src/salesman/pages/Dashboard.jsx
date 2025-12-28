import React, { useState, useEffect } from 'react';
import StatCard from '../components/StatCard';
import AttendanceCard from '../components/AttendanceCard';
import AdvancedAnalytics from '../components/AdvancedAnalytics';
import { getDashboardStats } from '../hooks/useSalesmanApi';
import '../styles/salesman.css';
import '../styles/salesman-dashboard.css';

/**
 * Dashboard - Enhanced Salesman portal home page
 * Shows stats overview + analytics + optional attendance reminder
 * NO forced attendance blocking
 * Supports Admin View Mode via isAdminView prop
 */
export default function Dashboard({ userId = null, isAdminView = false }) {
  const [stats, setStats] = useState({
    attendanceMarked: false,
    todayCalls: 0,
    todayEnquiries: 0,
    todayOrders: 0,
    pendingFollowUps: 0,
    activeEnquiries: 0,
    ordersThisMonth: 0,
    timeline: []
  });
  const [loading, setLoading] = useState(true);
  const [showAnalytics, setShowAnalytics] = useState(false);

  useEffect(() => {
    loadDashboard();
  }, [userId]);

  const loadDashboard = async () => {
    try {
      const params = userId ? `?user_id=${userId}` : '';
      const data = await getDashboardStats(params);
      setStats(data);
    } catch (error) {
      console.error('Failed to load dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="dash-top">
        <div className="dash-top-left">
          <h1 className="dash-title">Dashboard</h1>
          <p className="dash-subtitle">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Top: Title + Analytics Toggle */}
      <div className="dash-top">
        <div className="dash-top-left">
          <h1 className="dash-title">Dashboard</h1>
          <p className="dash-subtitle">Overview of your sales activities</p>
        </div>
        <button className="dash-analytics-btn" onClick={() => setShowAnalytics(!showAnalytics)}>
          <span className="icon">📈</span>
          <span>{showAnalytics ? 'Hide Analytics' : 'Show Analytics'}</span>
        </button>
      </div>

      {/* Attendance Reminder - redesigned banner */}
      <div className="dash-attendance">
        <AttendanceCard marked={stats.attendanceMarked} />
      </div>

      {/* Performance section */}
      <div className="perf-header">
        <span className="perf-icon">📊</span>
        <h2 className="perf-title">Today's Performance</h2>
      </div>
      <div className="metrics-grid">
        <div className="metric-card">
          <div className="metric-left">
            <div className="metric-label">Enquiries Created</div>
            <div className="metric-sub">{stats.activeEnquiries} active total</div>
          </div>
          <div className="metric-right">
            <div className="metric-badge" aria-label="enquiries">📋</div>
            <div className="metric-value">{stats.todayEnquiries}</div>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-left">
            <div className="metric-label">Calls Made</div>
            <div className="metric-sub">Customer interactions</div>
          </div>
          <div className="metric-right">
            <div className="metric-badge" aria-label="calls">📞</div>
            <div className="metric-value">{stats.todayCalls}</div>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-left">
            <div className="metric-label">Pending Follow-Ups</div>
            <div className="metric-sub">{stats.pendingFollowUps > 0 ? 'Needs attention' : 'All clear'}</div>
          </div>
          <div className="metric-right">
            <div className={`metric-badge ${stats.pendingFollowUps > 0 ? 'danger' : 'success'}`} aria-label="pending">⏰</div>
            <div className="metric-value">{stats.pendingFollowUps}</div>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-left">
            <div className="metric-label">Orders Created</div>
            <div className="metric-sub">{stats.ordersThisMonth} this month</div>
          </div>
          <div className="metric-right">
            <div className="metric-badge" aria-label="orders">🎉</div>
            <div className="metric-value">{stats.todayOrders}</div>
          </div>
        </div>
      </div>

      {/* Timeline View */}
      {stats.timeline && stats.timeline.length > 0 && (
        <div className="page-section">
          <h3 className="section-title">📅 Today's Activity Timeline</h3>
          <div style={{ 
            background: '#FFFFFF', 
            borderRadius: '12px', 
            padding: '20px',
            border: '1px solid #E5E7EB',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
          }}>
            {stats.timeline.map((item, index) => (
              <div key={index} style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '16px',
                padding: '16px 0',
                borderBottom: index < stats.timeline.length - 1 ? '1px solid #F3F4F6' : 'none'
              }}>
                {/* Icon Circle */}
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  background: '#F3F4F6',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '18px',
                  flexShrink: 0
                }}>
                  {item.icon}
                </div>
                
                {/* Content */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ 
                    fontSize: '14px', 
                    fontWeight: 600, 
                    color: '#111827',
                    marginBottom: '4px'
                  }}>
                    {item.title}
                  </div>
                  <div style={{ 
                    fontSize: '13px', 
                    color: '#6B7280',
                    marginBottom: '4px'
                  }}>
                    {item.description}
                  </div>
                  <div style={{ 
                    fontSize: '12px', 
                    color: '#9CA3AF'
                  }}>
                    {item.time.toLocaleTimeString('en-US', { 
                      hour: '2-digit', 
                      minute: '2-digit'
                    })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Advanced Analytics Section */}
      {showAnalytics && (
        <div className="dash-analytics">
          <AdvancedAnalytics data={stats} />
        </div>
      )}

      {/* Admin View Notice */}
      {isAdminView && (
        <div className="admin-note">
          <h4>ℹ️ Admin View Mode</h4>
          <p>Staff action buttons are hidden. You can view data and use admin controls only. Employee ID: {userId}</p>
        </div>
      )}
    </div>
  );
}
    

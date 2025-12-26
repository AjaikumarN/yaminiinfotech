import React, { useState, useEffect } from 'react';
import StatCard from '../components/StatCard';
import AttendanceCard from '../components/AttendanceCard';
import AdvancedAnalytics from '../components/AdvancedAnalytics';
import { getDashboardStats } from '../hooks/useSalesmanApi';
import '../styles/salesman.css';

/**
 * Dashboard - Enhanced Salesman portal home page
 * Shows stats overview + analytics + optional attendance reminder
 * NO forced attendance blocking
 */
export default function Dashboard() {
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
  }, []);

  const loadDashboard = async () => {
    try {
      const data = await getDashboardStats();
      setStats(data);
    } catch (error) {
      console.error('Failed to load dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="page-header">
        <h2 className="page-title">Loading...</h2>
      </div>
    );
  }

  return (
    <div>
      {/* Page Header with Analytics Toggle */}
      <div className="page-header">
        <div>
          <h2 className="page-title">Dashboard</h2>
          <p className="page-description">Overview of your sales activities</p>
        </div>
        <button
          className="btn btn-secondary"
          onClick={() => setShowAnalytics(!showAnalytics)}
        >
          {showAnalytics ? '📊 Hide Analytics' : '📈 Show Analytics'}
        </button>
      </div>

      {/* Optional Attendance Reminder */}
      <AttendanceCard marked={stats.attendanceMarked} />

      {/* KPI Cards - Today's Metrics */}
      <div className="page-section">
        <h3 className="section-title">📊 Today's Performance</h3>
        <div className="card-grid">
          <StatCard
            icon="📋"
            label="Enquiries Created"
            value={stats.todayEnquiries}
            iconBg="#FEF3C7"
            subtext={`${stats.activeEnquiries} active total`}
          />
          <StatCard
            icon="📞"
            label="Calls Made"
            value={stats.todayCalls}
            iconBg="#DBEAFE"
            subtext="Customer interactions"
          />
          <StatCard
            icon="⏰"
            label="Pending Follow-Ups"
            value={stats.pendingFollowUps}
            iconBg={stats.pendingFollowUps > 0 ? '#FEE2E2' : '#D1FAE5'}
            subtext={stats.pendingFollowUps > 0 ? 'Needs attention' : 'All clear'}
          />
          <StatCard
            icon="🎉"
            label="Orders Created"
            value={stats.todayOrders}
            iconBg="#D1FAE5"
            subtext={`${stats.ordersThisMonth} this month`}
          />
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
            
            {/* No activity message */}
            {stats.timeline.length === 0 && (
              <div style={{ textAlign: 'center', padding: '40px 20px', color: '#9CA3AF' }}>
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>📭</div>
                <div style={{ fontSize: '14px', fontWeight: 500 }}>No activity recorded today</div>
                <div style={{ fontSize: '12px', marginTop: '8px' }}>
                  Start by marking attendance or logging a call
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Old Stats Grid - Hidden when timeline exists */}
      {false && (
        <div className="card-grid">
          <StatCard
            icon="📞"
            label="Calls Today"
            value={stats.todayCalls}
            iconBg="#DBEAFE"
          />
          <StatCard
            icon="📋"
            label="Active Enquiries"
            value={stats.activeEnquiries}
            iconBg="#FEF3C7"
          />
          <StatCard
            icon="🧾"
            label="Orders This Month"
            value={stats.ordersThisMonth}
            iconBg="#D1FAE5"
          />
          <StatCard
            icon="🕘"
            label="Attendance Status"
            value={stats.attendanceMarked ? 'Marked' : 'Not Marked'}
            iconBg={stats.attendanceMarked ? '#D1FAE5' : '#FEE2E2'}
          />
        </div>
      )}

      {/* Advanced Analytics Section */}
      {showAnalytics && (
        <div className="page-section">
          <AdvancedAnalytics data={stats} />
        </div>
      )}

      {/* Quick Actions */}
      <div className="page-section">
        <h3 className="section-title">Quick Actions</h3>
        <div className="card-grid">
          <a href="/salesman/calls" className="action-card">
            <div className="action-icon" style={{ background: '#DBEAFE' }}>📞</div>
            <div className="action-title">Log a Call</div>
            <div className="action-description">Record customer interaction</div>
          </a>
          <a href="/salesman/enquiries" className="action-card">
            <div className="action-icon" style={{ background: '#FEF3C7' }}>📋</div>
            <div className="action-title">View Enquiries</div>
            <div className="action-description">Manage your leads</div>
          </a>
          <a href="/salesman/daily-report" className="action-card">
            <div className="action-icon" style={{ background: '#E0E7FF' }}>📝</div>
            <div className="action-title">Daily Report</div>
            <div className="action-description">Submit end of day report</div>
          </a>
        </div>
      </div>

      {/* Performance Tips */}
      <div className="page-section">
        <div style={{ padding: '20px', background: '#EFF6FF', borderRadius: '12px', borderLeft: '4px solid #2563EB' }}>
          <h4 style={{ margin: '0 0 8px 0', color: '#1E40AF' }}>💡 Pro Tip</h4>
          <p style={{ margin: 0, color: '#1E40AF', fontSize: '14px' }}>
            Use <kbd style={{ padding: '2px 6px', background: '#FFF', borderRadius: '4px', border: '1px solid #BFDBFE' }}>⌘K</kbd> or <kbd style={{ padding: '2px 6px', background: '#FFF', borderRadius: '4px', border: '1px solid #BFDBFE' }}>Ctrl+K</kbd> to quickly search for customers, enquiries, and orders
          </p>
        </div>
      </div>
    </div>
  );
}

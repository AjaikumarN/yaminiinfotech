import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../contexts/AuthContext';
import { apiRequest } from '../../utils/api';

const EngineerDashboard = ({ userId = null, isAdminView = false }) => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const [stats, setStats] = useState({
    assigned: 0,
    in_progress: 0,
    completed_today: 0,
    sla_warning: 0,
    pending_feedback: 0,
    avg_rating: 0
  });
  
  const [recentJobs, setRecentJobs] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 30000);
    return () => clearInterval(interval);
  }, [userId]);

  const fetchDashboardData = async () => {
    try {
      // If admin view, add user_id parameter
      const params = userId ? `?user_id=${userId}` : '';
      const [servicesData, analyticsData] = await Promise.all([
        apiRequest(`/api/service-requests/my-services${params}`),
        apiRequest(`/api/feedback/engineer/analytics${params}`).catch(() => null)
      ]);

      calculateStats(servicesData, analyticsData);
      setRecentJobs(servicesData.slice(0, 5));
      setAnalytics(analyticsData);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (services, analyticsData) => {
    const now = new Date();
    const todayStart = new Date(now.setHours(0,0,0,0));

    setStats({
      assigned: services.filter(s => s.status === 'ASSIGNED').length,
      in_progress: services.filter(s => 
        s.status === 'IN_PROGRESS' || s.status === 'ON_THE_WAY'
      ).length,
      completed_today: services.filter(s => 
        s.status === 'COMPLETED' && 
        new Date(s.resolved_at) >= todayStart
      ).length,
      sla_warning: services.filter(s => 
        s.sla_status?.status === 'warning' || s.sla_status?.status === 'breached'
      ).length,
      pending_feedback: services.filter(s => 
        s.status === 'COMPLETED' && !s.feedback_submitted
      ).length,
      avg_rating: analyticsData?.average_rating || 0
    });
  };

  const getSLAColor = (status) => {
    const colors = {
      ok: '#10b981',
      warning: '#f59e0b',
      breached: '#ef4444',
      paused: '#6b7280'
    };
    return colors[status] || '#6b7280';
  };

  const getPriorityBadge = (priority) => {
    const badges = {
      CRITICAL: { color: '#dc2626', icon: '🔴' },
      URGENT: { color: '#f59e0b', icon: '🟠' },
      NORMAL: { color: '#10b981', icon: '🟢' }
    };
    return badges[priority] || badges.NORMAL;
  };

  if (loading) {
    return (
      <div className="engineer-loading">
        <div className="spinner"></div>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="engineer-dashboard">
      {/* Header */}
      <div className="dashboard-header">
        <div className="header-left">
          <h1>🔧 Dashboard</h1>
          <p>Welcome back, <strong>{user?.full_name || user?.name}</strong>{isAdminView && ` (Admin viewing Engineer ${userId})`}</p>
        </div>
        {!isAdminView && (
          <div className="header-right">
            <div className="quick-actions">
              <button 
                className="btn-quick-action"
                onClick={() => navigate('/service-engineer/jobs')}
              >
                📋 View Jobs
              </button>
              <button 
                className="btn-quick-action"
                onClick={() => navigate('/service-engineer/sla-tracker')}
              >
                ⏱ SLA Tracker
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Stats Grid */}
      <div className="stats-grid">
        <div className="stat-card stat-primary">
          <div className="stat-icon">📋</div>
          <div className="stat-content">
            <h3>{stats.assigned}</h3>
            <p>Assigned Jobs</p>
          </div>
        </div>

        <div className="stat-card stat-info">
          <div className="stat-icon">🔄</div>
          <div className="stat-content">
            <h3>{stats.in_progress}</h3>
            <p>In Progress</p>
          </div>
        </div>

        <div className="stat-card stat-success">
          <div className="stat-icon">✅</div>
          <div className="stat-content">
            <h3>{stats.completed_today}</h3>
            <p>Completed Today</p>
          </div>
        </div>

        <div className="stat-card stat-warning">
          <div className="stat-icon">⚠️</div>
          <div className="stat-content">
            <h3>{stats.sla_warning}</h3>
            <p>SLA Warnings</p>
          </div>
        </div>

        <div className="stat-card stat-feedback">
          <div className="stat-icon">⭐</div>
          <div className="stat-content">
            <h3>{stats.pending_feedback}</h3>
            <p>Pending Feedback</p>
          </div>
        </div>

        {analytics && (
          <div className="stat-card stat-rating">
            <div className="stat-icon">🏆</div>
            <div className="stat-content">
              <h3>{analytics.average_rating?.toFixed(1) || '0.0'}</h3>
              <p>Avg Rating</p>
            </div>
          </div>
        )}
      </div>

      {/* Recent Jobs */}
      <div className="recent-jobs-section">
        <div className="section-header">
          <h2>📋 Recent Assignments</h2>
          <button 
            className="btn-view-all"
            onClick={() => navigate('/service-engineer/jobs')}
          >
            View All →
          </button>
        </div>

        <div className="jobs-list">
          {recentJobs.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📭</div>
              <p>No assigned jobs at the moment</p>
            </div>
          ) : (
            recentJobs.map(job => (
              <div key={job.id} className="job-card">
                <div className="job-header">
                  <div className="job-ticket">
                    <span className="ticket-icon">🎫</span>
                    <strong>{job.ticket_no}</strong>
                  </div>
                  <div className="job-badges">
                    {job.priority && (
                      <span 
                        className="priority-badge"
                        style={{ 
                          background: getPriorityBadge(job.priority).color,
                          color: 'white',
                          padding: '4px 8px',
                          borderRadius: '4px',
                          fontSize: '11px'
                        }}
                      >
                        {getPriorityBadge(job.priority).icon} {job.priority}
                      </span>
                    )}
                    {job.sla_status && (
                      <span 
                        className="sla-badge"
                        style={{ 
                          background: getSLAColor(job.sla_status.status),
                          color: 'white',
                          padding: '4px 8px',
                          borderRadius: '4px',
                          fontSize: '11px'
                        }}
                      >
                        SLA: {job.sla_status.status.toUpperCase()}
                      </span>
                    )}
                  </div>
                </div>

                <div className="job-content">
                  <h3>{job.customer_name}</h3>
                  <p className="job-description">{job.issue_description}</p>
                  <div className="job-meta">
                    <span>🏢 {job.customer_company || 'N/A'}</span>
                    <span>📞 {job.customer_phone}</span>
                    <span>📍 {job.location || 'Location not set'}</span>
                  </div>
                </div>

                <div className="job-footer">
                  <span className="status-badge status-{job.status.toLowerCase()}">
                    {job.status}
                  </span>
                  <button 
                    className="btn-view-job"
                    onClick={() => navigate('/service-engineer/jobs')}
                  >
                    View Details →
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Performance Analytics */}
      {analytics && (
        <div className="analytics-section">
          <h2>📊 Your Performance</h2>
          <div className="analytics-grid">
            <div className="analytics-card">
              <div className="analytics-label">Total Jobs Completed</div>
              <div className="analytics-value">{analytics.total_jobs_completed || 0}</div>
            </div>
            <div className="analytics-card">
              <div className="analytics-label">Average Rating</div>
              <div className="analytics-value">
                ⭐ {analytics.average_rating?.toFixed(1) || '0.0'}
              </div>
            </div>
            <div className="analytics-card">
              <div className="analytics-label">Feedback Received</div>
              <div className="analytics-value">{analytics.feedback_count || 0}</div>
            </div>
            <div className="analytics-card">
              <div className="analytics-label">SLA Compliance</div>
              <div className="analytics-value">
                {analytics.sla_compliance_rate 
                  ? `${(analytics.sla_compliance_rate * 100).toFixed(1)}%`
                  : 'N/A'
                }
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .engineer-dashboard {
          padding: 24px;
          max-width: 1400px;
          margin: 0 auto;
        }

        .dashboard-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
        }

        .dashboard-header h1 {
          font-size: 28px;
          margin: 0;
          color: #1f2937;
        }

        .dashboard-header p {
          color: #6b7280;
          margin: 4px 0 0 0;
        }

        .quick-actions {
          display: flex;
          gap: 12px;
        }

        .btn-quick-action {
          padding: 10px 20px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 600;
          transition: all 0.3s;
        }

        .btn-quick-action:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 16px;
          margin-bottom: 32px;
        }

        .stat-card {
          background: white;
          padding: 20px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          gap: 16px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.05);
          transition: all 0.3s;
        }

        .stat-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 24px rgba(0,0,0,0.1);
        }

        .stat-icon {
          font-size: 32px;
        }

        .stat-content h3 {
          font-size: 32px;
          margin: 0;
          color: #1f2937;
        }

        .stat-content p {
          margin: 4px 0 0 0;
          color: #6b7280;
          font-size: 14px;
        }

        .recent-jobs-section {
          background: white;
          padding: 24px;
          border-radius: 12px;
          margin-bottom: 24px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.05);
        }

        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }

        .section-header h2 {
          margin: 0;
          color: #1f2937;
        }

        .btn-view-all {
          background: transparent;
          border: 1px solid #667eea;
          color: #667eea;
          padding: 8px 16px;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 600;
          transition: all 0.3s;
        }

        .btn-view-all:hover {
          background: #667eea;
          color: white;
        }

        .jobs-list {
          display: grid;
          gap: 16px;
        }

        .job-card {
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          padding: 16px;
          transition: all 0.3s;
        }

        .job-card:hover {
          border-color: #667eea;
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.1);
        }

        .job-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
        }

        .job-ticket {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .job-badges {
          display: flex;
          gap: 8px;
        }

        .job-content h3 {
          margin: 0 0 8px 0;
          color: #1f2937;
        }

        .job-description {
          color: #6b7280;
          margin: 0 0 12px 0;
        }

        .job-meta {
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
          font-size: 13px;
          color: #6b7280;
        }

        .job-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: 12px;
          padding-top: 12px;
          border-top: 1px solid #e5e7eb;
        }

        .status-badge {
          padding: 4px 12px;
          border-radius: 12px;
          font-size: 12px;
          font-weight: 600;
        }

        .status-assigned {
          background: #dbeafe;
          color: #1e40af;
        }

        .status-in_progress {
          background: #fef3c7;
          color: #92400e;
        }

        .status-on_the_way {
          background: #e0e7ff;
          color: #3730a3;
        }

        .btn-view-job {
          background: transparent;
          border: none;
          color: #667eea;
          cursor: pointer;
          font-weight: 600;
        }

        .btn-view-job:hover {
          text-decoration: underline;
        }

        .empty-state {
          text-align: center;
          padding: 48px;
          color: #6b7280;
        }

        .empty-icon {
          font-size: 48px;
          margin-bottom: 16px;
        }

        .analytics-section {
          background: white;
          padding: 24px;
          border-radius: 12px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.05);
        }

        .analytics-section h2 {
          margin: 0 0 20px 0;
          color: #1f2937;
        }

        .analytics-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 16px;
        }

        .analytics-card {
          background: linear-gradient(135deg, #f5f7fa 0%, #e8eef5 100%);
          padding: 20px;
          border-radius: 8px;
          text-align: center;
        }

        .analytics-label {
          font-size: 13px;
          color: #6b7280;
          margin-bottom: 8px;
        }

        .analytics-value {
          font-size: 28px;
          font-weight: 700;
          color: #1f2937;
        }

        .engineer-loading {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 400px;
        }

        .spinner {
          width: 40px;
          height: 40px;
          border: 4px solid #e5e7eb;
          border-top-color: #667eea;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default EngineerDashboard;

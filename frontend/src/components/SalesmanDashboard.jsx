import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import { apiRequest } from '../utils/api';

const SalesmanDashboard = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    todayFollowups: [],
    overdueFollowups: [],
    assignedEnquiries: [],
    recentVisits: [],
    dailyReport: null,
    attendance: null,
    performance: {
      totalLeads: 0,
      contacted: 0,
      converted: 0,
      conversionRate: 0,
      revenue: 0
    }
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchDashboardData();
      const interval = setInterval(fetchDashboardData, 60000); // Refresh every minute
      return () => clearInterval(interval);
    }
  }, [user]);

  const fetchDashboardData = async () => {
    if (!user) return;

    try {
      const today = new Date().toISOString().split('T')[0];
      
      const [enquiries, followups, visits, reports, attendance] = await Promise.all([
        apiRequest(`/api/enquiries?assigned_to=${user.id}`).catch(() => []),
        apiRequest(`/api/enquiries/followups`).catch(() => []),
        apiRequest(`/api/sales/my-visits`).catch(() => []),
        apiRequest(`/api/reports/my-reports?days=1`).catch(() => []),
        apiRequest(`/api/sales/my-attendance?date=${today}`).catch(() => [])
      ]);

      const enquiriesData = enquiries || [];
      const followupsData = followups || [];
      const visitsData = visits || [];
      const reportsData = reports || [];
      const attendanceData = attendance || [];

      // Today's follow-ups
      const todayFollowups = followupsData.filter(f => 
        f.followup_date?.startsWith(today) && f.status === 'Pending'
      );

      // Overdue follow-ups
      const now = new Date();
      const overdueFollowups = followupsData.filter(f => {
        if (f.status !== 'Pending') return false;
        const scheduledDate = new Date(f.followup_date);
        return scheduledDate < now;
      });

      // Calculate performance metrics
      const contacted = enquiriesData.filter(e => e.status !== 'New').length;
      const converted = enquiriesData.filter(e => e.status === 'Converted').length;
      const conversionRate = enquiriesData.length > 0 
        ? ((converted / enquiriesData.length) * 100).toFixed(1)
        : 0;

      setStats({
        todayFollowups,
        overdueFollowups,
        assignedEnquiries: enquiriesData,
        recentVisits: visitsData.slice(0, 5),
        dailyReport: reportsData[0] || null,
        attendance: attendanceData[0] || null,
        performance: {
          totalLeads: enquiriesData.length,
          contacted,
          converted,
          conversionRate,
          revenue: 0 // Will be calculated from sales data
        }
      });
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getPriorityColor = (priority) => {
    const colors = {
      HOT: '#dc3545',
      WARM: '#ffc107',
      COLD: '#17a2b8'
    };
    return colors[priority] || '#6c757d';
  };

  const getTimeDifference = (date) => {
    const diff = Date.now() - new Date(date).getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);
    
    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    return 'Just now';
  };

  if (loading) {
    return <div className="loading">⏳ Loading dashboard...</div>;
  }

  return (
    <div className="salesman-dashboard">
      {/* Header */}
      <div className="dashboard-header">
        <div>
          <h1>🎯 Sales Dashboard</h1>
          <p>Welcome back, {user?.full_name || user?.username}!</p>
        </div>
        <div className="header-actions">
          <button 
            className={`btn-attendance ${stats.attendance ? 'checked-in' : ''}`}
            onClick={() => navigate('/salesman/attendance')}
          >
            {stats.attendance ? '✅ Checked In' : '⏰ Mark Attendance'}
          </button>
          <button className="btn-refresh" onClick={fetchDashboardData}>
            🔄 Refresh
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="metrics-grid">
        <div className="metric-card">
          <div className="metric-icon" style={{ background: '#667eea' }}>📋</div>
          <div className="metric-info">
            <h3>{stats.performance.totalLeads}</h3>
            <p>Total Leads Assigned</p>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon" style={{ background: '#28a745' }}>📞</div>
          <div className="metric-info">
            <h3>{stats.performance.contacted}</h3>
            <p>Leads Contacted</p>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon" style={{ background: '#ffc107' }}>💰</div>
          <div className="metric-info">
            <h3>{stats.performance.converted}</h3>
            <p>Converted Sales</p>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon" style={{ background: '#17a2b8' }}>📈</div>
          <div className="metric-info">
            <h3>{stats.performance.conversionRate}%</h3>
            <p>Conversion Rate</p>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon" style={{ background: '#dc3545' }}>⚠️</div>
          <div className="metric-info">
            <h3>{stats.overdueFollowups.length}</h3>
            <p>Overdue Follow-ups</p>
          </div>
        </div>
      </div>

      {/* Today's Tasks */}
      <div className="tasks-section">
        <div className="panel">
          <div className="panel-header">
            <h2>📅 Today's Follow-ups</h2>
            <span className="badge">{stats.todayFollowups.length} pending</span>
          </div>
          <div className="panel-content">
            {stats.todayFollowups.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">✅</div>
                <p>No follow-ups scheduled for today</p>
              </div>
            ) : (
              <div className="followup-list">
                {stats.todayFollowups.map(followup => (
                  <div key={followup.id} className="followup-card">
                    <div className="followup-header">
                      <h4>{followup.customer_name || `Enquiry #${followup.enquiry_id}`}</h4>
                      <span className="followup-time">
                        {new Date(followup.followup_date).toLocaleTimeString('en-US', { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </span>
                    </div>
                    <p className="followup-note">{followup.note}</p>
                    <div className="followup-actions">
                      <button 
                        className="btn-primary"
                        onClick={() => navigate(`/enquiries/${followup.enquiry_id}`)}
                      >
                        View Details
                      </button>
                      <button 
                        className="btn-success"
                        onClick={() => navigate('/salesman/followups')}
                      >
                        Mark Complete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Overdue Follow-ups Alert */}
        {stats.overdueFollowups.length > 0 && (
          <div className="panel alert-panel">
            <div className="panel-header alert">
              <h2>⚠️ Overdue Follow-ups</h2>
              <span className="badge badge-danger">{stats.overdueFollowups.length}</span>
            </div>
            <div className="panel-content">
              <div className="followup-list">
                {stats.overdueFollowups.slice(0, 3).map(followup => (
                  <div key={followup.id} className="followup-card alert">
                    <div className="followup-header">
                      <h4>{followup.customer_name || `Enquiry #${followup.enquiry_id}`}</h4>
                      <span className="overdue-tag">
                        {getTimeDifference(followup.followup_date)}
                      </span>
                    </div>
                    <p className="followup-note">{followup.note}</p>
                    <button 
                      className="btn-primary"
                      onClick={() => navigate(`/salesman/enquiries/${followup.enquiry_id}`)}
                    >
                      Follow Up Now
                    </button>
                  </div>
                ))}
              </div>
              {stats.overdueFollowups.length > 3 && (
                <button 
                  className="btn-link"
                  onClick={() => navigate('/salesman/followups?filter=overdue')}
                >
                  View all {stats.overdueFollowups.length} overdue follow-ups →
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="quick-actions-panel">
        <h2>⚡ Quick Actions</h2>
        <div className="actions-grid">
          <button className="action-btn" onClick={() => navigate('/salesman/enquiries')}>
            <span className="action-icon">📋</span>
            <span className="action-text">My Enquiries</span>
            <span className="action-count">{stats.assignedEnquiries.length}</span>
          </button>
          <button className="action-btn" onClick={() => navigate('/salesman/followups')}>
            <span className="action-icon">🔄</span>
            <span className="action-text">Follow-ups</span>
            <span className="action-count">{stats.todayFollowups.length}</span>
          </button>
          <button className="action-btn" onClick={() => navigate('/salesman/visits')}>
            <span className="action-icon">🏢</span>
            <span className="action-text">Field Visits</span>
          </button>
          <button className="action-btn" onClick={() => navigate('/salesman/daily-report')}>
            <span className="action-icon">📝</span>
            <span className="action-text">Daily Report</span>
            {!stats.dailyReport && <span className="action-badge">Due</span>}
          </button>
          <button className="action-btn" onClick={() => navigate('/products')}>
            <span className="action-icon">📦</span>
            <span className="action-text">Product Catalog</span>
          </button>
          <button className="action-btn" onClick={() => navigate('/salesman/performance')}>
            <span className="action-icon">📊</span>
            <span className="action-text">My Performance</span>
          </button>
        </div>
      </div>

      <style>{`
        .salesman-dashboard {
          padding: 20px;
          background: #f5f7fa;
          min-height: 100vh;
        }

        .dashboard-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 30px;
          background: white;
          padding: 25px;
          border-radius: 12px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }

        .dashboard-header h1 {
          margin: 0 0 5px 0;
          color: #1a1a1a;
        }

        .dashboard-header p {
          margin: 0;
          color: #666;
        }

        .header-actions {
          display: flex;
          gap: 10px;
        }

        .btn-attendance,
        .btn-refresh {
          padding: 12px 24px;
          border: none;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s;
        }

        .btn-attendance {
          background: #ffc107;
          color: #1a1a1a;
        }

        .btn-attendance.checked-in {
          background: #28a745;
          color: white;
        }

        .btn-refresh {
          background: #667eea;
          color: white;
        }

        .btn-refresh:hover {
          background: #5568d3;
        }

        .metrics-grid {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 20px;
          margin-bottom: 30px;
        }

        .metric-card {
          background: white;
          padding: 20px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          gap: 15px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }

        .metric-icon {
          width: 60px;
          height: 60px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 28px;
        }

        .metric-info h3 {
          margin: 0;
          font-size: 28px;
          color: #1a1a1a;
        }

        .metric-info p {
          margin: 5px 0 0 0;
          color: #666;
          font-size: 13px;
        }

        .tasks-section {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
          margin-bottom: 30px;
        }

        .panel {
          background: white;
          border-radius: 12px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }

        .panel.alert-panel {
          border: 2px solid #dc3545;
        }

        .panel-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px;
          border-bottom: 2px solid #f0f0f0;
        }

        .panel-header.alert {
          background: #fff5f5;
          border-bottom-color: #dc3545;
        }

        .panel-header h2 {
          margin: 0;
          font-size: 18px;
          color: #1a1a1a;
        }

        .badge {
          background: #f0f0f0;
          padding: 4px 12px;
          border-radius: 12px;
          font-weight: 700;
          color: #666;
          font-size: 12px;
        }

        .badge-danger {
          background: #dc3545;
          color: white;
        }

        .panel-content {
          padding: 20px;
        }

        .followup-list {
          display: flex;
          flex-direction: column;
          gap: 15px;
        }

        .followup-card {
          padding: 15px;
          background: #f8f9fa;
          border-radius: 8px;
          border-left: 4px solid #667eea;
        }

        .followup-card.alert {
          background: #fff5f5;
          border-left-color: #dc3545;
        }

        .followup-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 8px;
        }

        .followup-header h4 {
          margin: 0;
          font-size: 16px;
          color: #1a1a1a;
        }

        .followup-time {
          font-size: 12px;
          color: #666;
          background: white;
          padding: 4px 8px;
          border-radius: 4px;
        }

        .overdue-tag {
          font-size: 12px;
          color: white;
          background: #dc3545;
          padding: 4px 8px;
          border-radius: 4px;
          font-weight: 600;
        }

        .followup-note {
          margin: 8px 0;
          color: #666;
          font-size: 14px;
        }

        .followup-actions {
          display: flex;
          gap: 10px;
          margin-top: 10px;
        }

        .btn-primary,
        .btn-success {
          padding: 8px 16px;
          border: none;
          border-radius: 6px;
          font-weight: 600;
          cursor: pointer;
          font-size: 13px;
          transition: all 0.3s;
        }

        .btn-primary {
          background: #667eea;
          color: white;
        }

        .btn-primary:hover {
          background: #5568d3;
        }

        .btn-success {
          background: #28a745;
          color: white;
        }

        .btn-success:hover {
          background: #218838;
        }

        .btn-link {
          background: none;
          border: none;
          color: #667eea;
          cursor: pointer;
          font-weight: 600;
          margin-top: 10px;
          width: 100%;
          text-align: center;
          padding: 10px;
        }

        .btn-link:hover {
          text-decoration: underline;
        }

        .empty-state {
          text-align: center;
          padding: 40px 20px;
        }

        .empty-icon {
          font-size: 60px;
          margin-bottom: 15px;
        }

        .empty-state p {
          color: #999;
          font-size: 16px;
          margin: 0;
        }

        .quick-actions-panel {
          background: white;
          padding: 25px;
          border-radius: 12px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }

        .quick-actions-panel h2 {
          margin: 0 0 20px 0;
          color: #1a1a1a;
        }

        .actions-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 15px;
        }

        .action-btn {
          background: #f8f9fa;
          border: 2px solid #e0e0e0;
          padding: 20px;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.3s;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          position: relative;
        }

        .action-btn:hover {
          border-color: #667eea;
          background: white;
          transform: translateY(-4px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        }

        .action-icon {
          font-size: 36px;
        }

        .action-text {
          font-weight: 600;
          color: #1a1a1a;
          font-size: 14px;
        }

        .action-count {
          background: #667eea;
          color: white;
          padding: 4px 12px;
          border-radius: 12px;
          font-size: 12px;
          font-weight: 700;
        }

        .action-badge {
          position: absolute;
          top: 10px;
          right: 10px;
          background: #dc3545;
          color: white;
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 11px;
          font-weight: 700;
        }

        .loading {
          text-align: center;
          padding: 100px 20px;
          font-size: 24px;
          color: #666;
        }

        @media (max-width: 1400px) {
          .metrics-grid {
            grid-template-columns: repeat(3, 1fr);
          }
        }

        @media (max-width: 968px) {
          .metrics-grid {
            grid-template-columns: repeat(2, 1fr);
          }

          .tasks-section {
            grid-template-columns: 1fr;
          }

          .actions-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 576px) {
          .metrics-grid,
          .actions-grid {
            grid-template-columns: 1fr;
          }

          .dashboard-header {
            flex-direction: column;
            gap: 15px;
          }

          .header-actions {
            width: 100%;
            flex-direction: column;
          }

          .btn-attendance,
          .btn-refresh {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
};

export default SalesmanDashboard;

import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import { apiRequest } from '../utils/api';

const SalesmanDashboard = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    todaysCalls: [],
    overdueFollowups: [],
    assignedEnquiries: [],
    thisWeekReport: null
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 60000); // Refresh every minute
    return () => clearInterval(interval);
  }, [user]);

  const fetchDashboardData = async () => {
    if (!user) return;

    try {
      const today = new Date().toISOString().split('T')[0];
      
      const [enquiries, followups] = await Promise.all([
        apiRequest(`/api/enquiries?assigned_to=${user.id}`),
        apiRequest(`/api/followups?user_id=${user.id}`)
      ]);

      const enquiriesData = enquiries || [];
      const followupsData = followups || [];

      // Today's calls (followups scheduled for today)
      const todaysCalls = followupsData.filter(f => 
        f.scheduled_date?.startsWith(today) && f.status === 'Pending'
      );

      // Overdue followups
      const now = new Date();
      const overdueFollowups = followupsData.filter(f => {
        if (f.status !== 'Pending') return false;
        const scheduledDate = new Date(f.scheduled_date);
        return scheduledDate < now;
      });

      setStats({
        todaysCalls,
        overdueFollowups,
        assignedEnquiries: enquiriesData,
        thisWeekReport: null // Will be populated from daily reports API
      });
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const completeFollowup = async (followupId, enquiryId) => {
    try {
      await apiRequest(`/api/followups/${followupId}`, {
        method: 'PUT',
        body: JSON.stringify({
          status: 'Completed',
          completed_at: new Date().toISOString()
        })
      });
      
      // Navigate to enquiry detail for adding notes
      navigate(`/salesman/enquiry/${enquiryId}`);
    } catch (error) {
      console.error('Failed to complete followup:', error);
      alert('Failed to mark followup as complete');
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
      <div className="dashboard-header">
        <div>
          <h1>👋 Welcome, {user?.name}!</h1>
          <p>Here's your sales activity for today</p>
        </div>
        <button className="btn-refresh" onClick={fetchDashboardData}>
          🔄 Refresh
        </button>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#667eea' }}>📞</div>
          <div className="stat-info">
            <h3>{stats.todaysCalls.length}</h3>
            <p>Today's Calls</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#dc3545' }}>⚠️</div>
          <div className="stat-info">
            <h3>{stats.overdueFollowups.length}</h3>
            <p>Overdue Follow-ups</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#28a745' }}>📋</div>
          <div className="stat-info">
            <h3>{stats.assignedEnquiries.length}</h3>
            <p>Assigned Enquiries</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#ffc107' }}>🎯</div>
          <div className="stat-info">
            <h3>
              {stats.assignedEnquiries.filter(e => e.priority === 'HOT').length}
            </h3>
            <p>Hot Leads</p>
          </div>
        </div>
      </div>

      <div className="content-grid">
        {/* Today's Calls */}
        <div className="panel">
          <div className="panel-header">
            <h2>📞 Today's Calls</h2>
            <span className="badge">{stats.todaysCalls.length}</span>
          </div>
          <div className="panel-content">
            {stats.todaysCalls.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">✅</div>
                <p>No calls scheduled for today</p>
              </div>
            ) : (
              <div className="calls-list">
                {stats.todaysCalls.map(call => (
                  <div key={call.id} className="call-item">
                    <div className="call-info">
                      <h4>{call.enquiry?.customer_name || 'Unknown Customer'}</h4>
                      <p className="phone">📱 {call.enquiry?.phone}</p>
                      <p className="time">
                        ⏰ {new Date(call.scheduled_date).toLocaleTimeString('en-US', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                      <p className="notes">{call.notes}</p>
                    </div>
                    <div className="call-actions">
                      <button
                        className="btn-complete"
                        onClick={() => completeFollowup(call.id, call.enquiry_id)}
                      >
                        ✓ Complete
                      </button>
                      <button
                        className="btn-view"
                        onClick={() => navigate(`/salesman/enquiry/${call.enquiry_id}`)}
                      >
                        View Details
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Overdue Follow-ups */}
        <div className="panel">
          <div className="panel-header">
            <h2>⚠️ Overdue Follow-ups</h2>
            <span className="badge alert">{stats.overdueFollowups.length}</span>
          </div>
          <div className="panel-content">
            {stats.overdueFollowups.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">🎉</div>
                <p>No overdue follow-ups!</p>
              </div>
            ) : (
              <div className="calls-list">
                {stats.overdueFollowups.map(followup => (
                  <div key={followup.id} className="call-item urgent">
                    <div className="call-info">
                      <h4>{followup.enquiry?.customer_name || 'Unknown Customer'}</h4>
                      <p className="phone">📱 {followup.enquiry?.phone}</p>
                      <p className="overdue-time">
                        ⏱️ Due {getTimeDifference(followup.scheduled_date)}
                      </p>
                      <p className="notes">{followup.notes}</p>
                    </div>
                    <div className="call-actions">
                      <button
                        className="btn-complete"
                        onClick={() => completeFollowup(followup.id, followup.enquiry_id)}
                      >
                        ✓ Complete
                      </button>
                      <button
                        className="btn-view"
                        onClick={() => navigate(`/salesman/enquiry/${followup.enquiry_id}`)}
                      >
                        View Details
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Assigned Enquiries */}
      <div className="panel full-width">
        <div className="panel-header">
          <h2>📋 My Enquiries</h2>
          <span className="badge">{stats.assignedEnquiries.length}</span>
        </div>
        <div className="panel-content">
          {stats.assignedEnquiries.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📦</div>
              <p>No enquiries assigned yet</p>
            </div>
          ) : (
            <div className="enquiries-grid">
              {stats.assignedEnquiries.map(enq => (
                <div
                  key={enq.id}
                  className="enquiry-card"
                  onClick={() => navigate(`/salesman/enquiry/${enq.id}`)}
                >
                  <div className="card-header">
                    <span
                      className="priority-badge"
                      style={{ background: getPriorityColor(enq.priority) }}
                    >
                      {enq.priority}
                    </span>
                    <span className="time-badge">
                      {getTimeDifference(enq.created_at)}
                    </span>
                  </div>

                  <h3>{enq.customer_name}</h3>
                  <p className="contact-info">
                    📱 {enq.phone}
                    {enq.email && <span> | ✉️ {enq.email}</span>}
                  </p>

                  {enq.product && (
                    <div className="product-tag">
                      🖨️ {enq.product.name}
                    </div>
                  )}

                  <p className="enquiry-details">
                    {enq.enquiry_details?.substring(0, 100)}...
                  </p>

                  <div className="card-footer">
                    <span className="status-badge">{enq.status || 'New'}</span>
                    <span className="arrow">→</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
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

        .btn-refresh {
          padding: 12px 24px;
          background: #667eea;
          color: white;
          border: none;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s;
        }

        .btn-refresh:hover {
          background: #5568d3;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 20px;
          margin-bottom: 30px;
        }

        .stat-card {
          background: white;
          padding: 20px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          gap: 15px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }

        .stat-icon {
          width: 60px;
          height: 60px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 28px;
        }

        .stat-info h3 {
          margin: 0;
          font-size: 32px;
          color: #1a1a1a;
        }

        .stat-info p {
          margin: 5px 0 0 0;
          color: #666;
          font-size: 14px;
        }

        .content-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 20px;
          margin-bottom: 30px;
        }

        .panel {
          background: white;
          border-radius: 12px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }

        .panel.full-width {
          grid-column: 1 / -1;
        }

        .panel-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px;
          border-bottom: 2px solid #f0f0f0;
        }

        .panel-header h2 {
          margin: 0;
          font-size: 20px;
          color: #1a1a1a;
        }

        .badge {
          background: #f0f0f0;
          padding: 4px 12px;
          border-radius: 12px;
          font-weight: 700;
          color: #666;
        }

        .badge.alert {
          background: #dc3545;
          color: white;
        }

        .panel-content {
          padding: 20px;
        }

        .calls-list {
          display: flex;
          flex-direction: column;
          gap: 15px;
        }

        .call-item {
          background: #f8f9fa;
          padding: 15px;
          border-radius: 8px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          transition: all 0.3s;
        }

        .call-item.urgent {
          border-left: 4px solid #dc3545;
        }

        .call-item:hover {
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }

        .call-info h4 {
          margin: 0 0 5px 0;
          color: #1a1a1a;
        }

        .call-info p {
          margin: 3px 0;
          font-size: 13px;
          color: #666;
        }

        .phone {
          font-weight: 600;
          color: #667eea;
        }

        .time {
          color: #28a745;
          font-weight: 600;
        }

        .overdue-time {
          color: #dc3545;
          font-weight: 700;
        }

        .notes {
          font-style: italic;
        }

        .call-actions {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .btn-complete,
        .btn-view {
          padding: 8px 16px;
          border: none;
          border-radius: 6px;
          font-weight: 600;
          font-size: 13px;
          cursor: pointer;
          transition: all 0.3s;
          white-space: nowrap;
        }

        .btn-complete {
          background: #28a745;
          color: white;
        }

        .btn-complete:hover {
          background: #218838;
        }

        .btn-view {
          background: #667eea;
          color: white;
        }

        .btn-view:hover {
          background: #5568d3;
        }

        .enquiries-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 20px;
        }

        .enquiry-card {
          background: #f8f9fa;
          padding: 15px;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.3s;
        }

        .enquiry-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        }

        .card-header {
          display: flex;
          justify-content: space-between;
          margin-bottom: 12px;
        }

        .priority-badge {
          padding: 4px 10px;
          border-radius: 4px;
          color: white;
          font-size: 11px;
          font-weight: 700;
        }

        .time-badge {
          background: #e0e0e0;
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 11px;
          color: #666;
        }

        .enquiry-card h3 {
          margin: 0 0 8px 0;
          font-size: 16px;
          color: #1a1a1a;
        }

        .contact-info {
          margin: 0 0 10px 0;
          font-size: 12px;
          color: #666;
        }

        .product-tag {
          background: #e8f5e9;
          color: #2e7d32;
          padding: 6px 10px;
          border-radius: 6px;
          font-size: 12px;
          margin-bottom: 10px;
          font-weight: 600;
        }

        .enquiry-details {
          font-size: 13px;
          color: #666;
          line-height: 1.5;
          margin: 0 0 12px 0;
        }

        .card-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-top: 1px solid #e0e0e0;
          padding-top: 10px;
        }

        .status-badge {
          background: #667eea;
          color: white;
          padding: 4px 10px;
          border-radius: 4px;
          font-size: 11px;
          font-weight: 600;
        }

        .arrow {
          color: #667eea;
          font-weight: 700;
          font-size: 18px;
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

        .loading {
          text-align: center;
          padding: 100px 20px;
          font-size: 24px;
          color: #666;
        }

        @media (max-width: 1200px) {
          .stats-grid {
            grid-template-columns: repeat(2, 1fr);
          }

          .content-grid {
            grid-template-columns: 1fr;
          }

          .enquiries-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 768px) {
          .stats-grid {
            grid-template-columns: 1fr;
          }

          .enquiries-grid {
            grid-template-columns: 1fr;
          }

          .call-item {
            flex-direction: column;
            gap: 15px;
          }

          .call-actions {
            width: 100%;
          }

          .btn-complete,
          .btn-view {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
};

export default SalesmanDashboard;

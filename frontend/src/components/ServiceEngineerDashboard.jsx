import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import { apiRequest } from '../utils/api';

const ServiceEngineerDashboard = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [complaints, setComplaints] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    slaBreached: 0,
    slaWarning: 0,
    resolved: 0
  });
  const [filterStatus, setFilterStatus] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchComplaints();
    const interval = setInterval(fetchComplaints, 60000); // Refresh every minute
    return () => clearInterval(interval);
  }, [user]);

  const fetchComplaints = async () => {
    if (!user) return;

    try {
      const data = await apiRequest(`/api/complaints?assigned_to=${user.id}`);
      const complaintsData = data || [];
      
      setComplaints(complaintsData);
      calculateStats(complaintsData);
    } catch (error) {
      console.error('Failed to fetch complaints:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (data) => {
    const total = data.length;
    const resolved = data.filter(c => c.status === 'Resolved').length;
    const slaBreached = data.filter(c => c.sla_status === 'breached').length;
    const slaWarning = data.filter(c => c.sla_status === 'warning').length;

    setStats({ total, resolved, slaBreached, slaWarning });
  };

  const getSLATimer = (complaint) => {
    if (!complaint.created_at) return { hours: 0, minutes: 0, status: 'ok' };

    const createdAt = new Date(complaint.created_at);
    const now = new Date();
    const diffMs = now - createdAt;
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

    const slaHours = complaint.priority === 'High' ? 4 : 
                     complaint.priority === 'Medium' ? 8 : 24;

    let status = 'ok';
    if (diffHours >= slaHours) {
      status = 'breached';
    } else if (diffHours >= slaHours * 0.75) {
      status = 'warning';
    }

    return {
      hours: diffHours,
      minutes: diffMinutes,
      slaHours,
      status
    };
  };

  const getSLAColor = (status) => {
    const colors = {
      ok: '#28a745',
      warning: '#ffc107',
      breached: '#dc3545'
    };
    return colors[status] || '#6c757d';
  };

  const updateComplaintStatus = async (complaintId, newStatus) => {
    try {
      const complaint = complaints.find(c => c.id === complaintId);
      
      await apiRequest(`/api/complaints/${complaintId}`, {
        method: 'PUT',
        body: JSON.stringify({
          ...complaint,
          status: newStatus,
          resolved_at: newStatus === 'Resolved' ? new Date().toISOString() : null
        })
      });

      fetchComplaints(); // Refresh data
      alert(`Complaint marked as ${newStatus}`);
    } catch (error) {
      console.error('Failed to update complaint:', error);
      alert('Failed to update complaint status');
    }
  };

  const filteredComplaints = filterStatus === 'all' 
    ? complaints 
    : complaints.filter(c => c.status === filterStatus);

  if (loading) {
    return <div className="loading">⏳ Loading complaints...</div>;
  }

  return (
    <div className="engineer-dashboard">
      <div className="dashboard-header">
        <div>
          <h1>🔧 Service Engineer Dashboard</h1>
          <p>Welcome, {user?.name}</p>
        </div>
        <button className="btn-refresh" onClick={fetchComplaints}>
          🔄 Refresh
        </button>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#667eea' }}>📋</div>
          <div className="stat-info">
            <h3>{stats.total}</h3>
            <p>Total Complaints</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#28a745' }}>✅</div>
          <div className="stat-info">
            <h3>{stats.resolved}</h3>
            <p>Resolved</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#ffc107' }}>⚠️</div>
          <div className="stat-info">
            <h3>{stats.slaWarning}</h3>
            <p>SLA Warning</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#dc3545' }}>🚨</div>
          <div className="stat-info">
            <h3>{stats.slaBreached}</h3>
            <p>SLA Breached</p>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="filter-tabs">
        <button
          className={filterStatus === 'all' ? 'active' : ''}
          onClick={() => setFilterStatus('all')}
        >
          All ({complaints.length})
        </button>
        <button
          className={filterStatus === 'Pending' ? 'active' : ''}
          onClick={() => setFilterStatus('Pending')}
        >
          Pending ({complaints.filter(c => c.status === 'Pending').length})
        </button>
        <button
          className={filterStatus === 'In Progress' ? 'active' : ''}
          onClick={() => setFilterStatus('In Progress')}
        >
          In Progress ({complaints.filter(c => c.status === 'In Progress').length})
        </button>
        <button
          className={filterStatus === 'Resolved' ? 'active' : ''}
          onClick={() => setFilterStatus('Resolved')}
        >
          Resolved ({complaints.filter(c => c.status === 'Resolved').length})
        </button>
      </div>

      {/* Complaints List */}
      <div className="complaints-panel">
        {filteredComplaints.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🎉</div>
            <p>No complaints in this category</p>
          </div>
        ) : (
          <div className="complaints-list">
            {filteredComplaints.map(complaint => {
              const slaTimer = getSLATimer(complaint);
              return (
                <div
                  key={complaint.id}
                  className="complaint-card"
                  onClick={() => navigate(`/engineer/complaint/${complaint.id}`)}
                >
                  <div className="card-top">
                    <div className="complaint-info">
                      <h3>#{complaint.id} - {complaint.customer?.name || 'Unknown Customer'}</h3>
                      <p className="contact">
                        📱 {complaint.customer?.phone} | 📧 {complaint.customer?.email}
                      </p>
                      <p className="issue-type">
                        🔧 {complaint.issue_type || 'General Issue'}
                      </p>
                      <p className="description">
                        {complaint.description?.substring(0, 150)}
                        {complaint.description?.length > 150 && '...'}
                      </p>
                    </div>

                    <div className="sla-timer-section">
                      <div
                        className="sla-timer"
                        style={{ borderColor: getSLAColor(slaTimer.status) }}
                      >
                        <div className="timer-icon" style={{ color: getSLAColor(slaTimer.status) }}>
                          {slaTimer.status === 'breached' ? '🚨' : 
                           slaTimer.status === 'warning' ? '⚠️' : '✅'}
                        </div>
                        <div className="timer-display">
                          <span className="hours">{slaTimer.hours}h</span>
                          <span className="minutes">{slaTimer.minutes}m</span>
                        </div>
                        <div className="sla-info">
                          SLA: {slaTimer.slaHours}h
                        </div>
                        <div
                          className="sla-status"
                          style={{ color: getSLAColor(slaTimer.status) }}
                        >
                          {slaTimer.status === 'breached' ? 'BREACHED' :
                           slaTimer.status === 'warning' ? 'WARNING' : 'ON TRACK'}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="card-bottom">
                    <div className="complaint-badges">
                      <span className={`priority-badge ${complaint.priority?.toLowerCase()}`}>
                        {complaint.priority || 'Low'} Priority
                      </span>
                      <span className={`status-badge ${complaint.status?.toLowerCase().replace(' ', '-')}`}>
                        {complaint.status || 'Pending'}
                      </span>
                      {complaint.product && (
                        <span className="product-badge">
                          🖨️ {complaint.product.name}
                        </span>
                      )}
                    </div>

                    <div className="quick-actions" onClick={(e) => e.stopPropagation()}>
                      {complaint.status !== 'In Progress' && complaint.status !== 'Resolved' && (
                        <button
                          className="btn-action"
                          onClick={() => updateComplaintStatus(complaint.id, 'In Progress')}
                        >
                          🚀 Start Work
                        </button>
                      )}
                      {complaint.status === 'In Progress' && (
                        <button
                          className="btn-action success"
                          onClick={() => updateComplaintStatus(complaint.id, 'Resolved')}
                        >
                          ✅ Mark Resolved
                        </button>
                      )}
                      <button
                        className="btn-action primary"
                        onClick={() => navigate(`/engineer/complaint/${complaint.id}`)}
                      >
                        View Details →
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <style jsx>{`
        .engineer-dashboard {
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

        .filter-tabs {
          background: white;
          padding: 20px;
          border-radius: 12px;
          margin-bottom: 20px;
          display: flex;
          gap: 10px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }

        .filter-tabs button {
          padding: 10px 20px;
          border: 2px solid #ddd;
          background: white;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 600;
          transition: all 0.3s;
        }

        .filter-tabs button:hover {
          border-color: #667eea;
          color: #667eea;
        }

        .filter-tabs button.active {
          background: #667eea;
          color: white;
          border-color: #667eea;
        }

        .complaints-panel {
          background: white;
          padding: 20px;
          border-radius: 12px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }

        .complaints-list {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .complaint-card {
          background: #f8f9fa;
          padding: 20px;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.3s;
          border: 2px solid transparent;
        }

        .complaint-card:hover {
          border-color: #667eea;
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        }

        .card-top {
          display: grid;
          grid-template-columns: 1fr auto;
          gap: 20px;
          margin-bottom: 15px;
        }

        .complaint-info h3 {
          margin: 0 0 10px 0;
          color: #1a1a1a;
          font-size: 18px;
        }

        .contact {
          margin: 0 0 8px 0;
          color: #666;
          font-size: 13px;
        }

        .issue-type {
          margin: 0 0 8px 0;
          color: #667eea;
          font-weight: 600;
          font-size: 14px;
        }

        .description {
          margin: 0;
          color: #666;
          line-height: 1.6;
          font-size: 14px;
        }

        .sla-timer-section {
          display: flex;
          align-items: center;
        }

        .sla-timer {
          background: white;
          padding: 15px;
          border-radius: 8px;
          text-align: center;
          border: 3px solid;
          min-width: 150px;
        }

        .timer-icon {
          font-size: 32px;
          margin-bottom: 8px;
        }

        .timer-display {
          font-size: 24px;
          font-weight: 700;
          color: #1a1a1a;
          margin-bottom: 5px;
        }

        .timer-display .minutes {
          margin-left: 5px;
        }

        .sla-info {
          font-size: 12px;
          color: #666;
          margin-bottom: 5px;
        }

        .sla-status {
          font-size: 11px;
          font-weight: 700;
        }

        .card-bottom {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-top: 15px;
          border-top: 2px solid #e0e0e0;
        }

        .complaint-badges {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
        }

        .priority-badge,
        .status-badge,
        .product-badge {
          padding: 6px 12px;
          border-radius: 6px;
          font-size: 12px;
          font-weight: 700;
        }

        .priority-badge.high {
          background: #dc3545;
          color: white;
        }

        .priority-badge.medium {
          background: #ffc107;
          color: #1a1a1a;
        }

        .priority-badge.low {
          background: #28a745;
          color: white;
        }

        .status-badge.pending {
          background: #6c757d;
          color: white;
        }

        .status-badge.in-progress {
          background: #007bff;
          color: white;
        }

        .status-badge.resolved {
          background: #28a745;
          color: white;
        }

        .product-badge {
          background: #e8f5e9;
          color: #2e7d32;
        }

        .quick-actions {
          display: flex;
          gap: 10px;
        }

        .btn-action {
          padding: 10px 18px;
          border: none;
          border-radius: 6px;
          font-weight: 600;
          font-size: 13px;
          cursor: pointer;
          transition: all 0.3s;
          background: #667eea;
          color: white;
        }

        .btn-action:hover {
          transform: translateY(-2px);
          box-shadow: 0 2px 8px rgba(0,0,0,0.2);
        }

        .btn-action.success {
          background: #28a745;
        }

        .btn-action.primary {
          background: #007bff;
        }

        .empty-state {
          text-align: center;
          padding: 60px 20px;
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

          .card-top {
            grid-template-columns: 1fr;
          }

          .filter-tabs {
            overflow-x: auto;
          }
        }

        @media (max-width: 768px) {
          .stats-grid {
            grid-template-columns: 1fr;
          }

          .card-bottom {
            flex-direction: column;
            gap: 15px;
            align-items: flex-start;
          }

          .quick-actions {
            width: 100%;
            flex-direction: column;
          }

          .btn-action {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
};

export default ServiceEngineerDashboard;

import { useState, useEffect } from 'react';
import axios from 'axios';

const SLAWarningDashboard = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, warning, breach

  useEffect(() => {
    fetchComplaints();
    // Refresh every 2 minutes
    const interval = setInterval(fetchComplaints, 2 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const fetchComplaints = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        'http://127.0.0.1:8000/api/complaints',
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );
      
      setComplaints(response.data || []);
    } catch (err) {
      console.error('Failed to fetch complaints:', err);
    } finally {
      setLoading(false);
    }
  };

  const calculateSLAStatus = (complaint) => {
    if (!complaint.sla_time) return { status: 'none', timeLeft: null, urgent: false };
    
    const now = new Date();
    const slaTime = new Date(complaint.sla_time);
    const diffMs = slaTime - now;
    const diffHours = diffMs / (1000 * 60 * 60);

    if (diffHours < 0) {
      return { 
        status: 'breach', 
        timeLeft: `${Math.abs(diffHours).toFixed(1)}h overdue`,
        urgent: true 
      };
    } else if (diffHours < 2) {
      return { 
        status: 'warning', 
        timeLeft: `${diffHours.toFixed(1)}h remaining`,
        urgent: true 
      };
    } else {
      return { 
        status: 'ok', 
        timeLeft: `${diffHours.toFixed(1)}h remaining`,
        urgent: false 
      };
    }
  };

  const getFilteredComplaints = () => {
    return complaints
      .filter(c => c.status !== 'Completed')
      .map(c => ({ ...c, slaStatus: calculateSLAStatus(c) }))
      .filter(c => {
        if (filter === 'warning') return c.slaStatus.status === 'warning';
        if (filter === 'breach') return c.slaStatus.status === 'breach';
        return c.slaStatus.urgent;
      })
      .sort((a, b) => {
        if (a.slaStatus.status === 'breach' && b.slaStatus.status !== 'breach') return -1;
        if (a.slaStatus.status !== 'breach' && b.slaStatus.status === 'breach') return 1;
        return 0;
      });
  };

  const filteredComplaints = getFilteredComplaints();
  const breachCount = complaints.filter(c => calculateSLAStatus(c).status === 'breach').length;
  const warningCount = complaints.filter(c => calculateSLAStatus(c).status === 'warning').length;

  if (loading) {
    return <div className="loading">⏳ Loading SLA dashboard...</div>;
  }

  return (
    <div className="sla-dashboard">
      <div className="dashboard-header">
        <h2>🚨 Service SLA Monitor</h2>
        <button onClick={fetchComplaints} className="refresh-btn">
          🔄 Refresh
        </button>
      </div>

      <div className="stats-grid">
        <div className="stat-card breach">
          <div className="stat-value">{breachCount}</div>
          <div className="stat-label">🚨 SLA Breached</div>
        </div>
        <div className="stat-card warning">
          <div className="stat-value">{warningCount}</div>
          <div className="stat-label">⚠️ Warnings (&lt;2h)</div>
        </div>
        <div className="stat-card total">
          <div className="stat-value">{complaints.length}</div>
          <div className="stat-label">📊 Active Complaints</div>
        </div>
      </div>

      <div className="filter-tabs">
        <button 
          className={filter === 'all' ? 'active' : ''}
          onClick={() => setFilter('all')}
        >
          All Urgent
        </button>
        <button 
          className={filter === 'breach' ? 'active' : ''}
          onClick={() => setFilter('breach')}
        >
          🚨 Breached ({breachCount})
        </button>
        <button 
          className={filter === 'warning' ? 'active' : ''}
          onClick={() => setFilter('warning')}
        >
          ⚠️ Warnings ({warningCount})
        </button>
      </div>

      <div className="complaints-list">
        {filteredComplaints.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">✅</div>
            <p>No urgent SLA issues at the moment</p>
            <p className="subtitle">All services are within acceptable timeframes</p>
          </div>
        ) : (
          filteredComplaints.map(complaint => (
            <div 
              key={complaint.id} 
              className={`complaint-card ${complaint.slaStatus.status}`}
            >
              <div className="card-header">
                <div className="ticket-info">
                  <span className="ticket-no">{complaint.ticket_no}</span>
                  <span className={`status-badge ${complaint.slaStatus.status}`}>
                    {complaint.slaStatus.status === 'breach' ? '🚨 BREACHED' : '⚠️ WARNING'}
                  </span>
                </div>
                <div className="time-left">
                  {complaint.slaStatus.timeLeft}
                </div>
              </div>

              <div className="card-body">
                <div className="customer-name">{complaint.customer_name}</div>
                <div className="fault-desc">{complaint.fault_description}</div>
                
                <div className="complaint-details">
                  <div className="detail-item">
                    <span className="label">📱 Phone:</span>
                    <span>{complaint.phone}</span>
                  </div>
                  <div className="detail-item">
                    <span className="label">🖨️ Machine:</span>
                    <span>{complaint.machine_model}</span>
                  </div>
                  <div className="detail-item">
                    <span className="label">👤 Status:</span>
                    <span className={`status ${complaint.status.toLowerCase()}`}>
                      {complaint.status}
                    </span>
                  </div>
                </div>
              </div>

              {complaint.slaStatus.status === 'breach' && (
                <div className="action-required">
                  🚨 IMMEDIATE ACTION REQUIRED - Service is overdue!
                </div>
              )}
            </div>
          ))
        )}
      </div>

      <style jsx>{`
        .sla-dashboard {
          padding: 20px;
          max-width: 1200px;
          margin: 0 auto;
        }

        .dashboard-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 25px;
        }

        .dashboard-header h2 {
          margin: 0;
          font-size: 24px;
          color: #1a1a1a;
        }

        .refresh-btn {
          padding: 10px 20px;
          background: #007bff;
          color: white;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-weight: 600;
        }

        .refresh-btn:hover {
          background: #0056b3;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 20px;
          margin-bottom: 25px;
        }

        .stat-card {
          padding: 20px;
          border-radius: 10px;
          text-align: center;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }

        .stat-card.breach {
          background: linear-gradient(135deg, #ff6b6b, #ee5a6f);
          color: white;
        }

        .stat-card.warning {
          background: linear-gradient(135deg, #ffa502, #ff6348);
          color: white;
        }

        .stat-card.total {
          background: linear-gradient(135deg, #667eea, #764ba2);
          color: white;
        }

        .stat-value {
          font-size: 36px;
          font-weight: 700;
          margin-bottom: 8px;
        }

        .stat-label {
          font-size: 14px;
          opacity: 0.9;
        }

        .filter-tabs {
          display: flex;
          gap: 10px;
          margin-bottom: 20px;
          background: white;
          padding: 10px;
          border-radius: 8px;
        }

        .filter-tabs button {
          flex: 1;
          padding: 10px;
          border: 2px solid #e0e0e0;
          background: white;
          border-radius: 6px;
          cursor: pointer;
          font-weight: 600;
          transition: all 0.2s;
        }

        .filter-tabs button:hover {
          border-color: #007bff;
        }

        .filter-tabs button.active {
          background: #007bff;
          color: white;
          border-color: #007bff;
        }

        .complaints-list {
          display: grid;
          gap: 15px;
        }

        .complaint-card {
          background: white;
          border-radius: 10px;
          padding: 20px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
          border-left: 5px solid #ddd;
        }

        .complaint-card.breach {
          border-left-color: #dc3545;
          animation: pulse 2s infinite;
        }

        .complaint-card.warning {
          border-left-color: #ffc107;
        }

        @keyframes pulse {
          0%, 100% { box-shadow: 0 2px 8px rgba(220, 53, 69, 0.3); }
          50% { box-shadow: 0 4px 16px rgba(220, 53, 69, 0.6); }
        }

        .card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 15px;
        }

        .ticket-info {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .ticket-no {
          font-weight: 700;
          font-size: 16px;
          color: #1a1a1a;
        }

        .status-badge {
          padding: 4px 10px;
          border-radius: 12px;
          font-size: 12px;
          font-weight: 700;
        }

        .status-badge.breach {
          background: #dc3545;
          color: white;
        }

        .status-badge.warning {
          background: #ffc107;
          color: #000;
        }

        .time-left {
          font-weight: 700;
          color: #dc3545;
          font-size: 15px;
        }

        .customer-name {
          font-size: 18px;
          font-weight: 600;
          margin-bottom: 8px;
          color: #1a1a1a;
        }

        .fault-desc {
          color: #666;
          margin-bottom: 15px;
          line-height: 1.5;
        }

        .complaint-details {
          display: grid;
          gap: 8px;
        }

        .detail-item {
          display: flex;
          font-size: 14px;
        }

        .detail-item .label {
          font-weight: 600;
          min-width: 100px;
          color: #555;
        }

        .status {
          padding: 2px 8px;
          border-radius: 4px;
          font-weight: 600;
          font-size: 13px;
        }

        .status.assigned {
          background: #cce5ff;
          color: #004085;
        }

        .status.delayed {
          background: #f8d7da;
          color: #721c24;
        }

        .action-required {
          margin-top: 15px;
          padding: 12px;
          background: #dc3545;
          color: white;
          border-radius: 6px;
          text-align: center;
          font-weight: 700;
          animation: blink 1.5s infinite;
        }

        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }

        .empty-state {
          text-align: center;
          padding: 60px 20px;
          background: white;
          border-radius: 10px;
        }

        .empty-icon {
          font-size: 64px;
          margin-bottom: 15px;
        }

        .empty-state p {
          margin: 8px 0;
          color: #28a745;
          font-weight: 600;
          font-size: 18px;
        }

        .empty-state .subtitle {
          color: #666;
          font-size: 14px;
          font-weight: 400;
        }

        .loading {
          text-align: center;
          padding: 40px;
          font-size: 18px;
          color: #666;
        }
      `}</style>
    </div>
  );
};

export default SLAWarningDashboard;

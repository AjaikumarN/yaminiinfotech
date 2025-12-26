import React, { useState, useEffect } from 'react';
import { apiRequest } from '../../utils/api';

const ServiceHistory = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, completed, cancelled

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const data = await apiRequest('/api/service-requests/my-services');
      setServices(data);
    } catch (error) {
      console.error('Failed to fetch service history:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredServices = services.filter(service => {
    if (filter === 'completed') return service.status === 'COMPLETED';
    if (filter === 'cancelled') return service.status === 'CANCELLED';
    return true;
  });

  const getStatusColor = (status) => {
    const colors = {
      COMPLETED: '#10b981',
      CANCELLED: '#6b7280',
      IN_PROGRESS: '#f59e0b',
      ASSIGNED: '#3b82f6'
    };
    return colors[status] || '#6b7280';
  };

  if (loading) {
    return (
      <div className="history-loading">
        <div className="spinner"></div>
        <p>Loading service history...</p>
      </div>
    );
  }

  return (
    <div className="service-history">
      <div className="history-header">
        <div className="header-left">
          <h1>🔁 Service History</h1>
          <p>Complete record of all your service requests</p>
        </div>
        <div className="header-actions">
          <button className="btn-export" onClick={() => alert('Export feature coming soon!')}>
            📥 Export
          </button>
        </div>
      </div>

      <div className="history-filters">
        <button
          className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
        >
          All ({services.length})
        </button>
        <button
          className={`filter-btn ${filter === 'completed' ? 'active' : ''}`}
          onClick={() => setFilter('completed')}
        >
          ✅ Completed ({services.filter(s => s.status === 'COMPLETED').length})
        </button>
        <button
          className={`filter-btn ${filter === 'cancelled' ? 'active' : ''}`}
          onClick={() => setFilter('cancelled')}
        >
          ❌ Cancelled ({services.filter(s => s.status === 'CANCELLED').length})
        </button>
      </div>

      {filteredServices.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📭</div>
          <h2>No History Found</h2>
          <p>No services match the selected filter</p>
        </div>
      ) : (
        <div className="history-table-container">
          <table className="history-table">
            <thead>
              <tr>
                <th>Ticket</th>
                <th>Customer</th>
                <th>Issue</th>
                <th>Status</th>
                <th>Priority</th>
                <th>Created</th>
                <th>Completed</th>
                <th>Duration</th>
              </tr>
            </thead>
            <tbody>
              {filteredServices.map(service => {
                const created = new Date(service.created_at);
                const completed = service.resolved_at ? new Date(service.resolved_at) : null;
                const duration = completed 
                  ? Math.floor((completed - created) / (1000 * 60 * 60)) 
                  : null;

                return (
                  <tr key={service.id}>
                    <td className="td-ticket">
                      <strong>{service.ticket_no}</strong>
                    </td>
                    <td>
                      <div className="customer-cell">
                        <div className="customer-name">{service.customer_name}</div>
                        <div className="customer-phone">{service.customer_phone}</div>
                      </div>
                    </td>
                    <td className="td-issue">
                      {service.issue_description}
                    </td>
                    <td>
                      <span 
                        className="status-pill"
                        style={{ 
                          background: getStatusColor(service.status),
                          color: 'white'
                        }}
                      >
                        {service.status}
                      </span>
                    </td>
                    <td>
                      <span className={`priority-badge priority-${service.priority?.toLowerCase()}`}>
                        {service.priority || 'NORMAL'}
                      </span>
                    </td>
                    <td>{created.toLocaleDateString()}</td>
                    <td>{completed ? completed.toLocaleDateString() : '-'}</td>
                    <td>{duration ? `${duration}h` : '-'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <style>{`
        .service-history {
          padding: 24px;
          max-width: 1600px;
          margin: 0 auto;
        }

        .history-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
        }

        .history-header h1 {
          margin: 0;
          color: #1f2937;
        }

        .history-header p {
          margin: 4px 0 0 0;
          color: #6b7280;
        }

        .btn-export {
          padding: 10px 20px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 600;
          transition: all 0.3s;
        }

        .btn-export:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
        }

        .history-filters {
          display: flex;
          gap: 12px;
          margin-bottom: 24px;
        }

        .filter-btn {
          padding: 10px 20px;
          border: 1px solid #d1d5db;
          background: white;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 600;
          transition: all 0.3s;
        }

        .filter-btn:hover {
          border-color: #667eea;
          color: #667eea;
        }

        .filter-btn.active {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border-color: transparent;
        }

        .history-loading {
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

        .empty-state {
          text-align: center;
          padding: 80px 20px;
          background: white;
          border-radius: 12px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.05);
        }

        .empty-icon {
          font-size: 72px;
          margin-bottom: 16px;
        }

        .empty-state h2 {
          color: #1f2937;
          margin: 0 0 8px 0;
        }

        .empty-state p {
          color: #6b7280;
          margin: 0;
        }

        .history-table-container {
          background: white;
          border-radius: 12px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.05);
          overflow: hidden;
        }

        .history-table {
          width: 100%;
          border-collapse: collapse;
        }

        .history-table thead {
          background: #f9fafb;
        }

        .history-table th {
          padding: 16px;
          text-align: left;
          font-weight: 700;
          color: #1f2937;
          border-bottom: 2px solid #e5e7eb;
        }

        .history-table td {
          padding: 16px;
          border-bottom: 1px solid #e5e7eb;
          color: #6b7280;
        }

        .history-table tbody tr:hover {
          background: #f9fafb;
        }

        .td-ticket strong {
          color: #1f2937;
        }

        .customer-cell {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .customer-name {
          color: #1f2937;
          font-weight: 600;
        }

        .customer-phone {
          font-size: 12px;
          color: #9ca3af;
        }

        .td-issue {
          max-width: 300px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .status-pill {
          padding: 4px 12px;
          border-radius: 12px;
          font-size: 11px;
          font-weight: 600;
          display: inline-block;
        }

        .priority-badge {
          padding: 4px 10px;
          border-radius: 12px;
          font-size: 11px;
          font-weight: 600;
          display: inline-block;
        }

        .priority-critical {
          background: #fee2e2;
          color: #991b1b;
        }

        .priority-urgent {
          background: #fef3c7;
          color: #92400e;
        }

        .priority-normal {
          background: #d1fae5;
          color: #065f46;
        }

        @media (max-width: 1200px) {
          .history-table-container {
            overflow-x: auto;
          }

          .history-table {
            min-width: 1000px;
          }
        }
      `}</style>
    </div>
  );
};

export default ServiceHistory;

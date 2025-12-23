import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import { apiRequest } from '../utils/api';
import CreateOrder from './CreateOrder';

const SalesmanEnquiries = () => {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [enquiries, setEnquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({ status: '', priority: '' });
  const [showCreateOrder, setShowCreateOrder] = useState(false);
  const [selectedEnquiry, setSelectedEnquiry] = useState(null);

  useEffect(() => {
    fetchEnquiries();
  }, [filter]);

  const fetchEnquiries = async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams();
      if (filter.status) queryParams.append('status', filter.status);
      if (filter.priority) queryParams.append('priority', filter.priority);

      const data = await apiRequest(`/api/sales/salesman/enquiries?${queryParams}`);
      setEnquiries(data);
    } catch (error) {
      console.error('Failed to fetch enquiries:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (enquiryId, newStatus) => {
    try {
      await apiRequest(`/api/sales/salesman/enquiries/${enquiryId}`, {
        method: 'PUT',
        body: JSON.stringify({ status: newStatus })
      });
      fetchEnquiries();
    } catch (error) {
      console.error('Failed to update status:', error);
      alert('Failed to update status: ' + error.message);
    }
  };

  const openCreateOrder = (enquiry) => {
    setSelectedEnquiry(enquiry);
    setShowCreateOrder(true);
  };

  const getPriorityColor = (priority) => {
    const colors = {
      HOT: '#dc3545',
      WARM: '#ffc107',
      COLD: '#17a2b8'
    };
    return colors[priority] || '#6c757d';
  };

  const getStatusColor = (status) => {
    const colors = {
      NEW: '#6c757d',
      CONTACTED: '#17a2b8',
      FOLLOW_UP: '#ffc107',
      QUOTED: '#fd7e14',
      CONVERTED: '#28a745',
      LOST: '#dc3545'
    };
    return colors[status] || '#6c757d';
  };

  const canCreateOrder = (enquiry) => {
    return enquiry.status === 'CONVERTED' && !enquiry.has_order;
  };

  if (loading) {
    return <div className="loading">⏳ Loading enquiries...</div>;
  }

  return (
    <div className="salesman-enquiries">
      <div className="page-header">
        <h1>📋 My Enquiries</h1>
        <button className="btn-refresh" onClick={fetchEnquiries}>
          🔄 Refresh
        </button>
      </div>

      {/* Filters */}
      <div className="filters-bar">
        <div className="filter-group">
          <label>Status</label>
          <select
            value={filter.status}
            onChange={(e) => setFilter({ ...filter, status: e.target.value })}
          >
            <option value="">All Status</option>
            <option value="NEW">New</option>
            <option value="CONTACTED">Contacted</option>
            <option value="FOLLOW_UP">Follow-up</option>
            <option value="QUOTED">Quoted</option>
            <option value="CONVERTED">Converted</option>
            <option value="LOST">Lost</option>
          </select>
        </div>
        <div className="filter-group">
          <label>Priority</label>
          <select
            value={filter.priority}
            onChange={(e) => setFilter({ ...filter, priority: e.target.value })}
          >
            <option value="">All Priorities</option>
            <option value="HOT">🔥 HOT</option>
            <option value="WARM">🌡️ WARM</option>
            <option value="COLD">❄️ COLD</option>
          </select>
        </div>
        <button
          className="btn-clear"
          onClick={() => setFilter({ status: '', priority: '' })}
        >
          Clear Filters
        </button>
      </div>

      {/* Enquiries Grid */}
      <div className="enquiries-grid">
        {enquiries.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📭</div>
            <h3>No enquiries found</h3>
            <p>No enquiries match your current filters</p>
          </div>
        ) : (
          enquiries.map((enquiry) => (
            <div 
              key={enquiry.id} 
              className="enquiry-card"
              onClick={() => navigate(`/enquiries/${enquiry.id}`)}
              style={{ cursor: 'pointer' }}
            >
              <div className="card-header">
                <div className="enquiry-info">
                  <h3>{enquiry.customer_name}</h3>
                  <span className="enquiry-id">#{enquiry.enquiry_id}</span>
                </div>
                <div className="badges">
                  <span 
                    className="priority-badge"
                    style={{ background: getPriorityColor(enquiry.priority) }}
                  >
                    {enquiry.priority}
                  </span>
                  <span 
                    className="status-badge"
                    style={{ background: getStatusColor(enquiry.status) }}
                  >
                    {enquiry.status}
                  </span>
                </div>
              </div>

              <div className="card-body">
                <div className="info-row">
                  <span className="label">📞 Phone:</span>
                  <span>{enquiry.phone}</span>
                </div>
                {enquiry.email && (
                  <div className="info-row">
                    <span className="label">📧 Email:</span>
                    <span>{enquiry.email}</span>
                  </div>
                )}
                <div className="info-row">
                  <span className="label">📦 Product:</span>
                  <span>{enquiry.product_interest}</span>
                </div>
                {enquiry.notes && (
                  <div className="info-row">
                    <span className="label">📝 Notes:</span>
                    <span>{enquiry.notes}</span>
                  </div>
                )}
                {enquiry.next_follow_up && (
                  <div className="info-row">
                    <span className="label">📅 Next Follow-up:</span>
                    <span>{new Date(enquiry.next_follow_up).toLocaleDateString()}</span>
                  </div>
                )}
              </div>

              <div className="card-footer">
                <button
                  className="btn-view-details"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/enquiries/${enquiry.id}`);
                  }}
                >
                  👁️ View Details
                </button>
                
                {canCreateOrder(enquiry) && (
                  <button
                    className="btn-create-order"
                    onClick={(e) => {
                      e.stopPropagation();
                      openCreateOrder(enquiry);
                    }}
                  >
                    🛒 Create Order
                  </button>
                )}
                
                {enquiry.status !== 'CONVERTED' && enquiry.status !== 'LOST' && (
                  <div className="status-actions">
                    <select
                      className="status-select"
                      value={enquiry.status}
                      onChange={(e) => {
                        e.stopPropagation();
                        handleUpdateStatus(enquiry.id, e.target.value);
                      }}
                    >
                      <option value="NEW">New</option>
                      <option value="CONTACTED">Contacted</option>
                      <option value="FOLLOW_UP">Follow-up</option>
                      <option value="QUOTED">Quoted</option>
                      <option value="CONVERTED">Converted</option>
                      <option value="LOST">Lost</option>
                    </select>
                  </div>
                )}

                {enquiry.status === 'CONVERTED' && enquiry.has_order && (
                  <span className="order-created-badge">✅ Order Created</span>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Create Order Modal */}
      {showCreateOrder && selectedEnquiry && (
        <CreateOrder
          enquiry={selectedEnquiry}
          onClose={() => {
            setShowCreateOrder(false);
            setSelectedEnquiry(null);
          }}
          onSuccess={() => {
            fetchEnquiries();
          }}
        />
      )}

      <style>{`
        .salesman-enquiries {
          padding: 30px;
          background: #f5f7fa;
          min-height: 100vh;
        }

        .page-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 30px;
        }

        .page-header h1 {
          margin: 0;
          color: #1a1a1a;
          font-size: 32px;
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

        .filters-bar {
          background: white;
          padding: 25px;
          border-radius: 12px;
          margin-bottom: 30px;
          display: flex;
          gap: 20px;
          align-items: end;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }

        .filter-group {
          flex: 1;
          display: flex;
          flex-direction: column;
        }

        .filter-group label {
          margin-bottom: 8px;
          font-weight: 600;
          color: #333;
          font-size: 14px;
        }

        .filter-group select {
          padding: 12px;
          border: 2px solid #e0e0e0;
          border-radius: 8px;
          font-size: 14px;
          cursor: pointer;
        }

        .btn-clear {
          padding: 12px 24px;
          background: #f0f0f0;
          border: none;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
        }

        .enquiries-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
          gap: 20px;
        }

        .enquiry-card {
          background: white;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
          transition: all 0.3s;          cursor: pointer;        }

        .enquiry-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 4px 16px rgba(0,0,0,0.15);
        }

        .card-header {
          padding: 20px;
          background: #f8f9fa;
          border-bottom: 2px solid #e0e0e0;
          display: flex;
          justify-content: space-between;
          align-items: start;
        }

        .enquiry-info h3 {
          margin: 0 0 5px 0;
          color: #1a1a1a;
          font-size: 18px;
        }

        .enquiry-id {
          font-size: 12px;
          color: #666;
          font-weight: 600;
        }

        .badges {
          display: flex;
          gap: 8px;
        }

        .priority-badge,
        .status-badge {
          padding: 6px 12px;
          border-radius: 12px;
          font-size: 11px;
          font-weight: 700;
          color: white;
          text-transform: uppercase;
        }

        .card-body {
          padding: 20px;
        }

        .info-row {
          display: flex;
          margin-bottom: 12px;
          font-size: 14px;
        }

        .info-row .label {
          min-width: 120px;
          font-weight: 600;
          color: #666;
        }

        .info-row span:last-child {
          color: #1a1a1a;
          flex: 1;
        }

        .card-footer {
          padding: 20px;
          border-top: 2px solid #f0f0f0;
          display: flex;
          gap: 15px;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
        }

        .btn-view-details {
          padding: 12px 24px;
          background: #3498db;
          color: white;
          border: none;
          border-radius: 8px;
          font-weight: 700;
          cursor: pointer;
          font-size: 14px;
          transition: all 0.3s;
          flex: 1;
          min-width: 140px;
        }

        .btn-view-details:hover {
          background: #2980b9;
          transform: scale(1.02);
        }

        .btn-create-order {
          padding: 12px 24px;
          background: #28a745;
          color: white;
          border: none;
          border-radius: 8px;
          font-weight: 700;
          cursor: pointer;
          font-size: 14px;
          transition: all 0.3s;
          flex: 1;
          min-width: 140px;
        }

        .btn-create-order:hover {
          background: #218838;
          transform: scale(1.02);
        }

        .status-actions {
          flex: 1;
        }

        .status-select {
          width: 100%;
          padding: 12px;
          border: 2px solid #e0e0e0;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          background: white;
        }

        .order-created-badge {
          padding: 12px 24px;
          background: #28a745;
          color: white;
          border-radius: 8px;
          font-weight: 700;
          font-size: 14px;
        }

        .empty-state {
          text-align: center;
          padding: 80px 20px;
          grid-column: 1 / -1;
        }

        .empty-icon {
          font-size: 80px;
          margin-bottom: 20px;
        }

        .empty-state h3 {
          margin: 0 0 10px 0;
          color: #1a1a1a;
          font-size: 24px;
        }

        .empty-state p {
          margin: 0;
          color: #999;
          font-size: 16px;
        }

        .loading {
          text-align: center;
          padding: 100px 20px;
          font-size: 24px;
          color: #666;
        }

        @media (max-width: 768px) {
          .enquiries-grid {
            grid-template-columns: 1fr;
          }

          .filters-bar {
            flex-direction: column;
            align-items: stretch;
          }

          .card-footer {
            flex-direction: column;
          }

          .btn-create-order {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
};

export default SalesmanEnquiries;
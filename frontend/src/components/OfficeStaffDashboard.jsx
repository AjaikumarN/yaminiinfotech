import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import { apiRequest } from '../utils/api';

const OfficeStaffDashboard = () => {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [alerts, setAlerts] = useState({
    stockAlerts: [],
    serviceDelays: [],
    salesActivity: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAlerts();
    const interval = setInterval(fetchAlerts, 300000); // Refresh every 5 minutes
    return () => clearInterval(interval);
  }, []);

  const fetchAlerts = async () => {
    try {
      const [products, complaints, sales] = await Promise.all([
        apiRequest('/api/products').catch(() => []),
        apiRequest('/api/complaints/').catch(() => []),
        apiRequest('/api/sales').catch(() => [])
      ]);

      // Stock alerts (products with low stock)
      const stockAlerts = (products || []).filter(p => 
        p.stock_quantity < 10 && p.stock_quantity > 0
      );

      // Service delays (complaints pending > 24 hours)
      const now = new Date();
      const serviceDelays = (complaints || []).filter(c => {
        if (c.status === 'Resolved') return false;
        const createdAt = new Date(c.created_at);
        const hoursDiff = (now - createdAt) / (1000 * 60 * 60);
        return hoursDiff > 24;
      });

      // Recent sales activity (last 10 sales)
      const salesActivity = (sales || [])
        .sort((a, b) => new Date(b.sale_date) - new Date(a.sale_date))
        .slice(0, 10);

      setAlerts({ stockAlerts, serviceDelays, salesActivity });
    } catch (error) {
      console.error('Failed to fetch alerts:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">⏳ Loading dashboard...</div>;
  }

  return (
    <div className="office-staff-dashboard">
      <div className="dashboard-header">
        <h1>📊 Office Staff Dashboard</h1>
        <div className="header-actions">
          <button className="btn-add-product" onClick={() => navigate('/products/add')}>
            ➕ Add Product
          </button>
          <button className="btn-refresh" onClick={fetchAlerts}>
            🔄 Refresh
          </button>
        </div>
      </div>

      <div className="alerts-grid">
        {/* Stock Alerts */}
        <div className="alert-panel">
          <div className="panel-header">
            <h2>📦 Stock Alerts</h2>
            <span className={`badge ${alerts.stockAlerts.length > 0 ? 'alert' : ''}`}>
              {alerts.stockAlerts.length}
            </span>
          </div>
          <div className="panel-content">
            {alerts.stockAlerts.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">✅</div>
                <p>All stock levels are healthy</p>
              </div>
            ) : (
              <div className="alerts-list">
                {alerts.stockAlerts.map(product => (
                  <div key={product.id} className="alert-item">
                    <div className="alert-icon">⚠️</div>
                    <div className="alert-info">
                      <h4>{product.name}</h4>
                      <p>Stock: {product.stock_quantity} units</p>
                      <p className="alert-action">Action needed: Reorder soon</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Service Delays */}
        <div className="alert-panel">
          <div className="panel-header">
            <h2>🚨 Service Delays</h2>
            <span className={`badge ${alerts.serviceDelays.length > 0 ? 'alert' : ''}`}>
              {alerts.serviceDelays.length}
            </span>
          </div>
          <div className="panel-content">
            {alerts.serviceDelays.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">✅</div>
                <p>No service delays</p>
              </div>
            ) : (
              <div className="alerts-list">
                {alerts.serviceDelays.map(complaint => (
                  <div key={complaint.id} className="alert-item">
                    <div className="alert-icon">⏱️</div>
                    <div className="alert-info">
                      <h4>Complaint #{complaint.id}</h4>
                      <p>{complaint.customer?.name}</p>
                      <p className="alert-action">
                        {Math.floor((Date.now() - new Date(complaint.created_at)) / (1000 * 60 * 60))}h pending
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Recent Sales Activity */}
        <div className="alert-panel full-width">
          <div className="panel-header">
            <h2>💰 Recent Sales Activity</h2>
            <span className="badge">{alerts.salesActivity.length}</span>
          </div>
          <div className="panel-content">
            {alerts.salesActivity.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">📋</div>
                <p>No recent sales</p>
              </div>
            ) : (
              <table className="sales-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Customer</th>
                    <th>Product</th>
                    <th>Amount</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {alerts.salesActivity.map(sale => (
                    <tr key={sale.id}>
                      <td>{new Date(sale.sale_date).toLocaleDateString()}</td>
                      <td>{sale.customer?.name || 'N/A'}</td>
                      <td>{sale.product?.name || 'N/A'}</td>
                      <td>₹{sale.amount?.toLocaleString()}</td>
                      <td>
                        <span className={`status-badge ${sale.status?.toLowerCase()}`}>
                          {sale.status || 'Pending'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      <style>{`
        .office-staff-dashboard {
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
          margin: 0;
          color: #1a1a1a;
        }

        .header-actions {
          display: flex;
          gap: 15px;
        }

        .btn-add-product {
          padding: 12px 24px;
          background: #28a745;
          color: white;
          border: none;
          borderRadius: 8px;
          fontWeight: 600;
          cursor: pointer;
          transition: all 0.3s;
        }

        .btn-add-product:hover {
          background: #218838;
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

        .alerts-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 20px;
        }

        .alert-panel {
          background: white;
          border-radius: 12px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }

        .alert-panel.full-width {
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

        .alerts-list {
          display: flex;
          flex-direction: column;
          gap: 15px;
        }

        .alert-item {
          background: #f8f9fa;
          padding: 15px;
          border-radius: 8px;
          display: flex;
          gap: 15px;
          align-items: flex-start;
        }

        .alert-icon {
          font-size: 32px;
        }

        .alert-info h4 {
          margin: 0 0 5px 0;
          color: #1a1a1a;
        }

        .alert-info p {
          margin: 3px 0;
          color: #666;
          font-size: 14px;
        }

        .alert-action {
          color: #dc3545 !important;
          font-weight: 600;
        }

        .sales-table {
          width: 100%;
          border-collapse: collapse;
        }

        .sales-table th {
          background: #f8f9fa;
          padding: 12px;
          text-align: left;
          font-weight: 700;
          color: #1a1a1a;
          border-bottom: 2px solid #e0e0e0;
        }

        .sales-table td {
          padding: 12px;
          border-bottom: 1px solid #f0f0f0;
          color: #666;
        }

        .sales-table tr:hover {
          background: #f8f9fa;
        }

        .status-badge {
          padding: 4px 10px;
          border-radius: 4px;
          font-size: 12px;
          font-weight: 700;
        }

        .status-badge.completed {
          background: #28a745;
          color: white;
        }

        .status-badge.pending {
          background: #ffc107;
          color: #1a1a1a;
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

        @media (max-width: 968px) {
          .alerts-grid {
            grid-template-columns: 1fr;
          }

          .sales-table {
            font-size: 13px;
          }
        }
      `}</style>
    </div>
  );
};

export default OfficeStaffDashboard;

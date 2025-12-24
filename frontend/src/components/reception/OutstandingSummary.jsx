import React, { useState, useEffect } from 'react';
import { apiRequest } from '../../utils/api';

const OutstandingSummary = () => {
  const [outstandingData, setOutstandingData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: '',
    minAmount: '',
    daysOverdue: 'ALL'
  });

  useEffect(() => {
    fetchOutstandingData();
  }, []);

  const fetchOutstandingData = async () => {
    try {
      // Fetch orders/invoices - adjust endpoint as needed
      const orders = await apiRequest('/api/orders/').catch(() => []);
      
      // Calculate outstanding from completed orders
      const outstanding = (orders || [])
        .filter(order => order.status === 'DELIVERED' || order.status === 'COMPLETED')
        .filter(order => {
          const totalAmount = order.total_amount || 0;
          const paidAmount = order.paid_amount || 0;
          return totalAmount > paidAmount;
        })
        .map(order => {
          const totalAmount = order.total_amount || 0;
          const paidAmount = order.paid_amount || 0;
          const balance = totalAmount - paidAmount;
          const dueDate = order.due_date ? new Date(order.due_date) : new Date(order.created_at);
          const today = new Date();
          const daysPastDue = Math.max(0, Math.floor((today - dueDate) / (1000 * 60 * 60 * 24)));
          
          return {
            id: order.id,
            customer_name: order.customer_name,
            invoice_no: order.order_id || `ORD-${order.id}`,
            total_amount: totalAmount,
            paid_amount: paidAmount,
            balance: balance,
            due_date: dueDate,
            days_overdue: daysPastDue,
            order_date: order.created_at
          };
        })
        .sort((a, b) => b.days_overdue - a.days_overdue);
      
      setOutstandingData(outstanding);
    } catch (error) {
      console.error('Failed to fetch outstanding data:', error);
      setOutstandingData([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredData = outstandingData.filter(item => {
    if (filters.search) {
      const search = filters.search.toLowerCase();
      if (!(item.customer_name.toLowerCase().includes(search) || 
            item.invoice_no.toLowerCase().includes(search))) {
        return false;
      }
    }
    if (filters.minAmount) {
      if (item.balance < parseFloat(filters.minAmount)) return false;
    }
    if (filters.daysOverdue !== 'ALL') {
      const days = parseInt(filters.daysOverdue);
      if (days === 0 && item.days_overdue > 0) return false;
      if (days === 30 && item.days_overdue < 30) return false;
      if (days === 60 && item.days_overdue < 60) return false;
      if (days === 90 && item.days_overdue < 90) return false;
    }
    return true;
  });

  const totalOutstanding = outstandingData.reduce((sum, item) => sum + item.balance, 0);
  const criticalCount = outstandingData.filter(item => item.days_overdue > 60).length;
  const warningCount = outstandingData.filter(item => item.days_overdue > 30 && item.days_overdue <= 60).length;

  if (loading) {
    return <div className="loading">⏳ Loading outstanding data...</div>;
  }

  return (
    <div className="reception-page">
      <div className="page-header">
        <div>
          <h1>₹ Outstanding Summary (Read-Only)</h1>
          <p className="subtitle">Replacement of Outstanding notebook</p>
        </div>
      </div>

      {/* SUMMARY CARDS */}
      <div className="summary-grid">
        <div className="summary-card total">
          <div className="card-icon">₹</div>
          <div className="card-content">
            <div className="card-value">₹{(totalOutstanding / 100000).toFixed(2)}L</div>
            <div className="card-label">Total Outstanding</div>
          </div>
        </div>
        <div className="summary-card invoices">
          <div className="card-icon">📄</div>
          <div className="card-content">
            <div className="card-value">{outstandingData.length}</div>
            <div className="card-label">Pending Invoices</div>
          </div>
        </div>
        <div className="summary-card critical">
          <div className="card-icon">🔴</div>
          <div className="card-content">
            <div className="card-value">{criticalCount}</div>
            <div className="card-label">Critical (60+ days)</div>
          </div>
        </div>
        <div className="summary-card warning">
          <div className="card-icon">🟠</div>
          <div className="card-content">
            <div className="card-value">{warningCount}</div>
            <div className="card-label">Warning (30-60 days)</div>
          </div>
        </div>
      </div>

      {/* READ-ONLY NOTICE */}
      <div className="notice-banner">
        ℹ️ <strong>Read-Only View:</strong> Reception can view outstanding summary but cannot create invoices or update payments.
      </div>

      {/* FILTERS */}
      <div className="filters-section">
        <div className="filter-group">
          <label>Search:</label>
          <input
            type="text"
            placeholder="Customer name or invoice no..."
            value={filters.search}
            onChange={(e) => setFilters({...filters, search: e.target.value})}
          />
        </div>
        
        <div className="filter-group">
          <label>Min Balance:</label>
          <input
            type="number"
            placeholder="Minimum amount..."
            value={filters.minAmount}
            onChange={(e) => setFilters({...filters, minAmount: e.target.value})}
          />
        </div>
        
        <div className="filter-group">
          <label>Overdue Status:</label>
          <select value={filters.daysOverdue} onChange={(e) => setFilters({...filters, daysOverdue: e.target.value})}>
            <option value="ALL">All</option>
            <option value="0">Not Overdue</option>
            <option value="30">30+ days</option>
            <option value="60">60+ days (Critical)</option>
            <option value="90">90+ days (Very Critical)</option>
          </select>
        </div>

        <div className="filter-info">
          Showing {filteredData.length} of {outstandingData.length} records
        </div>
      </div>

      {/* OUTSTANDING TABLE */}
      <div className="data-table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Customer Name</th>
              <th>Invoice No</th>
              <th>Total Amount</th>
              <th>Paid Amount</th>
              <th>Balance</th>
              <th>Due Date</th>
              <th>Days Overdue</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.length === 0 ? (
              <tr><td colSpan="8" className="empty-state">
                {outstandingData.length === 0 ? '✅ No outstanding invoices' : 'No records match filters'}
              </td></tr>
            ) : (
              filteredData.map(item => {
                const statusClass = item.days_overdue > 60 ? 'critical' : item.days_overdue > 30 ? 'warning' : 'normal';
                return (
                  <tr key={item.id} className={`row-${statusClass}`}>
                    <td><strong>{item.customer_name}</strong></td>
                    <td>{item.invoice_no}</td>
                    <td>₹{item.total_amount.toLocaleString()}</td>
                    <td>₹{item.paid_amount.toLocaleString()}</td>
                    <td className="balance-amount">₹{item.balance.toLocaleString()}</td>
                    <td>{item.due_date.toLocaleDateString()}</td>
                    <td>
                      <span className={`days-badge ${statusClass}`}>
                        {item.days_overdue === 0 ? 'On Time' : `${item.days_overdue} days`}
                      </span>
                    </td>
                    <td>
                      <span className={`status-badge ${statusClass}`}>
                        {statusClass === 'critical' ? '🔴 Critical' : 
                         statusClass === 'warning' ? '🟠 Warning' : '🟢 Normal'}
                      </span>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <style>{`
        .reception-page {
          padding: 20px;
          max-width: 1600px;
          margin: 0 auto;
        }

        .page-header {
          margin-bottom: 30px;
          padding-bottom: 20px;
          border-bottom: 2px solid #ecf0f1;
        }

        .page-header h1 {
          margin: 0;
          color: #2c3e50;
          font-size: 28px;
        }

        .subtitle {
          margin: 5px 0 0 0;
          color: #7f8c8d;
          font-size: 14px;
        }

        .summary-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 20px;
          margin-bottom: 25px;
        }

        .summary-card {
          background: white;
          padding: 25px;
          border-radius: 12px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.08);
          display: flex;
          align-items: center;
          gap: 20px;
          border-left: 4px solid;
        }

        .summary-card.total { border-color: #9b59b6; }
        .summary-card.invoices { border-color: #3498db; }
        .summary-card.critical { border-color: #e74c3c; }
        .summary-card.warning { border-color: #f39c12; }

        .card-icon {
          font-size: 40px;
        }

        .card-value {
          font-size: 32px;
          font-weight: bold;
          color: #2c3e50;
          margin-bottom: 5px;
        }

        .card-label {
          font-size: 13px;
          color: #7f8c8d;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .notice-banner {
          background: #fff9e6;
          border-left: 4px solid #f39c12;
          padding: 15px 20px;
          border-radius: 8px;
          margin-bottom: 25px;
          color: #7f6c00;
          font-size: 14px;
        }

        .filters-section {
          background: white;
          padding: 20px;
          border-radius: 12px;
          margin-bottom: 20px;
          display: flex;
          gap: 15px;
          flex-wrap: wrap;
          align-items: end;
          box-shadow: 0 2px 8px rgba(0,0,0,0.08);
        }

        .filter-group {
          display: flex;
          flex-direction: column;
          gap: 5px;
        }

        .filter-group label {
          font-size: 12px;
          font-weight: 600;
          color: #7f8c8d;
          text-transform: uppercase;
        }

        .filter-group input,
        .filter-group select {
          padding: 8px 12px;
          border: 1px solid #ddd;
          border-radius: 6px;
          font-size: 14px;
          min-width: 180px;
        }

        .filter-info {
          margin-left: auto;
          padding: 8px 12px;
          background: #ecf0f1;
          border-radius: 6px;
          font-size: 13px;
          font-weight: 600;
          color: #2c3e50;
        }

        .data-table-container {
          background: white;
          border-radius: 12px;
          overflow-x: auto;
          box-shadow: 0 2px 8px rgba(0,0,0,0.08);
        }

        .data-table {
          width: 100%;
          border-collapse: collapse;
        }

        .data-table th,
        .data-table td {
          padding: 14px;
          text-align: left;
          border-bottom: 1px solid #ecf0f1;
        }

        .data-table th {
          background: #f8f9fa;
          font-weight: 600;
          font-size: 12px;
          color: #7f8c8d;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .data-table tbody tr:hover {
          background: #f8f9fa;
        }

        .row-critical {
          background: #fff5f5;
        }

        .row-warning {
          background: #fff9e6;
        }

        .balance-amount {
          color: #e74c3c;
          font-weight: bold;
          font-size: 15px;
        }

        .days-badge {
          display: inline-block;
          padding: 4px 10px;
          border-radius: 4px;
          font-size: 11px;
          font-weight: 600;
        }

        .days-badge.normal {
          background: #27ae60;
          color: white;
        }

        .days-badge.warning {
          background: #f39c12;
          color: white;
        }

        .days-badge.critical {
          background: #e74c3c;
          color: white;
        }

        .status-badge {
          display: inline-block;
          padding: 4px 10px;
          border-radius: 4px;
          font-size: 11px;
          font-weight: 600;
        }

        .status-badge.normal {
          background: #27ae60;
          color: white;
        }

        .status-badge.warning {
          background: #f39c12;
          color: white;
        }

        .status-badge.critical {
          background: #e74c3c;
          color: white;
        }

        .empty-state {
          text-align: center;
          padding: 60px 20px !important;
          color: #95a5a6;
          font-style: italic;
          font-size: 16px;
        }

        .loading {
          text-align: center;
          padding: 100px;
          font-size: 20px;
          color: #7f8c8d;
        }
      `}</style>
    </div>
  );
};

export default OutstandingSummary;

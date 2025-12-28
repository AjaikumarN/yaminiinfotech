import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../contexts/AuthContext';
import { apiRequest } from '../../utils/api';

const CallsHistory = () => {
  const { user } = useContext(AuthContext);
  const [calls, setCalls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [todayCalls, setTodayCalls] = useState([]);
  const [historyCalls, setHistoryCalls] = useState([]);
  const [filters, setFilters] = useState({
    dateFrom: '',
    dateTo: '',
    search: '',
    callType: 'ALL',
    outcome: 'ALL'
  });
  const [showCallForm, setShowCallForm] = useState(false);
  const [callForm, setCallForm] = useState({
    customer_name: '',
    phone: '',
    call_type: 'Cold',
    outcome: '',
    notes: ''
  });

  const DAILY_TARGET = 40;

  useEffect(() => {
    fetchCalls();
  }, []);

  const fetchCalls = async () => {
    try {
      const [todayData, allData] = await Promise.all([
        apiRequest('/api/sales/calls?today=true'),
        apiRequest('/api/sales/calls')
      ]);
      setTodayCalls(todayData || []);
      setHistoryCalls((allData || []).filter(call => {
        const callDate = new Date(call.call_date).toDateString();
        const today = new Date().toDateString();
        return callDate !== today;
      }));
      setCalls(allData || []);
    } catch (error) {
      console.error('Failed to fetch calls:', error);
    } finally {
      setLoading(false);
    }
  };

  const logCall = async (e) => {
    e.preventDefault();
    try {
      await apiRequest('/api/sales/calls', {
        method: 'POST',
        body: JSON.stringify(callForm)
      });
      setShowCallForm(false);
      setCallForm({
        customer_name: '',
        phone: '',
        call_type: 'Cold',
        outcome: '',
        notes: ''
      });
      fetchCalls();
      alert('✅ Call logged successfully!');
    } catch (error) {
      alert('❌ Failed to log call: ' + (error.message || ''));
    }
  };

  const filteredHistory = historyCalls.filter(call => {
    if (filters.callType !== 'ALL' && call.call_type !== filters.callType) return false;
    if (filters.outcome !== 'ALL' && call.outcome !== filters.outcome) return false;
    if (filters.search) {
      const search = filters.search.toLowerCase();
      return (
        call.customer_name.toLowerCase().includes(search) ||
        call.phone.includes(search)
      );
    }
    if (filters.dateFrom) {
      const callDate = new Date(call.call_date);
      const fromDate = new Date(filters.dateFrom);
      if (callDate < fromDate) return false;
    }
    if (filters.dateTo) {
      const callDate = new Date(call.call_date);
      const toDate = new Date(filters.dateTo);
      if (callDate > toDate) return false;
    }
    return true;
  });

  const callProgress = Math.min(100, (todayCalls.length / DAILY_TARGET) * 100);
  const progressColor = callProgress >= 100 ? '#27ae60' : callProgress >= 75 ? '#f39c12' : '#e74c3c';

  if (loading) {
    return <div className="loading">⏳ Loading call data...</div>;
  }

  return (
    <div className="reception-page">
      <div className="page-header">
        <div>
          <h1>📞 Today's Calls & History</h1>
          <p className="subtitle">Replacement of Call notes register</p>
        </div>
        <button className="btn-primary" onClick={() => setShowCallForm(true)}>
          ➕ Log Call
        </button>
      </div>

      {/* TODAY'S CALLS SECTION */}
      <div className="today-section">
        <h2>📅 Today's Calls & Target</h2>
        
        {/* Progress Bar */}
        <div className="progress-card">
          <div className="progress-header">
            <span className="progress-label">Daily Call Target</span>
            <span className="progress-value">{todayCalls.length} / {DAILY_TARGET}</span>
          </div>
          <div className="progress-bar-container">
            <div 
              className="progress-bar-fill" 
              style={{ width: `${callProgress}%`, background: progressColor }}
            >
              {callProgress >= 10 && <span className="progress-text">{Math.round(callProgress)}%</span>}
            </div>
          </div>
          {callProgress >= 100 && (
            <div className="progress-message success">
              🎉 Congratulations! Daily target achieved!
            </div>
          )}
          {callProgress < 100 && (
            <div className="progress-message">
              {DAILY_TARGET - todayCalls.length} more calls needed to reach target
            </div>
          )}
        </div>

        {/* Today's Calls Table */}
        <div className="data-table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Time</th>
                <th>Customer Name</th>
                <th>Phone</th>
                <th>Call Type</th>
                <th>Outcome</th>
                <th>Notes / Next Action</th>
                <th>Logged By</th>
              </tr>
            </thead>
            <tbody>
              {todayCalls.length === 0 ? (
                <tr><td colSpan="7" className="empty-state">No calls logged today</td></tr>
              ) : (
                todayCalls.map(call => (
                  <tr key={call.id}>
                    <td><strong>{new Date(call.call_date).toLocaleTimeString()}</strong></td>
                    <td>{call.customer_name}</td>
                    <td>{call.phone}</td>
                    <td>
                      <span className={`call-type-badge ${call.call_type.toLowerCase().replace('-', '')}`}>
                        {call.call_type}
                      </span>
                    </td>
                    <td>
                      <span className={`outcome-badge ${call.outcome.toLowerCase().replace(' ', '')}`}>
                        {call.outcome}
                      </span>
                    </td>
                    <td>{call.notes || '-'}</td>
                    <td className="logged-by">Reception</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* HISTORY SECTION */}
      <div className="history-section">
        <h2>📚 Call History</h2>
        
        {/* Filters */}
        <div className="filters-section">
          <div className="filter-group">
            <label>Search:</label>
            <input
              type="text"
              placeholder="Customer name or phone..."
              value={filters.search}
              onChange={(e) => setFilters({...filters, search: e.target.value})}
            />
          </div>
          
          <div className="filter-group">
            <label>Date From:</label>
            <input
              type="date"
              value={filters.dateFrom}
              onChange={(e) => setFilters({...filters, dateFrom: e.target.value})}
            />
          </div>
          
          <div className="filter-group">
            <label>Date To:</label>
            <input
              type="date"
              value={filters.dateTo}
              onChange={(e) => setFilters({...filters, dateTo: e.target.value})}
            />
          </div>
          
          <div className="filter-group">
            <label>Call Type:</label>
            <select value={filters.callType} onChange={(e) => setFilters({...filters, callType: e.target.value})}>
              <option value="ALL">All</option>
              <option value="Cold">Cold Call</option>
              <option value="Follow-up">Follow-up</option>
              <option value="Hot">Hot Lead</option>
            </select>
          </div>
          
          <div className="filter-group">
            <label>Outcome:</label>
            <select value={filters.outcome} onChange={(e) => setFilters({...filters, outcome: e.target.value})}>
              <option value="ALL">All</option>
              <option value="Interested">Interested</option>
              <option value="Not Interested">Not Interested</option>
              <option value="Callback Later">Callback Later</option>
              <option value="Wrong Number">Wrong Number</option>
            </select>
          </div>

          <div className="filter-info">
            Showing {filteredHistory.length} of {historyCalls.length} history records
          </div>
        </div>

        {/* History Table */}
        <div className="data-table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Time</th>
                <th>Customer Name</th>
                <th>Phone</th>
                <th>Call Type</th>
                <th>Outcome</th>
                <th>Notes</th>
              </tr>
            </thead>
            <tbody>
              {filteredHistory.length === 0 ? (
                <tr><td colSpan="7" className="empty-state">No history records found</td></tr>
              ) : (
                filteredHistory.map(call => (
                  <tr key={call.id}>
                    <td>{new Date(call.call_date).toLocaleDateString()}</td>
                    <td>{new Date(call.call_date).toLocaleTimeString()}</td>
                    <td>{call.customer_name}</td>
                    <td>{call.phone}</td>
                    <td>
                      <span className={`call-type-badge ${call.call_type.toLowerCase().replace('-', '')}`}>
                        {call.call_type}
                      </span>
                    </td>
                    <td>
                      <span className={`outcome-badge ${call.outcome.toLowerCase().replace(' ', '')}`}>
                        {call.outcome}
                      </span>
                    </td>
                    <td>{call.notes || '-'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* LOG CALL MODAL */}
      {showCallForm && (
        <div className="modal-overlay" onClick={() => setShowCallForm(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>📞 Log Call</h3>
            <form onSubmit={logCall}>
              <div className="form-group">
                <label>Customer Name *</label>
                <input
                  required
                  value={callForm.customer_name}
                  onChange={(e) => setCallForm({...callForm, customer_name: e.target.value})}
                />
              </div>
              <div className="form-group">
                <label>Phone *</label>
                <input
                  required
                  type="tel"
                  value={callForm.phone}
                  onChange={(e) => setCallForm({...callForm, phone: e.target.value})}
                />
              </div>
              <div className="form-group">
                <label>Call Type *</label>
                <select
                  required
                  value={callForm.call_type}
                  onChange={(e) => setCallForm({...callForm, call_type: e.target.value})}
                >
                  <option value="Cold">Cold Call</option>
                  <option value="Follow-up">Follow-up</option>
                  <option value="Hot">Hot Lead</option>
                </select>
              </div>
              <div className="form-group">
                <label>Outcome *</label>
                <select
                  required
                  value={callForm.outcome}
                  onChange={(e) => setCallForm({...callForm, outcome: e.target.value})}
                >
                  <option value="">Select...</option>
                  <option value="Interested">Interested</option>
                  <option value="Not Interested">Not Interested</option>
                  <option value="Callback Later">Callback Later</option>
                  <option value="Wrong Number">Wrong Number</option>
                </select>
              </div>
              <div className="form-group">
                <label>Notes / Next Action</label>
                <textarea
                  rows="3"
                  value={callForm.notes}
                  onChange={(e) => setCallForm({...callForm, notes: e.target.value})}
                />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={() => setShowCallForm(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Log Call
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{`
        .reception-page {
          padding: 20px;
          max-width: 1600px;
          margin: 0 auto;
        }

        .page-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
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

        .today-section,
        .history-section {
          background: white;
          padding: 25px;
          border-radius: 12px;
          margin-bottom: 25px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.08);
        }

        .today-section h2,
        .history-section h2 {
          margin: 0 0 20px 0;
          color: #2c3e50;
          font-size: 20px;
        }

        .progress-card {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          padding: 25px;
          border-radius: 12px;
          color: white;
          margin-bottom: 25px;
        }

        .progress-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 15px;
        }

        .progress-label {
          font-size: 16px;
          font-weight: 600;
        }

        .progress-value {
          font-size: 24px;
          font-weight: bold;
        }

        .progress-bar-container {
          background: rgba(255,255,255,0.2);
          border-radius: 50px;
          height: 30px;
          overflow: hidden;
          margin-bottom: 10px;
        }

        .progress-bar-fill {
          height: 100%;
          border-radius: 50px;
          transition: width 0.5s ease;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .progress-text {
          color: white;
          font-weight: bold;
          font-size: 14px;
        }

        .progress-message {
          text-align: center;
          font-size: 14px;
          margin-top: 10px;
          opacity: 0.9;
        }

        .progress-message.success {
          font-weight: bold;
          font-size: 16px;
          opacity: 1;
        }

        .filters-section {
          background: #f8f9fa;
          padding: 20px;
          border-radius: 8px;
          margin-bottom: 20px;
          display: flex;
          gap: 15px;
          flex-wrap: wrap;
          align-items: end;
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
          min-width: 150px;
        }

        .filter-info {
          margin-left: auto;
          padding: 8px 12px;
          background: white;
          border-radius: 6px;
          font-size: 13px;
          font-weight: 600;
          color: #2c3e50;
        }

        .data-table-container {
          overflow-x: auto;
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

        .call-type-badge {
          display: inline-block;
          padding: 4px 10px;
          border-radius: 4px;
          font-size: 11px;
          font-weight: 600;
        }

        .call-type-badge.cold {
          background: #3498db;
          color: white;
        }

        .call-type-badge.followup {
          background: #f39c12;
          color: white;
        }

        .call-type-badge.hot {
          background: #e74c3c;
          color: white;
        }

        .outcome-badge {
          display: inline-block;
          padding: 4px 10px;
          border-radius: 4px;
          font-size: 11px;
          font-weight: 600;
        }

        .outcome-badge.interested {
          background: #27ae60;
          color: white;
        }

        .outcome-badge.notinterested {
          background: #e74c3c;
          color: white;
        }

        .outcome-badge.callbacklater {
          background: #f39c12;
          color: white;
        }

        .outcome-badge.wrongnumber {
          background: #95a5a6;
          color: white;
        }

        .logged-by {
          color: #7f8c8d;
          font-size: 13px;
        }

        .empty-state {
          text-align: center;
          padding: 60px 20px !important;
          color: #95a5a6;
          font-style: italic;
          font-size: 16px;
        }

        .btn-primary,
        .btn-secondary {
          padding: 10px 20px;
          border: none;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s;
          font-size: 14px;
        }

        .btn-primary {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
        }

        .btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
        }

        .btn-secondary {
          background: #95a5a6;
          color: white;
        }

        .btn-secondary:hover {
          background: #7f8c8d;
        }

        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0,0,0,0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }

        .modal-content {
          background: white;
          border-radius: 12px;
          padding: 30px;
          max-width: 500px;
          width: 90%;
          max-height: 90vh;
          overflow-y: auto;
        }

        .modal-content h3 {
          margin: 0 0 25px 0;
          color: #2c3e50;
        }

        .form-group {
          margin-bottom: 15px;
        }

        .form-group label {
          display: block;
          margin-bottom: 5px;
          font-weight: 600;
          font-size: 13px;
          color: #2c3e50;
        }

        .form-group input,
        .form-group select,
        .form-group textarea {
          width: 100%;
          padding: 10px;
          border: 1px solid #ddd;
          border-radius: 6px;
          font-size: 14px;
          font-family: inherit;
        }

        .form-group textarea {
          resize: vertical;
        }

        .modal-actions {
          display: flex;
          justify-content: flex-end;
          gap: 10px;
          margin-top: 25px;
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

export default CallsHistory;

import { useState, useEffect } from 'react';
import axios from 'axios';

const MissingReportsWidget = () => {
  const [missingReports, setMissingReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchMissingReports();
    // Refresh every 5 minutes
    const interval = setInterval(fetchMissingReports, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const fetchMissingReports = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        'http://127.0.0.1:8000/api/reports/daily/missing',
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );
      
      setMissingReports(response.data.missing_reports || []);
      setError('');
    } catch (err) {
      setError('Failed to load missing reports');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="widget-card">
        <div className="loading">⏳ Loading...</div>
      </div>
    );
  }

  return (
    <div className="missing-reports-widget">
      <div className="widget-card">
        <div className="widget-header">
          <h3>⚠️ Missing Daily Reports</h3>
          <button onClick={fetchMissingReports} className="refresh-btn" title="Refresh">
            🔄
          </button>
        </div>

        {error && (
          <div className="error-message">{error}</div>
        )}

        {missingReports.length === 0 ? (
          <div className="success-state">
            <div className="success-icon">✅</div>
            <p>All salesmen have submitted their daily reports!</p>
            <p className="subtitle">Great job team! 🎉</p>
          </div>
        ) : (
          <>
            <div className="alert-banner">
              <span className="alert-count">{missingReports.length}</span>
              <span>salesman{missingReports.length > 1 ? 's' : ''} haven't submitted reports today</span>
            </div>

            <div className="missing-list">
              {missingReports.map((report, index) => (
                <div key={report.salesman_id} className="salesman-item">
                  <div className="salesman-info">
                    <div className="avatar">{report.salesman_name.charAt(0).toUpperCase()}</div>
                    <div className="details">
                      <span className="name">{report.salesman_name}</span>
                      <span className="username">@{report.username}</span>
                    </div>
                  </div>
                  <div className="status-badge">
                    Not Submitted
                  </div>
                </div>
              ))}
            </div>

            <div className="info-footer">
              <p>💡 Automated notifications will be sent at 7:00 PM if reports remain unsubmitted.</p>
            </div>
          </>
        )}
      </div>

      <style jsx>{`
        .missing-reports-widget {
          margin-bottom: 20px;
        }

        .widget-card {
          background: white;
          border-radius: 12px;
          padding: 20px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }

        .widget-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 15px;
        }

        .widget-header h3 {
          margin: 0;
          font-size: 18px;
          color: #1a1a1a;
        }

        .refresh-btn {
          background: none;
          border: none;
          font-size: 18px;
          cursor: pointer;
          padding: 5px;
          border-radius: 4px;
          transition: background 0.2s;
        }

        .refresh-btn:hover {
          background: #f0f0f0;
        }

        .loading,
        .error-message {
          text-align: center;
          padding: 20px;
          color: #666;
        }

        .error-message {
          color: #dc3545;
          background: #f8d7da;
          border-radius: 6px;
        }

        .success-state {
          text-align: center;
          padding: 30px 20px;
        }

        .success-icon {
          font-size: 48px;
          margin-bottom: 10px;
        }

        .success-state p {
          margin: 8px 0;
          color: #28a745;
          font-weight: 600;
        }

        .success-state .subtitle {
          color: #666;
          font-weight: 400;
          font-size: 14px;
        }

        .alert-banner {
          background: linear-gradient(135deg, #ff6b6b, #ee5a6f);
          color: white;
          padding: 15px;
          border-radius: 8px;
          margin-bottom: 15px;
          display: flex;
          align-items: center;
          gap: 12px;
          font-weight: 600;
        }

        .alert-count {
          background: rgba(255,255,255,0.3);
          padding: 5px 12px;
          border-radius: 20px;
          font-size: 18px;
          font-weight: 700;
        }

        .missing-list {
          max-height: 400px;
          overflow-y: auto;
        }

        .salesman-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px;
          border-bottom: 1px solid #f0f0f0;
          transition: background 0.2s;
        }

        .salesman-item:hover {
          background: #f8f9fa;
        }

        .salesman-item:last-child {
          border-bottom: none;
        }

        .salesman-info {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .avatar {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: linear-gradient(135deg, #667eea, #764ba2);
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 16px;
        }

        .details {
          display: flex;
          flex-direction: column;
        }

        .name {
          font-weight: 600;
          color: #1a1a1a;
          font-size: 15px;
        }

        .username {
          color: #666;
          font-size: 13px;
        }

        .status-badge {
          background: #fff3cd;
          color: #856404;
          padding: 6px 12px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 600;
          border: 1px solid #ffeaa7;
        }

        .info-footer {
          margin-top: 15px;
          padding: 12px;
          background: #e7f3ff;
          border-left: 3px solid #007bff;
          border-radius: 4px;
        }

        .info-footer p {
          margin: 0;
          font-size: 13px;
          color: #004085;
        }
      `}</style>
    </div>
  );
};

export default MissingReportsWidget;

import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import { apiRequest } from '../utils/api';

const SalesmanDailyReport = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [todayReport, setTodayReport] = useState(null);
  const [formData, setFormData] = useState({
    calls_made: 0,
    shops_visited: 0,
    enquiries_generated: 0,
    sales_closed: 0,
    report_notes: ''
  });
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchReports();
    }
  }, [user]);

  const fetchReports = async () => {
    try {
      const data = await apiRequest('/api/reports/my-reports?days=30');
      const reportsData = data || [];
      setReports(reportsData);
      
      // Check if today's report is already submitted
      const today = new Date().toISOString().split('T')[0];
      const todayRep = reportsData.find(r => r.report_date.startsWith(today));
      setTodayReport(todayRep || null);
      
      if (todayRep) {
        setFormData({
          calls_made: todayRep.calls_made,
          shops_visited: todayRep.shops_visited,
          enquiries_generated: todayRep.enquiries_generated,
          sales_closed: todayRep.sales_closed,
          report_notes: todayRep.report_notes || ''
        });
      }
    } catch (error) {
      console.error('Failed to fetch reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Format date as YYYY-MM-DD for the backend
      const today = new Date();
      const reportDate = today.toISOString().split('T')[0];
      
      await apiRequest('/api/reports/daily', {
        method: 'POST',
        body: JSON.stringify({
          ...formData,
          report_date: reportDate
        })
      });
      
      alert('Daily report submitted successfully!');
      fetchReports();
    } catch (error) {
      console.error('Failed to submit report:', error);
      alert('Failed to submit daily report');
    }
  };

  if (loading) {
    return <div className="loading">⏳ Loading reports...</div>;
  }

  return (
    <div className="daily-report-page">
      <div className="page-header">
        <div>
          <h1>📝 Daily Report</h1>
          <p>Submit your daily sales activity report</p>
        </div>
        <button className="btn-back" onClick={() => navigate('/salesman/dashboard')}>
          ← Back
        </button>
      </div>

      {/* Today's Report Form */}
      <div className="report-form-container">
        <h2>{todayReport ? '✅ Today\'s Report Submitted' : '📝 Submit Today\'s Report'}</h2>
        <form onSubmit={handleSubmit}>
          <div className="metrics-grid">
            <div className="metric-input">
              <label>📞 Calls Made</label>
              <input
                type="number"
                min="0"
                value={formData.calls_made}
                onChange={(e) => setFormData({...formData, calls_made: parseInt(e.target.value) || 0})}
                disabled={todayReport}
              />
            </div>

            <div className="metric-input">
              <label>🏢 Shops Visited</label>
              <input
                type="number"
                min="0"
                value={formData.shops_visited}
                onChange={(e) => setFormData({...formData, shops_visited: parseInt(e.target.value) || 0})}
                disabled={todayReport}
              />
            </div>

            <div className="metric-input">
              <label>📋 Enquiries Generated</label>
              <input
                type="number"
                min="0"
                value={formData.enquiries_generated}
                onChange={(e) => setFormData({...formData, enquiries_generated: parseInt(e.target.value) || 0})}
                disabled={todayReport}
              />
            </div>

            <div className="metric-input">
              <label>💰 Sales Closed</label>
              <input
                type="number"
                min="0"
                value={formData.sales_closed}
                onChange={(e) => setFormData({...formData, sales_closed: parseInt(e.target.value) || 0})}
                disabled={todayReport}
              />
            </div>
          </div>

          <div className="form-group">
            <label>📝 Additional Notes / Remarks</label>
            <textarea
              rows="4"
              value={formData.report_notes}
              onChange={(e) => setFormData({...formData, report_notes: e.target.value})}
              placeholder="Key achievements, challenges faced, important updates..."
              disabled={todayReport}
            />
          </div>

          {!todayReport && (
            <button type="submit" className="btn-submit">
              ✓ Submit Report
            </button>
          )}
        </form>
      </div>

      {/* Report History */}
      <div className="reports-history">
        <h2>📊 Report History ({reports.length} reports)</h2>
        {reports.length === 0 ? (
          <div className="empty-state">
            <p>No reports submitted yet</p>
          </div>
        ) : (
          <div className="reports-list">
            {reports.map(report => (
              <div key={report.id} className="report-card">
                <div className="report-header">
                  <h3>{new Date(report.report_date).toLocaleDateString('en-US', {
                    weekday: 'long',
                    month: 'long',
                    day: 'numeric'
                  })}</h3>
                  <span className="report-status">
                    {report.report_submitted ? '✅ Submitted' : '⏳ Draft'}
                  </span>
                </div>
                <div className="report-stats">
                  <div className="stat">
                    <span className="stat-icon">📞</span>
                    <span className="stat-value">{report.calls_made}</span>
                    <span className="stat-label">Calls</span>
                  </div>
                  <div className="stat">
                    <span className="stat-icon">🏢</span>
                    <span className="stat-value">{report.shops_visited}</span>
                    <span className="stat-label">Visits</span>
                  </div>
                  <div className="stat">
                    <span className="stat-icon">📋</span>
                    <span className="stat-value">{report.enquiries_generated}</span>
                    <span className="stat-label">Enquiries</span>
                  </div>
                  <div className="stat">
                    <span className="stat-icon">💰</span>
                    <span className="stat-value">{report.sales_closed}</span>
                    <span className="stat-label">Sales</span>
                  </div>
                </div>
                {report.report_notes && (
                  <div className="report-notes">
                    <p>{report.report_notes}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <style>{`
        .daily-report-page {
          padding: 20px;
          background: #f5f7fa;
          min-height: 100vh;
        }

        .page-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 30px;
          background: white;
          padding: 25px;
          border-radius: 12px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }

        .page-header h1 {
          margin: 0 0 5px 0;
        }

        .page-header p {
          margin: 0;
          color: #666;
        }

        .btn-back {
          padding: 12px 24px;
          background: #6c757d;
          color: white;
          border: none;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
        }

        .report-form-container {
          background: white;
          padding: 25px;
          border-radius: 12px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
          margin-bottom: 20px;
        }

        .report-form-container h2 {
          margin: 0 0 20px 0;
        }

        .metrics-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 20px;
          margin-bottom: 20px;
        }

        .metric-input {
          display: flex;
          flex-direction: column;
        }

        .metric-input label {
          font-weight: 600;
          margin-bottom: 8px;
          color: #1a1a1a;
        }

        .metric-input input {
          padding: 12px;
          border: 2px solid #e0e0e0;
          border-radius: 8px;
          font-size: 18px;
          font-weight: 700;
          text-align: center;
        }

        .metric-input input:focus {
          outline: none;
          border-color: #667eea;
        }

        .metric-input input:disabled {
          background: #f8f9fa;
          cursor: not-allowed;
        }

        .form-group {
          margin-bottom: 20px;
        }

        .form-group label {
          display: block;
          font-weight: 600;
          margin-bottom: 8px;
          color: #1a1a1a;
        }

        .form-group textarea {
          width: 100%;
          padding: 12px;
          border: 2px solid #e0e0e0;
          border-radius: 8px;
          font-size: 14px;
          resize: vertical;
        }

        .form-group textarea:focus {
          outline: none;
          border-color: #667eea;
        }

        .form-group textarea:disabled {
          background: #f8f9fa;
          cursor: not-allowed;
        }

        .btn-submit {
          width: 100%;
          padding: 14px;
          background: #28a745;
          color: white;
          border: none;
          border-radius: 8px;
          font-weight: 600;
          font-size: 16px;
          cursor: pointer;
        }

        .btn-submit:hover {
          background: #218838;
        }

        .reports-history {
          background: white;
          padding: 25px;
          border-radius: 12px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }

        .reports-history h2 {
          margin: 0 0 20px 0;
        }

        .reports-list {
          display: grid;
          gap: 15px;
        }

        .report-card {
          background: #f8f9fa;
          padding: 20px;
          border-radius: 8px;
          border-left: 4px solid #667eea;
        }

        .report-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 15px;
        }

        .report-header h3 {
          margin: 0;
          font-size: 16px;
        }

        .report-status {
          font-size: 12px;
          font-weight: 700;
          padding: 4px 8px;
          border-radius: 4px;
          background: #28a745;
          color: white;
        }

        .report-stats {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 15px;
        }

        .stat {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 15px;
          background: white;
          border-radius: 6px;
        }

        .stat-icon {
          font-size: 24px;
          margin-bottom: 8px;
        }

        .stat-value {
          font-size: 24px;
          font-weight: 700;
          color: #1a1a1a;
        }

        .stat-label {
          font-size: 12px;
          color: #666;
          margin-top: 4px;
        }

        .report-notes {
          margin-top: 15px;
          padding-top: 15px;
          border-top: 1px solid #e0e0e0;
        }

        .report-notes p {
          margin: 0;
          color: #666;
          line-height: 1.6;
        }

        .empty-state {
          text-align: center;
          padding: 40px;
          color: #999;
        }

        .loading {
          text-align: center;
          padding: 100px 20px;
          font-size: 24px;
          color: #666;
        }

        @media (max-width: 968px) {
          .metrics-grid {
            grid-template-columns: repeat(2, 1fr);
          }

          .report-stats {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 576px) {
          .metrics-grid,
          .report-stats {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default SalesmanDailyReport;

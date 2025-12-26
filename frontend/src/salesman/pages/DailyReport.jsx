import React, { useState, useEffect } from 'react';
import { submitDailyReport, getTodayReport } from '../hooks/useSalesmanApi';
import '../styles/salesman.css';

/**
 * DailyReport Page - End of day report submission
 */
export default function DailyReport() {
  const [todayReport, setTodayReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    calls_made: 0,
    meetings_done: 0,
    orders_closed: 0,
    challenges: '',
    achievements: '',
    tomorrow_plan: '',
  });

  useEffect(() => {
    checkTodayReport();
  }, []);

  const checkTodayReport = async () => {
    try {
      const report = await getTodayReport();
      setTodayReport(report);
    } catch (error) {
      // No report for today is fine
      console.log('No report for today yet');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      await submitDailyReport(formData);
      alert('✅ Daily report submitted successfully!');
      await checkTodayReport();
    } catch (error) {
      console.error('Failed to submit report:', error);
      alert(error.response?.data?.detail || 'Failed to submit report');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="page-header"><h2 className="page-title">Loading...</h2></div>;
  }

  // Already submitted
  if (todayReport) {
    return (
      <div>
        <div className="page-header">
          <h2 className="page-title">Daily Report</h2>
          <p className="page-description">Your report for today</p>
        </div>

        <div className="attendance-banner marked">
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>✅</div>
            <div style={{ fontSize: '20px', fontWeight: 600, marginBottom: '8px' }}>
              Daily Report Already Submitted
            </div>
            <div style={{ fontSize: '14px', color: '#059669' }}>
              Submitted at: {new Date(todayReport.created_at).toLocaleTimeString()}
            </div>
          </div>
        </div>

        <div className="form-card">
          <h3 className="section-title">Report Summary</h3>
          <div className="report-summary">
            <div className="report-stat">
              <div className="report-stat-label">Calls Made</div>
              <div className="report-stat-value">{todayReport.calls_made}</div>
            </div>
            <div className="report-stat">
              <div className="report-stat-label">Meetings Done</div>
              <div className="report-stat-value">{todayReport.meetings_done}</div>
            </div>
            <div className="report-stat">
              <div className="report-stat-label">Orders Closed</div>
              <div className="report-stat-value">{todayReport.orders_closed}</div>
            </div>
          </div>
          {todayReport.achievements && (
            <div className="report-field">
              <div className="report-field-label">Achievements</div>
              <div className="report-field-value">{todayReport.achievements}</div>
            </div>
          )}
          {todayReport.challenges && (
            <div className="report-field">
              <div className="report-field-label">Challenges</div>
              <div className="report-field-value">{todayReport.challenges}</div>
            </div>
          )}
          {todayReport.tomorrow_plan && (
            <div className="report-field">
              <div className="report-field-label">Tomorrow's Plan</div>
              <div className="report-field-value">{todayReport.tomorrow_plan}</div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Submit form
  return (
    <div>
      <div className="page-header">
        <h2 className="page-title">Daily Report</h2>
        <p className="page-description">Submit your end-of-day report</p>
      </div>

      <form onSubmit={handleSubmit} className="form-card">
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Calls Made *</label>
            <input
              type="number"
              className="form-control"
              value={formData.calls_made}
              onChange={(e) => setFormData({ ...formData, calls_made: parseInt(e.target.value) || 0 })}
              min="0"
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Meetings Done *</label>
            <input
              type="number"
              className="form-control"
              value={formData.meetings_done}
              onChange={(e) => setFormData({ ...formData, meetings_done: parseInt(e.target.value) || 0 })}
              min="0"
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Orders Closed *</label>
            <input
              type="number"
              className="form-control"
              value={formData.orders_closed}
              onChange={(e) => setFormData({ ...formData, orders_closed: parseInt(e.target.value) || 0 })}
              min="0"
              required
            />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Today's Achievements</label>
          <textarea
            className="form-control"
            rows="3"
            value={formData.achievements}
            onChange={(e) => setFormData({ ...formData, achievements: e.target.value })}
            placeholder="What went well today?"
          />
        </div>

        <div className="form-group">
          <label className="form-label">Challenges Faced</label>
          <textarea
            className="form-control"
            rows="3"
            value={formData.challenges}
            onChange={(e) => setFormData({ ...formData, challenges: e.target.value })}
            placeholder="Any difficulties or obstacles?"
          />
        </div>

        <div className="form-group">
          <label className="form-label">Tomorrow's Plan</label>
          <textarea
            className="form-control"
            rows="3"
            value={formData.tomorrow_plan}
            onChange={(e) => setFormData({ ...formData, tomorrow_plan: e.target.value })}
            placeholder="What will you focus on tomorrow?"
          />
        </div>

        <div className="form-actions">
          <button type="submit" className="btn btn-primary" disabled={submitting}>
            {submitting ? 'Submitting...' : '✓ Submit Report'}
          </button>
        </div>
      </form>
    </div>
  );
}

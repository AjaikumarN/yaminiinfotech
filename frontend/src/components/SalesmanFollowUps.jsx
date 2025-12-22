import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import { apiRequest } from '../utils/api';

const SalesmanFollowUps = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [followups, setFollowups] = useState([]);
  const [filter, setFilter] = useState('all'); // all, pending, completed, overdue
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchFollowups();
    }
  }, [user, filter]);

  const fetchFollowups = async () => {
    try {
      const status = filter === 'all' ? null : filter === 'pending' ? 'Pending' : 'Completed';
      const data = await apiRequest(`/api/enquiries/followups${status ? `?status=${status}` : ''}`);
      
      let filteredData = data || [];
      
      // If filter is overdue, get only overdue pending followups
      if (filter === 'overdue') {
        const now = new Date();
        filteredData = filteredData.filter(f => {
          if (f.status !== 'Pending') return false;
          const scheduledDate = new Date(f.followup_date);
          return scheduledDate < now;
        });
      }
      
      setFollowups(filteredData);
    } catch (error) {
      console.error('Failed to fetch followups:', error);
    } finally {
      setLoading(false);
    }
  };

  const completeFollowup = async (followupId) => {
    try {
      await apiRequest(`/api/enquiries/followups/${followupId}`, {
        method: 'PUT',
        body: JSON.stringify({
          status: 'Completed',
          completed_at: new Date().toISOString()
        })
      });
      
      fetchFollowups();
      alert('Follow-up marked as complete!');
    } catch (error) {
      console.error('Failed to complete followup:', error);
      alert('Failed to mark followup as complete');
    }
  };

  const getFollowupStatus = (followup) => {
    if (followup.status === 'Completed') return { label: 'Completed', color: '#28a745' };
    
    const now = new Date();
    const followupDate = new Date(followup.followup_date);
    
    if (followupDate < now) return { label: 'Overdue', color: '#dc3545' };
    if (followupDate.toDateString() === now.toDateString()) return { label: 'Due Today', color: '#ffc107' };
    return { label: 'Scheduled', color: '#17a2b8' };
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return <div className="loading">⏳ Loading follow-ups...</div>;
  }

  return (
    <div className="followups-page">
      <div className="page-header">
        <div>
          <h1>🔄 Follow-ups</h1>
          <p>Manage your customer follow-ups</p>
        </div>
        <button className="btn-back" onClick={() => navigate('/salesman/dashboard')}>
          ← Back to Dashboard
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="filter-tabs">
        <button 
          className={`tab ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
        >
          All ({followups.length})
        </button>
        <button 
          className={`tab ${filter === 'pending' ? 'active' : ''}`}
          onClick={() => setFilter('pending')}
        >
          Pending
        </button>
        <button 
          className={`tab ${filter === 'overdue' ? 'active' : ''}`}
          onClick={() => setFilter('overdue')}
        >
          Overdue
        </button>
        <button 
          className={`tab ${filter === 'completed' ? 'active' : ''}`}
          onClick={() => setFilter('completed')}
        >
          Completed
        </button>
      </div>

      {/* Followups List */}
      <div className="followups-container">
        {followups.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📭</div>
            <h3>No follow-ups found</h3>
            <p>You don't have any {filter !== 'all' ? filter : ''} follow-ups at the moment</p>
          </div>
        ) : (
          <div className="followups-grid">
            {followups.map(followup => {
              const status = getFollowupStatus(followup);
              return (
                <div key={followup.id} className="followup-card">
                  <div className="card-header">
                    <h3>Enquiry #{followup.enquiry_id}</h3>
                    <span 
                      className="status-badge"
                      style={{ background: status.color }}
                    >
                      {status.label}
                    </span>
                  </div>
                  
                  <div className="card-body">
                    <div className="info-row">
                      <span className="label">📅 Scheduled:</span>
                      <span className="value">{formatDate(followup.followup_date)}</span>
                    </div>
                    
                    <div className="note-section">
                      <span className="label">📝 Note:</span>
                      <p className="note-text">{followup.note}</p>
                    </div>
                  </div>
                  
                  <div className="card-actions">
                    <button 
                      className="btn-primary"
                      onClick={() => navigate(`/salesman/enquiries/${followup.enquiry_id}`)}
                    >
                      View Enquiry
                    </button>
                    {followup.status === 'Pending' && (
                      <button 
                        className="btn-success"
                        onClick={() => completeFollowup(followup.id)}
                      >
                        ✓ Complete
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <style>{`
        .followups-page {
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
          color: #1a1a1a;
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
          transition: all 0.3s;
        }

        .btn-back:hover {
          background: #5a6268;
        }

        .filter-tabs {
          background: white;
          padding: 15px;
          border-radius: 12px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
          margin-bottom: 20px;
          display: flex;
          gap: 10px;
        }

        .tab {
          padding: 10px 20px;
          background: #f8f9fa;
          border: 2px solid transparent;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s;
        }

        .tab:hover {
          background: #e9ecef;
        }

        .tab.active {
          background: #667eea;
          color: white;
          border-color: #667eea;
        }

        .followups-container {
          background: white;
          padding: 25px;
          border-radius: 12px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }

        .empty-state {
          text-align: center;
          padding: 60px 20px;
        }

        .empty-icon {
          font-size: 80px;
          margin-bottom: 20px;
        }

        .empty-state h3 {
          margin: 0 0 10px 0;
          color: #1a1a1a;
        }

        .empty-state p {
          color: #666;
          margin: 0;
        }

        .followups-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
          gap: 20px;
        }

        .followup-card {
          background: #f8f9fa;
          border-radius: 8px;
          padding: 20px;
          border-left: 4px solid #667eea;
        }

        .card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 15px;
        }

        .card-header h3 {
          margin: 0;
          font-size: 18px;
          color: #1a1a1a;
        }

        .status-badge {
          padding: 4px 12px;
          border-radius: 12px;
          color: white;
          font-size: 12px;
          font-weight: 700;
        }

        .card-body {
          margin-bottom: 15px;
        }

        .info-row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 10px;
        }

        .label {
          font-weight: 600;
          color: #666;
          font-size: 14px;
        }

        .value {
          color: #1a1a1a;
          font-size: 14px;
        }

        .note-section {
          margin-top: 15px;
        }

        .note-text {
          margin: 8px 0 0 0;
          padding: 12px;
          background: white;
          border-radius: 6px;
          color: #666;
          font-size: 14px;
          line-height: 1.5;
        }

        .card-actions {
          display: flex;
          gap: 10px;
          margin-top: 15px;
        }

        .btn-primary,
        .btn-success {
          flex: 1;
          padding: 10px 16px;
          border: none;
          border-radius: 6px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s;
        }

        .btn-primary {
          background: #667eea;
          color: white;
        }

        .btn-primary:hover {
          background: #5568d3;
        }

        .btn-success {
          background: #28a745;
          color: white;
        }

        .btn-success:hover {
          background: #218838;
        }

        .loading {
          text-align: center;
          padding: 100px 20px;
          font-size: 24px;
          color: #666;
        }

        @media (max-width: 768px) {
          .followups-grid {
            grid-template-columns: 1fr;
          }

          .page-header {
            flex-direction: column;
            gap: 15px;
          }

          .btn-back {
            width: 100%;
          }

          .filter-tabs {
            flex-wrap: wrap;
          }
        }
      `}</style>
    </div>
  );
};

export default SalesmanFollowUps;

import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import { apiRequest } from '../utils/api';

const ServiceEngineerDashboard = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  
  // Attendance State
  const [attendanceStatus, setAttendanceStatus] = useState({
    checked_in: false,
    loading: true
  });
  const [checkingIn, setCheckingIn] = useState(false);

  // Service Requests State
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    assigned: 0,
    in_progress: 0,
    on_hold: 0,
    completed_today: 0,
    sla_breached: 0,
    sla_warning: 0
  });

  // Performance Analytics State
  const [analytics, setAnalytics] = useState(null);

  // Status Update Modal
  const [statusModal, setStatusModal] = useState({ show: false, service: null });
  const [completionModal, setCompletionModal] = useState({ show: false, service: null });
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [partsReplaced, setPartsReplaced] = useState('');
  const [qrModal, setQrModal] = useState({ show: false, qr: null, url: null });

  useEffect(() => {
    checkAttendanceStatus();
  }, []);

  useEffect(() => {
    if (attendanceStatus.checked_in) {
      fetchServices();
      fetchAnalytics();
      const interval = setInterval(fetchServices, 30000); // Refresh every 30 seconds
      return () => clearInterval(interval);
    }
  }, [attendanceStatus.checked_in]);

  const checkAttendanceStatus = async () => {
    try {
      const data = await apiRequest('/api/attendance/status');
      setAttendanceStatus({
        checked_in: data.checked_in,
        attendance: data.attendance,
        loading: false
      });
    } catch (error) {
      console.error('Failed to check attendance:', error);
      setAttendanceStatus({ checked_in: false, loading: false });
    }
  };

  const handleCheckIn = async () => {
    setCheckingIn(true);
    try {
      // Get current location
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(async (position) => {
          try {
            const checkInData = {
              time: new Date().toLocaleTimeString(),
              location: "Field Location",
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
              photo_path: null,
              status: "Present"
            };

            await apiRequest('/api/attendance/check-in', {
              method: 'POST',
              body: JSON.stringify(checkInData)
            });

            // Wait for status to update
            const statusData = await apiRequest('/api/attendance/status');
            console.log('Attendance status after check-in:', statusData);
            
            if (statusData.checked_in) {
              setAttendanceStatus({
                checked_in: true,
                attendance: statusData.attendance,
                loading: false
              });
              alert('✅ Successfully checked in! Loading dashboard...');
            } else {
              alert('⚠️ Check-in succeeded but status not updated. Please refresh the page.');
            }
            setCheckingIn(false);
          } catch (error) {
            alert('❌ Check-in failed: ' + error.message);
            setCheckingIn(false);
          }
        }, (error) => {
          alert('Location permission denied. Please enable location.');
          setCheckingIn(false);
        });
      } else {
        alert('Geolocation not supported');
        setCheckingIn(false);
      }
    } catch (error) {
      alert('❌ Check-in failed');
      setCheckingIn(false);
    }
  };

  const fetchServices = async () => {
    try {
      const data = await apiRequest('/api/service-requests/my-services');
      setServices(data);
      calculateStats(data);
    } catch (error) {
      console.error('Failed to fetch services:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAnalytics = async () => {
    try {
      const data = await apiRequest('/api/feedback/engineer/analytics');
      setAnalytics(data);
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    }
  };

  const calculateStats = (data) => {
    const now = new Date();
    const todayStart = new Date(now.setHours(0,0,0,0));

    const stats = {
      total: data.length,
      assigned: data.filter(s => s.status === 'ASSIGNED').length,
      in_progress: data.filter(s => s.status === 'IN_PROGRESS' || s.status === 'ON_THE_WAY').length,
      on_hold: data.filter(s => s.status === 'ON_HOLD').length,
      completed_today: data.filter(s => 
        s.status === 'COMPLETED' && 
        new Date(s.resolved_at) >= todayStart
      ).length,
      sla_breached: data.filter(s => s.sla_status?.status === 'breached').length,
      sla_warning: data.filter(s => s.sla_status?.status === 'warning').length
    };

    setStats(stats);
  };

  const getSLAColor = (status) => {
    const colors = {
      ok: '#10b981',
      warning: '#f59e0b',
      breached: '#ef4444',
      paused: '#6b7280'
    };
    return colors[status] || '#6b7280';
  };

  const formatTime = (seconds) => {
    if (!seconds) return '0h 0m';
    const hours = Math.floor(Math.abs(seconds) / 3600);
    const minutes = Math.floor((Math.abs(seconds) % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  const handleStatusUpdate = async (newStatus) => {
    try {
      await apiRequest(`/api/service-requests/${statusModal.service.id}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status: newStatus })
      });

      setStatusModal({ show: false, service: null });
      fetchServices();
      alert(`✅ Status updated to ${newStatus}`);
    } catch (error) {
      alert('❌ Failed to update status: ' + error.message);
    }
  };

  const handleComplete = async () => {
    if (!resolutionNotes.trim()) {
      alert('Please provide resolution notes');
      return;
    }

    try {
      const response = await apiRequest(`/api/service-requests/${completionModal.service.id}/complete`, {
        method: 'POST',
        body: JSON.stringify({
          resolution_notes: resolutionNotes,
          parts_replaced: partsReplaced || null
        })
      });

      setCompletionModal({ show: false, service: null });
      setResolutionNotes('');
      setPartsReplaced('');
      
      // Show QR code
      setQrModal({
        show: true,
        qr: response.feedback_qr,
        url: response.feedback_url
      });

      fetchServices();
      fetchAnalytics();
    } catch (error) {
      alert('❌ Failed to complete service: ' + error.message);
    }
  };

  const getNextStatus = (currentStatus) => {
    const transitions = {
      'ASSIGNED': ['ON_THE_WAY', 'ON_HOLD'],
      'ON_THE_WAY': ['IN_PROGRESS', 'ON_HOLD'],
      'IN_PROGRESS': ['ON_HOLD', 'COMPLETED'],
      'ON_HOLD': ['IN_PROGRESS']
    };
    return transitions[currentStatus] || [];
  };

  const getPriorityColor = (priority) => {
    const colors = {
      'CRITICAL': '#dc2626',
      'URGENT': '#f59e0b',
      'NORMAL': '#10b981'
    };
    return colors[priority] || '#6b7280';
  };

  // Attendance Gate
  if (attendanceStatus.loading) {
    return (
      <div className="loading-screen">
        <div className="spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  if (!attendanceStatus.checked_in) {
    return (
      <div className="attendance-gate">
        <div className="gate-card">
          <div className="gate-icon">🔐</div>
          <h1>Attendance Required</h1>
          <p>You must check in before accessing service requests</p>
          <div className="gate-info">
            <p>📍 Location tracking will be enabled</p>
            <p>⏰ Time: {new Date().toLocaleString()}</p>
          </div>
          <button 
            className="btn-checkin" 
            onClick={handleCheckIn}
            disabled={checkingIn}
          >
            {checkingIn ? '⏳ Checking In...' : '✅ Check In Now'}
          </button>
        </div>

        <style>{`
          .attendance-gate {
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            padding: 20px;
          }

          .gate-card {
            background: white;
            padding: 50px;
            border-radius: 20px;
            text-align: center;
            box-shadow: 0 20px 60px rgba(0,0,0,0.3);
            max-width: 500px;
            width: 100%;
          }

          .gate-icon {
            font-size: 80px;
            margin-bottom: 20px;
          }

          .gate-card h1 {
            margin: 0 0 15px 0;
            color: #1f2937;
            font-size: 28px;
          }

          .gate-card > p {
            color: #6b7280;
            margin: 0 0 30px 0;
            font-size: 16px;
          }

          .gate-info {
            background: #f3f4f6;
            padding: 20px;
            border-radius: 12px;
            margin-bottom: 30px;
          }

          .gate-info p {
            margin: 8px 0;
            color: #4b5563;
            font-size: 14px;
          }

          .btn-checkin {
            width: 100%;
            padding: 16px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border: none;
            border-radius: 12px;
            font-size: 18px;
            font-weight: 700;
            cursor: pointer;
            transition: transform 0.2s;
          }

          .btn-checkin:hover:not(:disabled) {
            transform: translateY(-2px);
            box-shadow: 0 10px 20px rgba(102, 126, 234, 0.4);
          }

          .btn-checkin:disabled {
            opacity: 0.6;
            cursor: not-allowed;
          }

          .loading-screen {
            min-height: 100vh;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            gap: 20px;
          }

          .spinner {
            width: 50px;
            height: 50px;
            border: 4px solid #f3f4f6;
            border-top: 4px solid #667eea;
            border-radius: 50%;
            animation: spin 1s linear infinite;
          }

          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  // Main Dashboard
  return (
    <div className="engineer-dashboard">
      {/* Header */}
      <div className="dashboard-header">
        <div>
          <h1>🔧 Service Engineer Dashboard</h1>
          <p>Welcome, {user?.full_name || user?.name}</p>
          <span className="attendance-badge">✅ Checked In at {new Date(attendanceStatus.attendance.date).toLocaleTimeString()}</span>
        </div>
        <button className="btn-refresh" onClick={fetchServices}>
          🔄 Refresh
        </button>
      </div>

      {/* Performance Analytics */}
      {analytics && (
        <div className="analytics-card">
          <h2>📊 Your Performance</h2>
          <div className="analytics-grid">
            <div className="metric">
              <div className="metric-value">{analytics.average_rating?.toFixed(1) || 'N/A'}⭐</div>
              <div className="metric-label">Avg Rating</div>
            </div>
            <div className="metric">
              <div className="metric-value">{analytics.sla_compliance_percentage?.toFixed(0) || '0'}%</div>
              <div className="metric-label">SLA Compliance</div>
            </div>
            <div className="metric">
              <div className="metric-value">{analytics.performance_score?.toFixed(0) || '0'}</div>
              <div className="metric-label">Performance Score</div>
            </div>
            <div className="metric">
              <div className="metric-value">{analytics.total_services || 0}</div>
              <div className="metric-label">Total Services</div>
            </div>
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="stats-grid">
        <div className="stat-card" style={{ borderLeft: '4px solid #667eea' }}>
          <div className="stat-icon">📋</div>
          <div className="stat-info">
            <h3>{stats.total}</h3>
            <p>Active Services</p>
          </div>
        </div>

        <div className="stat-card" style={{ borderLeft: '4px solid #10b981' }}>
          <div className="stat-icon">✅</div>
          <div className="stat-info">
            <h3>{stats.completed_today}</h3>
            <p>Completed Today</p>
          </div>
        </div>

        <div className="stat-card" style={{ borderLeft: '4px solid #f59e0b' }}>
          <div className="stat-icon">⚠️</div>
          <div className="stat-info">
            <h3>{stats.sla_warning}</h3>
            <p>SLA Warning</p>
          </div>
        </div>

        <div className="stat-card" style={{ borderLeft: '4px solid #ef4444' }}>
          <div className="stat-icon">🚨</div>
          <div className="stat-info">
            <h3>{stats.sla_breached}</h3>
            <p>SLA Breached</p>
          </div>
        </div>
      </div>

      {/* Services List */}
      <div className="services-panel">
        <h2>📝 My Service Requests</h2>
        
        {loading ? (
          <div className="loading">⏳ Loading services...</div>
        ) : services.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🎉</div>
            <p>No active service requests</p>
          </div>
        ) : (
          <div className="services-list">
            {services.map(service => (
              <div key={service.id} className="service-card">
                <div className="card-header">
                  <div className="service-id">
                    <h3>SR#{service.id}</h3>
                    <span 
                      className="priority-badge"
                      style={{ background: getPriorityColor(service.priority) }}
                    >
                      {service.priority || 'NORMAL'}
                    </span>
                  </div>
                  
                  {/* SLA Timer */}
                  {service.sla_status && (
                    <div 
                      className="sla-timer"
                      style={{ borderColor: getSLAColor(service.sla_status.status) }}
                    >
                      <div className="timer-label">
                        {service.sla_status.status === 'breached' && '🚨 BREACHED'}
                        {service.sla_status.status === 'warning' && '⚠️ WARNING'}
                        {service.sla_status.status === 'ok' && '✅ ON TRACK'}
                        {service.sla_status.status === 'paused' && '⏸️ PAUSED'}
                      </div>
                      <div className="timer-value" style={{ color: getSLAColor(service.sla_status.status) }}>
                        {service.sla_status.status === 'breached' 
                          ? `+${formatTime(service.sla_status.remaining_seconds)}`
                          : formatTime(service.sla_status.remaining_seconds)
                        }
                      </div>
                    </div>
                  )}
                </div>

                <div className="card-body">
                  <div className="customer-info">
                    <p><strong>Customer:</strong> {service.customer_name}</p>
                    <p><strong>Phone:</strong> {service.customer_phone}</p>
                    <p><strong>Address:</strong> {service.address || 'N/A'}</p>
                  </div>

                  <div className="issue-info">
                    <p><strong>Issue:</strong></p>
                    <p className="description">{service.complaint_text}</p>
                  </div>

                  {service.product && (
                    <div className="product-info">
                      🖨️ {service.product.name} - {service.product.model}
                    </div>
                  )}

                  <div className="status-badge-row">
                    <span className={`status-badge status-${service.status?.toLowerCase()}`}>
                      {service.status?.replace('_', ' ')}
                    </span>
                    <span className="created-at">
                      Created: {new Date(service.created_at).toLocaleString()}
                    </span>
                  </div>
                </div>

                <div className="card-actions">
                  {service.status === 'COMPLETED' ? (
                    <button className="btn-action" disabled style={{ opacity: 0.5 }}>
                      ✅ Completed
                    </button>
                  ) : (
                    <>
                      <button 
                        className="btn-action btn-primary"
                        onClick={() => setStatusModal({ show: true, service })}
                      >
                        🔄 Update Status
                      </button>
                      
                      {(service.status === 'IN_PROGRESS' || service.status === 'ON_THE_WAY') && (
                        <button 
                          className="btn-action btn-success"
                          onClick={() => setCompletionModal({ show: true, service })}
                        >
                          ✅ Complete Service
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Status Update Modal */}
      {statusModal.show && (
        <div className="modal-overlay" onClick={() => setStatusModal({ show: false, service: null })}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h2>Update Status - SR#{statusModal.service.id}</h2>
            <p className="modal-subtitle">Current: {statusModal.service.status}</p>
            
            <div className="status-options">
              {getNextStatus(statusModal.service.status).map(status => (
                <button
                  key={status}
                  className="status-option"
                  onClick={() => handleStatusUpdate(status)}
                >
                  {status.replace('_', ' ')}
                </button>
              ))}
            </div>

            <button 
              className="btn-cancel"
              onClick={() => setStatusModal({ show: false, service: null })}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Completion Modal */}
      {completionModal.show && (
        <div className="modal-overlay" onClick={() => setCompletionModal({ show: false, service: null })}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h2>Complete Service - SR#{completionModal.service.id}</h2>
            
            <div className="form-group">
              <label>Resolution Notes *</label>
              <textarea
                value={resolutionNotes}
                onChange={e => setResolutionNotes(e.target.value)}
                placeholder="Describe the resolution (required)"
                rows={4}
                required
              />
            </div>

            <div className="form-group">
              <label>Parts Replaced (Optional)</label>
              <input
                type="text"
                value={partsReplaced}
                onChange={e => setPartsReplaced(e.target.value)}
                placeholder="e.g., Drum unit, Toner cartridge"
              />
            </div>

            <div className="modal-actions">
              <button className="btn-action btn-success" onClick={handleComplete}>
                ✅ Complete & Generate Feedback QR
              </button>
              <button 
                className="btn-cancel"
                onClick={() => {
                  setCompletionModal({ show: false, service: null });
                  setResolutionNotes('');
                  setPartsReplaced('');
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* QR Code Modal */}
      {qrModal.show && (
        <div className="modal-overlay" onClick={() => setQrModal({ show: false, qr: null, url: null })}>
          <div className="modal-content qr-modal" onClick={e => e.stopPropagation()}>
            <h2>✅ Service Completed!</h2>
            <p className="modal-subtitle">Show this QR code to the customer for feedback</p>
            
            {qrModal.qr && (
              <div className="qr-container">
                <img src={`data:image/png;base64,${qrModal.qr}`} alt="Feedback QR Code" />
              </div>
            )}

            <p className="feedback-url">
              <strong>Feedback Link:</strong><br/>
              <a href={qrModal.url} target="_blank" rel="noopener noreferrer">
                {qrModal.url}
              </a>
            </p>

            <button 
              className="btn-action btn-primary"
              onClick={() => setQrModal({ show: false, qr: null, url: null })}
            >
              Close
            </button>
          </div>
        </div>
      )}

      <style>{`
        .engineer-dashboard {
          padding: 20px;
          background: #f9fafb;
          min-height: 100vh;
        }

        .dashboard-header {
          background: white;
          padding: 25px;
          border-radius: 12px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
          margin-bottom: 20px;
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
        }

        .dashboard-header h1 {
          margin: 0 0 8px 0;
          color: #111827;
          font-size: 28px;
        }

        .dashboard-header p {
          margin: 0 0 8px 0;
          color: #6b7280;
        }

        .attendance-badge {
          display: inline-block;
          background: #d1fae5;
          color: #065f46;
          padding: 6px 12px;
          border-radius: 6px;
          font-size: 13px;
          font-weight: 600;
        }

        .btn-refresh {
          padding: 12px 24px;
          background: #667eea;
          color: white;
          border: none;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }

        .btn-refresh:hover {
          background: #5568d3;
          transform: translateY(-1px);
        }

        .analytics-card {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 25px;
          border-radius: 12px;
          margin-bottom: 20px;
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
        }

        .analytics-card h2 {
          margin: 0 0 20px 0;
          font-size: 20px;
        }

        .analytics-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 20px;
        }

        .metric {
          background: rgba(255,255,255,0.2);
          padding: 20px;
          border-radius: 8px;
          text-align: center;
        }

        .metric-value {
          font-size: 32px;
          font-weight: 700;
          margin-bottom: 8px;
        }

        .metric-label {
          font-size: 13px;
          opacity: 0.9;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 20px;
          margin-bottom: 20px;
        }

        .stat-card {
          background: white;
          padding: 20px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          gap: 15px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }

        .stat-icon {
          font-size: 36px;
        }

        .stat-info h3 {
          margin: 0;
          font-size: 32px;
          color: #111827;
        }

        .stat-info p {
          margin: 4px 0 0 0;
          color: #6b7280;
          font-size: 14px;
        }

        .services-panel {
          background: white;
          padding: 25px;
          border-radius: 12px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }

        .services-panel h2 {
          margin: 0 0 20px 0;
          color: #111827;
        }

        .services-list {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .service-card {
          background: #f9fafb;
          border: 2px solid #e5e7eb;
          border-radius: 8px;
          padding: 20px;
          transition: all 0.2s;
        }

        .service-card:hover {
          border-color: #667eea;
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        }

        .card-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 16px;
          padding-bottom: 16px;
          border-bottom: 2px solid #e5e7eb;
        }

        .service-id {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .service-id h3 {
          margin: 0;
          color: #111827;
          font-size: 20px;
        }

        .priority-badge {
          padding: 6px 12px;
          border-radius: 6px;
          color: white;
          font-size: 12px;
          font-weight: 700;
          text-transform: uppercase;
        }

        .sla-timer {
          background: white;
          padding: 12px 16px;
          border-radius: 8px;
          border: 3px solid;
          text-align: center;
          min-width: 140px;
        }

        .timer-label {
          font-size: 12px;
          font-weight: 700;
          margin-bottom: 4px;
        }

        .timer-value {
          font-size: 20px;
          font-weight: 700;
        }

        .card-body {
          margin-bottom: 16px;
        }

        .customer-info,
        .issue-info {
          margin-bottom: 12px;
        }

        .customer-info p,
        .issue-info p {
          margin: 4px 0;
          color: #374151;
          font-size: 14px;
        }

        .description {
          color: #6b7280;
          line-height: 1.6;
          padding: 8px 12px;
          background: white;
          border-radius: 6px;
          margin-top: 4px !important;
        }

        .product-info {
          background: #e0e7ff;
          color: #3730a3;
          padding: 10px 14px;
          border-radius: 6px;
          font-size: 13px;
          font-weight: 600;
          margin-bottom: 12px;
        }

        .status-badge-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: 12px;
        }

        .status-badge {
          padding: 6px 14px;
          border-radius: 6px;
          font-size: 12px;
          font-weight: 700;
          text-transform: uppercase;
        }

        .status-assigned { background: #dbeafe; color: #1e40af; }
        .status-on_the_way { background: #fef3c7; color: #92400e; }
        .status-in_progress { background: #ddd6fe; color: #5b21b6; }
        .status-on_hold { background: #fed7aa; color: #9a3412; }
        .status-completed { background: #d1fae5; color: #065f46; }

        .created-at {
          font-size: 12px;
          color: #9ca3af;
        }

        .card-actions {
          display: flex;
          gap: 10px;
          padding-top: 16px;
          border-top: 2px solid #e5e7eb;
        }

        .btn-action {
          flex: 1;
          padding: 12px;
          border: none;
          border-radius: 8px;
          font-weight: 600;
          font-size: 14px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .btn-primary {
          background: #667eea;
          color: white;
        }

        .btn-primary:hover {
          background: #5568d3;
          transform: translateY(-1px);
        }

        .btn-success {
          background: #10b981;
          color: white;
        }

        .btn-success:hover {
          background: #059669;
          transform: translateY(-1px);
        }

        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0,0,0,0.7);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 20px;
        }

        .modal-content {
          background: white;
          padding: 30px;
          border-radius: 16px;
          max-width: 500px;
          width: 100%;
          max-height: 90vh;
          overflow-y: auto;
        }

        .modal-content h2 {
          margin: 0 0 8px 0;
          color: #111827;
        }

        .modal-subtitle {
          margin: 0 0 20px 0;
          color: #6b7280;
          font-size: 14px;
        }

        .status-options {
          display: flex;
          flex-direction: column;
          gap: 10px;
          margin-bottom: 20px;
        }

        .status-option {
          padding: 16px;
          background: #f3f4f6;
          border: 2px solid #e5e7eb;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          text-transform: uppercase;
        }

        .status-option:hover {
          background: #667eea;
          color: white;
          border-color: #667eea;
        }

        .form-group {
          margin-bottom: 20px;
        }

        .form-group label {
          display: block;
          margin-bottom: 8px;
          color: #374151;
          font-weight: 600;
          font-size: 14px;
        }

        .form-group textarea,
        .form-group input {
          width: 100%;
          padding: 12px;
          border: 2px solid #e5e7eb;
          border-radius: 8px;
          font-size: 14px;
          font-family: inherit;
          resize: vertical;
        }

        .form-group textarea:focus,
        .form-group input:focus {
          outline: none;
          border-color: #667eea;
        }

        .modal-actions {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .btn-cancel {
          padding: 12px;
          background: #f3f4f6;
          color: #374151;
          border: none;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }

        .btn-cancel:hover {
          background: #e5e7eb;
        }

        .qr-modal {
          text-align: center;
        }

        .qr-container {
          background: white;
          padding: 20px;
          border-radius: 12px;
          display: inline-block;
          margin: 20px 0;
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        }

        .qr-container img {
          display: block;
          width: 250px;
          height: 250px;
        }

        .feedback-url {
          background: #f3f4f6;
          padding: 15px;
          border-radius: 8px;
          margin: 20px 0;
          font-size: 13px;
          word-break: break-all;
        }

        .feedback-url a {
          color: #667eea;
          text-decoration: none;
        }

        .empty-state,
        .loading {
          text-align: center;
          padding: 60px 20px;
          color: #9ca3af;
        }

        .empty-icon {
          font-size: 64px;
          margin-bottom: 16px;
        }

        @media (max-width: 1200px) {
          .analytics-grid,
          .stats-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 768px) {
          .analytics-grid,
          .stats-grid {
            grid-template-columns: 1fr;
          }

          .card-header {
            flex-direction: column;
            gap: 12px;
          }

          .card-actions {
            flex-direction: column;
          }
        }
      `}</style>
    </div>
  );
};

export default ServiceEngineerDashboard;

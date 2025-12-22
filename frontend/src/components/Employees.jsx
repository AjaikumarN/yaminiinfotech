import React, { useState, useEffect } from 'react'
import { useNotifications } from '../contexts/NotificationContext.jsx'
import { complaintAPI } from '../utils/api'

export default function ServiceEngineer() {
  const { addNotification, templates } = useNotifications()
  const [activeTab, setActiveTab] = useState('dashboard')
  const [engineerRole] = useState('Incharge') // 'Incharge' or 'Sub'
  const [engineerName] = useState('Rahul Kumar')
  const [loading, setLoading] = useState(true)
  const [complaints, setComplaints] = useState([])
  const [initialComplaints] = useState([
    {
      id: 'COMP001',
      ticketNo: 'TKT-2025-001',
      customerName: 'Rajesh Enterprises',
      customerPhone: '+91 98765 43210',
      customerAddress: '123 MG Road, Bangalore - 560001',
      productModel: 'HP LaserJet Pro MFP M428fdw',
      faultDetails: 'Printer not responding, paper jam error, toner low warning',
      priority: 'High',
      slaTime: '2025-12-19T16:00:00',
      assignedDate: '2025-12-19T09:00:00',
      status: 'Assigned',
      assignedTo: 'Rahul Kumar',
      reportedBy: 'Customer',
      expectedResolution: '4 hours'
    },
    {
      id: 'COMP002',
      ticketNo: 'TKT-2025-002',
      customerName: 'Tech Solutions Pvt Ltd',
      customerPhone: '+91 98123 45678',
      customerAddress: '456 Whitefield, Bangalore - 560066',
      productModel: 'Canon PIXMA G3000',
      faultDetails: 'Print quality poor, lines appearing on printouts',
      priority: 'Medium',
      slaTime: '2025-12-20T12:00:00',
      assignedDate: '2025-12-18T14:00:00',
      status: 'On the way',
      assignedTo: 'Rahul Kumar',
      reportedBy: 'Customer',
      expectedResolution: '24 hours'
    },
    {
      id: 'COMP003',
      ticketNo: 'TKT-2025-003',
      customerName: 'Sharma & Associates',
      customerPhone: '+91 97654 32109',
      customerAddress: '789 Koramangala, Bangalore - 560034',
      productModel: 'Epson EcoTank L3250',
      faultDetails: 'Scanner not working, USB connection issue',
      priority: 'Low',
      slaTime: '2025-12-21T18:00:00',
      assignedDate: '2025-12-19T11:00:00',
      status: 'Assigned',
      assignedTo: 'Manoj Singh',
      reportedBy: 'Reception',
      expectedResolution: '48 hours',
      subEngineer: 'Manoj Singh'
    },
    {
      id: 'COMP004',
      ticketNo: 'TKT-2025-004',
      customerName: 'Global Tech Inc',
      customerPhone: '+91 99876 54321',
      customerAddress: '321 Electronic City, Bangalore - 560100',
      productModel: 'Brother HL-L2321D',
      faultDetails: 'No power, device not turning on',
      priority: 'High',
      slaTime: '2025-12-19T11:00:00', // Already delayed
      assignedDate: '2025-12-18T07:00:00',
      status: 'Delayed',
      assignedTo: 'Rahul Kumar',
      reportedBy: 'Customer',
      expectedResolution: '4 hours'
    }
  ])

  const [selectedComplaint, setSelectedComplaint] = useState(null)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [alerts, setAlerts] = useState([])

  // Fetch complaints assigned to this engineer
  useEffect(() => {
    const fetchComplaints = async () => {
      try {
        setLoading(true)
        const data = await complaintAPI.getMy()
        setComplaints(data.length > 0 ? data : initialComplaints)
      } catch (error) {
        console.error('Error fetching complaints:', error)
        setComplaints(initialComplaints)
        addNotification({
          type: 'error',
          title: 'Error',
          message: 'Failed to load complaints. Using sample data.',
          priority: 'medium',
          module: 'Service'
        })
      } finally {
        setLoading(false)
      }
    }
    fetchComplaints()
  }, [])

  // Check for delayed services and generate alerts
  useEffect(() => {
    const checkSLA = () => {
      const now = new Date()
      const newAlerts = []

      complaints.forEach(complaint => {
        const slaTime = new Date(complaint.slaTime)
        const timeDiff = slaTime - now
        const hoursRemaining = timeDiff / (1000 * 60 * 60)

        // If past SLA or within 1 hour
        if (hoursRemaining < 0) {
          newAlerts.push({
            id: complaint.id,
            type: 'critical',
            message: `CRITICAL: Service delayed for ${complaint.customerName} (${complaint.ticketNo})`,
            complaint: complaint,
            hoursOverdue: Math.abs(hoursRemaining).toFixed(1)
          })
          
          // Send notification for service delay
          addNotification(templates.serviceDelay(complaint.customerName, Math.abs(hoursRemaining).toFixed(1)))
          
          // Update status to delayed
          if (complaint.status !== 'Completed' && complaint.status !== 'Delayed') {
            updateComplaintStatus(complaint.id, 'Delayed')
          }
        } else if (hoursRemaining < 1 && complaint.status !== 'Completed') {
          newAlerts.push({
            id: complaint.id,
            type: 'warning',
            message: `WARNING: Service due in ${hoursRemaining.toFixed(1)} hours for ${complaint.customerName}`,
            complaint: complaint,
            hoursRemaining: hoursRemaining.toFixed(1)
          })
        }
      })

      setAlerts(newAlerts)
    }

    checkSLA()
    const interval = setInterval(checkSLA, 60000) // Check every minute

    return () => clearInterval(interval)
  }, [complaints])

  const updateComplaintStatus = (complaintId, newStatus) => {
    setComplaints(complaints.map(c => 
      c.id === complaintId ? { ...c, status: newStatus } : c
    ))
  }

  const calculateSLAStatus = (slaTime, status) => {
    if (status === 'Completed') return 'completed'
    
    const now = new Date()
    const sla = new Date(slaTime)
    const diff = sla - now
    const hours = diff / (1000 * 60 * 60)

    if (hours < 0) return 'overdue'
    if (hours < 1) return 'critical'
    if (hours < 4) return 'warning'
    return 'normal'
  }

  const getTimeRemaining = (slaTime) => {
    const now = new Date()
    const sla = new Date(slaTime)
    const diff = sla - now
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))

    if (diff < 0) {
      return `Overdue by ${Math.abs(hours)}h ${Math.abs(minutes)}m`
    }
    return `${hours}h ${minutes}m remaining`
  }

  const renderDashboard = () => {
    const myComplaints = engineerRole === 'Incharge' 
      ? complaints 
      : complaints.filter(c => c.assignedTo === engineerName || c.subEngineer === engineerName)

    const stats = {
      total: myComplaints.length,
      assigned: myComplaints.filter(c => c.status === 'Assigned').length,
      onTheWay: myComplaints.filter(c => c.status === 'On the way').length,
      completed: myComplaints.filter(c => c.status === 'Completed').length,
      delayed: myComplaints.filter(c => c.status === 'Delayed').length,
      high: myComplaints.filter(c => c.priority === 'High').length
    }

    return (
      <div className="dashboard">
        <div className="engineer-info-card">
          <div className="engineer-avatar">👨‍🔧</div>
          <div className="engineer-details">
            <h2>{engineerName}</h2>
            <p className="role-badge">{engineerRole} Engineer</p>
            <p className="status-text">Active • {stats.total} Active Complaints</p>
          </div>
        </div>

        {alerts.length > 0 && (
          <div className="alerts-section">
            <h3>🚨 Active Alerts</h3>
            {alerts.map(alert => (
              <div key={alert.id} className={`alert-card ${alert.type}`}>
                <div className="alert-icon">
                  {alert.type === 'critical' ? '🔴' : '⚠️'}
                </div>
                <div className="alert-content">
                  <strong>{alert.message}</strong>
                  {alert.hoursOverdue && (
                    <p>Overdue by {alert.hoursOverdue} hours</p>
                  )}
                  {alert.hoursRemaining && (
                    <p>{alert.hoursRemaining} hours remaining</p>
                  )}
                </div>
                <button 
                  className="btn-small"
                  onClick={() => {
                    setSelectedComplaint(alert.complaint)
                    setShowDetailModal(true)
                  }}
                >
                  View
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="stats-grid">
          <div className="stat-card total">
            <div className="stat-icon">📋</div>
            <div className="stat-content">
              <h3>Total Complaints</h3>
              <div className="stat-number">{stats.total}</div>
            </div>
          </div>

          <div className="stat-card assigned">
            <div className="stat-icon">📌</div>
            <div className="stat-content">
              <h3>Assigned</h3>
              <div className="stat-number">{stats.assigned}</div>
            </div>
          </div>

          <div className="stat-card ontheway">
            <div className="stat-icon">🚗</div>
            <div className="stat-content">
              <h3>On the Way</h3>
              <div className="stat-number">{stats.onTheWay}</div>
            </div>
          </div>

          <div className="stat-card completed">
            <div className="stat-icon">✅</div>
            <div className="stat-content">
              <h3>Completed</h3>
              <div className="stat-number">{stats.completed}</div>
            </div>
          </div>

          <div className="stat-card delayed">
            <div className="stat-icon">⏰</div>
            <div className="stat-content">
              <h3>Delayed</h3>
              <div className="stat-number">{stats.delayed}</div>
            </div>
          </div>

          <div className="stat-card high">
            <div className="stat-icon">🔥</div>
            <div className="stat-content">
              <h3>High Priority</h3>
              <div className="stat-number">{stats.high}</div>
            </div>
          </div>
        </div>

        <div className="upcoming-services">
          <h3>⏰ Urgent Services (Next 4 Hours)</h3>
          {myComplaints
            .filter(c => {
              const hours = (new Date(c.slaTime) - new Date()) / (1000 * 60 * 60)
              return hours < 4 && c.status !== 'Completed'
            })
            .sort((a, b) => new Date(a.slaTime) - new Date(b.slaTime))
            .map(complaint => (
              <div key={complaint.id} className="urgent-service-card">
                <div className="service-info">
                  <strong>{complaint.customerName}</strong>
                  <p>{complaint.faultDetails}</p>
                  <small>{getTimeRemaining(complaint.slaTime)}</small>
                </div>
                <button 
                  className="btn-primary"
                  onClick={() => {
                    setSelectedComplaint(complaint)
                    setShowDetailModal(true)
                  }}
                >
                  View Details
                </button>
              </div>
            ))}
        </div>
      </div>
    )
  }

  const renderComplaints = () => {
    const myComplaints = engineerRole === 'Incharge' 
      ? complaints 
      : complaints.filter(c => c.assignedTo === engineerName || c.subEngineer === engineerName)

    return (
      <div className="complaints-section">
        <div className="section-header">
          <h2>🛠️ Service Complaints</h2>
          <div className="filters">
            <select className="filter-select">
              <option value="all">All Status</option>
              <option value="Assigned">Assigned</option>
              <option value="On the way">On the Way</option>
              <option value="Completed">Completed</option>
              <option value="Delayed">Delayed</option>
            </select>
            <select className="filter-select">
              <option value="all">All Priority</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>
        </div>

        <div className="table-container">
          <table className="complaints-table">
            <thead>
              <tr>
                <th>Ticket No</th>
                <th>Customer</th>
                <th>Product</th>
                <th>Fault</th>
                <th>Priority</th>
                <th>Status</th>
                <th>SLA Status</th>
                <th>Time Remaining</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {myComplaints.map(complaint => {
                const slaStatus = calculateSLAStatus(complaint.slaTime, complaint.status)
                return (
                  <tr key={complaint.id} className={`priority-${complaint.priority.toLowerCase()}`}>
                    <td><strong>{complaint.ticketNo}</strong></td>
                    <td>
                      <div>{complaint.customerName}</div>
                      <small>{complaint.customerPhone}</small>
                    </td>
                    <td>{complaint.productModel}</td>
                    <td className="fault-cell">{complaint.faultDetails}</td>
                    <td>
                      <span className={`badge priority-${complaint.priority.toLowerCase()}`}>
                        {complaint.priority}
                      </span>
                    </td>
                    <td>
                      <select 
                        className="status-select"
                        value={complaint.status}
                        onChange={(e) => updateComplaintStatus(complaint.id, e.target.value)}
                      >
                        <option value="Assigned">Assigned</option>
                        <option value="On the way">On the Way</option>
                        <option value="Completed">Completed</option>
                        <option value="Delayed">Delayed</option>
                      </select>
                    </td>
                    <td>
                      <span className={`sla-badge ${slaStatus}`}>
                        {slaStatus.toUpperCase()}
                      </span>
                    </td>
                    <td className={slaStatus === 'overdue' ? 'text-danger' : ''}>
                      {getTimeRemaining(complaint.slaTime)}
                    </td>
                    <td>
                      <button 
                        className="btn-small btn-primary"
                        onClick={() => {
                          setSelectedComplaint(complaint)
                          setShowDetailModal(true)
                        }}
                      >
                        Details
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    )
  }

  const renderComplaintDetail = () => {
    if (!selectedComplaint) return null

    const slaStatus = calculateSLAStatus(selectedComplaint.slaTime, selectedComplaint.status)

    return (
      <div className="complaint-detail-modal">
        <div className="modal-overlay" onClick={() => setShowDetailModal(false)}></div>
        <div className="modal-content">
          <div className="modal-header">
            <h2>Complaint Details - {selectedComplaint.ticketNo}</h2>
            <button className="close-btn" onClick={() => setShowDetailModal(false)}>✕</button>
          </div>

          <div className="modal-body">
            <div className="detail-section">
              <h3>Customer Information</h3>
              <div className="info-grid">
                <div><strong>Name:</strong> {selectedComplaint.customerName}</div>
                <div><strong>Phone:</strong> {selectedComplaint.customerPhone}</div>
                <div><strong>Address:</strong> {selectedComplaint.customerAddress}</div>
                <div><strong>Reported By:</strong> {selectedComplaint.reportedBy}</div>
              </div>
            </div>

            <div className="detail-section">
              <h3>Fault Information</h3>
              <div className="info-grid">
                <div><strong>Product:</strong> {selectedComplaint.productModel}</div>
                <div><strong>Priority:</strong> 
                  <span className={`badge priority-${selectedComplaint.priority.toLowerCase()}`}>
                    {selectedComplaint.priority}
                  </span>
                </div>
              </div>
              <div className="fault-description">
                <strong>Fault Details:</strong>
                <p>{selectedComplaint.faultDetails}</p>
              </div>
            </div>

            <div className="detail-section">
              <h3>Service Timeline & SLA</h3>
              <div className="info-grid">
                <div><strong>Assigned Date:</strong> {new Date(selectedComplaint.assignedDate).toLocaleString()}</div>
                <div><strong>SLA Deadline:</strong> {new Date(selectedComplaint.slaTime).toLocaleString()}</div>
                <div><strong>Expected Resolution:</strong> {selectedComplaint.expectedResolution}</div>
                <div>
                  <strong>SLA Status:</strong> 
                  <span className={`sla-badge ${slaStatus}`}>
                    {slaStatus.toUpperCase()}
                  </span>
                </div>
                <div><strong>Time Remaining:</strong> 
                  <span className={slaStatus === 'overdue' ? 'text-danger' : ''}>
                    {getTimeRemaining(selectedComplaint.slaTime)}
                  </span>
                </div>
              </div>
            </div>

            <div className="detail-section">
              <h3>Assignment Details</h3>
              <div className="info-grid">
                <div><strong>Assigned To:</strong> {selectedComplaint.assignedTo}</div>
                {selectedComplaint.subEngineer && (
                  <div><strong>Sub Engineer:</strong> {selectedComplaint.subEngineer}</div>
                )}
                <div>
                  <strong>Current Status:</strong>
                  <select 
                    className="status-select-large"
                    value={selectedComplaint.status}
                    onChange={(e) => {
                      updateComplaintStatus(selectedComplaint.id, e.target.value)
                      setSelectedComplaint({...selectedComplaint, status: e.target.value})
                    }}
                  >
                    <option value="Assigned">Assigned</option>
                    <option value="On the way">On the Way</option>
                    <option value="Completed">Completed</option>
                    <option value="Delayed">Delayed</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="detail-section">
              <h3>Quick Actions</h3>
              <div className="action-buttons">
                <button 
                  className="action-btn primary"
                  onClick={() => {
                    updateComplaintStatus(selectedComplaint.id, 'On the way')
                    setSelectedComplaint({...selectedComplaint, status: 'On the way'})
                  }}
                >
                  🚗 Mark On the Way
                </button>
                <button 
                  className="action-btn success"
                  onClick={() => {
                    updateComplaintStatus(selectedComplaint.id, 'Completed')
                    setSelectedComplaint({...selectedComplaint, status: 'Completed'})
                  }}
                >
                  ✅ Mark Completed
                </button>
                <button 
                  className="action-btn"
                  onClick={() => window.open(`tel:${selectedComplaint.customerPhone}`)}
                >
                  📞 Call Customer
                </button>
                <button 
                  className="action-btn"
                  onClick={() => window.open(`https://maps.google.com/?q=${encodeURIComponent(selectedComplaint.customerAddress)}`)}
                >
                  🗺️ Open in Maps
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="page-container service-engineer-module">
      <div className="content-wrapper">
        <div className="page-header">
          <div>
            <h1 className="page-title">🛠️ Service Engineer Dashboard</h1>
            <p className="page-subtitle">Complaint Management & Service Tracking</p>
          </div>
          {alerts.some(a => a.type === 'critical') && (
            <div className="header-alert">
              <span className="alert-badge critical">
                🚨 {alerts.filter(a => a.type === 'critical').length} Critical Alert(s)
              </span>
            </div>
          )}
        </div>

        <div className="tabs-navigation">
          <button 
            className={activeTab === 'dashboard' ? 'active' : ''}
            onClick={() => setActiveTab('dashboard')}
          >
            📊 Dashboard
          </button>
          <button 
            className={activeTab === 'complaints' ? 'active' : ''}
            onClick={() => setActiveTab('complaints')}
          >
            🛠️ All Complaints ({complaints.length})
          </button>
          <button 
            className={activeTab === 'alerts' ? 'active' : ''}
            onClick={() => setActiveTab('alerts')}
          >
            🚨 Alerts ({alerts.length})
          </button>
        </div>

        <div className="page-content">
          {activeTab === 'dashboard' && renderDashboard()}
          {activeTab === 'complaints' && renderComplaints()}
          {activeTab === 'alerts' && (
            <div className="alerts-section">
              <h2>Active Alerts</h2>
              {alerts.length > 0 ? (
                alerts.map(alert => (
                  <div key={alert.id} className={`alert-card ${alert.type}`}>
                    <div className="alert-icon">
                      {alert.type === 'critical' ? '🔴' : '⚠️'}
                    </div>
                    <div className="alert-content">
                      <strong>{alert.message}</strong>
                      <p>Customer: {alert.complaint.customerName}</p>
                      <p>Address: {alert.complaint.customerAddress}</p>
                      {alert.hoursOverdue && <p className="text-danger">Overdue by {alert.hoursOverdue} hours</p>}
                    </div>
                    <button 
                      className="btn-primary"
                      onClick={() => {
                        setSelectedComplaint(alert.complaint)
                        setShowDetailModal(true)
                      }}
                    >
                      View & Resolve
                    </button>
                  </div>
                ))
              ) : (
                <div className="empty-state">
                  <p>✅ No active alerts. All services are on track!</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {showDetailModal && renderComplaintDetail()}

      <style>{`
        .service-engineer-module {
          min-height: 100vh;
          background: #f5f7fa;
        }

        .page-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 20px;
          flex-wrap: wrap;
          gap: 15px;
        }

        .page-title {
          margin: 0;
          color: #2c3e50;
        }

        .page-subtitle {
          color: #7f8c8d;
          margin: 5px 0 0 0;
        }

        .header-alert {
          padding: 8px 0;
        }

        .alert-badge {
          padding: 8px 16px;
          border-radius: 20px;
          font-weight: 600;
          font-size: 14px;
        }

        .alert-badge.critical {
          background: #e74c3c;
          color: white;
          animation: pulse 2s infinite;
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }

        .tabs-navigation {
          display: flex;
          gap: 10px;
          margin-bottom: 20px;
          border-bottom: 2px solid #e0e0e0;
          padding-bottom: 10px;
          flex-wrap: wrap;
        }

        .tabs-navigation button {
          padding: 12px 20px;
          border: none;
          background: transparent;
          cursor: pointer;
          font-size: 14px;
          border-bottom: 3px solid transparent;
          transition: all 0.3s;
          font-weight: 500;
        }

        .tabs-navigation button:hover {
          background: #f0f0f0;
        }

        .tabs-navigation button.active {
          border-bottom-color: #e74c3c;
          color: #e74c3c;
        }

        .engineer-info-card {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 30px;
          border-radius: 12px;
          margin-bottom: 20px;
          display: flex;
          gap: 20px;
          align-items: center;
        }

        .engineer-avatar {
          font-size: 60px;
          background: rgba(255,255,255,0.2);
          width: 100px;
          height: 100px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .engineer-details h2 {
          margin: 0 0 5px 0;
        }

        .role-badge {
          background: rgba(255,255,255,0.3);
          display: inline-block;
          padding: 4px 12px;
          border-radius: 12px;
          font-size: 12px;
          font-weight: 600;
          margin: 5px 0;
        }

        .status-text {
          margin: 5px 0 0 0;
          opacity: 0.9;
        }

        .alerts-section {
          background: white;
          padding: 25px;
          border-radius: 10px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
          margin-bottom: 20px;
        }

        .alerts-section h3, .alerts-section h2 {
          margin-top: 0;
          color: #2c3e50;
        }

        .alert-card {
          display: flex;
          gap: 15px;
          padding: 20px;
          border-radius: 8px;
          margin-bottom: 15px;
          border-left: 4px solid;
          align-items: center;
        }

        .alert-card.critical {
          background: #fee;
          border-left-color: #e74c3c;
        }

        .alert-card.warning {
          background: #fff3e0;
          border-left-color: #ff9800;
        }

        .alert-icon {
          font-size: 32px;
        }

        .alert-content {
          flex: 1;
        }

        .alert-content strong {
          display: block;
          margin-bottom: 5px;
          color: #2c3e50;
        }

        .alert-content p {
          margin: 3px 0;
          font-size: 14px;
          color: #555;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 20px;
          margin-bottom: 30px;
        }

        .stat-card {
          background: white;
          padding: 25px;
          border-radius: 10px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
          display: flex;
          gap: 15px;
          align-items: center;
        }

        .stat-icon {
          font-size: 36px;
        }

        .stat-content h3 {
          margin: 0 0 8px 0;
          font-size: 13px;
          color: #7f8c8d;
          text-transform: uppercase;
        }

        .stat-number {
          font-size: 32px;
          font-weight: bold;
          color: #2c3e50;
        }

        .upcoming-services {
          background: white;
          padding: 25px;
          border-radius: 10px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }

        .upcoming-services h3 {
          margin-top: 0;
          color: #2c3e50;
        }

        .urgent-service-card {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 15px;
          background: #fff3e0;
          border-left: 4px solid #ff9800;
          border-radius: 8px;
          margin-bottom: 10px;
        }

        .service-info {
          flex: 1;
        }

        .service-info strong {
          display: block;
          color: #2c3e50;
          margin-bottom: 5px;
        }

        .service-info p {
          margin: 5px 0;
          color: #555;
          font-size: 14px;
        }

        .service-info small {
          color: #e67e22;
          font-weight: 600;
        }

        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
          flex-wrap: wrap;
          gap: 15px;
        }

        .filters {
          display: flex;
          gap: 10px;
        }

        .filter-select {
          padding: 8px 12px;
          border: 1px solid #ddd;
          border-radius: 5px;
          font-size: 14px;
        }

        .table-container {
          background: white;
          border-radius: 10px;
          overflow: hidden;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
          overflow-x: auto;
        }

        .complaints-table {
          width: 100%;
          border-collapse: collapse;
          min-width: 1000px;
        }

        .complaints-table th {
          background: #34495e;
          color: white;
          padding: 15px;
          text-align: left;
          font-weight: 600;
          font-size: 12px;
          text-transform: uppercase;
        }

        .complaints-table td {
          padding: 15px;
          border-bottom: 1px solid #ecf0f1;
          font-size: 14px;
        }

        .complaints-table tbody tr:hover {
          background: #f8f9fa;
        }

        .complaints-table tr.priority-high {
          border-left: 4px solid #e74c3c;
        }

        .complaints-table tr.priority-medium {
          border-left: 4px solid #f39c12;
        }

        .complaints-table tr.priority-low {
          border-left: 4px solid #3498db;
        }

        .fault-cell {
          max-width: 250px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .badge {
          display: inline-block;
          padding: 4px 12px;
          border-radius: 12px;
          font-size: 11px;
          font-weight: 600;
          text-transform: uppercase;
        }

        .priority-high {
          background: #f8d7da;
          color: #721c24;
        }

        .priority-medium {
          background: #fff3cd;
          color: #856404;
        }

        .priority-low {
          background: #d1ecf1;
          color: #0c5460;
        }

        .status-select, .status-select-large {
          padding: 6px 10px;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-size: 13px;
          cursor: pointer;
        }

        .status-select-large {
          padding: 10px 12px;
          font-size: 14px;
          width: 100%;
        }

        .sla-badge {
          display: inline-block;
          padding: 4px 12px;
          border-radius: 12px;
          font-size: 10px;
          font-weight: 700;
          text-transform: uppercase;
        }

        .sla-badge.normal {
          background: #d4edda;
          color: #155724;
        }

        .sla-badge.warning {
          background: #fff3cd;
          color: #856404;
        }

        .sla-badge.critical {
          background: #fff3e0;
          color: #e65100;
        }

        .sla-badge.overdue {
          background: #f8d7da;
          color: #721c24;
          animation: blink 1s infinite;
        }

        .sla-badge.completed {
          background: #d1ecf1;
          color: #0c5460;
        }

        @keyframes blink {
          0%, 50%, 100% { opacity: 1; }
          25%, 75% { opacity: 0.6; }
        }

        .text-danger {
          color: #e74c3c;
          font-weight: 600;
        }

        .btn-small {
          padding: 6px 12px;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 12px;
          transition: all 0.3s;
        }

        .btn-primary {
          background: #3498db;
          color: white;
          padding: 10px 20px;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-size: 14px;
          font-weight: 600;
          transition: all 0.3s;
        }

        .btn-primary:hover {
          background: #2980b9;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(52, 152, 219, 0.3);
        }

        .complaint-detail-modal {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          z-index: 1000;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .modal-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0,0,0,0.6);
        }

        .modal-content {
          position: relative;
          background: white;
          border-radius: 12px;
          width: 90%;
          max-width: 800px;
          max-height: 90vh;
          overflow-y: auto;
          box-shadow: 0 10px 40px rgba(0,0,0,0.3);
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px 25px;
          border-bottom: 2px solid #ecf0f1;
          position: sticky;
          top: 0;
          background: white;
          z-index: 10;
        }

        .modal-header h2 {
          margin: 0;
        }

        .close-btn {
          background: none;
          border: none;
          font-size: 24px;
          cursor: pointer;
          color: #7f8c8d;
          padding: 0;
          width: 30px;
          height: 30px;
        }

        .close-btn:hover {
          color: #e74c3c;
        }

        .modal-body {
          padding: 25px;
        }

        .detail-section {
          margin-bottom: 25px;
          padding-bottom: 20px;
          border-bottom: 1px solid #ecf0f1;
        }

        .detail-section:last-child {
          border-bottom: none;
        }

        .detail-section h3 {
          margin-top: 0;
          color: #34495e;
          border-left: 4px solid #e74c3c;
          padding-left: 12px;
        }

        .info-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 15px;
          background: #f8f9fa;
          padding: 20px;
          border-radius: 8px;
        }

        .info-grid div {
          font-size: 14px;
        }

        .fault-description {
          margin-top: 15px;
          padding: 15px;
          background: #fff3e0;
          border-left: 4px solid #ff9800;
          border-radius: 4px;
        }

        .fault-description p {
          margin: 8px 0 0 0;
          line-height: 1.6;
        }

        .action-buttons {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 15px;
        }

        .action-btn {
          padding: 12px 20px;
          border: 2px solid #3498db;
          background: white;
          color: #3498db;
          border-radius: 8px;
          cursor: pointer;
          font-size: 14px;
          font-weight: 600;
          transition: all 0.3s;
        }

        .action-btn:hover {
          background: #3498db;
          color: white;
          transform: translateY(-2px);
        }

        .action-btn.primary {
          border-color: #3498db;
          color: #3498db;
        }

        .action-btn.primary:hover {
          background: #3498db;
          color: white;
        }

        .action-btn.success {
          border-color: #27ae60;
          color: #27ae60;
        }

        .action-btn.success:hover {
          background: #27ae60;
          color: white;
        }

        .empty-state {
          background: white;
          padding: 60px 20px;
          border-radius: 10px;
          text-align: center;
          color: #7f8c8d;
          font-size: 16px;
        }

        @media (max-width: 768px) {
          .stats-grid {
            grid-template-columns: 1fr;
          }

          .engineer-info-card {
            flex-direction: column;
            text-align: center;
          }

          .info-grid,
          .action-buttons {
            grid-template-columns: 1fr;
          }

          .table-container {
            overflow-x: auto;
          }

          .tabs-navigation {
            overflow-x: auto;
            flex-wrap: nowrap;
          }

          .alert-card {
            flex-direction: column;
            align-items: flex-start;
          }
        }
      `}</style>
    </div>
  )
}

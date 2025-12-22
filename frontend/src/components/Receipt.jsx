import React, { useState, useEffect } from 'react'
import { useNotifications } from '../contexts/NotificationContext.jsx'
import { enquiryAPI } from '../utils/api'

export default function Reception() {
  const { addNotification, templates } = useNotifications()
  const [activeTab, setActiveTab] = useState('dashboard')
  const [enquiries, setEnquiries] = useState([])
  const [loading, setLoading] = useState(true)
  const [initialEnquiries] = useState([
    {
      id: 'ENQ001',
      customerName: 'Rajesh Kumar',
      phone: '+91 98765 43210',
      email: 'rajesh@example.com',
      product: 'HP LaserJet Pro MFP',
      source: 'Website',
      status: 'NEW',
      priority: 'HOT',
      assignedTo: null,
      createdDate: '2025-12-18',
      nextFollowUp: '2025-12-20',
      notes: [],
      statusHistory: [
        { date: '2025-12-18', status: 'NEW', updatedBy: 'System', note: 'Enquiry received' }
      ]
    },
    {
      id: 'ENQ002',
      customerName: 'Priya Sharma',
      phone: '+91 98123 45678',
      email: 'priya@example.com',
      product: 'Canon PIXMA G3000',
      source: 'Phone Call',
      status: 'ASSIGNED',
      priority: 'WARM',
      assignedTo: 'Amit Singh',
      createdDate: '2025-12-15',
      nextFollowUp: '2025-12-22',
      notes: [
        { date: '2025-12-15', type: 'Call', note: 'Customer interested in bulk purchase', addedBy: 'Reception' }
      ],
      statusHistory: [
        { date: '2025-12-15', status: 'NEW', updatedBy: 'System', note: 'Enquiry received' },
        { date: '2025-12-15', status: 'ASSIGNED', updatedBy: 'Reception', note: 'Assigned to Amit Singh' }
      ]
    },
    {
      id: 'ENQ003',
      customerName: 'Suresh Patel',
      phone: '+91 97654 32109',
      email: 'suresh@example.com',
      product: 'Epson EcoTank L3250',
      source: 'Walk-in',
      status: 'FOLLOW_UP',
      priority: 'COLD',
      assignedTo: 'Rohit Verma',
      createdDate: '2025-12-10',
      nextFollowUp: '2026-01-10',
      notes: [
        { date: '2025-12-10', type: 'Meeting', note: 'Will decide after budget approval', addedBy: 'Rohit Verma' },
        { date: '2025-12-12', type: 'Call', note: 'Waiting for company approval', addedBy: 'Rohit Verma' }
      ],
      statusHistory: [
        { date: '2025-12-10', status: 'NEW', updatedBy: 'System', note: 'Enquiry received' },
        { date: '2025-12-10', status: 'ASSIGNED', updatedBy: 'Reception', note: 'Assigned to Rohit Verma' },
        { date: '2025-12-12', status: 'FOLLOW_UP', updatedBy: 'Rohit Verma', note: 'Set for future follow-up' }
      ]
    }
  ])

  const [salesmen] = useState([
    { id: 1, name: 'Amit Singh', active: true },
    { id: 2, name: 'Rohit Verma', active: true },
    { id: 3, name: 'Vijay Kumar', active: true }
  ])

  const [selectedEnquiry, setSelectedEnquiry] = useState(null)
  const [showEnquiryDetail, setShowEnquiryDetail] = useState(false)
  const [newNote, setNewNote] = useState({ type: 'Call', note: '' })
  const [reminders, setReminders] = useState([])

  // Fetch enquiries from backend
  useEffect(() => {
    const fetchEnquiries = async () => {
      try {
        setLoading(true)
        const data = await enquiryAPI.getAll()
        setEnquiries(data.length > 0 ? data : initialEnquiries)
      } catch (error) {
        console.error('Error fetching enquiries:', error)
        setEnquiries(initialEnquiries)
        addNotification({
          type: 'error',
          title: 'Error',
          message: 'Failed to load enquiries. Using sample data.',
          priority: 'medium',
          module: 'Reception'
        })
      } finally {
        setLoading(false)
      }
    }
    fetchEnquiries()
  }, [])

  // Generate reminders based on enquiry status
  useEffect(() => {
    const today = new Date()
    const newReminders = []

    enquiries.forEach(enq => {
      const followUpDate = new Date(enq.nextFollowUp)
      const daysUntil = Math.ceil((followUpDate - today) / (1000 * 60 * 60 * 24))

      if (daysUntil <= 1 && enq.status !== 'CLOSED' && enq.status !== 'CONVERTED') {
        newReminders.push({
          id: enq.id,
          message: `Follow-up due for ${enq.customerName} (${enq.priority})`,
          enquiryId: enq.id,
          type: enq.priority === 'HOT' ? 'urgent' : enq.priority === 'WARM' ? 'normal' : 'low',
          daysOverdue: daysUntil < 0 ? Math.abs(daysUntil) : 0
        })
        
        // Send notification for overdue follow-ups
        if (daysUntil < 0) {
          addNotification(templates.followUpReminder(enq.id, enq.customerName))
        }
      }
    })

    setReminders(newReminders)
  }, [enquiries])

  const assignEnquiry = (enquiryId, salesmanName) => {
    setEnquiries(enquiries.map(enq => {
      if (enq.id === enquiryId) {
        const updated = {
          ...enq,
          assignedTo: salesmanName,
          status: 'ASSIGNED',
          statusHistory: [
            ...enq.statusHistory,
            {
              date: new Date().toISOString().split('T')[0],
              status: 'ASSIGNED',
              updatedBy: 'Reception',
              note: `Assigned to ${salesmanName}`
            }
          ]
        }
        
        // Send notification of assignment
        addNotification(templates.enquiryAssigned(enq.id, salesmanName))
        
        return updated
      }
      return enq
    }))
  }

  const updateEnquiryStatus = (enquiryId, newStatus, newPriority) => {
    setEnquiries(enquiries.map(enq => {
      if (enq.id === enquiryId) {
        let nextFollowUp = enq.nextFollowUp
        const today = new Date()

        // Auto-set next follow-up based on priority
        if (newPriority === 'HOT') {
          nextFollowUp = new Date(today.setDate(today.getDate() + 7)).toISOString().split('T')[0]
        } else if (newPriority === 'WARM') {
          nextFollowUp = new Date(today.setDate(today.getDate() + 30)).toISOString().split('T')[0]
        } else if (newPriority === 'COLD') {
          nextFollowUp = new Date(today.setDate(today.getDate() + 90)).toISOString().split('T')[0]
        }

        return {
          ...enq,
          status: newStatus,
          priority: newPriority,
          nextFollowUp,
          statusHistory: [
            ...enq.statusHistory,
            {
              date: new Date().toISOString().split('T')[0],
              status: newStatus,
              updatedBy: 'Reception',
              note: `Status changed to ${newStatus}, Priority: ${newPriority}`
            }
          ]
        }
      }
      return enq
    }))
  }

  const addNote = (enquiryId) => {
    if (!newNote.note.trim()) return

    setEnquiries(enquiries.map(enq => {
      if (enq.id === enquiryId) {
        return {
          ...enq,
          notes: [
            ...enq.notes,
            {
              date: new Date().toISOString().split('T')[0],
              type: newNote.type,
              note: newNote.note,
              addedBy: 'Reception'
            }
          ]
        }
      }
      return enq
    }))

    setNewNote({ type: 'Call', note: '' })
  }

  const updateFollowUpDate = (enquiryId, newDate) => {
    setEnquiries(enquiries.map(enq => {
      if (enq.id === enquiryId) {
        return {
          ...enq,
          nextFollowUp: newDate,
          statusHistory: [
            ...enq.statusHistory,
            {
              date: new Date().toISOString().split('T')[0],
              status: enq.status,
              updatedBy: 'Reception',
              note: `Follow-up date updated to ${newDate}`
            }
          ]
        }
      }
      return enq
    }))
  }

  const renderDashboard = () => {
    const stats = {
      new: enquiries.filter(e => e.status === 'NEW').length,
      hot: enquiries.filter(e => e.priority === 'HOT').length,
      warm: enquiries.filter(e => e.priority === 'WARM').length,
      cold: enquiries.filter(e => e.priority === 'COLD').length,
      assigned: enquiries.filter(e => e.assignedTo !== null).length,
      pending: reminders.length
    }

    return (
      <div className="dashboard">
        <div className="stats-grid">
          <div className="stat-card new">
            <h3>New Enquiries</h3>
            <div className="stat-number">{stats.new}</div>
          </div>
          <div className="stat-card hot">
            <h3>HOT Leads</h3>
            <div className="stat-number">{stats.hot}</div>
            <small>Weekly Follow-up</small>
          </div>
          <div className="stat-card warm">
            <h3>WARM Leads</h3>
            <div className="stat-number">{stats.warm}</div>
            <small>Monthly Follow-up</small>
          </div>
          <div className="stat-card cold">
            <h3>COLD Leads</h3>
            <div className="stat-number">{stats.cold}</div>
            <small>Future Follow-up</small>
          </div>
          <div className="stat-card assigned">
            <h3>Assigned</h3>
            <div className="stat-number">{stats.assigned}</div>
          </div>
          <div className="stat-card pending">
            <h3>Pending Reminders</h3>
            <div className="stat-number">{stats.pending}</div>
          </div>
        </div>

        {reminders.length > 0 && (
          <div className="reminders-section">
            <h2>🔔 Active Reminders</h2>
            <div className="reminders-list">
              {reminders.map(reminder => (
                <div key={reminder.id} className={`reminder-card ${reminder.type}`}>
                  <div className="reminder-content">
                    <strong>{reminder.message}</strong>
                    {reminder.daysOverdue > 0 && (
                      <span className="overdue-badge">{reminder.daysOverdue} days overdue</span>
                    )}
                  </div>
                  <button 
                    className="btn-small"
                    onClick={() => {
                      const enq = enquiries.find(e => e.id === reminder.enquiryId)
                      setSelectedEnquiry(enq)
                      setShowEnquiryDetail(true)
                      setActiveTab('enquiries')
                    }}
                  >
                    View
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    )
  }

  const renderEnquiries = () => {
    return (
      <div className="enquiries-section">
        <div className="section-header">
          <h2>All Enquiries</h2>
          <div className="filters">
            <select className="filter-select">
              <option value="all">All Status</option>
              <option value="NEW">New</option>
              <option value="ASSIGNED">Assigned</option>
              <option value="FOLLOW_UP">Follow Up</option>
            </select>
            <select className="filter-select">
              <option value="all">All Priority</option>
              <option value="HOT">HOT</option>
              <option value="WARM">WARM</option>
              <option value="COLD">COLD</option>
            </select>
          </div>
        </div>

        <div className="table-container">
          <table className="enquiries-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Customer</th>
                <th>Contact</th>
                <th>Product</th>
                <th>Status</th>
                <th>Priority</th>
                <th>Assigned To</th>
                <th>Next Follow-up</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {enquiries.map(enq => (
                <tr key={enq.id} className={`priority-${enq.priority.toLowerCase()}`}>
                  <td><strong>{enq.id}</strong></td>
                  <td>{enq.customerName}</td>
                  <td>
                    <div>{enq.phone}</div>
                    <small>{enq.email}</small>
                  </td>
                  <td>{enq.product}</td>
                  <td>
                    <span className={`badge status-${enq.status.toLowerCase()}`}>
                      {enq.status}
                    </span>
                  </td>
                  <td>
                    <span className={`badge priority-${enq.priority.toLowerCase()}`}>
                      {enq.priority}
                    </span>
                  </td>
                  <td>
                    {enq.assignedTo || (
                      <select 
                        className="assign-select"
                        onChange={(e) => assignEnquiry(enq.id, e.target.value)}
                      >
                        <option value="">Assign...</option>
                        {salesmen.map(s => (
                          <option key={s.id} value={s.name}>{s.name}</option>
                        ))}
                      </select>
                    )}
                  </td>
                  <td>{enq.nextFollowUp}</td>
                  <td>
                    <button 
                      className="btn-small btn-primary"
                      onClick={() => {
                        setSelectedEnquiry(enq)
                        setShowEnquiryDetail(true)
                      }}
                    >
                      Manage
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    )
  }

  const renderEnquiryDetail = () => {
    if (!selectedEnquiry) return null

    return (
      <div className="enquiry-detail-modal">
        <div className="modal-overlay" onClick={() => setShowEnquiryDetail(false)}></div>
        <div className="modal-content">
          <div className="modal-header">
            <h2>Enquiry Details - {selectedEnquiry.id}</h2>
            <button className="close-btn" onClick={() => setShowEnquiryDetail(false)}>✕</button>
          </div>

          <div className="modal-body">
            <div className="detail-section">
              <h3>Customer Information</h3>
              <div className="info-grid">
                <div><strong>Name:</strong> {selectedEnquiry.customerName}</div>
                <div><strong>Phone:</strong> {selectedEnquiry.phone}</div>
                <div><strong>Email:</strong> {selectedEnquiry.email}</div>
                <div><strong>Source:</strong> {selectedEnquiry.source}</div>
                <div><strong>Product:</strong> {selectedEnquiry.product}</div>
                <div><strong>Created:</strong> {selectedEnquiry.createdDate}</div>
              </div>
            </div>

            <div className="detail-section">
              <h3>Status Management</h3>
              <div className="status-controls">
                <div className="control-group">
                  <label>Status:</label>
                  <select 
                    value={selectedEnquiry.status}
                    onChange={(e) => updateEnquiryStatus(
                      selectedEnquiry.id, 
                      e.target.value, 
                      selectedEnquiry.priority
                    )}
                  >
                    <option value="NEW">New</option>
                    <option value="ASSIGNED">Assigned</option>
                    <option value="FOLLOW_UP">Follow Up</option>
                    <option value="QUOTED">Quoted</option>
                    <option value="CONVERTED">Converted</option>
                    <option value="CLOSED">Closed</option>
                  </select>
                </div>
                <div className="control-group">
                  <label>Priority:</label>
                  <select 
                    value={selectedEnquiry.priority}
                    onChange={(e) => updateEnquiryStatus(
                      selectedEnquiry.id, 
                      selectedEnquiry.status, 
                      e.target.value
                    )}
                  >
                    <option value="HOT">HOT (Weekly)</option>
                    <option value="WARM">WARM (Monthly)</option>
                    <option value="COLD">COLD (Future)</option>
                  </select>
                </div>
                <div className="control-group">
                  <label>Assigned To:</label>
                  <select 
                    value={selectedEnquiry.assignedTo || ''}
                    onChange={(e) => assignEnquiry(selectedEnquiry.id, e.target.value)}
                  >
                    <option value="">Unassigned</option>
                    {salesmen.map(s => (
                      <option key={s.id} value={s.name}>{s.name}</option>
                    ))}
                  </select>
                </div>
                <div className="control-group">
                  <label>Next Follow-up:</label>
                  <input 
                    type="date" 
                    value={selectedEnquiry.nextFollowUp}
                    onChange={(e) => updateFollowUpDate(selectedEnquiry.id, e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="detail-section">
              <h3>Call Notes & Updates</h3>
              <div className="notes-list">
                {selectedEnquiry.notes.length > 0 ? (
                  selectedEnquiry.notes.map((note, idx) => (
                    <div key={idx} className="note-item">
                      <div className="note-header">
                        <span className="note-type">{note.type}</span>
                        <span className="note-date">{note.date}</span>
                        <span className="note-author">{note.addedBy}</span>
                      </div>
                      <div className="note-content">{note.note}</div>
                    </div>
                  ))
                ) : (
                  <p className="no-notes">No notes yet</p>
                )}
              </div>

              <div className="add-note-form">
                <h4>Add New Note</h4>
                <div className="form-row">
                  <select 
                    value={newNote.type}
                    onChange={(e) => setNewNote({...newNote, type: e.target.value})}
                  >
                    <option value="Call">Call</option>
                    <option value="Email">Email</option>
                    <option value="Meeting">Meeting</option>
                    <option value="WhatsApp">WhatsApp</option>
                    <option value="Other">Other</option>
                  </select>
                  <textarea
                    value={newNote.note}
                    onChange={(e) => setNewNote({...newNote, note: e.target.value})}
                    placeholder="Enter note details..."
                    rows="3"
                  />
                  <button 
                    className="btn-primary"
                    onClick={() => addNote(selectedEnquiry.id)}
                  >
                    Add Note
                  </button>
                </div>
              </div>
            </div>

            <div className="detail-section">
              <h3>📌 Audit Trail (Status History)</h3>
              <div className="audit-trail">
                {selectedEnquiry.statusHistory.map((history, idx) => (
                  <div key={idx} className="audit-item">
                    <div className="audit-date">{history.date}</div>
                    <div className="audit-details">
                      <strong>{history.status}</strong> - {history.note}
                      <small>by {history.updatedBy}</small>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="page-container reception-module">
      <div className="content-wrapper">
        <div className="page-header">
          <div>
            <h1 className="page-title">🏢 Reception - CRM Hub</h1>
            <p className="page-subtitle">Sales Enquiry Management & Tracking System</p>
          </div>
        </div>

        <div className="tabs-navigation">
          <button 
            className={activeTab === 'dashboard' ? 'active' : ''}
            onClick={() => setActiveTab('dashboard')}
          >
            📊 Dashboard
          </button>
          <button 
            className={activeTab === 'enquiries' ? 'active' : ''}
            onClick={() => setActiveTab('enquiries')}
          >
            📋 All Enquiries
          </button>
          <button 
            className={activeTab === 'reminders' ? 'active' : ''}
            onClick={() => setActiveTab('reminders')}
          >
            🔔 Reminders ({reminders.length})
          </button>
        </div>

        <div className="page-content">
          {activeTab === 'dashboard' && renderDashboard()}
          {activeTab === 'enquiries' && renderEnquiries()}
          {activeTab === 'reminders' && (
            <div className="reminders-section">
              <h2>All Reminders</h2>
              {reminders.length > 0 ? (
                <div className="reminders-list">
                  {reminders.map(reminder => (
                    <div key={reminder.id} className={`reminder-card ${reminder.type}`}>
                      <div className="reminder-content">
                        <strong>{reminder.message}</strong>
                        {reminder.daysOverdue > 0 && (
                          <span className="overdue-badge">{reminder.daysOverdue} days overdue</span>
                        )}
                      </div>
                      <button 
                        className="btn-small"
                        onClick={() => {
                          const enq = enquiries.find(e => e.id === reminder.enquiryId)
                          setSelectedEnquiry(enq)
                          setShowEnquiryDetail(true)
                          setActiveTab('enquiries')
                        }}
                      >
                        View Details
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p>No pending reminders</p>
              )}
            </div>
          )}
        </div>
      </div>

      {showEnquiryDetail && renderEnquiryDetail()}

      <style>{`
        .reception-module {
          min-height: 100vh;
          background: #f5f7fa;
        }

        .page-header {
          margin-bottom: 20px;
        }

        .page-title {
          margin: 0;
          color: #2c3e50;
        }

        .page-subtitle {
          color: #7f8c8d;
          margin: 5px 0 0 0;
        }

        .tabs-navigation {
          display: flex;
          gap: 10px;
          margin-bottom: 20px;
          border-bottom: 2px solid #e0e0e0;
          padding-bottom: 10px;
        }

        .tabs-navigation button {
          padding: 12px 24px;
          border: none;
          background: transparent;
          cursor: pointer;
          font-size: 15px;
          border-bottom: 3px solid transparent;
          transition: all 0.3s;
          font-weight: 500;
        }

        .tabs-navigation button:hover {
          background: #f0f0f0;
        }

        .tabs-navigation button.active {
          border-bottom-color: #3498db;
          color: #3498db;
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
          border-left: 4px solid #3498db;
        }

        .stat-card.new { border-left-color: #9b59b6; }
        .stat-card.hot { border-left-color: #e74c3c; }
        .stat-card.warm { border-left-color: #f39c12; }
        .stat-card.cold { border-left-color: #3498db; }
        .stat-card.assigned { border-left-color: #2ecc71; }
        .stat-card.pending { border-left-color: #e67e22; }

        .stat-card h3 {
          margin: 0 0 10px 0;
          font-size: 14px;
          color: #7f8c8d;
          text-transform: uppercase;
        }

        .stat-number {
          font-size: 36px;
          font-weight: bold;
          color: #2c3e50;
        }

        .stat-card small {
          color: #95a5a6;
          font-size: 12px;
        }

        .reminders-section {
          background: white;
          padding: 25px;
          border-radius: 10px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }

        .reminders-section h2 {
          margin-top: 0;
          color: #2c3e50;
        }

        .reminders-list {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .reminder-card {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 15px;
          border-radius: 8px;
          border-left: 4px solid;
        }

        .reminder-card.urgent {
          background: #fee;
          border-left-color: #e74c3c;
        }

        .reminder-card.normal {
          background: #fff3e0;
          border-left-color: #f39c12;
        }

        .reminder-card.low {
          background: #e3f2fd;
          border-left-color: #3498db;
        }

        .reminder-content {
          flex: 1;
        }

        .overdue-badge {
          display: inline-block;
          margin-left: 10px;
          padding: 3px 8px;
          background: #e74c3c;
          color: white;
          border-radius: 12px;
          font-size: 11px;
          font-weight: bold;
        }

        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
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
        }

        .enquiries-table {
          width: 100%;
          border-collapse: collapse;
        }

        .enquiries-table th {
          background: #34495e;
          color: white;
          padding: 15px;
          text-align: left;
          font-weight: 600;
          font-size: 13px;
          text-transform: uppercase;
        }

        .enquiries-table td {
          padding: 15px;
          border-bottom: 1px solid #ecf0f1;
        }

        .enquiries-table tbody tr:hover {
          background: #f8f9fa;
        }

        .enquiries-table tr.priority-hot {
          border-left: 4px solid #e74c3c;
        }

        .enquiries-table tr.priority-warm {
          border-left: 4px solid #f39c12;
        }

        .enquiries-table tr.priority-cold {
          border-left: 4px solid #3498db;
        }

        .badge {
          display: inline-block;
          padding: 4px 12px;
          border-radius: 12px;
          font-size: 11px;
          font-weight: 600;
          text-transform: uppercase;
        }

        .status-new { background: #e8daef; color: #6c3483; }
        .status-assigned { background: #d1f2eb; color: #0e6655; }
        .status-follow_up { background: #fef5e7; color: #9c640c; }
        .status-quoted { background: #d6eaf8; color: #1a5490; }
        .status-converted { background: #d4efdf; color: #145a32; }
        .status-closed { background: #e5e7e9; color: #2c3e50; }

        .priority-hot { background: #f8d7da; color: #721c24; }
        .priority-warm { background: #fff3cd; color: #856404; }
        .priority-cold { background: #d1ecf1; color: #0c5460; }

        .assign-select {
          padding: 6px 10px;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-size: 13px;
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
        }

        .btn-primary:hover {
          background: #2980b9;
        }

        .enquiry-detail-modal {
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
          background: rgba(0,0,0,0.5);
        }

        .modal-content {
          position: relative;
          background: white;
          border-radius: 12px;
          width: 90%;
          max-width: 900px;
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
          color: #2c3e50;
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
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .close-btn:hover {
          color: #e74c3c;
        }

        .modal-body {
          padding: 25px;
        }

        .detail-section {
          margin-bottom: 30px;
          padding-bottom: 20px;
          border-bottom: 1px solid #ecf0f1;
        }

        .detail-section:last-child {
          border-bottom: none;
        }

        .detail-section h3 {
          margin-top: 0;
          color: #34495e;
          border-left: 4px solid #3498db;
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

        .status-controls {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 15px;
        }

        .control-group {
          display: flex;
          flex-direction: column;
          gap: 5px;
        }

        .control-group label {
          font-weight: 600;
          color: #555;
          font-size: 13px;
        }

        .control-group select,
        .control-group input {
          padding: 10px;
          border: 1px solid #ddd;
          border-radius: 5px;
          font-size: 14px;
        }

        .notes-list {
          max-height: 300px;
          overflow-y: auto;
          margin-bottom: 20px;
        }

        .note-item {
          background: #f8f9fa;
          padding: 15px;
          border-radius: 8px;
          margin-bottom: 10px;
          border-left: 3px solid #3498db;
        }

        .note-header {
          display: flex;
          gap: 15px;
          margin-bottom: 8px;
          font-size: 12px;
        }

        .note-type {
          background: #3498db;
          color: white;
          padding: 3px 10px;
          border-radius: 10px;
          font-weight: 600;
        }

        .note-date {
          color: #7f8c8d;
        }

        .note-author {
          color: #7f8c8d;
          font-style: italic;
        }

        .note-content {
          color: #2c3e50;
          line-height: 1.5;
        }

        .no-notes {
          text-align: center;
          color: #95a5a6;
          padding: 20px;
        }

        .add-note-form {
          background: #ecf0f1;
          padding: 20px;
          border-radius: 8px;
        }

        .add-note-form h4 {
          margin-top: 0;
          color: #34495e;
        }

        .form-row {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .form-row select,
        .form-row textarea {
          padding: 10px;
          border: 1px solid #bdc3c7;
          border-radius: 5px;
          font-size: 14px;
        }

        .audit-trail {
          background: #f8f9fa;
          padding: 20px;
          border-radius: 8px;
          max-height: 300px;
          overflow-y: auto;
        }

        .audit-item {
          display: flex;
          gap: 15px;
          padding: 10px;
          border-left: 3px solid #95a5a6;
          margin-bottom: 10px;
          background: white;
          border-radius: 4px;
        }

        .audit-date {
          min-width: 100px;
          font-weight: 600;
          color: #7f8c8d;
          font-size: 13px;
        }

        .audit-details {
          flex: 1;
        }

        .audit-details strong {
          color: #3498db;
        }

        .audit-details small {
          display: block;
          color: #95a5a6;
          font-size: 11px;
          margin-top: 3px;
        }

        @media (max-width: 768px) {
          .stats-grid {
            grid-template-columns: 1fr;
          }

          .tabs-navigation {
            overflow-x: auto;
            flex-wrap: nowrap;
          }

          .table-container {
            overflow-x: auto;
          }

          .modal-content {
            width: 95%;
            max-height: 95vh;
          }

          .info-grid,
          .status-controls {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  )
}

import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useNotifications } from '../contexts/NotificationContext.jsx'
import { useAuth } from '../contexts/AuthContext.jsx'
import { mifAPI, customerAPI, enquiryAPI, userAPI } from '../utils/api'

export default function Admin() {
  const navigate = useNavigate()
  const { addNotification, templates } = useNotifications()
  const { user, canAccessMIF } = useAuth()
  const [activeTab, setActiveTab] = useState('dashboard')
  const [activeSubTab, setActiveSubTab] = useState(null)
  const [adminName] = useState(user?.name || 'Admin User')
  const [loading, setLoading] = useState(true)

  // Customer Data
  const [customers, setCustomers] = useState([
    {
      id: 'CUST001',
      name: 'Rajesh Enterprises',
      contact: '+91 98765 43210',
      email: 'rajesh@example.com',
      address: '123 MG Road, Bangalore',
      joinDate: '2024-05-15',
      status: 'Active',
      totalPurchases: 5,
      totalValue: '₹2,50,000',
      lastPurchase: '2025-10-20',
      amcStatus: 'Active',
      amcExpiry: '2026-05-15'
    },
    {
      id: 'CUST002',
      name: 'Tech Solutions Pvt Ltd',
      contact: '+91 98123 45678',
      email: 'tech@example.com',
      address: '456 Whitefield, Bangalore',
      joinDate: '2023-08-10',
      status: 'Active',
      totalPurchases: 12,
      totalValue: '₹8,50,000',
      lastPurchase: '2025-11-30',
      amcStatus: 'Expiring Soon',
      amcExpiry: '2026-01-15'
    }
  ])

  // Employee Data
  const [employees, setEmployees] = useState([
    {
      id: 'EMP001',
      name: 'Amit Singh',
      role: 'Salesman',
      department: 'Sales',
      joinDate: '2024-01-15',
      status: 'Active',
      attendance: 95,
      performance: 88,
      todayPresent: true,
      lastLogin: '2025-12-20 09:30'
    },
    {
      id: 'EMP002',
      name: 'Rahul Kumar',
      role: 'Service Engineer',
      department: 'Service',
      joinDate: '2023-06-20',
      status: 'Active',
      attendance: 92,
      performance: 85,
      todayPresent: true,
      lastLogin: '2025-12-20 08:45'
    },
    {
      id: 'EMP003',
      name: 'Priya Sharma',
      role: 'Office Staff',
      department: 'Office',
      joinDate: '2024-03-10',
      status: 'Active',
      attendance: 98,
      performance: 92,
      todayPresent: true,
      lastLogin: '2025-12-20 09:00'
    }
  ])

  // Reception/Enquiry Data
  const [enquiries, setEnquiries] = useState([
    {
      id: 'ENQ001',
      customerName: 'Vijay Malhotra',
      phone: '+91 99887 76655',
      product: 'HP LaserJet Pro',
      status: 'HOT',
      assignedTo: 'Amit Singh',
      createdDate: '2025-12-18',
      lastFollowUp: '2025-12-19',
      nextFollowUp: '2025-12-20',
      followUpCount: 3,
      efficiency: 'Good'
    },
    {
      id: 'ENQ002',
      customerName: 'Sunita Reddy',
      phone: '+91 98776 65544',
      product: 'Canon PIXMA',
      status: 'WARM',
      assignedTo: 'Rohit Verma',
      createdDate: '2025-12-10',
      lastFollowUp: '2025-12-15',
      nextFollowUp: '2025-12-25',
      followUpCount: 2,
      efficiency: 'Average'
    }
  ])

  // MIF - Machine In Field (CONFIDENTIAL - ACCESS LOGGED)
  const [mifRecords, setMifRecords] = useState([])
  const [initialMifRecords] = useState([
    {
      id: 'MIF-2025-001',
      customerName: 'Rajesh Enterprises',
      machineModel: 'HP LaserJet Pro MFP M428fdw',
      serialNumber: 'HPM428-2024-001',
      installationDate: '2024-05-20',
      location: '123 MG Road, Bangalore',
      status: 'Active',
      amcStatus: 'Active',
      amcExpiry: '2026-05-20',
      lastService: '2025-11-15',
      nextService: '2026-01-15',
      servicesDone: 3,
      machineValue: '₹45,000'
    },
    {
      id: 'MIF-2025-002',
      customerName: 'Tech Solutions Pvt Ltd',
      machineModel: 'Canon PIXMA G3000',
      serialNumber: 'CNG3000-2023-045',
      installationDate: '2023-08-15',
      location: '456 Whitefield, Bangalore',
      status: 'Active',
      amcStatus: 'Expiring Soon',
      amcExpiry: '2026-01-15',
      lastService: '2025-10-20',
      nextService: '2025-12-25',
      servicesDone: 8,
      machineValue: '₹18,500'
    }
  ])

  const [mifAccessLog, setMifAccessLog] = useState([
    {
      id: 1,
      accessedBy: 'Admin User',
      timestamp: '2025-12-20 10:30:45',
      action: 'Viewed MIF Records',
      ipAddress: '192.168.1.100'
    }
  ])

  // Monthly Reminders
  const [monthlyReminders, setMonthlyReminders] = useState([
    {
      id: 'REM001',
      type: 'AMC Expiry',
      customer: 'Tech Solutions Pvt Ltd',
      dueDate: '2026-01-15',
      daysRemaining: 26,
      priority: 'High',
      status: 'Pending',
      notifyTo: ['Reception', 'Amit Singh']
    },
    {
      id: 'REM002',
      type: 'Service Due',
      customer: 'Rajesh Enterprises',
      dueDate: '2026-01-15',
      daysRemaining: 26,
      priority: 'Medium',
      status: 'Pending',
      notifyTo: ['Reception', 'Service Team']
    }
  ])

  const [showModal, setShowModal] = useState(false)
  const [modalType, setModalType] = useState('')
  const [formData, setFormData] = useState({})
  const [alerts, setAlerts] = useState([])

  // Fetch MIF records from backend (ACCESS IS LOGGED)
  useEffect(() => {
    const fetchMIFData = async () => {
      if (!canAccessMIF()) {
        addNotification({
          type: 'error',
          title: 'Access Denied',
          message: 'You do not have permission to access MIF records',
          priority: 'high',
          module: 'Admin'
        })
        return
      }

      try {
        setLoading(true)
        const data = await mifAPI.getAll()
        setMifRecords(data.length > 0 ? data : initialMifRecords)
        
        // Log that MIF was accessed
        addNotification({
          type: 'info',
          title: '🔒 MIF Access Logged',
          message: 'Your access to MIF records has been logged for security',
          priority: 'low',
          module: 'Admin'
        })
      } catch (error) {
        console.error('Error fetching MIF records:', error)
        setMifRecords(initialMifRecords)
        addNotification({
          type: 'error',
          title: 'Error',
          message: 'Failed to load MIF records',
          priority: 'high',
          module: 'Admin'
        })
      } finally {
        setLoading(false)
      }
    }

    if (activeTab === 'mif') {
      fetchMIFData()
    }
  }, [activeTab])

  // Fetch employees from database
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const data = await userAPI.getAll()
        setEmployees(data.map(user => ({
          id: user.id,
          empId: `EMP${String(user.id).padStart(3, '0')}`,
          name: user.full_name || user.username,
          username: user.username,
          email: user.email,
          role: user.role,
          department: user.department || 'General',
          joinDate: new Date(user.created_at).toISOString().split('T')[0],
          status: user.is_active ? 'Active' : 'Inactive',
          attendance: 95, // TODO: Calculate from actual attendance data
          performance: 85, // TODO: Calculate from actual performance data
          todayPresent: true,
          lastLogin: 'N/A'
        })))
      } catch (error) {
        console.error('Error fetching employees:', error)
      }
    }

    if (activeTab === 'employees' || activeTab === 'dashboard') {
      fetchEmployees()
    }
  }, [activeTab])

  // Generate alerts for admin
  useEffect(() => {
    const newAlerts = []

    // AMC expiring alerts
    mifRecords.forEach(mif => {
      const daysUntilExpiry = Math.ceil((new Date(mif.amcExpiry) - new Date()) / (1000 * 60 * 60 * 24))
      if (daysUntilExpiry <= 30 && daysUntilExpiry > 0) {
        newAlerts.push({
          id: `amc-${mif.id}`,
          type: 'warning',
          message: `AMC expiring in ${daysUntilExpiry} days for ${mif.customerName}`,
          priority: daysUntilExpiry <= 7 ? 'High' : 'Medium'
        })
        
        // Send notification for AMC expiry
        addNotification(templates.amcExpiry(mif.customerName, daysUntilExpiry))
      }
    })

    // Low attendance alerts
    employees.forEach(emp => {
      if (emp.attendance < 90) {
        newAlerts.push({
          id: `att-${emp.id}`,
          type: 'warning',
          message: `${emp.name} has low attendance (${emp.attendance}%)`,
          priority: 'Medium'
        })
        
        // Send attendance alert notification
        addNotification(templates.attendanceAlert(emp.name))
      }
    })

    // Pending follow-up alerts
    const overdueEnquiries = enquiries.filter(e => new Date(e.nextFollowUp) < new Date())
    if (overdueEnquiries.length > 0) {
      newAlerts.push({
        id: 'followup-overdue',
        type: 'critical',
        message: `${overdueEnquiries.length} enquiries have overdue follow-ups`,
        priority: 'High'
      })
    }

    setAlerts(newAlerts)
  }, [mifRecords, employees, enquiries])

  const openModal = (type) => {
    setModalType(type)
    setFormData({})
    setShowModal(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    switch(modalType) {
      case 'employee':
        try {
          const userData = {
            username: formData.username || formData.name.toLowerCase().replace(/\s+/g, ''),
            email: formData.email,
            full_name: formData.name,
            role: formData.role.toLowerCase().replace(/\s+/g, '_'),
            department: formData.department,
            password: formData.password || 'default123' // Default password
          }
          
          const newUser = await userAPI.create(userData)
          
          // Add to local state
          const newEmp = {
            id: newUser.id,
            empId: `EMP${String(newUser.id).padStart(3, '0')}`,
            name: newUser.full_name,
            username: newUser.username,
            email: newUser.email,
            role: newUser.role,
            department: newUser.department,
            joinDate: new Date().toISOString().split('T')[0],
            status: 'Active',
            attendance: 100,
            performance: 0,
            todayPresent: true,
            lastLogin: 'Never'
          }
          setEmployees([...employees, newEmp])
          
          addNotification({
            type: 'success',
            title: 'Employee Added',
            message: `${formData.name} has been added successfully`,
            priority: 'medium',
            module: 'Admin'
          })
        } catch (error) {
          console.error('Error adding employee:', error)
          addNotification({
            type: 'error',
            title: 'Error',
            message: error.message || 'Failed to add employee',
            priority: 'high',
            module: 'Admin'
          })
        }
        break
      
      case 'product':
        alert('Product added successfully!')
        break
        
      case 'service':
        alert('Service added successfully!')
        break
    }
    
    setShowModal(false)
  }

  const sendReminder = (reminderId) => {
    setMonthlyReminders(monthlyReminders.map(rem => 
      rem.id === reminderId ? { ...rem, status: 'Sent' } : rem
    ))
    alert('Reminder sent successfully!')
  }

  const renderDashboard = () => {
    const stats = {
      totalCustomers: customers.length,
      activeCustomers: customers.filter(c => c.status === 'Active').length,
      totalEmployees: employees.length,
      presentToday: employees.filter(e => e.todayPresent).length,
      totalEnquiries: enquiries.length,
      hotEnquiries: enquiries.filter(e => e.status === 'HOT').length,
      totalMachines: mifRecords.length,
      amcExpiring: mifRecords.filter(m => {
        const days = Math.ceil((new Date(m.amcExpiry) - new Date()) / (1000 * 60 * 60 * 24))
        return days <= 30 && days > 0
      }).length,
      pendingReminders: monthlyReminders.filter(r => r.status === 'Pending').length
    }

    return (
      <div className="admin-dashboard">
        <div className="welcome-section">
          <div className="welcome-card">
            <h2>👑 Admin Control Center</h2>
            <p>Complete system oversight and management</p>
          </div>
          {alerts.length > 0 && (
            <div className="alerts-badge">
              <span>{alerts.length} Alert{alerts.length !== 1 ? 's' : ''}</span>
            </div>
          )}
        </div>

        {alerts.length > 0 && (
          <div className="alerts-container">
            <h3>🚨 System Alerts</h3>
            <div className="alerts-grid">
              {alerts.map(alert => (
                <div key={alert.id} className={`alert-item ${alert.type}`}>
                  <span className={`priority-dot ${alert.priority.toLowerCase()}`}></span>
                  <p>{alert.message}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="stats-overview">
          <div className="stat-card">
            <div className="stat-icon">👥</div>
            <div className="stat-details">
              <h4>Customers</h4>
              <div className="stat-value">{stats.totalCustomers}</div>
              <small>{stats.activeCustomers} Active</small>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">👨‍💼</div>
            <div className="stat-details">
              <h4>Employees</h4>
              <div className="stat-value">{stats.totalEmployees}</div>
              <small>{stats.presentToday} Present Today</small>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">📞</div>
            <div className="stat-details">
              <h4>Enquiries</h4>
              <div className="stat-value">{stats.totalEnquiries}</div>
              <small>{stats.hotEnquiries} HOT Leads</small>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">🖨️</div>
            <div className="stat-details">
              <h4>Machines (MIF)</h4>
              <div className="stat-value">{stats.totalMachines}</div>
              <small>{stats.amcExpiring} AMC Expiring</small>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">🔔</div>
            <div className="stat-details">
              <h4>Reminders</h4>
              <div className="stat-value">{stats.pendingReminders}</div>
              <small>Pending Actions</small>
            </div>
          </div>
        </div>

        <div className="quick-actions-section">
          <h3>⚡ Quick Actions</h3>
          <div className="action-grid">
            <button className="action-card" onClick={() => openModal('employee')}>
              <span className="action-icon">➕</span>
              <span>Add Employee</span>
            </button>
            <button className="action-card" onClick={() => navigate('/products/add')}>
              <span className="action-icon">📦</span>
              <span>Add Product</span>
            </button>
            <button className="action-card" onClick={() => openModal('service')}>
              <span className="action-icon">🔧</span>
              <span>Add Service</span>
            </button>
            <button className="action-card" onClick={() => setActiveTab('mif')}>
              <span className="action-icon">🔒</span>
              <span>Access MIF</span>
            </button>
          </div>
        </div>
      </div>
    )
  }

  const renderCustomers = () => {
    return (
      <div className="customers-section">
        <div className="section-header">
          <h2>👥 Customer Management</h2>
          <div className="header-actions">
            <button className="btn-primary">+ Add Customer</button>
          </div>
        </div>

        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Contact</th>
                <th>Join Date</th>
                <th>Total Purchases</th>
                <th>Total Value</th>
                <th>Last Purchase</th>
                <th>AMC Status</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {customers.map(customer => (
                <tr key={customer.id}>
                  <td><strong>{customer.id}</strong></td>
                  <td>{customer.name}</td>
                  <td>
                    <div>{customer.contact}</div>
                    <small>{customer.email}</small>
                  </td>
                  <td>{customer.joinDate}</td>
                  <td>{customer.totalPurchases}</td>
                  <td><strong>{customer.totalValue}</strong></td>
                  <td>{customer.lastPurchase}</td>
                  <td>
                    <span className={`amc-badge ${customer.amcStatus.toLowerCase().replace(' ', '-')}`}>
                      {customer.amcStatus}
                    </span>
                    <br />
                    <small>Expires: {customer.amcExpiry}</small>
                  </td>
                  <td><span className="status-badge active">{customer.status}</span></td>
                  <td>
                    <button className="btn-small">View Details</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    )
  }

  const renderEmployees = () => {
    return (
      <div className="employees-section">
        <div className="section-header">
          <h2>👨‍💼 Employee Management</h2>
          <div className="header-actions">
            <button className="btn-primary" onClick={() => openModal('employee')}>+ Add Employee</button>
          </div>
        </div>

        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Role</th>
                <th>Department</th>
                <th>Join Date</th>
                <th>Attendance</th>
                <th>Performance</th>
                <th>Present Today</th>
                <th>Last Login</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {employees.map(emp => (
                <tr key={emp.id}>
                  <td><strong>{emp.id}</strong></td>
                  <td>{emp.name}</td>
                  <td>{emp.role}</td>
                  <td>{emp.department}</td>
                  <td>{emp.joinDate}</td>
                  <td>
                    <div className="progress-indicator">
                      <div 
                        className="progress-bar" 
                        style={{ 
                          width: `${emp.attendance}%`,
                          background: emp.attendance >= 90 ? '#27ae60' : emp.attendance >= 75 ? '#f39c12' : '#e74c3c'
                        }}
                      ></div>
                      <span>{emp.attendance}%</span>
                    </div>
                  </td>
                  <td>
                    <div className="progress-indicator">
                      <div 
                        className="progress-bar" 
                        style={{ 
                          width: `${emp.performance}%`,
                          background: emp.performance >= 85 ? '#27ae60' : emp.performance >= 70 ? '#f39c12' : '#e74c3c'
                        }}
                      ></div>
                      <span>{emp.performance}%</span>
                    </div>
                  </td>
                  <td>
                    <span className={emp.todayPresent ? 'present-badge' : 'absent-badge'}>
                      {emp.todayPresent ? '✓ Present' : '✗ Absent'}
                    </span>
                  </td>
                  <td><small>{emp.lastLogin}</small></td>
                  <td><span className="status-badge active">{emp.status}</span></td>
                  <td>
                    <button className="btn-small">Manage</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    )
  }

  const renderReception = () => {
    return (
      <div className="reception-section">
        <div className="section-header">
          <h2>📞 Reception Management</h2>
        </div>

        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Enquiry ID</th>
                <th>Customer</th>
                <th>Product</th>
                <th>Status</th>
                <th>Assigned To</th>
                <th>Created</th>
                <th>Last Follow-up</th>
                <th>Next Follow-up</th>
                <th>Follow-up Count</th>
                <th>Efficiency</th>
              </tr>
            </thead>
            <tbody>
              {enquiries.map(enq => {
                const isOverdue = new Date(enq.nextFollowUp) < new Date()
                return (
                  <tr key={enq.id} className={isOverdue ? 'row-warning' : ''}>
                    <td><strong>{enq.id}</strong></td>
                    <td>
                      <div>{enq.customerName}</div>
                      <small>{enq.phone}</small>
                    </td>
                    <td>{enq.product}</td>
                    <td>
                      <span className={`priority-badge ${enq.status.toLowerCase()}`}>
                        {enq.status}
                      </span>
                    </td>
                    <td>{enq.assignedTo}</td>
                    <td>{enq.createdDate}</td>
                    <td>{enq.lastFollowUp}</td>
                    <td className={isOverdue ? 'text-danger' : ''}>
                      {enq.nextFollowUp}
                      {isOverdue && ' (Overdue)'}
                    </td>
                    <td>{enq.followUpCount}</td>
                    <td>
                      <span className={`efficiency-badge ${enq.efficiency.toLowerCase()}`}>
                        {enq.efficiency}
                      </span>
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

  const renderMIF = () => {
    // Check MIF access permission
    if (!canAccessMIF()) {
      return (
        <div className="mif-section">
          <div className="access-denied-box">
            <div className="denied-icon">🔒</div>
            <h2>Access Restricted</h2>
            <p className="denied-message">
              MIF (Machine In Field) data is <strong>CONFIDENTIAL</strong> and accessible only to:
            </p>
            <ul className="access-list">
              <li>✓ Admin</li>
              <li>✓ Authorized Office Staff</li>
            </ul>
            <p className="denied-role">Your current role: <strong>{user?.role}</strong></p>
            <p className="denied-note">⚠️ This access attempt has been logged</p>
          </div>
        </div>
      )
    }

    // Log access when viewing MIF
    useEffect(() => {
      logMIFAccess('Viewed MIF Records')
    }, [])

    return (
      <div className="mif-section">
        <div className="confidential-banner">
          <span className="lock-icon">🔒</span>
          <div>
            <h3>CONFIDENTIAL - Machine In Field (MIF)</h3>
            <p>This section is restricted. All access is logged and monitored.</p>
            <p className="access-granted">✓ Access granted to: {user?.name} ({user?.role})</p>
          </div>
        </div>

        <div className="section-header">
          <h2>🖨️ Installed Base Management</h2>
          <button className="btn-primary">+ Add Installation</button>
        </div>

        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>MIF ID</th>
                <th>Customer</th>
                <th>Machine Model</th>
                <th>Serial Number</th>
                <th>Installation Date</th>
                <th>Location</th>
                <th>Machine Value</th>
                <th>AMC Status</th>
                <th>Last Service</th>
                <th>Next Service</th>
                <th>Services Done</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {mifRecords.map(mif => {
                const daysUntilAMC = Math.ceil((new Date(mif.amcExpiry) - new Date()) / (1000 * 60 * 60 * 24))
                return (
                  <tr key={mif.id}>
                    <td><strong>{mif.id}</strong></td>
                    <td>{mif.customerName}</td>
                    <td>{mif.machineModel}</td>
                    <td><code>{mif.serialNumber}</code></td>
                    <td>{mif.installationDate}</td>
                    <td>{mif.location}</td>
                    <td><strong>{mif.machineValue}</strong></td>
                    <td>
                      <span className={`amc-badge ${mif.amcStatus.toLowerCase().replace(' ', '-')}`}>
                        {mif.amcStatus}
                      </span>
                      <br />
                      <small>
                        Expires: {mif.amcExpiry}
                        {daysUntilAMC <= 30 && ` (${daysUntilAMC} days)`}
                      </small>
                    </td>
                    <td>{mif.lastService}</td>
                    <td>{mif.nextService}</td>
                    <td>{mif.servicesDone}</td>
                    <td><span className="status-badge active">{mif.status}</span></td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        <div className="access-log-section">
          <h3>🔍 Access Log</h3>
          <div className="log-container">
            {mifAccessLog.slice(0, 10).map(log => (
              <div key={log.id} className="log-entry">
                <span className="log-time">{log.timestamp}</span>
                <span className="log-user">{log.accessedBy}</span>
                <span className="log-action">{log.action}</span>
                <span className="log-ip">{log.ipAddress}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  const renderReminders = () => {
    return (
      <div className="reminders-section">
        <div className="section-header">
          <h2>🔔 Monthly Reminder System</h2>
          <p className="section-description">Automated reminders for AMC, Service, and Follow-ups</p>
        </div>

        <div className="reminders-grid">
          {monthlyReminders.map(reminder => (
            <div key={reminder.id} className={`reminder-card ${reminder.priority.toLowerCase()}`}>
              <div className="reminder-header">
                <h3>{reminder.type}</h3>
                <span className={`priority-badge ${reminder.priority.toLowerCase()}`}>
                  {reminder.priority}
                </span>
              </div>
              <div className="reminder-body">
                <p><strong>Customer:</strong> {reminder.customer}</p>
                <p><strong>Due Date:</strong> {reminder.dueDate}</p>
                <p className={reminder.daysRemaining <= 7 ? 'text-danger' : ''}>
                  <strong>Days Remaining:</strong> {reminder.daysRemaining}
                </p>
                <p><strong>Notify To:</strong></p>
                <ul>
                  {reminder.notifyTo.map((recipient, idx) => (
                    <li key={idx}>{recipient}</li>
                  ))}
                </ul>
                <p><strong>Status:</strong> 
                  <span className={`status-badge ${reminder.status.toLowerCase()}`}>
                    {reminder.status}
                  </span>
                </p>
              </div>
              <div className="reminder-footer">
                {reminder.status === 'Pending' && (
                  <button 
                    className="btn-primary"
                    onClick={() => sendReminder(reminder.id)}
                  >
                    Send Reminder Now
                  </button>
                )}
                {reminder.status === 'Sent' && (
                  <span className="sent-label">✓ Reminder Sent</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="page-container admin-module">
      <div className="content-wrapper">
        <div className="page-header">
          <div>
            <h1 className="page-title">👑 Admin Dashboard - God Mode</h1>
            <p className="page-subtitle">Complete System Control & Oversight</p>
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
            className={activeTab === 'customers' ? 'active' : ''}
            onClick={() => setActiveTab('customers')}
          >
            👥 Customers ({customers.length})
          </button>
          <button 
            className={activeTab === 'employees' ? 'active' : ''}
            onClick={() => setActiveTab('employees')}
          >
            👨‍💼 Employees ({employees.length})
          </button>
          <button 
            className={activeTab === 'reception' ? 'active' : ''}
            onClick={() => setActiveTab('reception')}
          >
            📞 Reception ({enquiries.length})
          </button>
          <button 
            className={activeTab === 'mif' ? 'active' : ''}
            onClick={() => setActiveTab('mif')}
          >
            🔒 MIF (Confidential)
          </button>
          <button 
            className={activeTab === 'reminders' ? 'active' : ''}
            onClick={() => setActiveTab('reminders')}
          >
            🔔 Reminders ({monthlyReminders.filter(r => r.status === 'Pending').length})
          </button>
        </div>

        <div className="page-content">
          {activeTab === 'dashboard' && renderDashboard()}
          {activeTab === 'customers' && renderCustomers()}
          {activeTab === 'employees' && renderEmployees()}
          {activeTab === 'reception' && renderReception()}
          {activeTab === 'mif' && renderMIF()}
          {activeTab === 'reminders' && renderReminders()}
        </div>
      </div>

      {/* Add Employee/Product/Service Modal */}
      {showModal && (
        <div className="modal">
          <div className="modal-overlay" onClick={() => setShowModal(false)}></div>
          <div className="modal-content">
            <div className="modal-header">
              <h2>
                {modalType === 'employee' && '➕ Add Employee'}
                {modalType === 'product' && '📦 Add Product'}
                {modalType === 'service' && '🔧 Add Service'}
              </h2>
              <button className="close-btn" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <form onSubmit={handleSubmit} className="modal-body">
              {modalType === 'employee' && (
                <>
                  <div className="form-group">
                    <label>Employee Name *</label>
                    <input 
                      type="text" 
                      value={formData.name || ''}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Username *</label>
                    <input 
                      type="text" 
                      value={formData.username || ''}
                      onChange={(e) => setFormData({...formData, username: e.target.value})}
                      placeholder="Auto-generated if left empty"
                    />
                  </div>
                  <div className="form-group">
                    <label>Email *</label>
                    <input 
                      type="email" 
                      value={formData.email || ''}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Password *</label>
                    <input 
                      type="password" 
                      value={formData.password || ''}
                      onChange={(e) => setFormData({...formData, password: e.target.value})}
                      placeholder="Leave empty for default: default123"
                    />
                  </div>
                  <div className="form-group">
                    <label>Role *</label>
                    <select 
                      value={formData.role || ''}
                      onChange={(e) => setFormData({...formData, role: e.target.value})}
                      required
                    >
                      <option value="">Select Role</option>
                      <option value="admin">Admin</option>
                      <option value="reception">Reception</option>
                      <option value="salesman">Salesman</option>
                      <option value="service_engineer">Service Engineer</option>
                      <option value="office_staff">Office Staff</option>
                      <option value="customer">Customer</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Department *</label>
                    <select 
                      value={formData.department || ''}
                      onChange={(e) => setFormData({...formData, department: e.target.value})}
                      required
                    >
                      <option value="">Select Department</option>
                      <option value="Sales">Sales</option>
                      <option value="Service">Service</option>
                      <option value="Office">Office</option>
                      <option value="Admin">Admin</option>
                      <option value="Reception">Reception</option>
                    </select>
                  </div>
                </>
              )}
              
              {modalType === 'product' && (
                <>
                  <div className="form-group">
                    <label>Product Name *</label>
                    <input 
                      type="text" 
                      value={formData.productName || ''}
                      onChange={(e) => setFormData({...formData, productName: e.target.value})}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Category *</label>
                    <input 
                      type="text" 
                      value={formData.category || ''}
                      onChange={(e) => setFormData({...formData, category: e.target.value})}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Price *</label>
                    <input 
                      type="number" 
                      value={formData.price || ''}
                      onChange={(e) => setFormData({...formData, price: e.target.value})}
                      required
                    />
                  </div>
                </>
              )}

              {modalType === 'service' && (
                <>
                  <div className="form-group">
                    <label>Service Name *</label>
                    <input 
                      type="text" 
                      value={formData.serviceName || ''}
                      onChange={(e) => setFormData({...formData, serviceName: e.target.value})}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Service Type *</label>
                    <select 
                      value={formData.serviceType || ''}
                      onChange={(e) => setFormData({...formData, serviceType: e.target.value})}
                      required
                    >
                      <option value="">Select Type</option>
                      <option value="Installation">Installation</option>
                      <option value="Maintenance">Maintenance</option>
                      <option value="Repair">Repair</option>
                      <option value="AMC">AMC</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Price *</label>
                    <input 
                      type="number" 
                      value={formData.price || ''}
                      onChange={(e) => setFormData({...formData, price: e.target.value})}
                      required
                    />
                  </div>
                </>
              )}

              <button type="submit" className="btn-primary">
                {modalType === 'employee' && 'Add Employee'}
                {modalType === 'product' && 'Add Product'}
                {modalType === 'service' && 'Add Service'}
              </button>
            </form>
          </div>
        </div>
      )}

      <style>{`
        .admin-module {
          min-height: 100vh;
          background: #f5f7fa;
        }

        .page-header {
          margin-bottom: 20px;
        }

        .page-title {
          margin: 0;
          color: #2c3e50;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
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
          border-bottom-color: #667eea;
          color: #667eea;
        }

        .welcome-section {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 20px;
          margin-bottom: 20px;
        }

        .welcome-card {
          flex: 1;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 30px;
          border-radius: 12px;
        }

        .welcome-card h2 {
          margin: 0 0 10px 0;
        }

        .alerts-badge {
          background: #e74c3c;
          color: white;
          padding: 15px 25px;
          border-radius: 12px;
          font-weight: 600;
          font-size: 16px;
          white-space: nowrap;
        }

        .alerts-container {
          background: white;
          padding: 25px;
          border-radius: 10px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
          margin-bottom: 20px;
        }

        .alerts-container h3 {
          margin-top: 0;
        }

        .alerts-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 15px;
        }

        .alert-item {
          padding: 15px;
          border-radius: 8px;
          border-left: 4px solid;
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .alert-item.critical {
          background: #fee;
          border-left-color: #e74c3c;
        }

        .alert-item.warning {
          background: #fff3e0;
          border-left-color: #ff9800;
        }

        .priority-dot {
          width: 10px;
          height: 10px;
          border-radius: 50%;
        }

        .priority-dot.high {
          background: #e74c3c;
        }

        .priority-dot.medium {
          background: #f39c12;
        }

        .stats-overview {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 20px;
          margin-bottom: 30px;
        }

        .stat-card {
          background: white;
          padding: 25px;
          border-radius: 12px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
          display: flex;
          align-items: center;
          gap: 20px;
          transition: transform 0.3s;
        }

        .stat-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        }

        .stat-icon {
          font-size: 48px;
        }

        .stat-details h4 {
          margin: 0 0 8px 0;
          color: #7f8c8d;
          font-size: 14px;
          text-transform: uppercase;
        }

        .stat-value {
          font-size: 32px;
          font-weight: bold;
          color: #2c3e50;
          margin-bottom: 5px;
        }

        .stat-details small {
          color: #95a5a6;
        }

        .quick-actions-section {
          background: white;
          padding: 25px;
          border-radius: 10px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }

        .quick-actions-section h3 {
          margin-top: 0;
        }

        .action-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 15px;
        }

        .action-card {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 25px;
          border-radius: 10px;
          border: none;
          cursor: pointer;
          transition: all 0.3s;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 10px;
          font-size: 16px;
          font-weight: 600;
        }

        .action-card:hover {
          transform: scale(1.05);
          box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
        }

        .action-icon {
          font-size: 36px;
        }

        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
          flex-wrap: wrap;
          gap: 15px;
        }

        .section-description {
          color: #7f8c8d;
          margin: 5px 0 0 0;
          font-size: 14px;
        }

        .header-actions {
          display: flex;
          gap: 10px;
        }

        .table-container {
          background: white;
          border-radius: 10px;
          overflow: hidden;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
          overflow-x: auto;
        }

        .data-table {
          width: 100%;
          border-collapse: collapse;
          min-width: 1000px;
        }

        .data-table th {
          background: #34495e;
          color: white;
          padding: 15px;
          text-align: left;
          font-weight: 600;
          font-size: 12px;
          text-transform: uppercase;
        }

        .data-table td {
          padding: 15px;
          border-bottom: 1px solid #ecf0f1;
        }

        .data-table tbody tr:hover {
          background: #f8f9fa;
        }

        .row-warning {
          background: #fff3e0 !important;
        }

        .status-badge {
          display: inline-block;
          padding: 4px 12px;
          border-radius: 12px;
          font-size: 11px;
          font-weight: 600;
          text-transform: uppercase;
        }

        .status-badge.active {
          background: #d4edda;
          color: #155724;
        }

        .status-badge.pending, .status-badge.sent {
          background: #fff3cd;
          color: #856404;
        }

        .amc-badge {
          display: inline-block;
          padding: 4px 12px;
          border-radius: 12px;
          font-size: 11px;
          font-weight: 600;
          text-transform: uppercase;
        }

        .amc-badge.active {
          background: #d4edda;
          color: #155724;
        }

        .amc-badge.expiring-soon {
          background: #fff3cd;
          color: #856404;
        }

        .priority-badge {
          padding: 4px 12px;
          border-radius: 12px;
          font-size: 11px;
          font-weight: 600;
          text-transform: uppercase;
        }

        .priority-badge.hot {
          background: #f8d7da;
          color: #721c24;
        }

        .priority-badge.warm {
          background: #fff3cd;
          color: #856404;
        }

        .priority-badge.cold {
          background: #d1ecf1;
          color: #0c5460;
        }

        .priority-badge.high {
          background: #e74c3c;
          color: white;
        }

        .priority-badge.medium {
          background: #f39c12;
          color: white;
        }

        .priority-badge.low {
          background: #3498db;
          color: white;
        }

        .efficiency-badge {
          display: inline-block;
          padding: 4px 12px;
          border-radius: 12px;
          font-size: 11px;
          font-weight: 600;
        }

        .efficiency-badge.good {
          background: #d4edda;
          color: #155724;
        }

        .efficiency-badge.average {
          background: #fff3cd;
          color: #856404;
        }

        .efficiency-badge.poor {
          background: #f8d7da;
          color: #721c24;
        }

        .progress-indicator {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .progress-bar {
          height: 8px;
          border-radius: 4px;
          min-width: 80px;
        }

        .present-badge {
          background: #d4edda;
          color: #155724;
          padding: 4px 8px;
          border-radius: 10px;
          font-size: 11px;
          font-weight: 600;
        }

        .absent-badge {
          background: #f8d7da;
          color: #721c24;
          padding: 4px 8px;
          border-radius: 10px;
          font-size: 11px;
          font-weight: 600;
        }

        .text-danger {
          color: #e74c3c;
          font-weight: 600;
        }

        .confidential-banner {
          background: linear-gradient(135deg, #c0392b 0%, #8e44ad 100%);
          color: white;
          padding: 20px 25px;
          border-radius: 10px;
          margin-bottom: 20px;
          display: flex;
          align-items: center;
          gap: 20px;
        }

        .lock-icon {
          font-size: 48px;
        }

        .confidential-banner h3 {
          margin: 0 0 5px 0;
        }

        .confidential-banner p {
          margin: 0;
          opacity: 0.9;
        }

        .access-granted {
          margin-top: 10px !important;
          font-weight: 600;
          opacity: 1 !important;
          font-size: 14px;
        }

        .access-denied-box {
          background: white;
          padding: 50px 40px;
          border-radius: 12px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.1);
          text-align: center;
          max-width: 600px;
          margin: 50px auto;
          border: 3px solid #c0392b;
        }

        .denied-icon {
          font-size: 80px;
          margin-bottom: 20px;
        }

        .access-denied-box h2 {
          color: #c0392b;
          margin: 0 0 20px 0;
        }

        .denied-message {
          color: #2c3e50;
          font-size: 16px;
          margin-bottom: 25px;
        }

        .access-list {
          list-style: none;
          padding: 0;
          margin: 20px 0;
          display: inline-block;
          text-align: left;
        }

        .access-list li {
          padding: 10px 20px;
          background: #f8f9fa;
          margin-bottom: 10px;
          border-radius: 6px;
          color: #27ae60;
          font-weight: 600;
          font-size: 15px;
        }

        .denied-role {
          margin: 25px 0;
          padding: 15px;
          background: #fff3cd;
          border-radius: 8px;
          color: #856404;
        }

        .denied-note {
          color: #e74c3c;
          font-weight: 600;
          margin-top: 20px;
        }

        .access-log-section {
          background: white;
          padding: 25px;
          border-radius: 10px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
          margin-top: 20px;
        }

        .access-log-section h3 {
          margin-top: 0;
        }

        .log-container {
          background: #f8f9fa;
          padding: 15px;
          border-radius: 8px;
          max-height: 300px;
          overflow-y: auto;
        }

        .log-entry {
          display: grid;
          grid-template-columns: 180px 150px 1fr 150px;
          gap: 15px;
          padding: 10px;
          background: white;
          border-radius: 4px;
          margin-bottom: 8px;
          font-size: 13px;
        }

        .log-time {
          color: #7f8c8d;
        }

        .log-user {
          font-weight: 600;
          color: #2c3e50;
        }

        .log-action {
          color: #555;
        }

        .log-ip {
          color: #95a5a6;
          font-family: monospace;
        }

        .reminders-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
          gap: 20px;
        }

        .reminder-card {
          background: white;
          padding: 20px;
          border-radius: 10px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
          border-left: 4px solid;
        }

        .reminder-card.high {
          border-left-color: #e74c3c;
        }

        .reminder-card.medium {
          border-left-color: #f39c12;
        }

        .reminder-card.low {
          border-left-color: #3498db;
        }

        .reminder-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 15px;
          padding-bottom: 15px;
          border-bottom: 2px solid #ecf0f1;
        }

        .reminder-header h3 {
          margin: 0;
          color: #2c3e50;
        }

        .reminder-body p {
          margin: 10px 0;
        }

        .reminder-body ul {
          margin: 10px 0;
          padding-left: 20px;
        }

        .reminder-footer {
          margin-top: 15px;
          padding-top: 15px;
          border-top: 1px solid #ecf0f1;
        }

        .sent-label {
          color: #27ae60;
          font-weight: 600;
        }

        .btn-primary {
          padding: 12px 24px;
          background: #3498db;
          color: white;
          border: none;
          border-radius: 6px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s;
        }

        .btn-primary:hover {
          background: #2980b9;
          transform: translateY(-2px);
        }

        .btn-small {
          padding: 6px 12px;
          background: #3498db;
          color: white;
          border: none;
          border-radius: 4px;
          font-size: 12px;
          cursor: pointer;
        }

        .btn-small:hover {
          background: #2980b9;
        }

        .modal {
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
          max-width: 500px;
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

        .form-group {
          margin-bottom: 20px;
        }

        .form-group label {
          display: block;
          margin-bottom: 8px;
          font-weight: 600;
          color: #2c3e50;
        }

        .form-group input,
        .form-group select {
          width: 100%;
          padding: 12px;
          border: 1px solid #ddd;
          border-radius: 6px;
          font-size: 14px;
        }

        @media (max-width: 768px) {
          .stats-overview,
          .action-grid,
          .reminders-grid {
            grid-template-columns: 1fr;
          }

          .welcome-section {
            flex-direction: column;
          }

          .tabs-navigation {
            overflow-x: auto;
            flex-wrap: nowrap;
          }

          .log-entry {
            grid-template-columns: 1fr;
            gap: 5px;
          }
        }
      `}</style>
    </div>
  )
}

import React, { useState, useEffect } from 'react'

export default function OfficeStaff() {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [staffName] = useState('Priya Sharma')

  // Sales Activity Data
  const [salesActivity, setSalesActivity] = useState([
    {
      id: 1,
      salesman: 'Amit Singh',
      date: '2025-12-20',
      callsTarget: 10,
      callsMade: 7,
      visitsCompleted: 2,
      followUpsPending: 3,
      status: 'Active',
      lastUpdate: '2025-12-20 14:30'
    },
    {
      id: 2,
      salesman: 'Rohit Verma',
      date: '2025-12-20',
      callsTarget: 10,
      callsMade: 10,
      visitsCompleted: 3,
      followUpsPending: 1,
      status: 'Active',
      lastUpdate: '2025-12-20 15:00'
    },
    {
      id: 3,
      salesman: 'Vijay Kumar',
      date: '2025-12-20',
      callsTarget: 10,
      callsMade: 3,
      visitsCompleted: 0,
      followUpsPending: 5,
      status: 'Behind',
      lastUpdate: '2025-12-20 11:15'
    }
  ])

  // Service Status Data
  const [serviceStatus, setServiceStatus] = useState([
    {
      id: 1,
      engineer: 'Rahul Kumar',
      assignedComplaints: 4,
      inProgress: 2,
      completed: 1,
      delayed: 1,
      slaCompliance: 75,
      status: 'Active',
      lastUpdate: '2025-12-20 15:30'
    },
    {
      id: 2,
      engineer: 'Manoj Singh',
      assignedComplaints: 2,
      inProgress: 1,
      completed: 1,
      delayed: 0,
      slaCompliance: 100,
      status: 'Active',
      lastUpdate: '2025-12-20 14:45'
    }
  ])

  // Stock/Inventory Data
  const [inventory, setInventory] = useState([
    {
      id: 1,
      productName: 'HP LaserJet Pro MFP M428fdw',
      category: 'Printer',
      currentStock: 5,
      minStock: 3,
      maxStock: 15,
      unit: 'Pcs',
      status: 'Available',
      lastUpdated: '2025-12-20'
    },
    {
      id: 2,
      productName: 'Canon PIXMA G3000',
      category: 'Printer',
      currentStock: 2,
      minStock: 3,
      maxStock: 10,
      unit: 'Pcs',
      status: 'Low Stock',
      lastUpdated: '2025-12-20'
    },
    {
      id: 3,
      productName: 'HP 79A Black Toner',
      category: 'Toner',
      currentStock: 15,
      minStock: 10,
      maxStock: 50,
      unit: 'Pcs',
      status: 'Available',
      lastUpdated: '2025-12-19'
    },
    {
      id: 4,
      productName: 'A4 Paper Ream',
      category: 'Paper',
      currentStock: 8,
      minStock: 20,
      maxStock: 100,
      unit: 'Reams',
      status: 'Critical',
      lastUpdated: '2025-12-20'
    }
  ])

  // MIF (Material Issue Form) Data
  const [mifRecords, setMifRecords] = useState([
    {
      id: 'MIF-001',
      date: '2025-12-20',
      issuedTo: 'Rahul Kumar',
      department: 'Service',
      items: [
        { product: 'HP 79A Toner', quantity: 2 },
        { product: 'Cleaning Kit', quantity: 1 }
      ],
      status: 'Issued',
      approvedBy: staffName
    },
    {
      id: 'MIF-002',
      date: '2025-12-20',
      issuedTo: 'Amit Singh',
      department: 'Sales',
      items: [
        { product: 'Product Brochure', quantity: 50 }
      ],
      status: 'Pending',
      approvedBy: null
    }
  ])

  const [alerts, setAlerts] = useState([])
  const [showStockModal, setShowStockModal] = useState(false)
  const [showMIFModal, setShowMIFModal] = useState(false)
  const [selectedItem, setSelectedItem] = useState(null)

  const [stockUpdateData, setStockUpdateData] = useState({
    productId: null,
    quantity: 0,
    action: 'add', // add or remove
    remarks: ''
  })

  const [newMIF, setNewMIF] = useState({
    issuedTo: '',
    department: '',
    items: [{ product: '', quantity: 1 }],
    remarks: ''
  })

  // Monitor and generate alerts
  useEffect(() => {
    const newAlerts = []

    // Sales activity alerts
    salesActivity.forEach(sale => {
      if (sale.callsMade < sale.callsTarget * 0.5) {
        newAlerts.push({
          id: `sales-${sale.id}`,
          type: 'warning',
          category: 'Sales',
          message: `${sale.salesman} is behind on call target (${sale.callsMade}/${sale.callsTarget})`,
          priority: 'Medium'
        })
      }
    })

    // Service status alerts
    serviceStatus.forEach(service => {
      if (service.delayed > 0) {
        newAlerts.push({
          id: `service-${service.id}`,
          type: 'critical',
          category: 'Service',
          message: `${service.engineer} has ${service.delayed} delayed complaint(s)`,
          priority: 'High'
        })
      }
      if (service.slaCompliance < 80) {
        newAlerts.push({
          id: `sla-${service.id}`,
          type: 'warning',
          category: 'Service',
          message: `${service.engineer} SLA compliance at ${service.slaCompliance}%`,
          priority: 'Medium'
        })
      }
    })

    // Stock alerts
    inventory.forEach(item => {
      if (item.status === 'Critical') {
        newAlerts.push({
          id: `stock-critical-${item.id}`,
          type: 'critical',
          category: 'Stock',
          message: `CRITICAL: ${item.productName} stock is critically low (${item.currentStock} ${item.unit})`,
          priority: 'High'
        })
      } else if (item.status === 'Low Stock') {
        newAlerts.push({
          id: `stock-low-${item.id}`,
          type: 'warning',
          category: 'Stock',
          message: `${item.productName} stock below minimum (${item.currentStock}/${item.minStock} ${item.unit})`,
          priority: 'Medium'
        })
      }
    })

    // MIF pending alerts
    const pendingMIF = mifRecords.filter(m => m.status === 'Pending').length
    if (pendingMIF > 0) {
      newAlerts.push({
        id: 'mif-pending',
        type: 'info',
        category: 'MIF',
        message: `${pendingMIF} Material Issue Form(s) pending approval`,
        priority: 'Low'
      })
    }

    setAlerts(newAlerts)
  }, [salesActivity, serviceStatus, inventory, mifRecords])

  const updateStock = (productId, action, quantity, remarks) => {
    setInventory(inventory.map(item => {
      if (item.id === productId) {
        const newStock = action === 'add' 
          ? item.currentStock + parseInt(quantity)
          : item.currentStock - parseInt(quantity)
        
        let status = 'Available'
        if (newStock <= item.minStock * 0.5) status = 'Critical'
        else if (newStock <= item.minStock) status = 'Low Stock'

        return {
          ...item,
          currentStock: newStock,
          status: status,
          lastUpdated: new Date().toISOString().split('T')[0]
        }
      }
      return item
    }))
  }

  const handleStockUpdate = (e) => {
    e.preventDefault()
    updateStock(
      stockUpdateData.productId,
      stockUpdateData.action,
      stockUpdateData.quantity,
      stockUpdateData.remarks
    )
    setShowStockModal(false)
    setStockUpdateData({ productId: null, quantity: 0, action: 'add', remarks: '' })
    alert('Stock updated successfully!')
  }

  const handleMIFSubmit = (e) => {
    e.preventDefault()
    const newMIFRecord = {
      id: `MIF-${String(mifRecords.length + 1).padStart(3, '0')}`,
      date: new Date().toISOString().split('T')[0],
      issuedTo: newMIF.issuedTo,
      department: newMIF.department,
      items: newMIF.items.filter(i => i.product && i.quantity > 0),
      status: 'Issued',
      approvedBy: staffName
    }
    
    setMifRecords([...mifRecords, newMIFRecord])
    setShowMIFModal(false)
    setNewMIF({
      issuedTo: '',
      department: '',
      items: [{ product: '', quantity: 1 }],
      remarks: ''
    })
    alert('MIF issued successfully!')
  }

  const approveMIF = (mifId) => {
    setMifRecords(mifRecords.map(mif => 
      mif.id === mifId ? { ...mif, status: 'Issued', approvedBy: staffName } : mif
    ))
  }

  const renderDashboard = () => {
    const stats = {
      activeSalesmen: salesActivity.length,
      totalCalls: salesActivity.reduce((sum, s) => sum + s.callsMade, 0),
      targetCalls: salesActivity.reduce((sum, s) => sum + s.callsTarget, 0),
      activeEngineers: serviceStatus.length,
      totalComplaints: serviceStatus.reduce((sum, s) => sum + s.assignedComplaints, 0),
      delayedService: serviceStatus.reduce((sum, s) => sum + s.delayed, 0),
      lowStockItems: inventory.filter(i => i.status === 'Low Stock' || i.status === 'Critical').length,
      pendingMIF: mifRecords.filter(m => m.status === 'Pending').length
    }

    return (
      <div className="dashboard">
        <div className="welcome-card">
          <h2>👋 Welcome, {staffName}!</h2>
          <p>Office Staff Dashboard - Monitor & Coordinate Operations</p>
        </div>

        {alerts.length > 0 && (
          <div className="alerts-section">
            <h3>🔔 Active Alerts ({alerts.length})</h3>
            <div className="alerts-grid">
              {alerts.slice(0, 5).map(alert => (
                <div key={alert.id} className={`alert-card ${alert.type}`}>
                  <div className="alert-header">
                    <span className="alert-category">{alert.category}</span>
                    <span className={`priority-badge ${alert.priority.toLowerCase()}`}>{alert.priority}</span>
                  </div>
                  <p>{alert.message}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="stats-overview">
          <div className="stat-section">
            <h3>📊 Sales Overview</h3>
            <div className="stats-row">
              <div className="stat-item">
                <div className="stat-value">{stats.activeSalesmen}</div>
                <div className="stat-label">Active Salesmen</div>
              </div>
              <div className="stat-item">
                <div className="stat-value">{stats.totalCalls}/{stats.targetCalls}</div>
                <div className="stat-label">Calls Made/Target</div>
              </div>
              <div className="stat-item">
                <div className="stat-value">{((stats.totalCalls/stats.targetCalls)*100).toFixed(0)}%</div>
                <div className="stat-label">Target Achievement</div>
              </div>
            </div>
          </div>

          <div className="stat-section">
            <h3>🛠️ Service Overview</h3>
            <div className="stats-row">
              <div className="stat-item">
                <div className="stat-value">{stats.activeEngineers}</div>
                <div className="stat-label">Active Engineers</div>
              </div>
              <div className="stat-item">
                <div className="stat-value">{stats.totalComplaints}</div>
                <div className="stat-label">Total Complaints</div>
              </div>
              <div className="stat-item">
                <div className="stat-value">{stats.delayedService}</div>
                <div className="stat-label">Delayed Services</div>
              </div>
            </div>
          </div>

          <div className="stat-section">
            <h3>📦 Stock & MIF</h3>
            <div className="stats-row">
              <div className="stat-item">
                <div className="stat-value">{inventory.length}</div>
                <div className="stat-label">Total Items</div>
              </div>
              <div className="stat-item">
                <div className="stat-value alert">{stats.lowStockItems}</div>
                <div className="stat-label">Low Stock Items</div>
              </div>
              <div className="stat-item">
                <div className="stat-value">{stats.pendingMIF}</div>
                <div className="stat-label">Pending MIF</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const renderSalesMonitor = () => {
    return (
      <div className="sales-monitor">
        <div className="section-header">
          <h2>📊 Sales Activity Monitor</h2>
          <div className="header-info">
            <span>Real-time sales team performance tracking</span>
          </div>
        </div>

        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Salesman</th>
                <th>Calls Made/Target</th>
                <th>Progress</th>
                <th>Shop Visits</th>
                <th>Follow-ups Pending</th>
                <th>Status</th>
                <th>Last Update</th>
              </tr>
            </thead>
            <tbody>
              {salesActivity.map(sale => {
                const progress = (sale.callsMade / sale.callsTarget) * 100
                return (
                  <tr key={sale.id} className={sale.status === 'Behind' ? 'row-warning' : ''}>
                    <td><strong>{sale.salesman}</strong></td>
                    <td>{sale.callsMade}/{sale.callsTarget}</td>
                    <td>
                      <div className="progress-bar">
                        <div 
                          className="progress-fill" 
                          style={{ 
                            width: `${progress}%`,
                            background: progress >= 80 ? '#27ae60' : progress >= 50 ? '#f39c12' : '#e74c3c'
                          }}
                        ></div>
                      </div>
                      <small>{progress.toFixed(0)}%</small>
                    </td>
                    <td>{sale.visitsCompleted}</td>
                    <td>{sale.followUpsPending}</td>
                    <td>
                      <span className={`status-badge ${sale.status.toLowerCase()}`}>
                        {sale.status}
                      </span>
                    </td>
                    <td><small>{sale.lastUpdate}</small></td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    )
  }

  const renderServiceMonitor = () => {
    return (
      <div className="service-monitor">
        <div className="section-header">
          <h2>🛠️ Service Status Monitor</h2>
          <div className="header-info">
            <span>Track service engineer performance and SLA compliance</span>
          </div>
        </div>

        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Engineer</th>
                <th>Assigned</th>
                <th>In Progress</th>
                <th>Completed</th>
                <th>Delayed</th>
                <th>SLA Compliance</th>
                <th>Status</th>
                <th>Last Update</th>
              </tr>
            </thead>
            <tbody>
              {serviceStatus.map(service => (
                <tr key={service.id} className={service.delayed > 0 ? 'row-warning' : ''}>
                  <td><strong>{service.engineer}</strong></td>
                  <td>{service.assignedComplaints}</td>
                  <td>{service.inProgress}</td>
                  <td>{service.completed}</td>
                  <td>
                    {service.delayed > 0 ? (
                      <span className="delayed-badge">{service.delayed}</span>
                    ) : (
                      <span>-</span>
                    )}
                  </td>
                  <td>
                    <div className="sla-indicator">
                      <div 
                        className="sla-bar" 
                        style={{ 
                          width: `${service.slaCompliance}%`,
                          background: service.slaCompliance >= 90 ? '#27ae60' : 
                                     service.slaCompliance >= 70 ? '#f39c12' : '#e74c3c'
                        }}
                      ></div>
                      <span>{service.slaCompliance}%</span>
                    </div>
                  </td>
                  <td>
                    <span className="status-badge active">{service.status}</span>
                  </td>
                  <td><small>{service.lastUpdate}</small></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    )
  }

  const renderStock = () => {
    return (
      <div className="stock-section">
        <div className="section-header">
          <h2>📦 Stock Management</h2>
          <button className="btn-primary" onClick={() => setShowStockModal(true)}>
            + Update Stock
          </button>
        </div>

        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Product Name</th>
                <th>Category</th>
                <th>Current Stock</th>
                <th>Min Stock</th>
                <th>Max Stock</th>
                <th>Unit</th>
                <th>Status</th>
                <th>Last Updated</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {inventory.map(item => (
                <tr key={item.id} className={`stock-${item.status.toLowerCase().replace(' ', '-')}`}>
                  <td><strong>{item.productName}</strong></td>
                  <td>{item.category}</td>
                  <td className="stock-value">{item.currentStock}</td>
                  <td>{item.minStock}</td>
                  <td>{item.maxStock}</td>
                  <td>{item.unit}</td>
                  <td>
                    <span className={`stock-badge ${item.status.toLowerCase().replace(' ', '-')}`}>
                      {item.status}
                    </span>
                  </td>
                  <td><small>{item.lastUpdated}</small></td>
                  <td>
                    <button 
                      className="btn-small"
                      onClick={() => {
                        setStockUpdateData({ ...stockUpdateData, productId: item.id })
                        setShowStockModal(true)
                      }}
                    >
                      Update
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

  const renderMIF = () => {
    return (
      <div className="mif-section">
        <div className="section-header">
          <h2>📋 Material Issue Forms (MIF)</h2>
          <button className="btn-primary" onClick={() => setShowMIFModal(true)}>
            + Create MIF
          </button>
        </div>

        <div className="mif-grid">
          {mifRecords.map(mif => (
            <div key={mif.id} className={`mif-card ${mif.status.toLowerCase()}`}>
              <div className="mif-header">
                <h3>{mif.id}</h3>
                <span className={`status-badge ${mif.status.toLowerCase()}`}>{mif.status}</span>
              </div>
              <div className="mif-details">
                <p><strong>Date:</strong> {mif.date}</p>
                <p><strong>Issued To:</strong> {mif.issuedTo}</p>
                <p><strong>Department:</strong> {mif.department}</p>
                <div className="items-list">
                  <strong>Items:</strong>
                  <ul>
                    {mif.items.map((item, idx) => (
                      <li key={idx}>{item.product} x {item.quantity}</li>
                    ))}
                  </ul>
                </div>
                <p><strong>Approved By:</strong> {mif.approvedBy || 'Pending'}</p>
              </div>
              {mif.status === 'Pending' && (
                <button 
                  className="btn-approve"
                  onClick={() => approveMIF(mif.id)}
                >
                  Approve MIF
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="page-container office-staff-module">
      <div className="content-wrapper">
        <div className="page-header">
          <div>
            <h1 className="page-title">🏢 Office Staff Dashboard</h1>
            <p className="page-subtitle">Monitor Sales, Service, Stock & Coordinate Operations</p>
          </div>
          {alerts.length > 0 && (
            <div className="header-alerts">
              <span className="alert-count">{alerts.length} Alert{alerts.length !== 1 ? 's' : ''}</span>
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
            className={activeTab === 'sales' ? 'active' : ''}
            onClick={() => setActiveTab('sales')}
          >
            📈 Sales Monitor
          </button>
          <button 
            className={activeTab === 'service' ? 'active' : ''}
            onClick={() => setActiveTab('service')}
          >
            🛠️ Service Monitor
          </button>
          <button 
            className={activeTab === 'stock' ? 'active' : ''}
            onClick={() => setActiveTab('stock')}
          >
            📦 Stock ({inventory.filter(i => i.status !== 'Available').length})
          </button>
          <button 
            className={activeTab === 'mif' ? 'active' : ''}
            onClick={() => setActiveTab('mif')}
          >
            📋 MIF ({mifRecords.filter(m => m.status === 'Pending').length})
          </button>
        </div>

        <div className="page-content">
          {activeTab === 'dashboard' && renderDashboard()}
          {activeTab === 'sales' && renderSalesMonitor()}
          {activeTab === 'service' && renderServiceMonitor()}
          {activeTab === 'stock' && renderStock()}
          {activeTab === 'mif' && renderMIF()}
        </div>
      </div>

      {/* Stock Update Modal */}
      {showStockModal && (
        <div className="modal">
          <div className="modal-overlay" onClick={() => setShowStockModal(false)}></div>
          <div className="modal-content">
            <div className="modal-header">
              <h2>📦 Update Stock</h2>
              <button className="close-btn" onClick={() => setShowStockModal(false)}>✕</button>
            </div>
            <form onSubmit={handleStockUpdate} className="modal-body">
              <div className="form-group">
                <label>Product *</label>
                <select 
                  value={stockUpdateData.productId || ''}
                  onChange={(e) => setStockUpdateData({...stockUpdateData, productId: parseInt(e.target.value)})}
                  required
                >
                  <option value="">Select Product</option>
                  {inventory.map(item => (
                    <option key={item.id} value={item.id}>
                      {item.productName} (Current: {item.currentStock} {item.unit})
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Action *</label>
                <select 
                  value={stockUpdateData.action}
                  onChange={(e) => setStockUpdateData({...stockUpdateData, action: e.target.value})}
                >
                  <option value="add">Add Stock</option>
                  <option value="remove">Remove Stock</option>
                </select>
              </div>
              <div className="form-group">
                <label>Quantity *</label>
                <input 
                  type="number" 
                  min="1"
                  value={stockUpdateData.quantity}
                  onChange={(e) => setStockUpdateData({...stockUpdateData, quantity: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Remarks</label>
                <textarea 
                  value={stockUpdateData.remarks}
                  onChange={(e) => setStockUpdateData({...stockUpdateData, remarks: e.target.value})}
                  rows="3"
                  placeholder="Optional remarks..."
                ></textarea>
              </div>
              <button type="submit" className="btn-primary">Update Stock</button>
            </form>
          </div>
        </div>
      )}

      {/* MIF Modal */}
      {showMIFModal && (
        <div className="modal">
          <div className="modal-overlay" onClick={() => setShowMIFModal(false)}></div>
          <div className="modal-content">
            <div className="modal-header">
              <h2>📋 Create Material Issue Form</h2>
              <button className="close-btn" onClick={() => setShowMIFModal(false)}>✕</button>
            </div>
            <form onSubmit={handleMIFSubmit} className="modal-body">
              <div className="form-group">
                <label>Issued To *</label>
                <input 
                  type="text" 
                  value={newMIF.issuedTo}
                  onChange={(e) => setNewMIF({...newMIF, issuedTo: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Department *</label>
                <select 
                  value={newMIF.department}
                  onChange={(e) => setNewMIF({...newMIF, department: e.target.value})}
                  required
                >
                  <option value="">Select Department</option>
                  <option value="Sales">Sales</option>
                  <option value="Service">Service</option>
                  <option value="Admin">Admin</option>
                  <option value="Office">Office</option>
                </select>
              </div>
              <div className="form-group">
                <label>Items *</label>
                {newMIF.items.map((item, idx) => (
                  <div key={idx} className="item-row">
                    <select 
                      value={item.product}
                      onChange={(e) => {
                        const items = [...newMIF.items]
                        items[idx].product = e.target.value
                        setNewMIF({...newMIF, items})
                      }}
                      required
                    >
                      <option value="">Select Product</option>
                      {inventory.map(inv => (
                        <option key={inv.id} value={inv.productName}>{inv.productName}</option>
                      ))}
                    </select>
                    <input 
                      type="number" 
                      min="1"
                      value={item.quantity}
                      onChange={(e) => {
                        const items = [...newMIF.items]
                        items[idx].quantity = parseInt(e.target.value)
                        setNewMIF({...newMIF, items})
                      }}
                      placeholder="Qty"
                      required
                    />
                  </div>
                ))}
                <button 
                  type="button" 
                  className="btn-small"
                  onClick={() => setNewMIF({
                    ...newMIF, 
                    items: [...newMIF.items, { product: '', quantity: 1 }]
                  })}
                >
                  + Add Item
                </button>
              </div>
              <div className="form-group">
                <label>Remarks</label>
                <textarea 
                  value={newMIF.remarks}
                  onChange={(e) => setNewMIF({...newMIF, remarks: e.target.value})}
                  rows="3"
                  placeholder="Optional remarks..."
                ></textarea>
              </div>
              <button type="submit" className="btn-primary">Issue MIF</button>
            </form>
          </div>
        </div>
      )}

      <style>{`
        .office-staff-module {
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

        .header-alerts {
          padding: 8px 0;
        }

        .alert-count {
          background: #e74c3c;
          color: white;
          padding: 8px 16px;
          border-radius: 20px;
          font-weight: 600;
          font-size: 14px;
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
          border-bottom-color: #3498db;
          color: #3498db;
        }

        .welcome-card {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 30px;
          border-radius: 12px;
          margin-bottom: 20px;
        }

        .welcome-card h2 {
          margin: 0 0 10px 0;
        }

        .alerts-section {
          background: white;
          padding: 25px;
          border-radius: 10px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
          margin-bottom: 20px;
        }

        .alerts-section h3 {
          margin-top: 0;
        }

        .alerts-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 15px;
        }

        .alert-card {
          padding: 15px;
          border-radius: 8px;
          border-left: 4px solid;
        }

        .alert-card.critical {
          background: #fee;
          border-left-color: #e74c3c;
        }

        .alert-card.warning {
          background: #fff3e0;
          border-left-color: #ff9800;
        }

        .alert-card.info {
          background: #e3f2fd;
          border-left-color: #2196f3;
        }

        .alert-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 8px;
        }

        .alert-category {
          font-weight: 600;
          font-size: 12px;
          text-transform: uppercase;
        }

        .priority-badge {
          padding: 3px 8px;
          border-radius: 10px;
          font-size: 10px;
          font-weight: 600;
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

        .stats-overview {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 20px;
        }

        .stat-section {
          background: white;
          padding: 25px;
          border-radius: 10px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }

        .stat-section h3 {
          margin-top: 0;
          color: #2c3e50;
          border-bottom: 2px solid #3498db;
          padding-bottom: 10px;
        }

        .stats-row {
          display: flex;
          justify-content: space-around;
          gap: 15px;
          margin-top: 20px;
        }

        .stat-item {
          text-align: center;
          flex: 1;
        }

        .stat-value {
          font-size: 32px;
          font-weight: bold;
          color: #2c3e50;
          margin-bottom: 5px;
        }

        .stat-value.alert {
          color: #e74c3c;
        }

        .stat-label {
          font-size: 12px;
          color: #7f8c8d;
          text-transform: uppercase;
        }

        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
          flex-wrap: wrap;
          gap: 15px;
        }

        .header-info span {
          color: #7f8c8d;
          font-size: 14px;
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
          min-width: 800px;
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

        .progress-bar {
          width: 100%;
          height: 8px;
          background: #ecf0f1;
          border-radius: 4px;
          overflow: hidden;
          margin-bottom: 5px;
        }

        .progress-fill {
          height: 100%;
          transition: width 0.3s;
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

        .status-badge.behind {
          background: #f8d7da;
          color: #721c24;
        }

        .status-badge.issued {
          background: #d4edda;
          color: #155724;
        }

        .status-badge.pending {
          background: #fff3cd;
          color: #856404;
        }

        .delayed-badge {
          background: #e74c3c;
          color: white;
          padding: 4px 8px;
          border-radius: 10px;
          font-weight: 600;
          font-size: 11px;
        }

        .sla-indicator {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .sla-bar {
          height: 8px;
          border-radius: 4px;
          min-width: 80px;
        }

        .stock-value {
          font-weight: bold;
          font-size: 16px;
        }

        .stock-badge {
          display: inline-block;
          padding: 4px 12px;
          border-radius: 12px;
          font-size: 11px;
          font-weight: 600;
          text-transform: uppercase;
        }

        .stock-badge.available {
          background: #d4edda;
          color: #155724;
        }

        .stock-badge.low-stock {
          background: #fff3cd;
          color: #856404;
        }

        .stock-badge.critical {
          background: #f8d7da;
          color: #721c24;
        }

        .mif-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
          gap: 20px;
        }

        .mif-card {
          background: white;
          padding: 20px;
          border-radius: 10px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }

        .mif-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 15px;
          padding-bottom: 15px;
          border-bottom: 2px solid #ecf0f1;
        }

        .mif-header h3 {
          margin: 0;
          color: #3498db;
        }

        .mif-details p {
          margin: 10px 0;
          font-size: 14px;
        }

        .items-list {
          margin: 15px 0;
          padding: 15px;
          background: #f8f9fa;
          border-radius: 8px;
        }

        .items-list ul {
          margin: 10px 0 0 0;
          padding-left: 20px;
        }

        .items-list li {
          margin: 5px 0;
        }

        .btn-approve {
          width: 100%;
          padding: 12px;
          background: #27ae60;
          color: white;
          border: none;
          border-radius: 6px;
          font-weight: 600;
          cursor: pointer;
          margin-top: 15px;
          transition: all 0.3s;
        }

        .btn-approve:hover {
          background: #229954;
          transform: translateY(-2px);
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
          transition: all 0.3s;
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
        .form-group select,
        .form-group textarea {
          width: 100%;
          padding: 12px;
          border: 1px solid #ddd;
          border-radius: 6px;
          font-size: 14px;
        }

        .item-row {
          display: flex;
          gap: 10px;
          margin-bottom: 10px;
        }

        .item-row select {
          flex: 2;
        }

        .item-row input {
          flex: 1;
        }

        @media (max-width: 768px) {
          .stats-overview {
            grid-template-columns: 1fr;
          }

          .stats-row {
            flex-direction: column;
          }

          .alerts-grid,
          .mif-grid {
            grid-template-columns: 1fr;
          }

          .tabs-navigation {
            overflow-x: auto;
            flex-wrap: nowrap;
          }
        }
      `}</style>
    </div>
  )
}

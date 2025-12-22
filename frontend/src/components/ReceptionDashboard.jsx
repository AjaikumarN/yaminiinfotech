import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiRequest } from '../utils/api';

const ReceptionDashboard = () => {
  const [enquiries, setEnquiries] = useState({ HOT: [], WARM: [], COLD: [] });
  const [salesmen, setSalesmen] = useState([]);
  const [loading, setLoading] = useState(true);
  const [draggedItem, setDraggedItem] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    try {
      const [enquiriesData, usersData] = await Promise.all([
        apiRequest('/api/enquiries'),
        apiRequest('/api/users')
      ]);

      // Group enquiries by priority
      const grouped = {
        HOT: [],
        WARM: [],
        COLD: []
      };

      (enquiriesData || []).forEach(enq => {
        const priority = enq.priority || 'WARM';
        if (grouped[priority]) {
          grouped[priority].push(enq);
        }
      });

      setEnquiries(grouped);
      setSalesmen((usersData || []).filter(u => u.role === 'salesman'));
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDragStart = (e, enquiry, currentPriority) => {
    setDraggedItem({ enquiry, currentPriority });
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = async (e, newPriority) => {
    e.preventDefault();
    
    if (!draggedItem) return;
    
    const { enquiry, currentPriority } = draggedItem;
    
    if (currentPriority === newPriority) {
      setDraggedItem(null);
      return;
    }

    try {
      await apiRequest(`/api/enquiries/${enquiry.id}`, {
        method: 'PUT',
        body: JSON.stringify({
          ...enquiry,
          priority: newPriority
        })
      });

      // Update local state
      setEnquiries(prev => ({
        ...prev,
        [currentPriority]: prev[currentPriority].filter(e => e.id !== enquiry.id),
        [newPriority]: [...prev[newPriority], { ...enquiry, priority: newPriority }]
      }));

    } catch (error) {
      console.error('Failed to update priority:', error);
      alert('Failed to update priority');
    }

    setDraggedItem(null);
  };

  const assignToSalesman = async (enquiryId, salesmanId) => {
    try {
      const enquiry = Object.values(enquiries).flat().find(e => e.id === enquiryId);
      
      await apiRequest(`/api/enquiries/${enquiryId}`, {
        method: 'PUT',
        body: JSON.stringify({
          ...enquiry,
          assigned_to: salesmanId,
          status: 'Assigned'
        })
      });

      fetchData(); // Refresh data
      alert('Enquiry assigned successfully!');
    } catch (error) {
      console.error('Failed to assign enquiry:', error);
      alert('Failed to assign enquiry');
    }
  };

  const getSourceIcon = (source) => {
    const icons = {
      website: '🌐',
      call: '📞',
      'walk-in': '🚶'
    };
    return icons[source] || '📋';
  };

  const getTimeDifference = (date) => {
    const diff = Date.now() - new Date(date).getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);
    
    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    return 'Just now';
  };

  const EnquiryCard = ({ enquiry, priority }) => (
    <div
      className="enquiry-card"
      draggable
      onDragStart={(e) => handleDragStart(e, enquiry, priority)}
      onClick={() => navigate(`/reception/enquiry/${enquiry.id}`)}
    >
      <div className="card-header">
        <span className="source-badge">
          {getSourceIcon(enquiry.source)} {enquiry.source || 'website'}
        </span>
        <span className="time-badge">{getTimeDifference(enquiry.created_at)}</span>
      </div>

      <h4>{enquiry.customer_name}</h4>
      <p className="phone">📱 {enquiry.phone}</p>
      
      {enquiry.product && (
        <div className="product-tag">
          🖨️ {enquiry.product.name}
        </div>
      )}

      <p className="details">{enquiry.enquiry_details?.substring(0, 80)}...</p>

      <div className="card-footer">
        <select
          className="assign-select"
          value={enquiry.assigned_to || ''}
          onChange={(e) => {
            e.stopPropagation();
            assignToSalesman(enquiry.id, e.target.value);
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <option value="">Assign to...</option>
          {salesmen.map(s => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
      </div>
    </div>
  );

  if (loading) {
    return <div className="loading">⏳ Loading enquiries...</div>;
  }

  return (
    <div className="reception-dashboard">
      <div className="dashboard-header">
        <div>
          <h1>📋 Enquiry Board</h1>
          <p>Drag and drop to change priority</p>
        </div>
        <div className="header-actions">
          <button className="btn-refresh" onClick={fetchData}>
            🔄 Refresh
          </button>
        </div>
      </div>

      <div className="kanban-board">
        {/* HOT Column */}
        <div
          className="kanban-column hot"
          onDragOver={handleDragOver}
          onDrop={(e) => handleDrop(e, 'HOT')}
        >
          <div className="column-header">
            <h2>🔥 HOT</h2>
            <span className="count">{enquiries.HOT.length}</span>
          </div>
          <div className="cards-container">
            {enquiries.HOT.map(enq => (
              <EnquiryCard key={enq.id} enquiry={enq} priority="HOT" />
            ))}
            {enquiries.HOT.length === 0 && (
              <div className="empty-state">No HOT enquiries</div>
            )}
          </div>
        </div>

        {/* WARM Column */}
        <div
          className="kanban-column warm"
          onDragOver={handleDragOver}
          onDrop={(e) => handleDrop(e, 'WARM')}
        >
          <div className="column-header">
            <h2>🌤️ WARM</h2>
            <span className="count">{enquiries.WARM.length}</span>
          </div>
          <div className="cards-container">
            {enquiries.WARM.map(enq => (
              <EnquiryCard key={enq.id} enquiry={enq} priority="WARM" />
            ))}
            {enquiries.WARM.length === 0 && (
              <div className="empty-state">No WARM enquiries</div>
            )}
          </div>
        </div>

        {/* COLD Column */}
        <div
          className="kanban-column cold"
          onDragOver={handleDragOver}
          onDrop={(e) => handleDrop(e, 'COLD')}
        >
          <div className="column-header">
            <h2>❄️ COLD</h2>
            <span className="count">{enquiries.COLD.length}</span>
          </div>
          <div className="cards-container">
            {enquiries.COLD.map(enq => (
              <EnquiryCard key={enq.id} enquiry={enq} priority="COLD" />
            ))}
            {enquiries.COLD.length === 0 && (
              <div className="empty-state">No COLD enquiries</div>
            )}
          </div>
        </div>
      </div>

      <style jsx>{`
        .reception-dashboard {
          padding: 20px;
          background: #f5f7fa;
          min-height: 100vh;
        }

        .dashboard-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 30px;
          background: white;
          padding: 25px;
          border-radius: 12px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }

        .dashboard-header h1 {
          margin: 0 0 5px 0;
          color: #1a1a1a;
        }

        .dashboard-header p {
          margin: 0;
          color: #666;
          font-size: 14px;
        }

        .btn-refresh {
          padding: 12px 24px;
          background: #667eea;
          color: white;
          border: none;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s;
        }

        .btn-refresh:hover {
          background: #5568d3;
          transform: translateY(-2px);
        }

        .kanban-board {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 20px;
        }

        .kanban-column {
          background: #fff;
          border-radius: 12px;
          padding: 20px;
          min-height: 600px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }

        .kanban-column.hot {
          border-top: 4px solid #dc3545;
        }

        .kanban-column.warm {
          border-top: 4px solid #ffc107;
        }

        .kanban-column.cold {
          border-top: 4px solid #17a2b8;
        }

        .column-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
          padding-bottom: 15px;
          border-bottom: 2px solid #f0f0f0;
        }

        .column-header h2 {
          margin: 0;
          font-size: 22px;
          color: #1a1a1a;
        }

        .count {
          background: #f0f0f0;
          padding: 4px 12px;
          border-radius: 12px;
          font-weight: 700;
          color: #666;
        }

        .cards-container {
          display: flex;
          flex-direction: column;
          gap: 15px;
        }

        .enquiry-card {
          background: #f8f9fa;
          padding: 15px;
          border-radius: 8px;
          cursor: move;
          transition: all 0.3s;
          border: 2px solid transparent;
        }

        .enquiry-card:hover {
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
          border-color: #667eea;
          transform: translateY(-2px);
        }

        .card-header {
          display: flex;
          justify-content: space-between;
          margin-bottom: 10px;
        }

        .source-badge,
        .time-badge {
          font-size: 11px;
          padding: 4px 8px;
          border-radius: 4px;
          font-weight: 600;
        }

        .source-badge {
          background: #667eea;
          color: white;
        }

        .time-badge {
          background: #e0e0e0;
          color: #666;
        }

        .enquiry-card h4 {
          margin: 0 0 5px 0;
          color: #1a1a1a;
          font-size: 16px;
        }

        .phone {
          margin: 0 0 10px 0;
          color: #666;
          font-size: 13px;
        }

        .product-tag {
          background: #e8f5e9;
          color: #2e7d32;
          padding: 6px 10px;
          border-radius: 6px;
          font-size: 12px;
          margin-bottom: 10px;
          font-weight: 600;
        }

        .details {
          color: #666;
          font-size: 13px;
          line-height: 1.5;
          margin: 0 0 12px 0;
        }

        .card-footer {
          border-top: 1px solid #e0e0e0;
          padding-top: 12px;
        }

        .assign-select {
          width: 100%;
          padding: 8px;
          border: 2px solid #ddd;
          border-radius: 6px;
          font-size: 13px;
          cursor: pointer;
          background: white;
        }

        .assign-select:focus {
          outline: none;
          border-color: #667eea;
        }

        .empty-state {
          text-align: center;
          padding: 40px 20px;
          color: #999;
          font-style: italic;
        }

        .loading {
          text-align: center;
          padding: 100px 20px;
          font-size: 24px;
          color: #666;
        }

        @media (max-width: 1200px) {
          .kanban-board {
            grid-template-columns: 1fr;
          }

          .kanban-column {
            min-height: auto;
          }
        }
      `}</style>
    </div>
  );
};

export default ReceptionDashboard;

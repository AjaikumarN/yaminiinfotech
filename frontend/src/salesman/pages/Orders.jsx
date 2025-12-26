import React, { useState, useEffect } from 'react';
import { getMyOrders } from '../hooks/useSalesmanApi';
import EmptyState from '../components/EmptyState';
import ExportButtons from '../components/ExportButtons';
import { showToast } from '../components/ToastNotification';
import '../styles/salesman.css';

/**
 * Orders Page - Enhanced with filters and export
 */
export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadOrders();
  }, []);

  useEffect(() => {
    filterOrders();
  }, [orders, statusFilter, searchQuery]);

  const loadOrders = async () => {
    try {
      const data = await getMyOrders();
      setOrders(data);
    } catch (error) {
      console.error('Failed to load orders:', error);
      showToast && showToast('Failed to load orders', 'error');
    } finally {
      setLoading(false);
    }
  };

  const filterOrders = () => {
    let filtered = [...orders];

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(o => o.status === statusFilter);
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(o =>
        o.id?.toString().includes(query) ||
        o.customer_name?.toLowerCase().includes(query) ||
        o.phone?.includes(query) ||
        o.email?.toLowerCase().includes(query)
      );
    }

    setFilteredOrders(filtered);
  };

  // Calculate total revenue from filtered orders
  const totalRevenue = filteredOrders.reduce((sum, order) => 
    sum + (order.total_amount || 0), 0
  );

  if (loading) {
    return <div className="page-header"><h2 className="page-title">Loading...</h2></div>;
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h2 className="page-title">Orders</h2>
          <p className="page-description">
            {filteredOrders.length} orders • ₹{totalRevenue.toLocaleString()} revenue
          </p>
        </div>
        <ExportButtons 
          data={filteredOrders} 
          filename="orders" 
          type="orders" 
        />
      </div>

      {/* Filters */}
      <div className="filters-section">
        <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
          <input
            type="text"
            className="form-control"
            placeholder="🔍 Search by order ID, customer name, phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="form-group" style={{ marginBottom: 0 }}>
          <select
            className="form-control"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="processing">Processing</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {filteredOrders.length === 0 ? (
        <EmptyState 
          icon="🧾" 
          message={searchQuery || statusFilter !== 'all'
            ? "No orders match your filters" 
            : "No orders yet. Keep pushing to close those sales!"
          } 
        />
      ) : (
        <div style={{ 
          background: '#FFFFFF', 
          borderRadius: '12px', 
          overflow: 'hidden',
          border: '1px solid #E5E7EB'
        }}>
          {filteredOrders.map((order, index) => {
            const OrderRow = () => {
              const [expanded, setExpanded] = React.useState(false);
              
              return (
                <div 
                  style={{
                    borderBottom: index < filteredOrders.length - 1 ? '1px solid #F3F4F6' : 'none'
                  }}
                >
                {/* Main Row */}
                <div 
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '0.8fr 2fr 1.5fr 1fr 1fr 1.2fr 0.5fr',
                    gap: '16px',
                    padding: '16px 20px',
                    alignItems: 'center',
                    cursor: 'pointer',
                    transition: 'background-color 0.15s'
                  }}
                  onClick={() => setExpanded(!expanded)}
                  onMouseEnter={(e) => e.currentTarget.style.background = '#F9FAFB'}
                  onMouseLeave={(e) => e.currentTarget.style.background = '#FFFFFF'}
                >
                  {/* Order ID */}
                  <div style={{ 
                    fontSize: '13px', 
                    fontWeight: 600, 
                    color: '#2563EB'
                  }}>
                    #{order.id}
                  </div>

                  {/* Customer Name + Contact */}
                  <div>
                    <div style={{ 
                      fontSize: '14px', 
                      fontWeight: 600, 
                      color: '#111827',
                      marginBottom: '4px'
                    }}>
                      {order.customer_name}
                    </div>
                    <div style={{ 
                      fontSize: '12px', 
                      color: '#6B7280'
                    }}>
                      📱 {order.phone}
                    </div>
                  </div>

                  {/* Amount */}
                  <div style={{ 
                    fontSize: '15px', 
                    fontWeight: 600,
                    color: '#059669'
                  }}>
                    ₹{order.total_amount?.toLocaleString() || '0'}
                  </div>

                  {/* Status Badge */}
                  <div>
                    <span style={{
                      display: 'inline-block',
                      padding: '4px 12px',
                      borderRadius: '12px',
                      fontSize: '12px',
                      fontWeight: 500,
                      background: 
                        order.status === 'pending' ? '#FEF3C7' :
                        order.status === 'confirmed' ? '#DBEAFE' :
                        order.status === 'processing' ? '#E0E7FF' :
                        order.status === 'delivered' ? '#D1FAE5' :
                        order.status === 'cancelled' ? '#FEE2E2' :
                        '#F3F4F6',
                      color: 
                        order.status === 'pending' ? '#92400E' :
                        order.status === 'confirmed' ? '#1E40AF' :
                        order.status === 'processing' ? '#3730A3' :
                        order.status === 'delivered' ? '#065F46' :
                        order.status === 'cancelled' ? '#991B1B' :
                        '#374151'
                    }}>
                      {order.status === 'pending' ? '⏳ Pending' :
                       order.status === 'confirmed' ? '✅ Confirmed' :
                       order.status === 'processing' ? '📦 Processing' :
                       order.status === 'delivered' ? '🎉 Delivered' :
                       order.status === 'cancelled' ? '❌ Cancelled' :
                       order.status}
                    </span>
                  </div>

                  {/* Status Flow Progress */}
                  <div style={{ fontSize: '11px', color: '#6B7280' }}>
                    {order.status === 'pending' && '● ○ ○ ○'}
                    {order.status === 'confirmed' && '● ● ○ ○'}
                    {order.status === 'processing' && '● ● ● ○'}
                    {order.status === 'delivered' && '● ● ● ●'}
                    {order.status === 'cancelled' && '✕'}
                  </div>

                  {/* Date */}
                  <div style={{ fontSize: '12px', color: '#9CA3AF' }}>
                    {new Date(order.created_at).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric'
                    })}
                  </div>

                  {/* Expand Arrow */}
                  <div style={{ 
                    textAlign: 'center',
                    fontSize: '18px',
                    color: '#9CA3AF',
                    transition: 'transform 0.2s',
                    transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)'
                  }}>
                    ▼
                  </div>
                </div>

                {/* Expanded Details */}
                {expanded && (
                  <div style={{
                    padding: '0 20px 16px 20px',
                    background: '#F9FAFB',
                    borderTop: '1px solid #F3F4F6'
                  }}>
                    <div style={{ 
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr 1fr',
                      gap: '16px',
                      marginTop: '16px'
                    }}>
                      {/* Customer Details */}
                      <div style={{ 
                        padding: '12px',
                        background: '#FFFFFF',
                        borderRadius: '8px',
                        border: '1px solid #E5E7EB'
                      }}>
                        <div style={{ 
                          fontSize: '12px',
                          fontWeight: 600,
                          color: '#6B7280',
                          marginBottom: '8px',
                          textTransform: 'uppercase',
                          letterSpacing: '0.5px'
                        }}>
                          Customer Info
                        </div>
                        <div style={{ fontSize: '13px', color: '#374151', marginBottom: '4px' }}>
                          {order.customer_name}
                        </div>
                        <div style={{ fontSize: '12px', color: '#6B7280', marginBottom: '2px' }}>
                          📱 {order.phone}
                        </div>
                        {order.email && (
                          <div style={{ fontSize: '12px', color: '#6B7280' }}>
                            📧 {order.email}
                          </div>
                        )}
                      </div>

                      {/* Order Details */}
                      <div style={{ 
                        padding: '12px',
                        background: '#FFFFFF',
                        borderRadius: '8px',
                        border: '1px solid #E5E7EB'
                      }}>
                        <div style={{ 
                          fontSize: '12px',
                          fontWeight: 600,
                          color: '#6B7280',
                          marginBottom: '8px',
                          textTransform: 'uppercase',
                          letterSpacing: '0.5px'
                        }}>
                          Order Details
                        </div>
                        <div style={{ fontSize: '13px', color: '#374151', marginBottom: '4px' }}>
                          Order ID: #{order.id}
                        </div>
                        <div style={{ fontSize: '12px', color: '#6B7280', marginBottom: '2px' }}>
                          Date: {new Date(order.created_at).toLocaleDateString()}
                        </div>
                        <div style={{ fontSize: '13px', color: '#059669', fontWeight: 600 }}>
                          Total: ₹{order.total_amount?.toLocaleString() || '0'}
                        </div>
                      </div>

                      {/* Quick Actions */}
                      <div style={{ 
                        padding: '12px',
                        background: '#FFFFFF',
                        borderRadius: '8px',
                        border: '1px solid #E5E7EB'
                      }}>
                        <div style={{ 
                          fontSize: '12px',
                          fontWeight: 600,
                          color: '#6B7280',
                          marginBottom: '8px',
                          textTransform: 'uppercase',
                          letterSpacing: '0.5px'
                        }}>
                          Quick Actions
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                          <a 
                            href={`tel:${order.phone}`}
                            style={{
                              padding: '6px 12px',
                              borderRadius: '6px',
                              background: '#DBEAFE',
                              color: '#1E40AF',
                              fontSize: '12px',
                              fontWeight: 500,
                              textDecoration: 'none',
                              textAlign: 'center',
                              transition: 'all 0.15s'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.background = '#2563EB'}
                            onMouseLeave={(e) => e.currentTarget.style.background = '#DBEAFE'}
                          >
                            📞 Call Customer
                          </a>
                          <button 
                            style={{
                              padding: '6px 12px',
                              borderRadius: '6px',
                              background: '#F3F4F6',
                              color: '#374151',
                              fontSize: '12px',
                              fontWeight: 500,
                              border: 'none',
                              cursor: 'pointer',
                              transition: 'all 0.15s'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.background = '#E5E7EB'}
                            onMouseLeave={(e) => e.currentTarget.style.background = '#F3F4F6'}
                            onClick={(e) => {
                              e.stopPropagation();
                              alert('Feature coming soon: Track order');
                            }}
                          >
                            📦 Track Order
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              );
            };
            
            return <OrderRow key={order.id} />;
          })}
        </div>
      )}
    </div>
  );
}

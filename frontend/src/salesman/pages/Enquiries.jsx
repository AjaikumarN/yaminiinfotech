import React, { useState, useEffect } from 'react';
import { getMyEnquiries, updateEnquiry } from '../hooks/useSalesmanApi';
import EmptyState from '../components/EmptyState';
import ExportButtons from '../components/ExportButtons';
import { showToast } from '../components/ToastNotification';
import '../styles/salesman.css';

/**
 * Enquiries Page - View and manage leads (Enhanced with export and search)
 */
export default function Enquiries() {
  const [enquiries, setEnquiries] = useState([]);
  const [filteredEnquiries, setFilteredEnquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadEnquiries();
  }, [filter]);

  useEffect(() => {
    filterEnquiries();
  }, [enquiries, searchQuery]);

  const loadEnquiries = async () => {
    try {
      const filters = filter === 'all' ? {} : { status: filter };
      const data = await getMyEnquiries(filters);
      setEnquiries(data);
    } catch (error) {
      console.error('Failed to load enquiries:', error);
      showToast && showToast('Failed to load enquiries', 'error');
    } finally {
      setLoading(false);
    }
  };

  const filterEnquiries = () => {
    if (!searchQuery) {
      setFilteredEnquiries(enquiries);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = enquiries.filter(e =>
      e.customer_name?.toLowerCase().includes(query) ||
      e.email?.toLowerCase().includes(query) ||
      e.phone?.includes(query) ||
      e.product_interest?.toLowerCase().includes(query) ||
      e.notes?.toLowerCase().includes(query)
    );
    setFilteredEnquiries(filtered);
  };

  const handleStatusUpdate = async (id, newStatus) => {
    try {
      await updateEnquiry(id, { status: newStatus });
      showToast && showToast('✅ Status updated successfully!', 'success');
      await loadEnquiries();
    } catch (error) {
      console.error('Failed to update enquiry:', error);
      showToast && showToast('Failed to update status', 'error');
    }
  };

  if (loading) {
    return <div className="page-header"><h2 className="page-title">Loading...</h2></div>;
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h2 className="page-title">Enquiries & Leads</h2>
          <p className="page-description">
            {filteredEnquiries.length} of {enquiries.length} enquiries
          </p>
        </div>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <ExportButtons 
            data={filteredEnquiries} 
            filename="enquiries" 
            type="enquiries" 
          />
          <select
            className="form-control"
            style={{ width: 'auto', minWidth: '150px' }}
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="all">All</option>
            <option value="new">New</option>
            <option value="contacted">Contacted</option>
            <option value="qualified">Qualified</option>
            <option value="converted">Converted</option>
            <option value="lost">Lost</option>
          </select>
        </div>
      </div>

      {/* Search Bar */}
      <div className="filters-section">
        <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
          <input
            type="text"
            className="form-control"
            placeholder="🔍 Search by name, email, phone, product interest..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {filteredEnquiries.length === 0 ? (
        <EmptyState 
          icon="📋" 
          message={searchQuery 
            ? "No enquiries match your search" 
            : "No enquiries found. Try changing the filter."
          } 
        />
      ) : (
        <div style={{ 
          background: '#FFFFFF', 
          borderRadius: '12px', 
          overflow: 'hidden',
          border: '1px solid #E5E7EB'
        }}>
          {/* Table Header */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '2fr 1.5fr 2fr 1fr 1fr 1.5fr',
            gap: '16px',
            padding: '16px 20px',
            background: '#F9FAFB',
            borderBottom: '1px solid #E5E7EB',
            fontSize: '12px',
            fontWeight: 600,
            color: '#6B7280',
            textTransform: 'uppercase',
            letterSpacing: '0.5px'
          }}>
            <div>Customer</div>
            <div>Phone</div>
            <div>Product Interest</div>
            <div>Status</div>
            <div>Assigned Date</div>
            <div>Actions</div>
          </div>

          {/* Table Rows */}
          {filteredEnquiries.map((enquiry, index) => (
            <div 
              key={enquiry.id} 
              style={{
                display: 'grid',
                gridTemplateColumns: '2fr 1.5fr 2fr 1fr 1fr 1.5fr',
                gap: '16px',
                padding: '16px 20px',
                borderBottom: index < filteredEnquiries.length - 1 ? '1px solid #F3F4F6' : 'none',
                alignItems: 'center',
                transition: 'background-color 0.15s',
                cursor: 'pointer',
                ':hover': { background: '#F9FAFB' }
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = '#F9FAFB'}
              onMouseLeave={(e) => e.currentTarget.style.background = '#FFFFFF'}
            >
              {/* Customer Name + Email */}
              <div>
                <div style={{ 
                  fontSize: '14px', 
                  fontWeight: 600, 
                  color: '#111827',
                  marginBottom: '4px'
                }}>
                  {enquiry.customer_name}
                </div>
                <div style={{ 
                  fontSize: '12px', 
                  color: '#6B7280',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}>
                  {enquiry.email}
                </div>
              </div>

              {/* Phone */}
              <div style={{ fontSize: '14px', color: '#374151' }}>
                📱 {enquiry.phone}
              </div>

              {/* Product Interest */}
              <div style={{ 
                fontSize: '14px', 
                color: '#374151',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
              }}>
                {enquiry.product_interest || '—'}
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
                    enquiry.status === 'new' ? '#FEF3C7' :
                    enquiry.status === 'contacted' ? '#DBEAFE' :
                    enquiry.status === 'qualified' ? '#E0E7FF' :
                    enquiry.status === 'converted' ? '#D1FAE5' :
                    '#FEE2E2',
                  color: 
                    enquiry.status === 'new' ? '#92400E' :
                    enquiry.status === 'contacted' ? '#1E40AF' :
                    enquiry.status === 'qualified' ? '#3730A3' :
                    enquiry.status === 'converted' ? '#065F46' :
                    '#991B1B'
                }}>
                  {enquiry.status === 'new' ? '🆕 New' :
                   enquiry.status === 'contacted' ? '📞 Contacted' :
                   enquiry.status === 'qualified' ? '✅ Qualified' :
                   enquiry.status === 'converted' ? '🎉 Converted' :
                   '❌ Lost'}
                </span>
              </div>

              {/* Assigned Date */}
              <div style={{ fontSize: '13px', color: '#6B7280' }}>
                {new Date(enquiry.created_at).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric'
                })}
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                {/* Call Button */}
                <a 
                  href={`tel:${enquiry.phone}`}
                  onClick={(e) => e.stopPropagation()}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '32px',
                    height: '32px',
                    borderRadius: '8px',
                    background: '#DBEAFE',
                    color: '#1E40AF',
                    fontSize: '14px',
                    textDecoration: 'none',
                    transition: 'all 0.15s'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#2563EB';
                    e.currentTarget.style.color = '#FFFFFF';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = '#DBEAFE';
                    e.currentTarget.style.color = '#1E40AF';
                  }}
                  title="Call customer"
                >
                  📞
                </a>

                {/* Add Follow-up Button */}
                <a 
                  href={`#/salesman/follow-ups?enquiry_id=${enquiry.id}`}
                  onClick={(e) => e.stopPropagation()}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '32px',
                    height: '32px',
                    borderRadius: '8px',
                    background: '#FEF3C7',
                    color: '#92400E',
                    fontSize: '14px',
                    textDecoration: 'none',
                    transition: 'all 0.15s'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#F59E0B';
                    e.currentTarget.style.color = '#FFFFFF';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = '#FEF3C7';
                    e.currentTarget.style.color = '#92400E';
                  }}
                  title="Add follow-up"
                >
                  ⏰
                </a>

                {/* Create Order Button */}
                <a 
                  href={`#/salesman/orders?enquiry_id=${enquiry.id}`}
                  onClick={(e) => e.stopPropagation()}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '32px',
                    height: '32px',
                    borderRadius: '8px',
                    background: '#D1FAE5',
                    color: '#065F46',
                    fontSize: '14px',
                    textDecoration: 'none',
                    transition: 'all 0.15s'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#10B981';
                    e.currentTarget.style.color = '#FFFFFF';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = '#D1FAE5';
                    e.currentTarget.style.color = '#065F46';
                  }}
                  title="Create order"
                >
                  🛒
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

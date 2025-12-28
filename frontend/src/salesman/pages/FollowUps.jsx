import React, { useState, useEffect } from 'react';
import { getMyCalls } from '../hooks/useSalesmanApi';
import EmptyState from '../components/EmptyState';
import '../styles/salesman.css';

/**
 * FollowUps Page - View calls that need follow-up
 * Filters calls where outcome is "callback"
 */
export default function FollowUps() {
  const [followUps, setFollowUps] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFollowUps();
  }, []);

  const loadFollowUps = async () => {
    try {
      const allCalls = await getMyCalls(false);
      // Filter for calls that need follow-up and sort by date
      const pending = allCalls
        .filter(call => call.outcome === 'callback' || call.outcome === 'interested')
        .map(call => {
          const callDate = new Date(call.created_at);
          const today = new Date();
          const daysSince = Math.floor((today - callDate) / (1000 * 60 * 60 * 24));
          
          // Determine priority and status
          let priority = 'medium';
          let status = 'pending';
          
          if (daysSince > 3) {
            priority = 'high';
            status = 'overdue';
          } else if (daysSince > 1) {
            priority = 'medium';
          } else {
            priority = 'low';
          }
          
          return { ...call, priority, status, daysSince };
        })
        .sort((a, b) => {
          // Sort: overdue first, then by days since contact
          if (a.status === 'overdue' && b.status !== 'overdue') return -1;
          if (a.status !== 'overdue' && b.status === 'overdue') return 1;
          return b.daysSince - a.daysSince;
        });
        
      setFollowUps(pending);
    } catch (error) {
      console.error('Failed to load follow-ups:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="page-header"><h2 className="page-title">Loading...</h2></div>;
  }

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 className="page-title">Follow-Ups</h2>
          <p className="page-description">Customers who need a follow-up call</p>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => window.location.href = '/salesman/visits'}
          style={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            border: 'none',
            padding: '12px 24px',
            borderRadius: '10px',
            fontWeight: '600',
            cursor: 'pointer',
            fontSize: '15px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)',
            transition: 'all 0.3s'
          }}
          onMouseEnter={(e) => {
            e.target.style.transform = 'translateY(-2px)';
            e.target.style.boxShadow = '0 6px 16px rgba(102, 126, 234, 0.4)';
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = 'translateY(0)';
            e.target.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.3)';
          }}
        >
          ➕ Create Follow-Up
        </button>
      </div>

      {followUps.length === 0 ? (
        <EmptyState 
          icon="🔁" 
          message="No pending follow-ups. Great job staying on top of your calls!" 
        />
      ) : (
        <div style={{ 
          background: '#FFFFFF', 
          borderRadius: '12px', 
          overflow: 'hidden',
          border: '1px solid #E5E7EB'
        }}>
          {followUps.map((call, index) => (
            <div 
              key={call.id} 
              style={{
                display: 'grid',
                gridTemplateColumns: '2fr 1.5fr 2.5fr 1fr 1.5fr',
                gap: '16px',
                padding: '16px 20px',
                borderBottom: index < followUps.length - 1 ? '1px solid #F3F4F6' : 'none',
                alignItems: 'center',
                transition: 'background-color 0.15s',
                background: call.status === 'overdue' ? '#FEF2F2' : '#FFFFFF'
              }}
              onMouseEnter={(e) => {
                if (call.status !== 'overdue') {
                  e.currentTarget.style.background = '#F9FAFB';
                }
              }}
              onMouseLeave={(e) => {
                if (call.status !== 'overdue') {
                  e.currentTarget.style.background = '#FFFFFF';
                }
              }}
            >
              {/* Customer Name + Priority */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <div style={{ 
                    fontSize: '14px', 
                    fontWeight: 600, 
                    color: '#111827'
                  }}>
                    {call.customer_name}
                  </div>
                  {/* Priority Badge */}
                  <span style={{
                    display: 'inline-block',
                    padding: '2px 8px',
                    borderRadius: '8px',
                    fontSize: '10px',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    background: 
                      call.priority === 'high' ? '#FEE2E2' :
                      call.priority === 'medium' ? '#FEF3C7' :
                      '#DBEAFE',
                    color: 
                      call.priority === 'high' ? '#991B1B' :
                      call.priority === 'medium' ? '#92400E' :
                      '#1E40AF'
                  }}>
                    {call.priority === 'high' ? '🔴 High' :
                     call.priority === 'medium' ? '🟡 Med' :
                     '🟢 Low'}
                  </span>
                </div>
                <div style={{ 
                  fontSize: '12px', 
                  color: '#6B7280'
                }}>
                  📱 {call.phone}
                </div>
              </div>

              {/* Last Contact */}
              <div>
                <div style={{ fontSize: '12px', color: '#6B7280', marginBottom: '2px' }}>
                  Last contact:
                </div>
                <div style={{ fontSize: '13px', color: '#374151', fontWeight: 500 }}>
                  {call.daysSince === 0 ? 'Today' :
                   call.daysSince === 1 ? 'Yesterday' :
                   `${call.daysSince} days ago`}
                </div>
              </div>

              {/* Notes */}
              <div style={{ 
                fontSize: '13px', 
                color: '#6B7280',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
              }}>
                {call.notes || '—'}
              </div>

              {/* Status Badge */}
              <div>
                <span style={{
                  display: 'inline-block',
                  padding: '4px 12px',
                  borderRadius: '12px',
                  fontSize: '12px',
                  fontWeight: 500,
                  background: call.status === 'overdue' ? '#FEE2E2' : '#FEF3C7',
                  color: call.status === 'overdue' ? '#991B1B' : '#92400E'
                }}>
                  {call.status === 'overdue' ? '⚠️ Overdue' : '⏰ Pending'}
                </span>
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                {/* Call Button */}
                <a 
                  href={`tel:${call.phone}`}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '6px 12px',
                    borderRadius: '8px',
                    background: '#2563EB',
                    color: '#FFFFFF',
                    fontSize: '13px',
                    fontWeight: 500,
                    textDecoration: 'none',
                    transition: 'all 0.15s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = '#1E40AF'}
                  onMouseLeave={(e) => e.currentTarget.style.background = '#2563EB'}
                >
                  📞 Call
                </a>
                
                {/* Complete Button */}
                <button 
                  onClick={() => {
                    if (confirm(`Mark follow-up with ${call.customer_name} as completed?`)) {
                      // TODO: Implement mark as completed
                      alert('Feature coming soon: Mark as completed');
                    }
                  }}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '6px 12px',
                    borderRadius: '8px',
                    background: '#F3F4F6',
                    color: '#374151',
                    fontSize: '13px',
                    fontWeight: 500,
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'all 0.15s'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#10B981';
                    e.currentTarget.style.color = '#FFFFFF';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = '#F3F4F6';
                    e.currentTarget.style.color = '#374151';
                  }}
                >
                  ✓ Done
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

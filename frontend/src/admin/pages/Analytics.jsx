import React, { useState, useEffect } from 'react';
import { apiRequest } from '../../utils/api';

export default function Analytics() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      const data = await apiRequest('/api/analytics/dashboard');
      setStats(data);
    } catch (error) {
      console.error('Failed to load analytics:', error);
      // Fallback data structure
      setStats({
        sales: { total_enquiries: 0, converted: 0, pending: 0 },
        service: { total_requests: 0, completed: 0, pending: 0, sla_breached: 0 },
        attendance: { total_staff: 0, present_today: 0, late_today: 0 }
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div style={{ padding: '24px' }}>⏳ Loading analytics...</div>;
  }

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: '700', color: '#1F2937', marginBottom: '8px' }}>
          Analytics Dashboard
        </h1>
        <p style={{ color: '#6B7280', marginBottom: '20px' }}>
          Business intelligence and performance insights
        </p>
      </div>

      {/* Sales Analytics */}
      <div style={{ marginBottom: '32px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: '600', color: '#1F2937', marginBottom: '16px' }}>
          📋 Sales Performance
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
          <div style={{ background: 'white', padding: '24px', borderRadius: '12px', border: '1px solid #E5E7EB' }}>
            <div style={{ fontSize: '14px', color: '#6B7280', marginBottom: '8px' }}>Total Enquiries</div>
            <div style={{ fontSize: '36px', fontWeight: '700', color: '#1F2937' }}>
              {stats?.sales?.total_enquiries || 0}
            </div>
          </div>
          <div style={{ background: 'white', padding: '24px', borderRadius: '12px', border: '1px solid #E5E7EB' }}>
            <div style={{ fontSize: '14px', color: '#6B7280', marginBottom: '8px' }}>Converted</div>
            <div style={{ fontSize: '36px', fontWeight: '700', color: '#10B981' }}>
              {stats?.sales?.converted || 0}
            </div>
            <div style={{ fontSize: '13px', color: '#6B7280', marginTop: '4px' }}>
              {stats?.sales?.total_enquiries > 0 
                ? `${Math.round((stats?.sales?.converted / stats?.sales?.total_enquiries) * 100)}% conversion rate`
                : '0% conversion rate'}
            </div>
          </div>
          <div style={{ background: 'white', padding: '24px', borderRadius: '12px', border: '1px solid #E5E7EB' }}>
            <div style={{ fontSize: '14px', color: '#6B7280', marginBottom: '8px' }}>Pending</div>
            <div style={{ fontSize: '36px', fontWeight: '700', color: '#F59E0B' }}>
              {stats?.sales?.pending || 0}
            </div>
          </div>
        </div>
      </div>

      {/* Service Analytics */}
      <div style={{ marginBottom: '32px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: '600', color: '#1F2937', marginBottom: '16px' }}>
          🔧 Service Performance
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
          <div style={{ background: 'white', padding: '24px', borderRadius: '12px', border: '1px solid #E5E7EB' }}>
            <div style={{ fontSize: '14px', color: '#6B7280', marginBottom: '8px' }}>Total Requests</div>
            <div style={{ fontSize: '36px', fontWeight: '700', color: '#1F2937' }}>
              {stats?.service?.total_requests || 0}
            </div>
          </div>
          <div style={{ background: 'white', padding: '24px', borderRadius: '12px', border: '1px solid #E5E7EB' }}>
            <div style={{ fontSize: '14px', color: '#6B7280', marginBottom: '8px' }}>Completed</div>
            <div style={{ fontSize: '36px', fontWeight: '700', color: '#10B981' }}>
              {stats?.service?.completed || 0}
            </div>
          </div>
          <div style={{ background: 'white', padding: '24px', borderRadius: '12px', border: '1px solid #E5E7EB' }}>
            <div style={{ fontSize: '14px', color: '#6B7280', marginBottom: '8px' }}>Pending</div>
            <div style={{ fontSize: '36px', fontWeight: '700', color: '#F59E0B' }}>
              {stats?.service?.pending || 0}
            </div>
          </div>
          <div style={{ background: 'white', padding: '24px', borderRadius: '12px', border: '1px solid #E5E7EB' }}>
            <div style={{ fontSize: '14px', color: '#6B7280', marginBottom: '8px' }}>SLA Breached</div>
            <div style={{ fontSize: '36px', fontWeight: '700', color: '#EF4444' }}>
              {stats?.service?.sla_breached || 0}
            </div>
          </div>
        </div>
      </div>

      {/* Attendance Analytics */}
      <div style={{ marginBottom: '32px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: '600', color: '#1F2937', marginBottom: '16px' }}>
          🕐 Attendance Overview
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
          <div style={{ background: 'white', padding: '24px', borderRadius: '12px', border: '1px solid #E5E7EB' }}>
            <div style={{ fontSize: '14px', color: '#6B7280', marginBottom: '8px' }}>Total Staff</div>
            <div style={{ fontSize: '36px', fontWeight: '700', color: '#1F2937' }}>
              {stats?.attendance?.total_staff || 0}
            </div>
          </div>
          <div style={{ background: 'white', padding: '24px', borderRadius: '12px', border: '1px solid #E5E7EB' }}>
            <div style={{ fontSize: '14px', color: '#6B7280', marginBottom: '8px' }}>Present Today</div>
            <div style={{ fontSize: '36px', fontWeight: '700', color: '#10B981' }}>
              {stats?.attendance?.present_today || 0}
            </div>
          </div>
          <div style={{ background: 'white', padding: '24px', borderRadius: '12px', border: '1px solid #E5E7EB' }}>
            <div style={{ fontSize: '14px', color: '#6B7280', marginBottom: '8px' }}>Late Today</div>
            <div style={{ fontSize: '36px', fontWeight: '700', color: '#F59E0B' }}>
              {stats?.attendance?.late_today || 0}
            </div>
          </div>
        </div>
      </div>

      {/* Performance Note */}
      <div style={{ 
        background: '#EFF6FF', 
        border: '1px solid #BFDBFE',
        borderRadius: '12px',
        padding: '16px',
        marginTop: '24px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '24px' }}>📊</span>
          <div>
            <div style={{ fontWeight: '600', color: '#1E40AF', marginBottom: '4px' }}>
              Real-Time Analytics
            </div>
            <div style={{ fontSize: '14px', color: '#3B82F6' }}>
              All data is pulled from live system - Updated every page load
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

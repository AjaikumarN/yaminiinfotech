import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiRequest } from '../../utils/api';
import KPICard from '../components/KPICard';
import AlertCard from '../components/AlertCard';
import StatusPill from '../components/StatusPill';
import { colors, spacing } from '../styles/tokens';

/**
 * Admin Dashboard - Enterprise Mission Control
 * Matches the exact ASCII layout specification
 */
export default function AdminDashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [kpis, setKpis] = useState({
    totalSalesToday: 0,
    pendingEnquiries: 0,
    ordersAwaitingApproval: 0,
    slaBreaches: 0,
    lateAttendance: 0,
    activeServiceRequests: 0
  });
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch KPIs using existing endpoints
      const [enquiries, orders] = await Promise.all([
        apiRequest('/api/enquiries/').catch(() => []),
        apiRequest('/api/orders/').catch(() => [])
      ]);

      // Calculate KPIs
      const today = new Date().toDateString();
      const pendingOrders = orders.filter(o => o.status === 'PENDING' || o.status === 'Pending');
      
      const calculatedKpis = {
        totalSalesToday: orders.filter(o => 
          new Date(o.created_at).toDateString() === today
        ).length,
        pendingEnquiries: enquiries.filter(e => 
          e.status === 'NEW' || e.status === 'PENDING'
        ).length,
        ordersAwaitingApproval: pendingOrders.length,
        slaBreaches: 0, // Will be calculated when service endpoint is available
        lateAttendance: 0, // Will be calculated when attendance endpoint is available
        activeServiceRequests: 0 // Will be calculated when service endpoint is available
      };

      setKpis(calculatedKpis);

      // Generate alerts based on KPIs
      const newAlerts = [];
      
      if (calculatedKpis.ordersAwaitingApproval > 0) {
        newAlerts.push({
          type: 'warning',
          icon: '⏳',
          title: 'Orders Pending Approval',
          message: `${calculatedKpis.ordersAwaitingApproval} orders are waiting for your approval`,
          action: 'Review Orders',
          onClick: () => navigate('/admin/orders')
        });
      }

      if (calculatedKpis.slaBreaches > 0) {
        newAlerts.push({
          type: 'danger',
          icon: '🚨',
          title: 'SLA Breaches Detected',
          message: `${calculatedKpis.slaBreaches} service requests have breached SLA`,
          action: 'View Details',
          onClick: () => navigate('/admin/service/sla')
        });
      }

      setAlerts(newAlerts);
    } catch (error) {
      console.error('Failed to load dashboard:', error);
      setKpis({
        totalSalesToday: 0,
        pendingEnquiries: 0,
        ordersAwaitingApproval: 0,
        slaBreaches: 0,
        lateAttendance: 0,
        activeServiceRequests: 0
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        height: '60vh' 
      }}>
        <div style={{ 
          fontSize: '18px', 
          color: colors.textSecondary,
          fontWeight: '500'
        }}>
          Loading dashboard...
        </div>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      {/* Header - Mission Control Tagline */}
      <div style={{ 
        marginBottom: spacing.xl,
        display: 'flex',
        alignItems: 'center',
        gap: '12px'
      }}>
        <div style={{
          width: '48px',
          height: '48px',
          background: 'linear-gradient(135deg, #FCD34D, #F59E0B)',
          borderRadius: '12px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '24px',
          boxShadow: '0 4px 6px rgba(245, 158, 11, 0.3)'
        }}>
          🎯
        </div>
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-gray-900" style={{ lineHeight: '1.2', marginBottom: '4px' }}>
            Mission Control
          </h2>
          <p className="text-sm text-gray-500 font-medium">
            Driving Business Through Technology
          </p>
        </div>
      </div>

      {/* KPI Strip - Responsive Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
        <KPICard
          icon="💰"
          label="Sales Today"
          value={kpis.totalSalesToday}
          status="success"
          onClick={() => navigate('/admin/orders')}
          loading={loading}
        />
        <KPICard
          icon="📝"
          label="Pending Enquiries"
          value={kpis.pendingEnquiries}
          status="warning"
          onClick={() => navigate('/admin/enquiries')}
          loading={loading}
        />
        <KPICard
          icon="✅"
          label="Awaiting Approval"
          value={kpis.ordersAwaitingApproval}
          status={kpis.ordersAwaitingApproval > 5 ? 'warning' : 'neutral'}
          trend={kpis.ordersAwaitingApproval > 5 ? 'up' : null}
          trendValue={kpis.ordersAwaitingApproval}
          onClick={() => navigate('/admin/orders')}
          loading={loading}
        />
        <KPICard
          icon="⚠️"
          label="SLA Breaches"
          value={kpis.slaBreaches}
          status={kpis.slaBreaches > 0 ? 'danger' : 'success'}
          trend={kpis.slaBreaches > 0 ? 'up' : null}
          onClick={() => navigate('/admin/service/sla')}
          loading={loading}
        />
        <KPICard
          icon="🕐"
          label="Late Today"
          value={kpis.lateAttendance}
          status={kpis.lateAttendance > 0 ? 'warning' : 'success'}
          onClick={() => navigate('/admin/attendance')}
          loading={loading}
        />
        <KPICard
          icon="🛠"
          label="Active Service"
          value={kpis.activeServiceRequests}
          status="neutral"
          onClick={() => navigate('/admin/service/requests')}
          loading={loading}
        />
      </div>

      {/* Alerts Section */}
      {alerts.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            🚨 Alerts & Notifications
          </h2>
          <div className="space-y-3">
            {alerts.map((alert, idx) => (
              <AlertCard
                key={idx}
                type={alert.type}
                icon={alert.icon}
                title={alert.title}
                message={alert.message}
                action={alert.action}
                onActionClick={alert.onClick}
              />
            ))}
          </div>
        </div>
      )}

      {/* Quick Actions Grid */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          ⚡ Quick Actions
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <QuickActionCard
            icon="👥"
            title="View Employees"
            description="See all staff and their dashboards"
            onClick={() => navigate('/admin/employees/salesmen')}
          />
          <QuickActionCard
            icon="📊"
            title="Sales Reports"
            description="Analyze sales performance"
            onClick={() => navigate('/admin/analytics')}
          />
          <QuickActionCard
            icon="📦"
            title="Manage Products"
            description="Add or update product catalog"
            onClick={() => navigate('/admin/products')}
          />
          <QuickActionCard
            icon="🧾"
            title="Audit Logs"
            description="Track all system activities"
            onClick={() => navigate('/admin/audit-logs')}
          />
        </div>
      </div>
    </div>
  );
}

/**
 * QuickActionCard - Clickable action card (responsive, enhanced alignment)
 */
function QuickActionCard({ icon, title, description, onClick }) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div 
      className="bg-white rounded-xl p-6 cursor-pointer border border-gray-200 transition-all duration-200 hover:shadow-lg hover:-translate-y-1 flex flex-col items-center justify-between min-h-[180px]"
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="text-5xl mb-4 w-20 h-20 flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl shadow-sm">{icon}</div>
      <div className="flex-1 flex flex-col items-center justify-center">
        <div className="text-lg font-bold text-gray-900 mb-2 text-center">{title}</div>
        <div className="text-sm text-gray-600 text-center leading-relaxed px-2">{description}</div>
      </div>
    </div>
  );
}

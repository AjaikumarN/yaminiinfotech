import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiRequest } from '../../utils/api';
import { theme } from '../styles/designSystem';
import EnterpriseCard from '../components/EnterpriseCard';

/**
 * Admin Dashboard - Enterprise Mission Control
 * Responsive: 6-col desktop, 3-col tablet, 2-col mobile
 * Professional, calm, trustworthy interface
 */
export default function AdminDashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [kpis, setKpis] = useState({
    totalSalesToday: 0,
    pendingEnquiries: 0,
    ordersAwaitingApproval: 0,
    slaBreaches: 0,
    lateAttendance: 0,
    activeServiceRequests: 0
  });
  const [alerts, setAlerts] = useState([]);

  // Track window width for responsive layout
  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    loadDashboardData();
    const interval = setInterval(loadDashboardData, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      const [enquiries, orders] = await Promise.all([
        apiRequest('/api/enquiries/').catch(() => []),
        apiRequest('/api/orders/').catch(() => [])
      ]);

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
        slaBreaches: 0,
        lateAttendance: 0,
        activeServiceRequests: 0
      };

      setKpis(calculatedKpis);

      const newAlerts = [];
      if (calculatedKpis.ordersAwaitingApproval > 0) {
        newAlerts.push({
          type: 'warning',
          icon: '⏳',
          title: 'Orders Pending Approval',
          message: `${calculatedKpis.ordersAwaitingApproval} orders require your approval`,
          action: () => navigate('/admin/orders')
        });
      }
      if (calculatedKpis.slaBreaches > 0) {
        newAlerts.push({
          type: 'danger',
          icon: '🚨',
          title: 'SLA Breaches',
          message: `${calculatedKpis.slaBreaches} service requests breached SLA`,
          action: () => navigate('/admin/service/sla')
        });
      }

      setAlerts(newAlerts);
    } catch (error) {
      console.error('Dashboard load error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Responsive grid columns
  const isMobile = windowWidth < theme.layout.breakpoints.tablet;
  const isTablet = windowWidth >= theme.layout.breakpoints.tablet && windowWidth < theme.layout.breakpoints.laptop;
  const gridCols = isMobile ? 2 : (isTablet ? 3 : 6);

  const pageStyles = {
    width: '100%',
    animation: 'fadeIn 0.3s ease-in'
  };

  const headerStyles = {
    marginBottom: theme.spacing.xl
  };

  const titleStyles = {
    fontSize: isMobile ? theme.typography.fontSize.xl : theme.typography.fontSize['3xl'],
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.sm,
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing.md
  };

  const subtitleStyles = {
    fontSize: isMobile ? theme.typography.fontSize.sm : theme.typography.fontSize.base,
    color: theme.colors.text.secondary,
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing.xs
  };

  const gridStyles = {
    display: 'grid',
    gridTemplateColumns: `repeat(${gridCols}, 1fr)`,
    gap: isMobile ? theme.spacing.md : theme.spacing.lg,
    marginBottom: theme.spacing.xl
  };

  const kpiMetrics = [
    {
      icon: '💰',
      label: 'Sales Today',
      value: kpis.totalSalesToday,
      color: theme.colors.success.main,
      bg: theme.colors.success.bg,
      onClick: () => navigate('/admin/orders')
    },
    {
      icon: '📋',
      label: 'Enquiries',
      value: kpis.pendingEnquiries,
      color: theme.colors.info.main,
      bg: theme.colors.info.bg,
      onClick: () => navigate('/admin/enquiries')
    },
    {
      icon: '⏳',
      label: 'Approvals',
      value: kpis.ordersAwaitingApproval,
      color: theme.colors.warning.main,
      bg: theme.colors.warning.bg,
      onClick: () => navigate('/admin/orders'),
      urgent: kpis.ordersAwaitingApproval > 0
    },
    {
      icon: '🛠',
      label: 'Service',
      value: kpis.activeServiceRequests,
      color: theme.colors.primary.main,
      bg: theme.colors.primary.bg,
      onClick: () => navigate('/admin/service/requests')
    },
    {
      icon: '🚨',
      label: 'SLA',
      value: kpis.slaBreaches,
      color: theme.colors.danger.main,
      bg: theme.colors.danger.bg,
      onClick: () => navigate('/admin/service/sla'),
      urgent: kpis.slaBreaches > 0
    },
    {
      icon: '🕐',
      label: 'Late',
      value: kpis.lateAttendance,
      color: theme.colors.warning.main,
      bg: theme.colors.warning.bg,
      onClick: () => navigate('/admin/attendance')
    }
  ];

  const quickActions = [
    { icon: '✅', label: 'Approve Orders', path: '/admin/orders', color: theme.colors.success.main },
    { icon: '👥', label: 'Manage Staff', path: '/admin/employees/salesmen', color: theme.colors.primary.main },
    { icon: '📦', label: 'Products', path: '/admin/products', color: theme.colors.info.main },
    { icon: '📊', label: 'Stock', path: '/admin/stock', color: theme.colors.warning.main },
    { icon: '💳', label: 'Outstanding', path: '/admin/outstanding', color: theme.colors.danger.main },
    { icon: '📈', label: 'Analytics', path: '/admin/analytics', color: theme.colors.primary.main }
  ];

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '400px',
        color: theme.colors.text.secondary
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '48px',
            height: '48px',
            border: `4px solid ${theme.colors.primary.light}`,
            borderTopColor: theme.colors.primary.main,
            borderRadius: '50%',
            animation: 'spin 0.8s linear infinite',
            margin: '0 auto 16px'
          }} />
          <p>Loading…</p>
        </div>
        <style>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div style={pageStyles}>
      {/* Header */}
      <div style={headerStyles}>
        <h1 style={titleStyles}>
          <span>🎯 Monitor Section</span>
        </h1>
        <p style={subtitleStyles}>
          <span>•</span>
          <span>Monitor • Approve • Control</span>
        </p>
      </div>

      {/* KPI Grid */}
      <div style={gridStyles}>
        {kpiMetrics.map((kpi, index) => (
          <EnterpriseCard
            key={index}
            onClick={kpi.onClick}
            hover
            padding="lg"
            style={{
              backgroundColor: kpi.bg,
              border: `1px solid ${kpi.color}20`,
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: theme.spacing.sm
            }}>
              <div style={{
                fontSize: isMobile ? '28px' : '32px',
                opacity: 0.9
              }}>
                {kpi.icon}
              </div>
              <div style={{
                fontSize: isMobile ? theme.typography.fontSize['2xl'] : theme.typography.fontSize['3xl'],
                fontWeight: theme.typography.fontWeight.bold,
                color: kpi.color,
                lineHeight: 1
              }}>
                {kpi.value}
              </div>
              <div style={{
                fontSize: theme.typography.fontSize.sm,
                fontWeight: theme.typography.fontWeight.medium,
                color: theme.colors.text.secondary
              }}>
                {kpi.label}
              </div>
            </div>
            
            {kpi.urgent && (
              <div style={{
                position: 'absolute',
                top: theme.spacing.sm,
                right: theme.spacing.sm,
                width: '8px',
                height: '8px',
                backgroundColor: kpi.color,
                borderRadius: '50%',
                animation: 'pulse 2s ease-in-out infinite'
              }} />
            )}
          </EnterpriseCard>
        ))}
      </div>

      {/* Alerts */}
      {alerts.length > 0 && (
        <div style={{ marginBottom: theme.spacing.xl }}>
          <h2 style={{
            fontSize: theme.typography.fontSize.lg,
            fontWeight: theme.typography.fontWeight.semibold,
            color: theme.colors.text.primary,
            marginBottom: theme.spacing.md
          }}>
            🔔 Alerts
          </h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
            gap: theme.spacing.md
          }}>
            {alerts.map((alert, index) => (
              <EnterpriseCard
                key={index}
                padding="lg"
                style={{
                  borderLeft: `4px solid ${
                    alert.type === 'danger' ? theme.colors.danger.main : theme.colors.warning.main
                  }`
                }}
              >
                <div style={{ display: 'flex', gap: theme.spacing.md }}>
                  <div style={{ fontSize: '32px' }}>{alert.icon}</div>
                  <div style={{ flex: 1 }}>
                    <h3 style={{
                      fontSize: theme.typography.fontSize.base,
                      fontWeight: theme.typography.fontWeight.semibold,
                      color: theme.colors.text.primary,
                      marginBottom: theme.spacing.xs
                    }}>
                      {alert.title}
                    </h3>
                    <p style={{
                      fontSize: theme.typography.fontSize.sm,
                      color: theme.colors.text.secondary,
                      marginBottom: theme.spacing.md
                    }}>
                      {alert.message}
                    </p>
                    <button
                      onClick={alert.action}
                      style={{
                        padding: `${theme.spacing.xs} ${theme.spacing.md}`,
                        backgroundColor: alert.type === 'danger' 
                          ? theme.colors.danger.main 
                          : theme.colors.warning.main,
                        color: theme.colors.neutral.white,
                        border: 'none',
                        borderRadius: theme.borderRadius.md,
                        fontSize: theme.typography.fontSize.sm,
                        fontWeight: theme.typography.fontWeight.medium,
                        cursor: 'pointer',
                        transition: theme.transitions.fast
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.opacity = '0.9';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.opacity = '1';
                      }}
                    >
                      Review →
                    </button>
                  </div>
                </div>
              </EnterpriseCard>
            ))}
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div>
        <h2 style={{
          fontSize: theme.typography.fontSize.lg,
          fontWeight: theme.typography.fontWeight.semibold,
          color: theme.colors.text.primary,
          marginBottom: theme.spacing.md
        }}>
          ⚡ Quick Actions
        </h2>
        <div style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : (isTablet ? '1fr 1fr' : '1fr 1fr 1fr'),
          gap: theme.spacing.md
        }}>
          {quickActions.map((action, index) => (
            <EnterpriseCard
              key={index}
              onClick={() => navigate(action.path)}
              hover
              padding="lg"
              style={{
                cursor: 'pointer',
                minHeight: '100px',
                display: 'flex',
                alignItems: 'center'
              }}
            >
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: theme.spacing.md,
                width: '100%'
              }}>
                <div style={{
                  width: '48px',
                  height: '48px',
                  backgroundColor: `${action.color}15`,
                  borderRadius: theme.borderRadius.lg,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '24px',
                  flexShrink: 0
                }}>
                  {action.icon}
                </div>
                <div style={{
                  fontSize: theme.typography.fontSize.base,
                  fontWeight: theme.typography.fontWeight.medium,
                  color: theme.colors.text.primary
                }}>
                  {action.label}
                </div>
              </div>
            </EnterpriseCard>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
}

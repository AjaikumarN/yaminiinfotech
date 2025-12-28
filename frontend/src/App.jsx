import React, { useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext.jsx'
import { NotificationProvider } from './contexts/NotificationContext.jsx'
import ProtectedRoute from './components/ProtectedRoute.jsx'
import Header from './components/Header.jsx'
import Footer from './components/Footer.jsx'
import Login from './components/Login.jsx'
import Home from './components/Home.jsx'
import Contact from './components/Contact.jsx'
import Customer from './components/Customer.jsx'
import SalesService from './components/SalesService.jsx'
import AboutUs from './components/AboutUs.jsx'
import Blog from './components/Blog.jsx'

// New Components
import ProductListing from './components/ProductListing.jsx'
import ProductDetail from './components/ProductDetail.jsx'
import EnquiryForm from './components/EnquiryForm.jsx'
import EnquiryDetail from './components/EnquiryDetail.jsx'
import ReceptionDashboardNew from './components/ReceptionDashboardNew.jsx'

// NEW Salesman Module - Clean Architecture (Rebuilt from scratch)
import SalesmanLayout from './salesman/layout/SalesmanLayout.jsx'
import SalesmanAttendance from './salesman/pages/Attendance.jsx'
import SalesmanDashboard from './salesman/pages/Dashboard.jsx'
import SalesmanEnquiries from './salesman/pages/Enquiries.jsx'
import SalesmanCalls from './salesman/pages/Calls.jsx'
import SalesmanFollowUps from './salesman/pages/FollowUps.jsx'
import SalesmanOrders from './salesman/pages/Orders.jsx'
import SalesmanDailyReport from './salesman/pages/DailyReport.jsx'
import SalesmanCompliance from './salesman/pages/Compliance.jsx'
import ServiceEngineerLayout from './components/service-engineer/ServiceEngineerLayout.jsx'
import EngineerDashboard from './components/service-engineer/EngineerDashboard.jsx'
import DailyStart from './components/service-engineer/DailyStart.jsx'
import AssignedJobs from './components/service-engineer/AssignedJobs.jsx'
import ServiceHistory from './components/service-engineer/ServiceHistory.jsx'
import SLATracker from './components/service-engineer/SLATracker.jsx'
import CustomerFeedback from './components/service-engineer/CustomerFeedback.jsx'
import DailyUpdate from './components/service-engineer/DailyUpdate.jsx'
import AdminDashboard from './components/AdminDashboard.jsx'
import AdminSalesPerformance from './components/AdminSalesPerformance.jsx'
import AddProduct from './components/AddProduct.jsx'
import FeedbackPage from './components/FeedbackPage.jsx'

// Reception Menu Pages
import ReceptionLayout from './components/reception/ReceptionLayout.jsx'
import EnquiryBoard from './components/reception/EnquiryBoard.jsx'
import CallsHistory from './components/reception/CallsHistory.jsx'
import ServiceComplaints from './components/reception/ServiceComplaints.jsx'
import RepeatComplaints from './components/reception/RepeatComplaints.jsx'
import DeliveryLog from './components/reception/DeliveryLog.jsx'
import OutstandingSummary from './components/reception/OutstandingSummary.jsx'
import MissingReports from './components/reception/MissingReports.jsx'
import VisitorLog from './components/reception/VisitorLog.jsx'

// Admin Module - Properly architected (MODE not APP)
import AdminLayout from './admin/layout/AdminLayout.jsx'
import AdminDashboardPage from './admin/pages/Dashboard.jsx'
import UserManagement from './admin/pages/UserManagement.jsx'
import AdminStockManagement from './admin/pages/StockManagement.jsx'
import AdminSLAMonitoring from './admin/pages/service/SLAMonitoring.jsx'
import AdminMIF from './admin/pages/service/MIF.jsx'
import AdminAttendance from './admin/pages/Attendance.jsx'
import AdminAnalytics from './admin/pages/Analytics.jsx'
import AdminAuditLogs from './admin/pages/AuditLogs.jsx'
import AdminSettings from './admin/pages/Settings.jsx'
import EmployeeList from './admin/pages/EmployeeList.jsx'
import EmployeeDashboardView from './admin/pages/EmployeeDashboardView.jsx'
import NewEmployee from './admin/pages/NewEmployee.jsx'

// Invoices component (if exists)
import Invoices from './components/Invoices.jsx'
import Orders from './components/Orders.jsx'

export default function App() {
  const [showNotificationPanel, setShowNotificationPanel] = useState(false)
  
  return (
    <AuthProvider>
      <NotificationProvider>
        <BrowserRouter
          future={{
            v7_startTransition: true,
            v7_relativeSplatPath: true
          }}
        >
          <div className="app">
            <Header 
              showNotificationPanel={showNotificationPanel}
              setShowNotificationPanel={setShowNotificationPanel}
            />
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<Home />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/about" element={<AboutUs />} />
              <Route path="/blog" element={<Blog />} />
              <Route path="/login" element={<Login />} />
              
              {/* Customer Public Routes - Product Catalog & Enquiry */}
              <Route path="/products" element={<ProductListing />} />
              <Route path="/products/:id" element={<ProductDetail />} />
              <Route path="/enquiry/:productId" element={<EnquiryForm />} />
              
              {/* Public Feedback Route - Customer feedback after service completion */}
              <Route path="/feedback/:id" element={<FeedbackPage />} />
              
              {/* Protected routes with role-based access */}
              <Route 
                path="/customer" 
                element={
                  <ProtectedRoute allowedRoles={['CUSTOMER', 'ADMIN']}>
                    <Customer />
                  </ProtectedRoute>
                } 
              />
              
              {/* Reception Menu Pages - Nested Routes with Sidebar */}
              <Route 
                path="/reception" 
                element={
                  <ProtectedRoute allowedRoles={['RECEPTION', 'ADMIN']}>
                    <ReceptionLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<ReceptionDashboardNew />} />
                <Route path="dashboard" element={<ReceptionDashboardNew />} />
                <Route path="enquiries" element={<EnquiryBoard />} />
                <Route path="calls" element={<CallsHistory />} />
                <Route path="service-complaints" element={<ServiceComplaints />} />
                <Route path="repeat-complaints" element={<RepeatComplaints />} />
                <Route path="delivery-log" element={<DeliveryLog />} />
                <Route path="outstanding" element={<OutstandingSummary />} />
                <Route path="missing-reports" element={<MissingReports />} />
                <Route path="visitors" element={<VisitorLog />} />
              </Route>
              
              {/* Enquiry routes - redirect to reception dashboard */}
              <Route 
                path="/enquiries/:enquiryId" 
                element={
                  <ProtectedRoute allowedRoles={['RECEPTION', 'ADMIN', 'SALESMAN']}>
                    <EnquiryDetail />
                  </ProtectedRoute>
                } 
              />
              
              {/* NEW SALESMAN MODULE - Clean Architecture with Attendance Gate */}
              
              {/* Attendance Page - Always accessible (no gate) */}
              <Route 
                path="/salesman/attendance" 
                element={
                  <ProtectedRoute allowedRoles={['SALESMAN', 'ADMIN']}>
                    <SalesmanLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<SalesmanAttendance />} />
              </Route>
              
              {/* Salesman pages - No attendance blocking */}
              <Route 
                path="/salesman" 
                element={
                  <ProtectedRoute allowedRoles={['SALESMAN', 'ADMIN']}>
                    <SalesmanLayout />
                  </ProtectedRoute>
                }
              >
                <Route path="dashboard" element={<SalesmanDashboard />} />
                <Route path="enquiries" element={<SalesmanEnquiries />} />
                <Route path="calls" element={<SalesmanCalls />} />
                <Route path="followups" element={<SalesmanFollowUps />} />
                <Route path="orders" element={<SalesmanOrders />} />
                <Route path="daily-report" element={<SalesmanDailyReport />} />
                <Route path="compliance" element={<SalesmanCompliance />} />
              </Route>
              
              {/* Backward compatibility - redirect old routes */}
              <Route 
                path="/employee/salesman" 
                element={
                  <ProtectedRoute allowedRoles={['SALESMAN', 'ADMIN']}>
                    <SalesService />
                  </ProtectedRoute>
                } 
              />
              
              {/* Service Engineer Menu Pages - Nested Routes with Sidebar */}
              <Route 
                path="/service-engineer" 
                element={
                  <ProtectedRoute allowedRoles={['SERVICE_ENGINEER', 'ADMIN']}>
                    <ServiceEngineerLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<EngineerDashboard />} />
                <Route path="dashboard" element={<EngineerDashboard />} />
                <Route path="attendance" element={<DailyStart />} />
                <Route path="jobs" element={<AssignedJobs />} />
                <Route path="history" element={<ServiceHistory />} />
                <Route path="sla-tracker" element={<SLATracker />} />
                <Route path="feedback" element={<CustomerFeedback />} />
                <Route path="daily-report" element={<DailyUpdate />} />
              </Route>
              
              {/* Backward compatibility routes */}
              <Route 
                path="/employee/service-engineer" 
                element={
                  <ProtectedRoute allowedRoles={['SERVICE_ENGINEER', 'ADMIN']}>
                    <ServiceEngineerLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<EngineerDashboard />} />
              </Route>
              
              <Route 
                path="/engineer/dashboard" 
                element={
                  <ProtectedRoute allowedRoles={['SERVICE_ENGINEER', 'ADMIN']}>
                    <ServiceEngineerLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<EngineerDashboard />} />
              </Route>
              
              <Route 
                path="/products/add" 
                element={
                  <ProtectedRoute allowedRoles={['ADMIN']}>
                    <AddProduct />
                  </ProtectedRoute>
                } 
              />
              
              <Route 
                path="/products/edit/:productId" 
                element={
                  <ProtectedRoute allowedRoles={['ADMIN']}>
                    <AddProduct />
                  </ProtectedRoute>
                } 
              />
              
              <Route 
                path="/admin" 
                element={
                  <ProtectedRoute allowedRoles={['ADMIN']}>
                    <AdminLayout />
                  </ProtectedRoute>
                } 
              >
                <Route index element={<AdminDashboardPage />} />
                <Route path="dashboard" element={<AdminDashboardPage />} />
                
                {/* Employees - List and Dashboard View */}
                <Route path="employees" element={<Navigate to="/admin/employees/salesmen" replace />} />
                <Route path="employees/:role" element={<EmployeeList />} />
                <Route path="employees/:role/:userId" element={<EmployeeDashboardView />} />
                <Route path="employees/admins" element={<UserManagement role="ADMIN" />} />
                
                {/* Inventory - REUSE existing pages ✅ */}
                <Route path="products" element={<ProductListing mode="admin" />} />
                <Route path="stock" element={<AdminStockManagement />} />
                
                {/* Sales - REUSE existing pages with admin mode ✅ */}
                <Route path="enquiries" element={<EnquiryBoard mode="admin" />} />
                <Route path="sales/overview" element={<EnquiryBoard mode="admin" />} />
                <Route path="orders" element={<Orders mode="admin" />} />
                
                {/* Finance - REUSE existing pages ✅ */}
                <Route path="invoices" element={<Invoices mode="admin" />} />
                <Route path="outstanding" element={<OutstandingSummary mode="admin" />} />
                
                {/* Service - REUSE existing components ✅ */}
                <Route path="service/requests" element={<ServiceComplaints mode="admin" />} />
                <Route path="service/overview" element={<ServiceComplaints mode="admin" />} />
                <Route path="service/sla" element={<AdminSLAMonitoring />} />
                <Route path="service/mif" element={<AdminMIF />} />
                
                {/* Operations - Reuse existing */}
                <Route path="attendance" element={<AdminAttendance />} />
                
                {/* Insights */}
                <Route path="analytics" element={<AdminAnalytics />} />
                
                {/* System */}
                <Route path="audit-logs" element={<AdminAuditLogs />} />
                <Route path="new-employee" element={<NewEmployee />} />
                <Route path="settings" element={<AdminSettings />} />
              </Route>
              
              {/* Legacy admin routes - redirect to new admin module */}
              <Route 
                path="/admin/sales-performance" 
                element={
                  <ProtectedRoute allowedRoles={['ADMIN', 'RECEPTION']}>
                    <AdminSalesPerformance />
                  </ProtectedRoute>
                } 
              />
            </Routes>
            <Footer />
          </div>
        </BrowserRouter>
      </NotificationProvider>
    </AuthProvider>
  )
}

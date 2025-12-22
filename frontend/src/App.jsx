import React, { useState } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext.jsx'
import { NotificationProvider } from './contexts/NotificationContext.jsx'
import ProtectedRoute from './components/ProtectedRoute.jsx'
import Header from './components/Header.jsx'
import Footer from './components/Footer.jsx'
import Notifications from './components/Notifications.jsx'
import Login from './components/Login.jsx'
import Home from './components/Home.jsx'
import Contact from './components/Contact.jsx'
import Admin from './components/Admin.jsx'
import Employees from './components/Employees.jsx'
import Customer from './components/Customer.jsx'
import Receipt from './components/Receipt.jsx'
import SalesService from './components/SalesService.jsx'
import AboutUs from './components/AboutUs.jsx'
import OfficeStaff from './components/OfficeStaff.jsx'
import Blog from './components/Blog.jsx'

// New Components
import ProductListing from './components/ProductListing.jsx'
import ProductDetail from './components/ProductDetail.jsx'
import EnquiryForm from './components/EnquiryForm.jsx'
import ReceptionDashboard from './components/ReceptionDashboard.jsx'
import SalesmanDashboard from './components/SalesmanDashboardNew.jsx'
import SalesmanEnquiries from './components/SalesmanEnquiries.jsx'
import SalesmanFollowUps from './components/SalesmanFollowUps.jsx'
import SalesmanVisits from './components/SalesmanVisits.jsx'
import SalesmanDailyReport from './components/SalesmanDailyReport.jsx'
import SalesmanAttendance from './components/SalesmanAttendance.jsx'
import ServiceEngineerDashboard from './components/ServiceEngineerDashboard.jsx'
import OfficeStaffDashboard from './components/OfficeStaffDashboard.jsx'
import AdminDashboard from './components/AdminDashboard.jsx'
import AdminSalesPerformance from './components/AdminSalesPerformance.jsx'
import AddProduct from './components/AddProduct.jsx'

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
            <Notifications 
              showPanel={showNotificationPanel}
              setShowPanel={setShowNotificationPanel}
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
              
              {/* Protected routes with role-based access */}
              <Route 
                path="/customer" 
                element={
                  <ProtectedRoute allowedRoles={['customer', 'admin']}>
                    <Customer />
                  </ProtectedRoute>
                } 
              />
              
              <Route 
                path="/reception" 
                element={
                  <ProtectedRoute allowedRoles={['reception', 'admin']}>
                    <Receipt />
                  </ProtectedRoute>
                } 
              />
              
              <Route 
                path="/reception/dashboard" 
                element={
                  <ProtectedRoute allowedRoles={['reception', 'admin']}>
                    <ReceptionDashboard />
                  </ProtectedRoute>
                } 
              />
              
              <Route 
                path="/employee/salesman" 
                element={
                  <ProtectedRoute allowedRoles={['salesman', 'admin']}>
                    <SalesService />
                  </ProtectedRoute>
                } 
              />
              
              <Route 
                path="/salesman/dashboard" 
                element={
                  <ProtectedRoute allowedRoles={['salesman', 'admin']}>
                    <SalesmanDashboard />
                  </ProtectedRoute>
                } 
              />
              
              <Route 
                path="/salesman/followups" 
                element={
                  <ProtectedRoute allowedRoles={['salesman', 'admin']}>
                    <SalesmanFollowUps />
                  </ProtectedRoute>
                } 
              />
              
              <Route 
                path="/salesman/visits" 
                element={
                  <ProtectedRoute allowedRoles={['salesman', 'admin']}>
                    <SalesmanVisits />
                  </ProtectedRoute>
                } 
              />
              
              <Route 
                path="/salesman/daily-report" 
                element={
                  <ProtectedRoute allowedRoles={['salesman', 'admin']}>
                    <SalesmanDailyReport />
                  </ProtectedRoute>
                } 
              />
              
              <Route 
                path="/salesman/attendance" 
                element={
                  <ProtectedRoute allowedRoles={['salesman', 'admin']}>
                    <SalesmanAttendance />
                  </ProtectedRoute>
                } 
              />
              
              <Route 
                path="/salesman/enquiries" 
                element={
                  <ProtectedRoute allowedRoles={['salesman', 'admin']}>
                    <SalesmanEnquiries />
                  </ProtectedRoute>
                } 
              />
              
              <Route 
                path="/salesman/performance" 
                element={
                  <ProtectedRoute allowedRoles={['salesman', 'admin']}>
                    <SalesmanDashboard />
                  </ProtectedRoute>
                } 
              />
              
              <Route 
                path="/employee/service-engineer" 
                element={
                  <ProtectedRoute allowedRoles={['service_engineer', 'admin']}>
                    <Employees />
                  </ProtectedRoute>
                } 
              />
              
              <Route 
                path="/engineer/dashboard" 
                element={
                  <ProtectedRoute allowedRoles={['service_engineer', 'admin']}>
                    <ServiceEngineerDashboard />
                  </ProtectedRoute>
                } 
              />
              
              <Route 
                path="/employee/office-staff" 
                element={
                  <ProtectedRoute allowedRoles={['office_staff', 'admin']}>
                    <OfficeStaff />
                  </ProtectedRoute>
                } 
              />
              
              <Route 
                path="/office/dashboard" 
                element={
                  <ProtectedRoute allowedRoles={['office_staff', 'admin']}>
                    <OfficeStaffDashboard />
                  </ProtectedRoute>
                } 
              />
              
              <Route 
                path="/products/add" 
                element={
                  <ProtectedRoute allowedRoles={['office_staff', 'admin']}>
                    <AddProduct />
                  </ProtectedRoute>
                } 
              />
              
              <Route 
                path="/products/edit/:productId" 
                element={
                  <ProtectedRoute allowedRoles={['office_staff', 'admin']}>
                    <AddProduct />
                  </ProtectedRoute>
                } 
              />
              
              <Route 
                path="/admin" 
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <Admin />
                  </ProtectedRoute>
                } 
              />
              
              <Route 
                path="/admin/dashboard" 
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <AdminDashboard />
                  </ProtectedRoute>
                } 
              />
              
              <Route 
                path="/admin/sales-performance" 
                element={
                  <ProtectedRoute allowedRoles={['admin', 'office_staff']}>
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
